#!/usr/bin/env tsx

/**
 * ============================================================================
 * CAPACITYCONNECT — DATABASE-BACKED AUTHENTICATION PROGRAMMATIC TEST SUITE
 * ============================================================================
 * 
 * Programmatic verification suite testing real PostgreSQL database authentication
 * via Prisma ORM, bcrypt password hashing, HTTP-only cookie session lifecycle,
 * role-based redirects, and status-based access control.
 * 
 * Requirements Tested:
 * - R1: Database-Backed Authentication Endpoints (POST /api/auth/login, POST /api/auth/logout)
 * - R2: Secure Cookie & Session Lifecycle Management (auth_token, 7-day expiry, httpOnly, sameSite lax)
 * - R3: Seed Data & Database Consistency (ADMIN, TRAINER, TRAINEE, PENDING, SUSPENDED, REJECTED)
 * - R4: Programmatic Verification Suite (5 Core Scenarios + Status & Validation Tests)
 * 
 * Execution:
 *   npm run test:auth
 *   npx tsx scripts/test-auth-db.ts
 */

import 'dotenv/config';
import { NextRequest } from 'next/server';
import { POST as loginPost } from '@/app/api/auth/login/route';
import { POST as logoutPost } from '@/app/api/auth/logout/route';
import { verifyToken, getCurrentUser, generateToken, TokenPayload } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface TestResult {
  scenario: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function createLoginRequest(body: unknown): NextRequest {
  const url = 'http://localhost:3000/api/auth/login';
  if (body === undefined || body === null) {
    return new NextRequest(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

async function runTest(
  scenario: string,
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  const start = performance.now();
  try {
    await testFn();
    const durationMs = performance.now() - start;
    results.push({ scenario, name, passed: true, durationMs });
    console.log(`  [\x1b[32mPASS\x1b[0m] ${name} (${durationMs.toFixed(1)}ms)`);
  } catch (err: any) {
    const durationMs = performance.now() - start;
    const errorMessage = err?.message || String(err);
    results.push({ scenario, name, passed: false, durationMs, error: errorMessage });
    console.error(`  [\x1b[31mFAIL\x1b[0m] ${name} (${durationMs.toFixed(1)}ms)`);
    console.error(`         \x1b[31mError: ${errorMessage}\x1b[0m`);
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function main() {
  console.log('\n================================================================================');
  console.log('       CAPACITYCONNECT — DATABASE-BACKED AUTHENTICATION TEST SUITE');
  console.log('================================================================================');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Database URL: ${process.env.DATABASE_URL ? 'Configured (Neon PostgreSQL)' : 'MISSING'}`);
  console.log('================================================================================\n');

  // Verify database connectivity first
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ PostgreSQL database connection established successfully via Prisma Client.\n');
  } catch (dbError: any) {
    console.error('✗ Failed to connect to PostgreSQL database:', dbError.message);
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // SCENARIO 1: Login with Valid Database Credentials (HTTP 200, JWT Cookie)
  // --------------------------------------------------------------------------
  console.log('--------------------------------------------------------------------------------');
  console.log('  Scenario 1: Login with Valid Database Credentials');
  console.log('--------------------------------------------------------------------------------');

  let adminAuthToken = '';

  await runTest(
    'Scenario 1',
    '1.1: Admin login (admin@capacityconnect.gov) returns HTTP 200 and role redirect /admin',
    async () => {
      const req = createLoginRequest({
        email: 'admin@capacityconnect.gov',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 200, `Expected status 200, got ${res.status}`);

      const body = await res.json();
      assert(body.success === true, 'Expected body.success === true');
      assert(body.user?.email === 'admin@capacityconnect.gov', `Expected email admin@capacityconnect.gov, got ${body.user?.email}`);
      assert(body.user?.role === 'ADMIN', `Expected role ADMIN, got ${body.user?.role}`);
      assert(body.user?.status === 'APPROVED', `Expected status APPROVED, got ${body.user?.status}`);
      assert(body.user?.fullName === 'Dr. Rajeshwari Sharma', `Expected full name Dr. Rajeshwari Sharma, got ${body.user?.fullName}`);
      assert(body.redirectUrl === '/admin', `Expected redirectUrl /admin, got ${body.redirectUrl}`);

      const cookie = res.cookies.get('auth_token');
      assert(!!cookie, 'Expected auth_token cookie to be set');
      assert(cookie!.httpOnly === true, 'Expected cookie httpOnly === true');
      assert(cookie!.sameSite === 'lax', `Expected cookie sameSite 'lax', got ${cookie!.sameSite}`);
      assert(cookie!.maxAge === 604800, `Expected cookie maxAge 604800 (7 days), got ${cookie!.maxAge}`);
      assert(cookie!.path === '/', `Expected cookie path '/', got ${cookie!.path}`);
      assert(cookie!.value.length > 20, 'Expected non-empty auth_token JWT string');

      adminAuthToken = cookie!.value;
    }
  );

  await runTest(
    'Scenario 1',
    '1.2: Trainer login (trainer@capacityconnect.gov) returns HTTP 200 and role redirect /trainer',
    async () => {
      const req = createLoginRequest({
        email: 'trainer@capacityconnect.gov',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 200, `Expected status 200, got ${res.status}`);

      const body = await res.json();
      assert(body.success === true, 'Expected body.success === true');
      assert(body.user?.role === 'TRAINER', `Expected role TRAINER, got ${body.user?.role}`);
      assert(body.redirectUrl === '/trainer', `Expected redirectUrl /trainer, got ${body.redirectUrl}`);

      const cookie = res.cookies.get('auth_token');
      assert(!!cookie, 'Expected auth_token cookie to be set');
      assert(cookie!.httpOnly === true, 'Expected cookie httpOnly === true');
    }
  );

  await runTest(
    'Scenario 1',
    '1.3: Trainee login (trainee@capacityconnect.gov) returns HTTP 200 and role redirect /trainee',
    async () => {
      const req = createLoginRequest({
        email: 'trainee@capacityconnect.gov',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 200, `Expected status 200, got ${res.status}`);

      const body = await res.json();
      assert(body.success === true, 'Expected body.success === true');
      assert(body.user?.role === 'TRAINEE', `Expected role TRAINEE, got ${body.user?.role}`);
      assert(body.redirectUrl === '/trainee', `Expected redirectUrl /trainee, got ${body.redirectUrl}`);

      const cookie = res.cookies.get('auth_token');
      assert(!!cookie, 'Expected auth_token cookie to be set');
      assert(cookie!.httpOnly === true, 'Expected cookie httpOnly === true');
    }
  );

  await runTest(
    'Scenario 1',
    '1.4: IMD DG Scientist login (dg.imd@moes.gov.in) returns HTTP 200 and admin redirect',
    async () => {
      const req = createLoginRequest({
        email: 'dg.imd@moes.gov.in',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 200, `Expected status 200, got ${res.status}`);

      const body = await res.json();
      assert(body.success === true, 'Expected body.success === true');
      assert(body.user?.fullName === 'Dr. Mrutyunjay Mohapatra', `Expected DG IMD full name, got ${body.user?.fullName}`);
      assert(body.user?.role === 'ADMIN', `Expected role ADMIN, got ${body.user?.role}`);
      assert(body.redirectUrl === '/admin', `Expected redirectUrl /admin, got ${body.redirectUrl}`);
    }
  );

  await runTest(
    'Scenario 1',
    '1.5: Pending status user (pending@capacityconnect.org) returns HTTP 200 and redirect /auth/pending',
    async () => {
      const req = createLoginRequest({
        email: 'pending@capacityconnect.org',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 200, `Expected status 200, got ${res.status}`);

      const body = await res.json();
      assert(body.success === true, 'Expected body.success === true');
      assert(body.user?.status === 'PENDING', `Expected status PENDING, got ${body.user?.status}`);
      assert(body.redirectUrl === '/auth/pending', `Expected redirectUrl /auth/pending, got ${body.redirectUrl}`);

      const cookie = res.cookies.get('auth_token');
      assert(!!cookie, 'Expected auth_token cookie to be set');
    }
  );

  // --------------------------------------------------------------------------
  // SCENARIO 2: Login with Invalid Password (HTTP 401 Unauthorized, No Cookie)
  // --------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('  Scenario 2: Login with Invalid Password');
  console.log('--------------------------------------------------------------------------------');

  await runTest(
    'Scenario 2',
    '2.1: Valid user with incorrect password returns HTTP 401 and no auth cookie',
    async () => {
      const req = createLoginRequest({
        email: 'admin@capacityconnect.gov',
        password: 'WrongPassword999!',
      });
      const res = await loginPost(req);
      assert(res.status === 401, `Expected status 401, got ${res.status}`);

      const body = await res.json();
      assert(body.error === 'Invalid email or password', `Expected 'Invalid email or password', got '${body.error}'`);

      const cookie = res.cookies.get('auth_token');
      assert(!cookie, 'Expected NO auth_token cookie to be set on failed login');
    }
  );

  await runTest(
    'Scenario 2',
    '2.2: Trainee user with wrong password returns HTTP 401 and no auth cookie',
    async () => {
      const req = createLoginRequest({
        email: 'trainee@capacityconnect.gov',
        password: 'DefinitelyIncorrectPassword!',
      });
      const res = await loginPost(req);
      assert(res.status === 401, `Expected status 401, got ${res.status}`);

      const body = await res.json();
      assert(body.error === 'Invalid email or password', `Expected 'Invalid email or password', got '${body.error}'`);

      const cookie = res.cookies.get('auth_token');
      assert(!cookie, 'Expected NO auth_token cookie to be set on failed login');
    }
  );

  // --------------------------------------------------------------------------
  // SCENARIO 3: Login with Non-Existent User (HTTP 401 Unauthorized, No Cookie)
  // --------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('  Scenario 3: Login with Non-Existent User');
  console.log('--------------------------------------------------------------------------------');

  await runTest(
    'Scenario 3',
    '3.1: Non-existent email returns HTTP 401 and no auth cookie',
    async () => {
      const req = createLoginRequest({
        email: 'nonexistent.officer.404@capacityconnect.gov',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 401, `Expected status 401, got ${res.status}`);

      const body = await res.json();
      assert(body.error === 'Invalid email or password', `Expected 'Invalid email or password', got '${body.error}'`);

      const cookie = res.cookies.get('auth_token');
      assert(!cookie, 'Expected NO auth_token cookie to be set for non-existent user');
    }
  );

  await runTest(
    'Scenario 3',
    '3.2: Completely unknown domain returns HTTP 401 without revealing user non-existence',
    async () => {
      const req = createLoginRequest({
        email: 'random.stranger@outerspace99.org',
        password: 'AnyPasswordValue!',
      });
      const res = await loginPost(req);
      assert(res.status === 401, `Expected status 401, got ${res.status}`);

      const body = await res.json();
      assert(body.error === 'Invalid email or password', `Expected uniform 'Invalid email or password', got '${body.error}'`);

      const cookie = res.cookies.get('auth_token');
      assert(!cookie, 'Expected NO auth_token cookie to be set');
    }
  );

  // --------------------------------------------------------------------------
  // SCENARIO 4: Logout Endpoint Clears Session Cookie (HTTP 200, maxAge: 0)
  // --------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('  Scenario 4: Logout Clears auth_token Cookie');
  console.log('--------------------------------------------------------------------------------');

  await runTest(
    'Scenario 4',
    '4.1: POST /api/auth/logout returns HTTP 200 and expires auth_token with maxAge: 0',
    async () => {
      const res = await logoutPost();
      assert(res.status === 200, `Expected status 200, got ${res.status}`);

      const body = await res.json();
      assert(body.success === true, 'Expected body.success === true');
      assert(body.message === 'Logged out successfully', `Expected 'Logged out successfully', got '${body.message}'`);

      const cookie = res.cookies.get('auth_token');
      assert(!!cookie, 'Expected auth_token clearing cookie to be present in response');
      assert(cookie!.value === '', `Expected empty cookie value, got '${cookie!.value}'`);
      assert(cookie!.maxAge === 0, `Expected maxAge 0, got ${cookie!.maxAge}`);
      assert(cookie!.httpOnly === true, 'Expected clearing cookie httpOnly === true');
      assert(cookie!.sameSite === 'lax', `Expected clearing cookie sameSite 'lax', got ${cookie!.sameSite}`);
      assert(cookie!.path === '/', `Expected clearing cookie path '/', got ${cookie!.path}`);
    }
  );

  // --------------------------------------------------------------------------
  // SCENARIO 5: Session Helper & Token Verification
  // --------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('  Scenario 5: Session Helper & Token Verification (verifyToken / getCurrentUser)');
  console.log('--------------------------------------------------------------------------------');

  await runTest(
    'Scenario 5',
    '5.1: verifyToken decodes valid JWT and extracts complete user metadata',
    async () => {
      assert(!!adminAuthToken, 'Expected valid admin auth token from Scenario 1');
      const payload = await verifyToken(adminAuthToken);

      assert(payload !== null, 'Expected verifyToken to return non-null payload for valid token');
      assert(payload!.email === 'admin@capacityconnect.gov', `Expected email admin@capacityconnect.gov, got ${payload!.email}`);
      assert(payload!.role === 'ADMIN', `Expected role ADMIN, got ${payload!.role}`);
      assert(payload!.status === 'APPROVED', `Expected status APPROVED, got ${payload!.status}`);
      assert(payload!.fullName === 'Dr. Rajeshwari Sharma', `Expected fullName Dr. Rajeshwari Sharma, got ${payload!.fullName}`);
      assert(typeof payload!.userId === 'string' && payload!.userId.length > 0, 'Expected non-empty userId');
    }
  );

  await runTest(
    'Scenario 5',
    '5.2: generateToken and verifyToken roundtrip preserves all user claims',
    async () => {
      const customPayload: TokenPayload = {
        userId: 'custom-test-uuid-12345',
        email: 'test.trainer@moes.gov.in',
        role: 'TRAINER',
        status: 'APPROVED',
        fullName: 'Test Trainer Scientist',
      };

      const token = await generateToken(customPayload);
      assert(typeof token === 'string' && token.length > 20, 'Expected valid signed JWT token string');

      const verified = await verifyToken(token);
      assert(verified !== null, 'Expected verified payload to be non-null');
      assert(verified!.userId === customPayload.userId, 'userId mismatch');
      assert(verified!.email === customPayload.email, 'email mismatch');
      assert(verified!.role === customPayload.role, 'role mismatch');
      assert(verified!.status === customPayload.status, 'status mismatch');
      assert(verified!.fullName === customPayload.fullName, 'fullName mismatch');
    }
  );

  await runTest(
    'Scenario 5',
    '5.3: verifyToken rejects invalid or tampered JWT tokens with null',
    async () => {
      const tamperedToken = adminAuthToken.slice(0, -5) + 'XXXXX';
      const resultTampered = await verifyToken(tamperedToken);
      assert(resultTampered === null, 'Expected tampered token to return null');

      const resultMalformed = await verifyToken('not.a.real.jwt.token');
      assert(resultMalformed === null, 'Expected malformed token to return null');

      const resultEmpty = await verifyToken('');
      assert(resultEmpty === null, 'Expected empty token to return null');
    }
  );

  await runTest(
    'Scenario 5',
    '5.4: getCurrentUser returns null gracefully when executed without active request cookies',
    async () => {
      const currentUser = await getCurrentUser();
      assert(currentUser === null, 'Expected getCurrentUser() to return null outside active cookie context');
    }
  );

  // --------------------------------------------------------------------------
  // SCENARIO 6: Status-Based Access Control (Suspended & Rejected Accounts)
  // --------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('  Scenario 6: Status-Based Access Control (HTTP 403 Forbidden)');
  console.log('--------------------------------------------------------------------------------');

  await runTest(
    'Scenario 6',
    '6.1: Suspended account (suspended@capacityconnect.org) returns HTTP 403 Forbidden',
    async () => {
      const req = createLoginRequest({
        email: 'suspended@capacityconnect.org',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 403, `Expected status 403 Forbidden, got ${res.status}`);

      const body = await res.json();
      assert(
        body.error === 'Account is suspended. Please contact administration.',
        `Expected suspended error message, got '${body.error}'`
      );

      const cookie = res.cookies.get('auth_token');
      assert(!cookie, 'Expected NO auth_token cookie for suspended account');
    }
  );

  await runTest(
    'Scenario 6',
    '6.2: Suspended account alias (.gov) returns HTTP 403 Forbidden and no cookie',
    async () => {
      const req = createLoginRequest({
        email: 'suspended@capacityconnect.gov',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 403, `Expected status 403 Forbidden, got ${res.status}`);

      const cookie = res.cookies.get('auth_token');
      assert(!cookie, 'Expected NO auth_token cookie for suspended account');
    }
  );

  await runTest(
    'Scenario 6',
    '6.3: Rejected account (rejected@capacityconnect.org) returns HTTP 403 Forbidden',
    async () => {
      const req = createLoginRequest({
        email: 'rejected@capacityconnect.org',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 403, `Expected status 403 Forbidden, got ${res.status}`);

      const body = await res.json();
      assert(
        body.error === 'Account has been rejected.',
        `Expected rejected error message, got '${body.error}'`
      );

      const cookie = res.cookies.get('auth_token');
      assert(!cookie, 'Expected NO auth_token cookie for rejected account');
    }
  );

  await runTest(
    'Scenario 6',
    '6.4: Rejected account alias (.gov) returns HTTP 403 Forbidden and no cookie',
    async () => {
      const req = createLoginRequest({
        email: 'rejected@capacityconnect.gov',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 403, `Expected status 403 Forbidden, got ${res.status}`);

      const cookie = res.cookies.get('auth_token');
      assert(!cookie, 'Expected NO auth_token cookie for rejected account');
    }
  );

  // --------------------------------------------------------------------------
  // SCENARIO 7: Request Payload & Input Validation Edge Cases (HTTP 400)
  // --------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('  Scenario 7: Request Payload & Input Validation (HTTP 400 Bad Request)');
  console.log('--------------------------------------------------------------------------------');

  await runTest(
    'Scenario 7',
    '7.1: Missing password field returns HTTP 400 Bad Request',
    async () => {
      const req = createLoginRequest({
        email: 'admin@capacityconnect.gov',
      });
      const res = await loginPost(req);
      assert(res.status === 400, `Expected status 400, got ${res.status}`);

      const body = await res.json();
      assert(body.error === 'Email and password are required', `Expected validation error, got '${body.error}'`);
    }
  );

  await runTest(
    'Scenario 7',
    '7.2: Missing email field returns HTTP 400 Bad Request',
    async () => {
      const req = createLoginRequest({
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 400, `Expected status 400, got ${res.status}`);

      const body = await res.json();
      assert(body.error === 'Email and password are required', `Expected validation error, got '${body.error}'`);
    }
  );

  await runTest(
    'Scenario 7',
    '7.3: Whitespace-only email returns HTTP 400 Bad Request',
    async () => {
      const req = createLoginRequest({
        email: '   ',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 400, `Expected status 400, got ${res.status}`);
    }
  );

  await runTest(
    'Scenario 7',
    '7.4: Non-JSON / malformed request body returns HTTP 400 Bad Request',
    async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json-string{',
      });
      const res = await loginPost(req);
      assert(res.status === 400, `Expected status 400, got ${res.status}`);
    }
  );

  // --------------------------------------------------------------------------
  // FINAL SUMMARY REPORT
  // --------------------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0);

  console.log('\n================================================================================');
  console.log('                              FINAL TEST SUMMARY');
  console.log('================================================================================');
  console.log(`  Scenario 1 (Valid Login & JWT Cookie):         ${results.filter(r => r.scenario === 'Scenario 1' && r.passed).length} / ${results.filter(r => r.scenario === 'Scenario 1').length} passed`);
  console.log(`  Scenario 2 (Invalid Password):                 ${results.filter(r => r.scenario === 'Scenario 2' && r.passed).length} / ${results.filter(r => r.scenario === 'Scenario 2').length} passed`);
  console.log(`  Scenario 3 (Non-Existent User):                ${results.filter(r => r.scenario === 'Scenario 3' && r.passed).length} / ${results.filter(r => r.scenario === 'Scenario 3').length} passed`);
  console.log(`  Scenario 4 (Logout & Cookie Expiration):       ${results.filter(r => r.scenario === 'Scenario 4' && r.passed).length} / ${results.filter(r => r.scenario === 'Scenario 4').length} passed`);
  console.log(`  Scenario 5 (Token Verification & Session):     ${results.filter(r => r.scenario === 'Scenario 5' && r.passed).length} / ${results.filter(r => r.scenario === 'Scenario 5').length} passed`);
  console.log(`  Scenario 6 (Suspended & Rejected Accounts):    ${results.filter(r => r.scenario === 'Scenario 6' && r.passed).length} / ${results.filter(r => r.scenario === 'Scenario 6').length} passed`);
  console.log(`  Scenario 7 (Payload & Validation Errors):      ${results.filter(r => r.scenario === 'Scenario 7' && r.passed).length} / ${results.filter(r => r.scenario === 'Scenario 7').length} passed`);
  console.log('--------------------------------------------------------------------------------');
  console.log(`  TOTAL TESTS:                                   ${total}`);
  console.log(`  TOTAL PASSED:                                  ${passed}`);
  console.log(`  TOTAL FAILED:                                  ${failed}`);
  console.log(`  TOTAL TEST DURATION:                           ${totalDuration.toFixed(1)} ms`);
  console.log('================================================================================\n');

  if (failed > 0) {
    console.error(`❌ TEST SUITE FAILED with ${failed} failing tests.`);
    process.exit(1);
  } else {
    console.log(`✅ ALL ${passed}/${total} TESTS PASSED SUCCESSFULLY! Database authentication verified.\n`);
    process.exit(0);
  }
}

main()
  .catch((e) => {
    console.error('Fatal test runner error:', e);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // Ignore disconnect errors on process shutdown
    }
  });
