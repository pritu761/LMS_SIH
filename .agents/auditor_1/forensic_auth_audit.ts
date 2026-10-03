import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { POST as loginPost } from '../../src/app/api/auth/login/route';
import { POST as logoutPost } from '../../src/app/api/auth/logout/route';
import { hashPassword, comparePassword, signToken, verifyToken, generateToken } from '../../src/lib/auth';
import { prisma } from '../../src/lib/prisma';

interface CheckResult {
  code: string;
  category: string;
  description: string;
  passed: boolean;
  durationMs: number;
  evidence: string;
}

const results: CheckResult[] = [];

function record(
  code: string,
  category: string,
  description: string,
  passed: boolean,
  durationMs: number,
  evidence: string
) {
  results.push({ code, category, description, passed, durationMs, evidence });
  const statusStr = passed ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  console.log(`[${statusStr}] [${code}] ${description} (${durationMs.toFixed(1)}ms)`);
  if (!passed) {
    console.error(`       \x1b[31mEvidence: ${evidence}\x1b[0m`);
  }
}

function createRequest(url: string, body: any): NextRequest {
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

async function runAudit() {
  console.log('\n================================================================================');
  console.log('       FORENSIC INTEGRITY AUDIT: DATABASE-BACKED AUTHENTICATION');
  console.log('================================================================================\n');

  // --------------------------------------------------------------------------
  // CATEGORY A: STATIC CODE ANALYSIS & PROHIBITED PATTERN DETECTION
  // --------------------------------------------------------------------------
  console.log('--- CATEGORY A: Static Code Analysis & Prohibited Patterns ---');

  // A1: Login Route - Mock Data & initialUsers check
  {
    const start = performance.now();
    const loginFilePath = path.resolve(process.cwd(), 'src/app/api/auth/login/route.ts');
    const content = fs.readFileSync(loginFilePath, 'utf8');
    const hasInitialUsers = content.includes('initialUsers');
    const hasMockData = content.includes('mockData');
    const passed = !hasInitialUsers && !hasMockData;
    record(
      'CHK-A1',
      'Static Analysis',
      'src/app/api/auth/login/route.ts contains NO mock data or initialUsers imports',
      passed,
      performance.now() - start,
      passed ? 'Clean: Zero occurrences of initialUsers or mockData found.' : 'VIOLATION: Found mock imports!'
    );
  }

  // A2: Login Route - Hardcoded password backdoor check
  {
    const start = performance.now();
    const loginFilePath = path.resolve(process.cwd(), 'src/app/api/auth/login/route.ts');
    const content = fs.readFileSync(loginFilePath, 'utf8');
    const hasPasswordBackdoor = /password\s*===?\s*['"]Password123!['"]/.test(content) ||
                                /password\s*===?\s*['"]admin['"]/.test(content) ||
                                /\|\|\s*['"]Password123!['"]/.test(content) ||
                                /Password123!/.test(content);
    const passed = !hasPasswordBackdoor;
    record(
      'CHK-A2',
      'Static Analysis',
      'src/app/api/auth/login/route.ts contains NO hardcoded password bypasses or backdoors',
      passed,
      performance.now() - start,
      passed ? 'Clean: No hardcoded password bypasses found.' : 'VIOLATION: Hardcoded password bypass detected!'
    );
  }

  // A3: Login Route - Facade check (returns constant without DB / bcrypt)
  {
    const start = performance.now();
    const loginFilePath = path.resolve(process.cwd(), 'src/app/api/auth/login/route.ts');
    const content = fs.readFileSync(loginFilePath, 'utf8');
    const queriesPrisma = content.includes('prisma.user.findUnique');
    const callsCompare = content.includes('comparePassword');
    const setsCookie = content.includes('setAuthCookie');
    const checksStatus = content.includes("user.status === 'SUSPENDED'") && content.includes("user.status === 'REJECTED'");
    const passed = queriesPrisma && callsCompare && setsCookie && checksStatus;
    record(
      'CHK-A3',
      'Static Analysis',
      'src/app/api/auth/login/route.ts implements full DB query, bcrypt compare, status checks, cookie setting',
      passed,
      performance.now() - start,
      `queriesPrisma=${queriesPrisma}, callsCompare=${callsCompare}, setsCookie=${setsCookie}, checksStatus=${checksStatus}`
    );
  }

  // A4: Logout Route - Cookie clearing verification
  {
    const start = performance.now();
    const logoutFilePath = path.resolve(process.cwd(), 'src/app/api/auth/logout/route.ts');
    const content = fs.readFileSync(logoutFilePath, 'utf8');
    const callsClearCookie = content.includes('clearAuthCookie');
    const passed = callsClearCookie;
    record(
      'CHK-A4',
      'Static Analysis',
      'src/app/api/auth/logout/route.ts invokes clearAuthCookie',
      passed,
      performance.now() - start,
      `callsClearCookie=${callsClearCookie}`
    );
  }

  // A5: Auth Library - Cryptographic implementations
  {
    const start = performance.now();
    const authFilePath = path.resolve(process.cwd(), 'src/lib/auth.ts');
    const content = fs.readFileSync(authFilePath, 'utf8');
    const usesJoseSign = content.includes('SignJWT') && content.includes('.sign(');
    const usesJoseVerify = content.includes('jwtVerify');
    const usesBcryptCompare = content.includes('bcrypt.compare');
    const usesBcryptHash = content.includes('bcrypt.hash') && content.includes('genSalt(10)');
    const passed = usesJoseSign && usesJoseVerify && usesBcryptCompare && usesBcryptHash;
    record(
      'CHK-A5',
      'Static Analysis',
      'src/lib/auth.ts implements genuine jose SignJWT/jwtVerify and bcryptjs 10 salt rounds',
      passed,
      performance.now() - start,
      `usesJoseSign=${usesJoseSign}, usesJoseVerify=${usesJoseVerify}, usesBcryptCompare=${usesBcryptCompare}, usesBcryptHash=${usesBcryptHash}`
    );
  }

  // A6: Programmatic Test Suite - Absence of Mocking & Self-Certification
  {
    const start = performance.now();
    const testSuitePath = path.resolve(process.cwd(), 'scripts/test-auth-db.ts');
    const content = fs.readFileSync(testSuitePath, 'utf8');
    const hasMockLibrary = /jest\.mock|sinon|nock|mockAdapter|proxyquire/.test(content);
    const importsLiveRoutes = content.includes("@/app/api/auth/login/route") && content.includes("@/app/api/auth/logout/route");
    const passed = !hasMockLibrary && importsLiveRoutes;
    record(
      'CHK-A6',
      'Static Analysis',
      'scripts/test-auth-db.ts tests live route handlers without mock libraries',
      passed,
      performance.now() - start,
      `hasMockLibrary=${hasMockLibrary}, importsLiveRoutes=${importsLiveRoutes}`
    );
  }

  // --------------------------------------------------------------------------
  // CATEGORY B: DATABASE AUTHENTICITY & SEED VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n--- CATEGORY B: Database Authenticity & Seed Verification ---');

  // B1: Live DB connection
  {
    const start = performance.now();
    let passed = false;
    let evidence = '';
    try {
      const rawRes = await prisma.$queryRaw<Array<{ result: number }>>`SELECT 1 as result`;
      passed = Array.isArray(rawRes) && rawRes.length > 0 && rawRes[0].result === 1;
      evidence = `Raw PostgreSQL response: ${JSON.stringify(rawRes)}`;
    } catch (err: any) {
      evidence = `DB connection error: ${err.message}`;
    }
    record('CHK-B1', 'Database Verification', 'Live PostgreSQL connectivity via Prisma Client', passed, performance.now() - start, evidence);
  }

  // B2: Query users and verify bcrypt hash structure
  let dbUsers: any[] = [];
  {
    const start = performance.now();
    let passed = false;
    let evidence = '';
    try {
      dbUsers = await prisma.user.findMany({ include: { profile: true } });
      const bcryptRegex = /^\$2[aby]\$10\$[./0-9A-Za-z]{53}$/;
      const allHaveBcrypt10 = dbUsers.length > 0 && dbUsers.every((u) => bcryptRegex.test(u.passwordHash));
      passed = allHaveBcrypt10;
      evidence = `Found ${dbUsers.length} users in DB. All match 10-round bcrypt regex: ${allHaveBcrypt10}`;
    } catch (err: any) {
      evidence = `Error: ${err.message}`;
    }
    record('CHK-B2', 'Database Verification', 'All database users have valid 10-round Bcrypt password hashes ($2a$10$...)', passed, performance.now() - start, evidence);
  }

  // B3: Verify genuine bcrypt password matching on DB hashes
  {
    const start = performance.now();
    let passed = false;
    let evidence = '';
    try {
      const targetUser = dbUsers.find((u) => u.email === 'admin@capacityconnect.gov');
      if (!targetUser) {
        evidence = 'admin@capacityconnect.gov not found in DB';
      } else {
        const matchValid = await bcrypt.compare('Password123!', targetUser.passwordHash);
        const matchInvalid = await bcrypt.compare('WrongPassword999!', targetUser.passwordHash);
        passed = matchValid === true && matchInvalid === false;
        evidence = `admin user hash verified: correctPassword=${matchValid}, wrongPassword=${matchInvalid}`;
      }
    } catch (err: any) {
      evidence = `Error: ${err.message}`;
    }
    record('CHK-B3', 'Database Verification', 'Bcrypt password comparison accurately verifies valid vs invalid passwords', passed, performance.now() - start, evidence);
  }

  // B4: Verify Role Personas in PostgreSQL
  {
    const start = performance.now();
    const hasAdmin = dbUsers.some((u) => u.role === 'ADMIN');
    const hasTrainer = dbUsers.some((u) => u.role === 'TRAINER');
    const hasTrainee = dbUsers.some((u) => u.role === 'TRAINEE');
    const passed = hasAdmin && hasTrainer && hasTrainee;
    const evidence = `ADMIN=${hasAdmin}, TRAINER=${hasTrainer}, TRAINEE=${hasTrainee}`;
    record('CHK-B4', 'Database Verification', 'PostgreSQL contains seed accounts for all roles (ADMIN, TRAINER, TRAINEE)', passed, performance.now() - start, evidence);
  }

  // B5: Verify Status Personas in PostgreSQL
  {
    const start = performance.now();
    const hasApproved = dbUsers.some((u) => u.status === 'APPROVED');
    const hasPending = dbUsers.some((u) => u.status === 'PENDING');
    const hasSuspended = dbUsers.some((u) => u.status === 'SUSPENDED');
    const hasRejected = dbUsers.some((u) => u.status === 'REJECTED');
    const passed = hasApproved && hasPending && hasSuspended && hasRejected;
    const evidence = `APPROVED=${hasApproved}, PENDING=${hasPending}, SUSPENDED=${hasSuspended}, REJECTED=${hasRejected}`;
    record('CHK-B5', 'Database Verification', 'PostgreSQL contains seed accounts for all statuses (APPROVED, PENDING, SUSPENDED, REJECTED)', passed, performance.now() - start, evidence);
  }

  // --------------------------------------------------------------------------
  // CATEGORY C: RUNTIME BEHAVIORAL EXECUTION (API HANDLERS)
  // --------------------------------------------------------------------------
  console.log('\n--- CATEGORY C: Runtime Behavioral Execution ---');

  let issuedToken = '';

  // C1: Valid Admin Login (HTTP 200, JWT Cookie, correct redirect)
  {
    const start = performance.now();
    let passed = false;
    let evidence = '';
    try {
      const req = createRequest('http://localhost:3000/api/auth/login', {
        email: 'admin@capacityconnect.gov',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      const body = await res.json();
      const cookie = res.cookies.get('auth_token');

      passed =
        res.status === 200 &&
        body.success === true &&
        body.user?.email === 'admin@capacityconnect.gov' &&
        body.user?.role === 'ADMIN' &&
        body.redirectUrl === '/admin' &&
        !!cookie &&
        cookie.httpOnly === true &&
        cookie.sameSite === 'lax' &&
        cookie.maxAge === 604800 &&
        cookie.path === '/';

      issuedToken = cookie?.value || '';
      evidence = `status=${res.status}, role=${body.user?.role}, redirect=${body.redirectUrl}, cookieHttpOnly=${cookie?.httpOnly}, maxAge=${cookie?.maxAge}`;
    } catch (err: any) {
      evidence = `Error: ${err.message}`;
    }
    record('CHK-C1', 'Runtime Execution', 'Valid admin login returns HTTP 200, role redirect /admin, and 7-day httpOnly cookie', passed, performance.now() - start, evidence);
  }

  // C2: Invalid Password (HTTP 401, no cookie)
  {
    const start = performance.now();
    let passed = false;
    let evidence = '';
    try {
      const req = createRequest('http://localhost:3000/api/auth/login', {
        email: 'admin@capacityconnect.gov',
        password: 'IncorrectPassword!',
      });
      const res = await loginPost(req);
      const body = await res.json();
      const cookie = res.cookies.get('auth_token');

      passed =
        res.status === 401 &&
        body.error === 'Invalid email or password' &&
        cookie === undefined;
      evidence = `status=${res.status}, error=${body.error}, cookieSet=${!!cookie}`;
    } catch (err: any) {
      evidence = `Error: ${err.message}`;
    }
    record('CHK-C2', 'Runtime Execution', 'Invalid password returns HTTP 401 and sets NO auth cookie', passed, performance.now() - start, evidence);
  }

  // C3: Non-existent User (HTTP 401, uniform error message, no cookie)
  {
    const start = performance.now();
    let passed = false;
    let evidence = '';
    try {
      const req = createRequest('http://localhost:3000/api/auth/login', {
        email: 'nobody.ghost.999@capacityconnect.gov',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      const body = await res.json();
      const cookie = res.cookies.get('auth_token');

      passed =
        res.status === 401 &&
        body.error === 'Invalid email or password' &&
        cookie === undefined;
      evidence = `status=${res.status}, error=${body.error}, cookieSet=${!!cookie}`;
    } catch (err: any) {
      evidence = `Error: ${err.message}`;
    }
    record('CHK-C3', 'Runtime Execution', 'Non-existent user returns uniform HTTP 401 and sets NO auth cookie', passed, performance.now() - start, evidence);
  }

  // C4: Suspended Account Login (HTTP 403 Forbidden)
  {
    const start = performance.now();
    let passed = false;
    let evidence = '';
    try {
      const req = createRequest('http://localhost:3000/api/auth/login', {
        email: 'suspended@capacityconnect.org',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      const body = await res.json();
      const cookie = res.cookies.get('auth_token');

      passed =
        res.status === 403 &&
        body.error === 'Account is suspended. Please contact administration.' &&
        cookie === undefined;
      evidence = `status=${res.status}, error=${body.error}, cookieSet=${!!cookie}`;
    } catch (err: any) {
      evidence = `Error: ${err.message}`;
    }
    record('CHK-C4', 'Runtime Execution', 'Suspended account returns HTTP 403 Forbidden and sets NO auth cookie', passed, performance.now() - start, evidence);
  }

  // C5: Rejected Account Login (HTTP 403 Forbidden)
  {
    const start = performance.now();
    let passed = false;
    let evidence = '';
    try {
      const req = createRequest('http://localhost:3000/api/auth/login', {
        email: 'rejected@capacityconnect.org',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      const body = await res.json();
      const cookie = res.cookies.get('auth_token');

      passed =
        res.status === 403 &&
        body.error === 'Account has been rejected.' &&
        cookie === undefined;
      evidence = `status=${res.status}, error=${body.error}, cookieSet=${!!cookie}`;
    } catch (err: any) {
      evidence = `Error: ${err.message}`;
    }
    record('CHK-C5', 'Runtime Execution', 'Rejected account returns HTTP 403 Forbidden and sets NO auth cookie', passed, performance.now() - start, evidence);
  }

  // C6: Pending Account Login (HTTP 200, redirect /auth/pending)
  {
    const start = performance.now();
    let passed = false;
    let evidence = '';
    try {
      const req = createRequest('http://localhost:3000/api/auth/login', {
        email: 'pending@capacityconnect.org',
        password: 'Password123!',
      });
      const res = await loginPost(req);
      const body = await res.json();
      const cookie = res.cookies.get('auth_token');

      passed =
        res.status === 200 &&
        body.success === true &&
        body.user?.status === 'PENDING' &&
        body.redirectUrl === '/auth/pending' &&
        !!cookie;
      evidence = `status=${res.status}, userStatus=${body.user?.status}, redirect=${body.redirectUrl}, cookieSet=${!!cookie}`;
    } catch (err: any) {
      evidence = `Error: ${err.message}`;
    }
    record('CHK-C6', 'Runtime Execution', 'Pending account returns HTTP 200 with redirect to /auth/pending', passed, performance.now() - start, evidence);
  }

  // C7: Logout Route (HTTP 200, maxAge: 0, cookie cleared)
  {
    const start = performance.now();
    let passed = false;
    let evidence = '';
    try {
      const res = await logoutPost();
      const body = await res.json();
      const cookie = res.cookies.get('auth_token');

      passed =
        res.status === 200 &&
        body.success === true &&
        body.message === 'Logged out successfully' &&
        !!cookie &&
        cookie.value === '' &&
        cookie.maxAge === 0 &&
        cookie.httpOnly === true;
      evidence = `status=${res.status}, message=${body.message}, cookieValue='${cookie?.value}', maxAge=${cookie?.maxAge}`;
    } catch (err: any) {
      evidence = `Error: ${err.message}`;
    }
    record('CHK-C7', 'Runtime Execution', 'POST /api/auth/logout expires auth_token cookie with maxAge: 0', passed, performance.now() - start, evidence);
  }

  // --------------------------------------------------------------------------
  // CATEGORY D: CRYPTOGRAPHIC SECURITY & SESSION LIFECYCLE
  // --------------------------------------------------------------------------
  console.log('\n--- CATEGORY D: Cryptographic Security & Session Lifecycle ---');

  // D1: Verify genuine JWT signature & payload decoding
  {
    const start = performance.now();
    let passed = false;
    let evidence = '';
    try {
      const payload = await verifyToken(issuedToken);
      passed =
        payload !== null &&
        payload.email === 'admin@capacityconnect.gov' &&
        payload.role === 'ADMIN' &&
        payload.status === 'APPROVED' &&
        typeof payload.userId === 'string' &&
        payload.userId.length > 0;
      evidence = `Decoded claims: email=${payload?.email}, role=${payload?.role}, status=${payload?.status}, userId=${payload?.userId}`;
    } catch (err: any) {
      evidence = `Error: ${err.message}`;
    }
    record('CHK-D1', 'Cryptographic Security', 'Issued JWT token is cryptographically valid and decrypts genuine claims', passed, performance.now() - start, evidence);
  }

  // D2: Tampered Token Detection (Anti-forgery)
  {
    const start = performance.now();
    let passed = false;
    let evidence = '';
    try {
      const tampered = issuedToken.slice(0, -8) + 'ABCDEFGH';
      const decoded = await verifyToken(tampered);
      passed = decoded === null;
      evidence = `Tampered token returned: ${decoded}`;
    } catch (err: any) {
      evidence = `Error: ${err.message}`;
    }
    record('CHK-D2', 'Cryptographic Security', 'Tampered JWT signature is rejected with null', passed, performance.now() - start, evidence);
  }

  // D3: Bcrypt Work Factor Timing Analysis
  {
    const start = performance.now();
    const rounds10Salt = await bcrypt.genSalt(10);
    const hashStart = performance.now();
    await bcrypt.hash('TestPassword123!', rounds10Salt);
    const hashDuration = performance.now() - hashStart;

    const compareStart = performance.now();
    const adminUser = dbUsers.find((u) => u.email === 'admin@capacityconnect.gov');
    await comparePassword('Password123!', adminUser.passwordHash);
    const compareDuration = performance.now() - compareStart;

    // Genuine 10-round bcrypt takes typically >20ms
    const passed = compareDuration > 10.0;
    const evidence = `bcrypt.hash duration: ${hashDuration.toFixed(1)}ms, comparePassword duration: ${compareDuration.toFixed(1)}ms (genuine CPU work factor)`;
    record('CHK-D3', 'Cryptographic Security', 'Bcrypt computation latency confirms genuine work factor 10 key derivation (not mocked)', passed, performance.now() - start, evidence);
  }

  // --------------------------------------------------------------------------
  // CATEGORY E: ADVERSARIAL STRESS TESTING
  // --------------------------------------------------------------------------
  console.log('\n--- CATEGORY E: Adversarial Stress Testing ---');

  // E1: SQL Injection in Email Field
  {
    const start = performance.now();
    let passed = false;
    let evidence = '';
    try {
      const sqlInjectionPayloads = [
        "admin@capacityconnect.gov' OR '1'='1",
        "'; DROP TABLE \"User\"; --",
        "\" OR \"\"=\"",
        "admin'--",
      ];

      let allRejectedSafely = true;
      for (const payload of sqlInjectionPayloads) {
        const req = createRequest('http://localhost:3000/api/auth/login', {
          email: payload,
          password: 'Password123!',
        });
        const res = await loginPost(req);
        if (res.status !== 401) {
          allRejectedSafely = false;
          evidence = `Payload '${payload}' returned status ${res.status} instead of 401!`;
          break;
        }
      }

      if (allRejectedSafely) {
        passed = true;
        evidence = `All 4 SQL injection payloads safely neutralized with HTTP 401 by Prisma parameterized queries`;
      }
    } catch (err: any) {
      evidence = `Error: ${err.message}`;
    }
    record('CHK-E1', 'Adversarial Defense', 'SQL injection vectors in email are safely neutralized with HTTP 401', passed, performance.now() - start, evidence);
  }

  // E2: Case Insensitivity of Login Email
  {
    const start = performance.now();
    let passed = false;
    let evidence = '';
    try {
      const upperReq = createRequest('http://localhost:3000/api/auth/login', {
        email: 'ADMIN@CAPACITYCONNECT.GOV',
        password: 'Password123!',
      });
      const res = await loginPost(upperReq);
      passed = res.status === 200;
      evidence = `Uppercase email login returned status ${res.status}`;
    } catch (err: any) {
      evidence = `Error: ${err.message}`;
    }
    record('CHK-E2', 'Adversarial Defense', 'Case-insensitive email normalization accepts uppercase input', passed, performance.now() - start, evidence);
  }

  // E3: Malformed & Invalid JSON Payloads
  {
    const start = performance.now();
    let passed = false;
    let evidence = '';
    try {
      const badReq = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"email": unclosed-json',
      });
      const res = await loginPost(badReq);
      passed = res.status === 400;
      evidence = `Malformed JSON returned status ${res.status}`;
    } catch (err: any) {
      evidence = `Error: ${err.message}`;
    }
    record('CHK-E3', 'Adversarial Defense', 'Malformed JSON payload is caught and returns HTTP 400 Bad Request', passed, performance.now() - start, evidence);
  }

  // E4: Empty / Missing / Whitespace Inputs
  {
    const start = performance.now();
    let passed = false;
    let evidence = '';
    try {
      const testCases = [
        { body: { email: '', password: 'Password123!' } },
        { body: { email: '   ', password: 'Password123!' } },
        { body: { email: 'admin@capacityconnect.gov', password: '' } },
        { body: {} },
        { body: null },
      ];

      let all400 = true;
      for (const tc of testCases) {
        const req = createRequest('http://localhost:3000/api/auth/login', tc.body);
        const res = await loginPost(req);
        if (res.status !== 400) {
          all400 = false;
          evidence = `Test case ${JSON.stringify(tc.body)} returned status ${res.status}`;
          break;
        }
      }

      passed = all400;
      if (all400) evidence = 'All 5 empty/whitespace/missing combinations returned HTTP 400 Bad Request';
    } catch (err: any) {
      evidence = `Error: ${err.message}`;
    }
    record('CHK-E4', 'Adversarial Defense', 'Missing or blank credentials strictly return HTTP 400 Bad Request', passed, performance.now() - start, evidence);
  }

  // --------------------------------------------------------------------------
  // SUMMARY REPORT & VERDICT
  // --------------------------------------------------------------------------
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0);

  console.log('\n================================================================================');
  console.log('                          AUDIT FORENSICS SUMMARY');
  console.log('================================================================================');
  console.log(`TOTAL CHECKS:     ${total}`);
  console.log(`PASSED:           ${passedCount}`);
  console.log(`FAILED:           ${failedCount}`);
  console.log(`TOTAL DURATION:   ${totalDuration.toFixed(1)} ms`);

  const verdict = failedCount === 0 ? 'CLEAN' : 'INTEGRITY VIOLATION';
  console.log(`VERDICT:          ${verdict}`);
  console.log('================================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAudit()
  .catch((e) => {
    console.error('Fatal audit runner error:', e);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // Ignore
    }
  });
