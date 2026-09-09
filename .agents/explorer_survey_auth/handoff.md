# Handoff Report: Auth Endpoints & Session Management Survey

**Agent**: `explorer_survey_auth`  
**Parent**: `f8808099-647a-453d-82bb-17517aef9ff0` (`parent`)  
**Status**: Complete (Hard Handoff)  
**Date**: 2026-09-03  

---

## 1. Observation

### Obs 1: Mock User Fallback and DB Error Swallow in `POST /api/auth/login`
- **File**: `c:\Users\pknat\LMS_SIH\src\app\api\auth\login\route.ts` (lines 21–36)
- **Verbatim Code**:
  ```typescript
  // 1. Check in PostgreSQL database
  let dbUser: any = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  } catch (e) {
    // Fallback
  }

  // 2. Or check runtime memory
  const mockUser = initialUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

  const user = dbUser || mockUser;
  ```
- **Finding**: Database exceptions are suppressed silently in an empty `catch` block. If the database lookup fails or the user does not exist in the database, it falls back to the in-memory `initialUsers` array.

### Obs 2: Password Backdoor in `POST /api/auth/login`
- **File**: `c:\Users\pknat\LMS_SIH\src\app\api\auth\login\route.ts` (lines 45–47)
- **Verbatim Code**:
  ```typescript
  // Compare Bcrypt password
  const isPasswordValid =
    password === 'Password123!' || (await comparePassword(password, user.passwordHash));
  ```
- **Finding**: The expression `password === 'Password123!' ||` allows any user account to be authenticated with `'Password123!'` regardless of the bcrypt hash in the database.

### Obs 3: Lack of Access Denial for Suspended / Rejected Accounts
- **File**: `c:\Users\pknat\LMS_SIH\src\app\api\auth\login\route.ts` (lines 55–87)
- **Finding**: The handler only checks `currentStatus === 'PENDING'` for redirection. If `user.status === 'SUSPENDED'` or `'REJECTED'`, the handler still signs a JWT token, issues an `auth_token` cookie, and returns HTTP 200 OK. It does NOT return `403 Forbidden` as specified in Requirement R1.

### Obs 4: JWT Signing and Verification Architecture in `src/lib/auth.ts`
- **File**: `c:\Users\pknat\LMS_SIH\src\lib\auth.ts` (lines 1–61)
- **Verbatim Code**:
  ```typescript
  import { SignJWT, jwtVerify } from 'jose';
  import bcrypt from 'bcryptjs';

  const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'capacity-connect-super-secure-jwt-secret-key-2026'
  );

  const TOKEN_COOKIE_NAME = 'auth_token';
  const TOKEN_EXPIRY = '7d';
  ```
- **Finding**: Uses `jose` (v5.9.6) which is edge-compatible (Web Crypto API). Encodes `JWT_SECRET` as `Uint8Array`. Algorithm is `HS256`. Token claims include `userId`, `email`, `role`, `status`, and `fullName`. Expiration is 7 days (`'7d'`).

### Obs 5: Cookie Flags and Logout Handling
- **File**: `c:\Users\pknat\LMS_SIH\src\lib\auth.ts` (lines 66–91) and `c:\Users\pknat\LMS_SIH\src\app\api\auth\logout\route.ts` (lines 1–9)
- **Verbatim Code**:
  ```typescript
  export function setAuthCookie(response: NextResponse, token: string): void {
    response.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });
  }

  export function clearAuthCookie(response: NextResponse): void {
    response.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  }
  ```
- **Finding**: Proper security attributes (`httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, 7-day `maxAge` on set, `maxAge: 0` on clear). `POST /api/auth/logout` calls `clearAuthCookie(response)` and returns `{ success: true, message: 'Logged out successfully' }`.

### Obs 6: `getCurrentUser()` Session Helper
- **File**: `c:\Users\pknat\LMS_SIH\src\lib\auth.ts` (lines 96–105)
- **Verbatim Code**:
  ```typescript
  export async function getCurrentUser(): Promise<TokenPayload | null> {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
      if (!token) return null;
      return await verifyToken(token);
    } catch (error) {
      return null;
    }
  }
  ```
- **Finding**: Uses async `cookies()` from `next/headers` (compatible with Next.js 15/16). Decodes JWT claims. Does not currently reject tokens where `payload.status === 'SUSPENDED'` or `'REJECTED'`.

### Obs 7: Database Connection and User State
- **Command Executed**: `npx tsx scripts/inspect-db.ts`
- **Result**: PostgreSQL connected cleanly via Neon serverless adapter (`@prisma/adapter-pg`). 16 users exist in the PostgreSQL `User` and `Profile` tables. All 16 users have bcrypt password hashes matching `'Password123!'` and currently have `status: 'APPROVED'`.

### Obs 8: Test Suite and Scripts Gap
- **File**: `package.json` (lines 6–18)
- **Finding**: No `test:auth` script exists in `package.json`. No `scripts/test-auth-db.ts` file exists in `scripts/`.

---

## 2. Logic Chain

1. **R1 Compliance Requirement**: Requirement R1 dictates strict database-driven credential verification in `POST /api/auth/login`, rejection of mock fallbacks, verification against bcrypt hashes, and returning 403 Forbidden for suspended/rejected accounts.
2. **From Obs 1 & Obs 2**: The current `login/route.ts` violates R1 in two ways:
   - If PostgreSQL is queried and fails or user is missing, it falls back to `initialUsers`.
   - The condition `password === 'Password123!' ||` allows credential bypass without hash verification.
3. **From Obs 3**: The current `login/route.ts` violates R1 by failing to check `user.status === 'SUSPENDED'` and `user.status === 'REJECTED'`. Instead of returning HTTP 403 Forbidden with an error message and denying cookie issuance, it issues a valid session cookie and returns HTTP 200.
4. **From Obs 4 & Obs 5**: The cryptographic foundation in `src/lib/auth.ts` (`jose`, HS256, 7d expiry, `auth_token` cookie flags, `clearAuthCookie` with `maxAge: 0`) is fully functional, secure, edge-compatible, and conforms to Requirement R2.
5. **From Obs 6**: `getCurrentUser()` properly extracts claims from `cookies()`. To satisfy R2 ("validate active tokens against current user status"), `getCurrentUser()` should also guard against tokens bearing `SUSPENDED` or `REJECTED` status.
6. **From Obs 7**: The live Neon PostgreSQL database is populated with 16 users, but all have `APPROVED` status. To test access denial for `SUSPENDED` and `REJECTED` accounts in R1 and R4, test accounts with these statuses must be added to the seed logic (R3).
7. **From Obs 8**: To satisfy R4, `scripts/test-auth-db.ts` and `npm run test:auth` must be created to programmatically execute the 5 required test scenarios.

---

## 3. Caveats

- **Network Dependency**: The database connection string in `.env` points to a live AWS Neon serverless instance (`ep-purple-smoke-az3ttzkg-pooler.c-3.ap-southeast-1.aws.neon.tech`). Running queries requires internet connectivity. Local testing confirmed active connectivity and successful queries.
- **Client Components relying on `initialUsers`**: Certain administrative mock views (e.g. `UserApprovalTable.tsx`, `CompetencyGapAnalyzer.tsx`) still import `initialUsers` for initial state demonstration. Removing mock fallback from `POST /api/auth/login` does not break these UI pages because they operate independently or fetch through `/api/admin/*`.

---

## 4. Conclusion

The authentication architecture is robust in its cryptographic primitives (`jose`, `bcryptjs`, and HTTP-only cookie lifecycle), but requires focused remediation in `src/app/api/auth/login/route.ts`, `src/lib/auth.ts`, `prisma/seed.ts`, and test infrastructure:
1. **Refactor `POST /api/auth/login`**:
   - Query `prisma.user.findUnique({ where: { email: email.toLowerCase() }, include: { profile: true } })` strictly. Remove `initialUsers` fallback.
   - Verify password strictly via `await comparePassword(password, user.passwordHash)`. Remove the `password === 'Password123!'` bypass.
   - Add status checks returning HTTP 403 Forbidden for `SUSPENDED` and `REJECTED` accounts.
   - Allow `PENDING` accounts to authenticate with redirect to `/auth/pending`.
   - Issue signed JWT and set `auth_token` cookie only for valid, non-suspended/non-rejected credentials.
2. **Enhance `src/lib/auth.ts`**:
   - Update `getCurrentUser()` to verify that the token does not have `status === 'SUSPENDED'` or `status === 'REJECTED'`.
3. **Update Prisma Seed Script (`prisma/seed.ts`)**:
   - Include test personas for `ADMIN`, `TRAINER`, and `TRAINEE` with `APPROVED`, `PENDING`, `SUSPENDED`, and `REJECTED` statuses.
4. **Implement Programmatic Test Suite (`scripts/test-auth-db.ts`)**:
   - Test all 5 scenarios required by R4 and add `"test:auth": "tsx scripts/test-auth-db.ts"` to `package.json`.

---

## 5. Verification Method

### Step 1: Database Inspection
Execute:
```powershell
npx tsx scripts/inspect-db.ts
```
Expected: Confirms all database user records, roles, statuses, and bcrypt password matches.

### Step 2: Test Script Execution (Once Implemented)
Execute:
```powershell
npm run test:auth
# OR
npx tsx scripts/test-auth-db.ts
```
Expected: All 5 scenarios (and optional status-check scenario) pass:
1. Valid login -> HTTP 200 + `auth_token` cookie + redirectUrl.
2. Invalid password -> HTTP 401 + no auth cookie.
3. Non-existent user -> HTTP 401 + no auth cookie.
4. Logout -> HTTP 200 + `auth_token` cookie cleared (`maxAge: 0`).
5. Token decoding -> user metadata extracted accurately.
6. Suspended user -> HTTP 403 + no auth cookie.

### Step 3: Application Build Verification
Execute:
```powershell
npm run build
```
Expected: Clean build with zero TypeScript or Next.js errors.
