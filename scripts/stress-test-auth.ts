#!/usr/bin/env tsx

/**
 * ============================================================================
 * CAPACITYCONNECT — ADVERSARIAL AUTHENTICATION STRESS TEST HARNESS
 * ============================================================================
 * 
 * Comprehensive adversarial fuzzing, injection checks, case sensitivity,
 * credential enumeration tests, backdoor verification, and bypass stress tests
 * on POST /api/auth/login and auth infrastructure.
 * 
 * Execution:
 *   npx tsx scripts/stress-test-auth.ts
 */

import 'dotenv/config';
import { NextRequest } from 'next/server';
import { POST as loginPost } from '@/app/api/auth/login/route';
import { POST as logoutPost } from '@/app/api/auth/logout/route';
import {
  verifyToken,
  generateToken,
  comparePassword,
  hashPassword,
  TokenPayload,
} from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';

interface TestResult {
  category: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
  notes?: string;
}

const results: TestResult[] = [];

function createLoginRequest(body: unknown): NextRequest {
  const url = 'http://localhost:3000/api/auth/login';
  if (body === undefined) {
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
  category: string,
  name: string,
  testFn: () => Promise<string | void>
): Promise<void> {
  const start = performance.now();
  try {
    const notes = await testFn();
    const durationMs = performance.now() - start;
    results.push({
      category,
      name,
      passed: true,
      durationMs,
      notes: typeof notes === 'string' ? notes : undefined,
    });
    console.log(`  [\x1b[32mPASS\x1b[0m] ${name} (${durationMs.toFixed(1)}ms)${notes ? ` — ${notes}` : ''}`);
  } catch (err: any) {
    const durationMs = performance.now() - start;
    const errorMessage = err?.message || String(err);
    results.push({ category, name, passed: false, durationMs, error: errorMessage });
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
  console.log('       CHALLENGER 1: ADVERSARIAL AUTHENTICATION STRESS TEST HARNESS');
  console.log('================================================================================');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Database: PostgreSQL (Neon Serverless)`);
  console.log('================================================================================\n');

  // Verify DB connection
  await prisma.$queryRaw`SELECT 1`;
  console.log('✓ Database connection active.\n');

  // ============================================================================
  // CATEGORY 1: Adversarial Fuzzing & Malformed Inputs
  // ============================================================================
  console.log('--------------------------------------------------------------------------------');
  console.log('  Category 1: Adversarial Fuzzing & Injection Defense');
  console.log('--------------------------------------------------------------------------------');

  await runTest(
    'Category 1',
    '1.1 SQLi in email: Classic single quote bypass (\' OR \'1\'=\'1)',
    async () => {
      const req = createLoginRequest({
        email: "' OR '1'='1",
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 401, `Expected 401, got ${res.status}`);
      const body = await res.json();
      assert(body.error === 'Invalid email or password', `Expected 'Invalid email or password', got '${body.error}'`);
      assert(!res.cookies.get('auth_token'), 'Cookie must not be set');
    }
  );

  await runTest(
    'Category 1',
    '1.2 SQLi in email: Comment-out payload (admin@capacityconnect.gov\' --)',
    async () => {
      const req = createLoginRequest({
        email: "admin@capacityconnect.gov' --",
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 401, `Expected 401, got ${res.status}`);
      assert(!res.cookies.get('auth_token'), 'Cookie must not be set');
    }
  );

  await runTest(
    'Category 1',
    '1.3 SQLi in email: UNION SELECT injection payload',
    async () => {
      const req = createLoginRequest({
        email: "admin@capacityconnect.gov' UNION SELECT * FROM \"User\"--",
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 401, `Expected 401, got ${res.status}`);
    }
  );

  await runTest(
    'Category 1',
    '1.4 SQLi in email: Destructive command chaining (\'; DROP TABLE "User"; --)',
    async () => {
      const req = createLoginRequest({
        email: "'; DROP TABLE \"User\"; --",
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 401, `Expected 401, got ${res.status}`);
      // Verify User table is intact
      const count = await prisma.user.count();
      assert(count > 0, 'Database table was damaged by injection!');
    }
  );

  await runTest(
    'Category 1',
    '1.5 SQLi in password: OR bypass against valid account',
    async () => {
      const req = createLoginRequest({
        email: 'admin@capacityconnect.gov',
        password: "' OR '1'='1",
      });
      const res = await loginPost(req);
      assert(res.status === 401, `Expected 401, got ${res.status}`);
      assert(!res.cookies.get('auth_token'), 'Cookie must not be set');
    }
  );

  await runTest(
    'Category 1',
    '1.6 NoSQL/Object injection: email as filter object ({"$gt": ""})',
    async () => {
      const req = createLoginRequest({
        email: { $gt: '' },
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 400, `Expected 400, got ${res.status}`);
      const body = await res.json();
      assert(body.error === 'Email and password are required', 'Expected validation error');
    }
  );

  await runTest(
    'Category 1',
    '1.7 NoSQL/Object injection: password as filter object ({"$ne": null})',
    async () => {
      const req = createLoginRequest({
        email: 'admin@capacityconnect.gov',
        password: { $ne: null },
      });
      const res = await loginPost(req);
      assert(res.status === 400, `Expected 400, got ${res.status}`);
    }
  );

  await runTest(
    'Category 1',
    '1.8 Array injection: email as string array (["admin@capacityconnect.gov"])',
    async () => {
      const req = createLoginRequest({
        email: ['admin@capacityconnect.gov'],
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 400, `Expected 400, got ${res.status}`);
    }
  );

  await runTest(
    'Category 1',
    '1.9 Array injection: password as array (["Password123!"])',
    async () => {
      const req = createLoginRequest({
        email: 'admin@capacityconnect.gov',
        password: ['Password123!'],
      });
      const res = await loginPost(req);
      assert(res.status === 400, `Expected 400, got ${res.status}`);
    }
  );

  await runTest(
    'Category 1',
    '1.10 Type juggling: numeric email (123456)',
    async () => {
      const req = createLoginRequest({ email: 123456, password: 'Password123!' });
      const res = await loginPost(req);
      assert(res.status === 400, `Expected 400, got ${res.status}`);
    }
  );

  await runTest(
    'Category 1',
    '1.11 Type juggling: boolean email (true / false)',
    async () => {
      const req1 = createLoginRequest({ email: true, password: 'Password123!' });
      const res1 = await loginPost(req1);
      assert(res1.status === 400, `Expected 400 for boolean true, got ${res1.status}`);

      const req2 = createLoginRequest({ email: false, password: 'Password123!' });
      const res2 = await loginPost(req2);
      assert(res2.status === 400, `Expected 400 for boolean false, got ${res2.status}`);
    }
  );

  await runTest(
    'Category 1',
    '1.12 Type juggling: null email and password',
    async () => {
      const req = createLoginRequest({ email: null, password: null });
      const res = await loginPost(req);
      assert(res.status === 400, `Expected 400, got ${res.status}`);
    }
  );

  await runTest(
    'Category 1',
    '1.13 Type juggling: numeric password',
    async () => {
      const req = createLoginRequest({ email: 'admin@capacityconnect.gov', password: 123456 });
      const res = await loginPost(req);
      assert(res.status === 400, `Expected 400, got ${res.status}`);
    }
  );

  await runTest(
    'Category 1',
    '1.14 Empty JSON object ({})',
    async () => {
      const req = createLoginRequest({});
      const res = await loginPost(req);
      assert(res.status === 400, `Expected 400, got ${res.status}`);
    }
  );

  await runTest(
    'Category 1',
    '1.15 Empty string credentials (email: "", password: "")',
    async () => {
      const req = createLoginRequest({ email: '', password: '' });
      const res = await loginPost(req);
      assert(res.status === 400, `Expected 400, got ${res.status}`);
    }
  );

  await runTest(
    'Category 1',
    '1.16 Whitespace email string ("   \\t\\n  ")',
    async () => {
      const req = createLoginRequest({ email: '   \t\n  ', password: 'Password123!' });
      const res = await loginPost(req);
      assert(res.status === 400, `Expected 400, got ${res.status}`);
    }
  );

  await runTest(
    'Category 1',
    '1.17 Whitespace password string ("   ")',
    async () => {
      const req = createLoginRequest({ email: 'admin@capacityconnect.gov', password: '   ' });
      const res = await loginPost(req);
      assert(res.status === 401, `Expected 401 for incorrect whitespace password, got ${res.status}`);
      assert(!res.cookies.get('auth_token'), 'Cookie must not be set');
    }
  );

  await runTest(
    'Category 1',
    '1.18 Malformed / non-JSON body payload',
    async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"email": "admin@capacityconnect.gov", "unclosed',
      });
      const res = await loginPost(req);
      assert(res.status === 400, `Expected 400 for bad JSON, got ${res.status}`);
    }
  );

  await runTest(
    'Category 1',
    '1.19 Raw JSON primitives: null, number, boolean, array',
    async () => {
      for (const primitive of ['null', '42', 'true', '["foo"]']) {
        const req = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: primitive,
        });
        const res = await loginPost(req);
        assert(res.status === 400, `Expected 400 for primitive ${primitive}, got ${res.status}`);
      }
    }
  );

  await runTest(
    'Category 1',
    '1.20 Prototype pollution payload (__proto__ injection)',
    async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '__proto__': { isAdmin: true, status: 'APPROVED' },
          email: 'admin@capacityconnect.gov',
          password: 'Password123!',
        }),
      });
      const res = await loginPost(req);
      assert(res.status === 200, `Expected 200 for valid credentials, got ${res.status}`);
      // Verify prototype was not polluted
      assert((Object.prototype as any).isAdmin === undefined, 'Object.prototype was polluted!');
    }
  );

  await runTest(
    'Category 1',
    '1.21 Null byte in email parameter (clean error or 401, no crash)',
    async () => {
      const req = createLoginRequest({
        email: 'admin@capacityconnect.gov\0',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      // Depending on Postgres UTF-8 check, either 401 (not found) or 500 (db driver rejects null byte cleanly)
      assert(
        res.status === 401 || res.status === 500,
        `Expected 401 or 500 without crashing process, got ${res.status}`
      );
      assert(!res.cookies.get('auth_token'), 'Cookie must not be set on null byte injection');
      return `Resolved with status ${res.status}`;
    }
  );

  await runTest(
    'Category 1',
    '1.22 Null byte in password parameter',
    async () => {
      const req = createLoginRequest({
        email: 'admin@capacityconnect.gov',
        password: 'Password123!\0',
      });
      const res = await loginPost(req);
      assert(res.status === 401, `Expected 401, got ${res.status}`);
      assert(!res.cookies.get('auth_token'), 'Cookie must not be set');
    }
  );

  await runTest(
    'Category 1',
    '1.23 Unicode Cyrillic homoglyph in email (\\u0430dmin)',
    async () => {
      // \u0430 is Cyrillic small letter a
      const homoglyphEmail = '\u0430dmin@capacityconnect.gov';
      const req = createLoginRequest({
        email: homoglyphEmail,
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 401, `Expected 401 for homoglyph spoofing, got ${res.status}`);
      assert(!res.cookies.get('auth_token'), 'Cookie must not be set');
    }
  );

  await runTest(
    'Category 1',
    '1.24 Zero-width space in email (admin\\u200B@capacityconnect.gov)',
    async () => {
      const zwsEmail = 'admin\u200B@capacityconnect.gov';
      const req = createLoginRequest({
        email: zwsEmail,
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 401, `Expected 401, got ${res.status}`);
    }
  );

  // ============================================================================
  // CATEGORY 2: Case Sensitivity & Normalization
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('  Category 2: Case Sensitivity & Normalization');
  console.log('--------------------------------------------------------------------------------');

  await runTest(
    'Category 2',
    '2.1 Full uppercase admin email (ADMIN@CAPACITYCONNECT.GOV)',
    async () => {
      const req = createLoginRequest({
        email: 'ADMIN@CAPACITYCONNECT.GOV',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const body = await res.json();
      assert(body.success === true, 'Expected success === true');
      assert(body.user?.role === 'ADMIN', 'Expected role ADMIN');
      assert(body.redirectUrl === '/admin', 'Expected redirectUrl /admin');
      assert(!!res.cookies.get('auth_token'), 'Expected auth_token cookie');
    }
  );

  await runTest(
    'Category 2',
    '2.2 Mixed case admin email (Admin@CapacityConnect.Gov)',
    async () => {
      const req = createLoginRequest({
        email: 'Admin@CapacityConnect.Gov',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
    }
  );

  await runTest(
    'Category 2',
    '2.3 Full uppercase trainer email (TRAINER@CAPACITYCONNECT.GOV)',
    async () => {
      const req = createLoginRequest({
        email: 'TRAINER@CAPACITYCONNECT.GOV',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const body = await res.json();
      assert(body.user?.role === 'TRAINER', 'Expected role TRAINER');
      assert(body.redirectUrl === '/trainer', 'Expected redirectUrl /trainer');
    }
  );

  await runTest(
    'Category 2',
    '2.4 Full uppercase trainee email (TRAINEE@CAPACITYCONNECT.GOV)',
    async () => {
      const req = createLoginRequest({
        email: 'TRAINEE@CAPACITYCONNECT.GOV',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const body = await res.json();
      assert(body.user?.role === 'TRAINEE', 'Expected role TRAINEE');
      assert(body.redirectUrl === '/trainee', 'Expected redirectUrl /trainee');
    }
  );

  await runTest(
    'Category 2',
    '2.5 Leading and trailing whitespace ("  admin@capacityconnect.gov  ")',
    async () => {
      const req = createLoginRequest({
        email: '  admin@capacityconnect.gov  ',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
    }
  );

  await runTest(
    'Category 2',
    '2.6 Tabs and newlines whitespace ("\\t\\nadmin@capacityconnect.gov\\r\\n")',
    async () => {
      const req = createLoginRequest({
        email: '\t\nadmin@capacityconnect.gov\r\n',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
    }
  );

  await runTest(
    'Category 2',
    '2.7 Uppercase + whitespace combined ("   TRAINEE@CAPACITYCONNECT.GOV   ")',
    async () => {
      const req = createLoginRequest({
        email: '   TRAINEE@CAPACITYCONNECT.GOV   ',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
    }
  );

  await runTest(
    'Category 2',
    '2.8 Internal whitespace ("admin @capacityconnect.gov") must be rejected',
    async () => {
      const req = createLoginRequest({
        email: 'admin @capacityconnect.gov',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 401, `Expected 401 for internal whitespace, got ${res.status}`);
    }
  );

  // ============================================================================
  // CATEGORY 3: Credential Enumeration Prevention
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('  Category 3: Credential Enumeration Prevention');
  console.log('--------------------------------------------------------------------------------');

  await runTest(
    'Category 3',
    '3.1 Status code uniformity: Wrong password vs Non-existent user (both 401)',
    async () => {
      const wrongPassReq = createLoginRequest({
        email: 'admin@capacityconnect.gov',
        password: 'WrongPassword999!',
      });
      const wrongPassRes = await loginPost(wrongPassReq);

      const nonExistentReq = createLoginRequest({
        email: 'phantom.officer.404@capacityconnect.gov',
        password: 'Password123!',
      });
      const nonExistentRes = await loginPost(nonExistentReq);

      assert(wrongPassRes.status === 401, `Expected 401 for wrong pass, got ${wrongPassRes.status}`);
      assert(nonExistentRes.status === 401, `Expected 401 for non-existent, got ${nonExistentRes.status}`);
    }
  );

  await runTest(
    'Category 3',
    '3.2 Error message uniformity: Exact match ("Invalid email or password")',
    async () => {
      const wrongPassReq = createLoginRequest({
        email: 'admin@capacityconnect.gov',
        password: 'WrongPassword999!',
      });
      const wrongPassRes = await loginPost(wrongPassReq);
      const wrongPassBody = await wrongPassRes.json();

      const nonExistentReq = createLoginRequest({
        email: 'phantom.officer.404@capacityconnect.gov',
        password: 'Password123!',
      });
      const nonExistentRes = await loginPost(nonExistentReq);
      const nonExistentBody = await nonExistentRes.json();

      assert(
        wrongPassBody.error === 'Invalid email or password',
        `Wrong password gave '${wrongPassBody.error}'`
      );
      assert(
        nonExistentBody.error === 'Invalid email or password',
        `Non-existent user gave '${nonExistentBody.error}'`
      );
      assert(
        wrongPassBody.error === nonExistentBody.error,
        'Error messages differ! Credential enumeration vulnerability detected.'
      );
    }
  );

  await runTest(
    'Category 3',
    '3.3 Cookie absence: Neither wrong pass nor non-existent user sets auth_token',
    async () => {
      const wrongPassReq = createLoginRequest({
        email: 'admin@capacityconnect.gov',
        password: 'WrongPassword999!',
      });
      const wrongPassRes = await loginPost(wrongPassReq);
      assert(!wrongPassRes.cookies.get('auth_token'), 'Wrong pass must not set cookie');

      const nonExistentReq = createLoginRequest({
        email: 'phantom.officer.404@capacityconnect.gov',
        password: 'Password123!',
      });
      const nonExistentRes = await loginPost(nonExistentReq);
      assert(!nonExistentRes.cookies.get('auth_token'), 'Non-existent user must not set cookie');
    }
  );

  await runTest(
    'Category 3',
    '3.4 Header leakage check: No user-revealing custom headers',
    async () => {
      const req = createLoginRequest({
        email: 'admin@capacityconnect.gov',
        password: 'WrongPassword999!',
      });
      const res = await loginPost(req);

      res.headers.forEach((_, header) => {
        const lower = header.toLowerCase();
        assert(
          !lower.includes('user') && !lower.includes('account') && !lower.includes('exist'),
          `Potentially leaky header detected: ${header}`
        );
      });
    }
  );

  await runTest(
    'Category 3',
    '3.5 Timing analysis: Measuring bcrypt execution delta vs db-miss',
    async () => {
      // Warm up
      await loginPost(createLoginRequest({ email: 'admin@capacityconnect.gov', password: 'x' }));
      await loginPost(createLoginRequest({ email: 'ghost@ghost.gov', password: 'x' }));

      const existingTimes: number[] = [];
      const nonExistentTimes: number[] = [];

      for (let i = 0; i < 3; i++) {
        const t0 = performance.now();
        await loginPost(createLoginRequest({ email: 'admin@capacityconnect.gov', password: 'WrongPassword999!' }));
        existingTimes.push(performance.now() - t0);

        const t1 = performance.now();
        await loginPost(createLoginRequest({ email: 'phantom.ghost.user.999@capacityconnect.gov', password: 'Password123!' }));
        nonExistentTimes.push(performance.now() - t1);
      }

      const avgExisting = existingTimes.reduce((a, b) => a + b, 0) / existingTimes.length;
      const avgNonExistent = nonExistentTimes.reduce((a, b) => a + b, 0) / nonExistentTimes.length;
      const delta = Math.abs(avgExisting - avgNonExistent);

      return `Avg existing: ${avgExisting.toFixed(1)}ms, Avg non-existent: ${avgNonExistent.toFixed(1)}ms, Delta: ${delta.toFixed(1)}ms`;
    }
  );

  // ============================================================================
  // CATEGORY 4: Backdoor & Bypass Stress Tests
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('  Category 4: Backdoor & Bypass Stress Tests');
  console.log('--------------------------------------------------------------------------------');

  await runTest(
    'Category 4',
    '4.1 Backdoor check: Verify Password123! does NOT bypass against different password',
    async () => {
      // Create a dedicated temporary user with a different password
      const uniqueEmail = `temp.challenge.${Date.now()}@capacityconnect.gov`;
      const secretPassword = 'MySuperUniquePassword2026!#$';
      const passwordHash = await hashPassword(secretPassword);

      const tempUser = await prisma.user.create({
        data: {
          email: uniqueEmail,
          passwordHash,
          role: 'TRAINEE',
          status: 'APPROVED',
          profile: {
            create: {
              fullName: 'Challenger Temp User',
            },
          },
        },
      });

      try {
        // Attempt 1: Log in with Password123! (must FAIL)
        const backdoorReq = createLoginRequest({
          email: uniqueEmail,
          password: 'Password123!',
        });
        const backdoorRes = await loginPost(backdoorReq);
        assert(backdoorRes.status === 401, `Backdoor vulnerability! Expected 401, got ${backdoorRes.status}`);

        // Attempt 2: Log in with real password (must SUCCEED)
        const realReq = createLoginRequest({
          email: uniqueEmail,
          password: secretPassword,
        });
        const realRes = await loginPost(realReq);
        assert(realRes.status === 200, `Real password failed! Expected 200, got ${realRes.status}`);
      } finally {
        // Cleanup temp user
        await prisma.profile.deleteMany({ where: { userId: tempUser.id } });
        await prisma.user.delete({ where: { id: tempUser.id } });
      }
    }
  );

  await runTest(
    'Category 4',
    '4.2 Empty password hash in DB: comparePassword resilience',
    async () => {
      const isMatch = await comparePassword('Password123!', '');
      assert(isMatch === false, 'comparePassword returned true for empty hash!');
    }
  );

  await runTest(
    'Category 4',
    '4.3 Corrupted bcrypt hash string: comparePassword resilience',
    async () => {
      let isMatch = true;
      try {
        isMatch = await comparePassword('Password123!', 'corrupted-non-bcrypt-hash');
      } catch {
        isMatch = false;
      }
      assert(isMatch === false, 'comparePassword must return false on corrupted hash');
    }
  );

  await runTest(
    'Category 4',
    '4.4 Wildcard and regex password attempts (*, .*, undefined)',
    async () => {
      for (const pass of ['*', '.*', 'admin', 'undefined', 'NaN']) {
        const req = createLoginRequest({
          email: 'admin@capacityconnect.gov',
          password: pass,
        });
        const res = await loginPost(req);
        assert(res.status === 401, `Wildcard password '${pass}' succeeded unexpectedly!`);
      }
    }
  );

  await runTest(
    'Category 4',
    '4.5 JWT Token Forgery: alg "none" attack rejected by verifyToken',
    async () => {
      // Craft unsigned / alg "none" token
      const unsignedPayload = {
        userId: 'fake-admin-id',
        email: 'admin@capacityconnect.gov',
        role: 'ADMIN',
        status: 'APPROVED',
        fullName: 'Forged Admin',
      };
      const headerB64 = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payloadB64 = Buffer.from(JSON.stringify(unsignedPayload)).toString('base64url');
      const unsignedToken = `${headerB64}.${payloadB64}.`;

      const result = await verifyToken(unsignedToken);
      assert(result === null, 'CRITICAL: verifyToken accepted alg "none" unsigned token!');
    }
  );

  await runTest(
    'Category 4',
    '4.6 JWT Token Forgery: Token signed with different secret rejected',
    async () => {
      const attackerSecret = new TextEncoder().encode('attacker-rogue-secret-key-12345');
      const forgedToken = await new SignJWT({
        userId: 'forged-admin-id',
        email: 'admin@capacityconnect.gov',
        role: 'ADMIN',
        status: 'APPROVED',
        fullName: 'Forged Admin',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(attackerSecret);

      const result = await verifyToken(forgedToken);
      assert(result === null, 'CRITICAL: verifyToken accepted token signed with wrong secret!');
    }
  );

  await runTest(
    'Category 4',
    '4.7 JWT Token Tampering: Payload tampering invalidates signature',
    async () => {
      const validToken = await generateToken({
        userId: 'trainee-123',
        email: 'trainee@capacityconnect.gov',
        role: 'TRAINEE',
        status: 'APPROVED',
        fullName: 'Trainee User',
      });

      const parts = validToken.split('.');
      assert(parts.length === 3, 'Expected 3-part JWT');

      // Tamper payload to elevate role to ADMIN
      const payloadObj = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      payloadObj.role = 'ADMIN';
      const tamperedPayloadB64 = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
      const tamperedToken = `${parts[0]}.${tamperedPayloadB64}.${parts[2]}`;

      const result = await verifyToken(tamperedToken);
      assert(result === null, 'CRITICAL: verifyToken accepted tampered token with altered role!');
    }
  );

  await runTest(
    'Category 4',
    '4.8 JWT Expiration: Expired token rejected by verifyToken',
    async () => {
      const JWT_SECRET = new TextEncoder().encode(
        process.env.JWT_SECRET || 'capacity-connect-super-secure-jwt-secret-key-2026'
      );
      const expiredToken = await new SignJWT({
        userId: 'expired-user',
        email: 'expired@capacityconnect.gov',
        role: 'TRAINEE',
        status: 'APPROVED',
        fullName: 'Expired User',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
        .setExpirationTime(Math.floor(Date.now() / 1000) - 10) // 10 seconds in the past
        .sign(JWT_SECRET);

      const result = await verifyToken(expiredToken);
      assert(result === null, 'CRITICAL: verifyToken accepted expired token!');
    }
  );

  // ============================================================================
  // CATEGORY 5: Extreme Load & Resource Boundary Stress
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('  Category 5: Extreme Load & Resource Boundary Stress');
  console.log('--------------------------------------------------------------------------------');

  await runTest(
    'Category 5',
    '5.1 Giant password string (10,000 characters) handles cleanly without crash',
    async () => {
      const hugePassword = 'A'.repeat(10000);
      const req = createLoginRequest({
        email: 'admin@capacityconnect.gov',
        password: hugePassword,
      });
      const res = await loginPost(req);
      assert(res.status === 401, `Expected 401, got ${res.status}`);
      assert(!res.cookies.get('auth_token'), 'Cookie must not be set');
    }
  );

  await runTest(
    'Category 5',
    '5.2 Giant email string (10,000 characters) handles cleanly without crash',
    async () => {
      const hugeEmail = 'b'.repeat(9980) + '@domain.gov';
      const req = createLoginRequest({
        email: hugeEmail,
        password: 'Password123!',
      });
      const res = await loginPost(req);
      assert(res.status === 401, `Expected 401, got ${res.status}`);
    }
  );

  await runTest(
    'Category 5',
    '5.3 Deeply nested JSON object body (50 levels deep)',
    async () => {
      let nested: any = { email: 'admin@capacityconnect.gov' };
      for (let i = 0; i < 50; i++) {
        nested = { child: nested };
      }
      const req = createLoginRequest(nested);
      const res = await loginPost(req);
      assert(res.status === 400, `Expected 400 for nested body missing top-level fields, got ${res.status}`);
    }
  );

  await runTest(
    'Category 5',
    '5.4 Concurrent login bursts: 25 simultaneous login requests',
    async () => {
      const promises = Array.from({ length: 25 }, (_, i) => {
        const isAdmin = i % 2 === 0;
        const email = isAdmin ? 'admin@capacityconnect.gov' : 'trainee@capacityconnect.gov';
        const expectedRole = isAdmin ? 'ADMIN' : 'TRAINEE';
        return loginPost(
          createLoginRequest({ email, password: 'Password123!' })
        ).then(async (res) => {
          assert(res.status === 200, `Concurrent request ${i} failed with status ${res.status}`);
          const body = await res.json();
          assert(body.user?.role === expectedRole, `Concurrent request ${i} role mismatch`);
          assert(!!res.cookies.get('auth_token'), `Concurrent request ${i} missing cookie`);
        });
      });

      await Promise.all(promises);
      return '25/25 concurrent requests resolved with status 200 and valid cookies';
    }
  );

  // ============================================================================
  // SUMMARY REPORT
  // ============================================================================
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0);

  console.log('\n================================================================================');
  console.log('                    ADVERSARIAL STRESS TEST SUMMARY');
  console.log('================================================================================');

  const categories = ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'];
  for (const cat of categories) {
    const catTests = results.filter((r) => r.category === cat);
    const catPassed = catTests.filter((r) => r.passed).length;
    console.log(`  ${cat.padEnd(14)}: ${catPassed} / ${catTests.length} passed`);
  }

  console.log('--------------------------------------------------------------------------------');
  console.log(`  TOTAL ADVERSARIAL TESTS:   ${total}`);
  console.log(`  TOTAL PASSED:              ${passed}`);
  console.log(`  TOTAL FAILED:              ${failed}`);
  console.log(`  TOTAL EXECUTION TIME:      ${totalDuration.toFixed(1)} ms`);
  console.log('================================================================================\n');

  if (failed > 0) {
    console.error(`❌ ADVERSARIAL STRESS TEST FAILED with ${failed} failing tests.`);
    process.exit(1);
  } else {
    console.log(`✅ ALL ${passed}/${total} ADVERSARIAL TESTS PASSED EMPIRICALLY! System robust.\n`);
    process.exit(0);
  }
}

main()
  .catch((e) => {
    console.error('Fatal stress test runner error:', e);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {}
  });
