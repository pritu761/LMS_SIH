# Comprehensive Authentication & Session Architecture Analysis

**Investigator**: `explorer_survey_auth`  
**Date**: 2026-09-03  
**Target Project**: CapacityConnect (LMS SIH)  
**Scope**: Auth endpoints, mock data fallbacks, JWT cryptographic signing/verification, cookie security attributes, bcrypt password hashing, `getCurrentUser()` session helper, and alignment with Requirements R1–R4.

---

## 1. Executive Summary

A deep investigation into CapacityConnect's authentication subsystem was conducted. The codebase currently has the core primitives for modern, edge-compatible authentication:
- **JWT token management** implemented via `jose` (v5.9.6) using HS256 with 7-day expiration.
- **Password hashing** implemented via `bcryptjs` (v2.4.3) with 10 salt rounds.
- **Cookie management** setting `httpOnly`, `sameSite: 'lax'`, `path: '/'`, 7-day `maxAge` on login, and `maxAge: 0` on logout.
- **PostgreSQL Database** hosted on Neon Serverless with Prisma ORM (`@prisma/client` and `@prisma/adapter-pg` v7.10.0), with 16 user accounts already seeded.

However, the existing `POST /api/auth/login` contains **critical architectural gaps and security fallbacks** that violate the authoritative production requirements (R1):
1. **Silent Fallback to Mock Data**: If the database query throws an error or fails to find the user, the handler silently catches the error and checks the in-memory `initialUsers` array in `src/lib/mockData.ts`.
2. **Hardcoded Password Backdoor**: In `src/app/api/auth/login/route.ts` line 46, `password === 'Password123!'` bypasses bcrypt hash comparison entirely, allowing unauthorized login with any user account.
3. **Missing Account Status Guards (403 Forbidden)**: Accounts with `status === 'SUSPENDED'` or `status === 'REJECTED'` are not rejected; instead, tokens are issued and users are routed to `/trainee`.
4. **Prisma Seed Gaps**: `prisma/seed.ts` only seeds 3 IMD users, lacking default generic role personas (`admin@capacityconnect.gov`, `trainer@capacityconnect.gov`, `trainee@capacityconnect.gov`) and lacking suspended/rejected test accounts needed for testing access control.
5. **Missing Verification Test Suite**: No automated test script exists for `npm run test:auth` or `npx tsx scripts/test-auth-db.ts`.

---

## 2. API Routes Investigation

### 2.1. `POST /api/auth/login` (`src/app/api/auth/login/route.ts`)
- **Schema Validation** (lines 9–17):
  - Uses `loginSchema.safeParse(body)` from `src/lib/validations.ts`.
  - Schema requires valid email format and password with `min(6)`.
  - Returns `400 Bad Request` with `{ error: 'Invalid login credentials', details: parsed.error.format() }` on invalid input.
- **Current Database & Mock Fallback Flow** (lines 21–43):
  ```typescript
  // 1. Check in PostgreSQL database
  let dbUser: any = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  } catch (e) {
    // Fallback silently
  }

  // 2. Or check runtime memory
  const mockUser = initialUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

  const user = dbUser || mockUser;

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }
  ```
- **Password Check & Backdoor Bypass** (lines 45–53):
  ```typescript
  const isPasswordValid =
    password === 'Password123!' || (await comparePassword(password, user.passwordHash));

  if (!isPasswordValid) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }
  ```
- **Token & Response Generation** (lines 55–90):
  - Extracts `currentStatus = user.status`, `userRole = user.role`, `fullName = user.profile?.fullName || 'Valued User'`.
  - Signs JWT via `signToken({...})`.
  - Returns JSON with `success: true`, sanitized `user` metadata, and `redirectUrl` (`/auth/pending`, `/admin`, `/trainer`, `/trainee`).
  - Sets cookie via `setAuthCookie(response, token)`.
  - **Defect**: Does not check for `SUSPENDED` or `REJECTED` statuses.

### 2.2. `POST /api/auth/logout` (`src/app/api/auth/logout/route.ts`)
- **Implementation** (lines 1–9):
  ```typescript
  import { NextResponse } from 'next/server';
  import { clearAuthCookie } from '@/lib/auth';

  export async function POST() {
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    clearAuthCookie(response);
    return response;
  }
  ```
- **Evaluation**: Fully compliant with R1/R2. Calls `clearAuthCookie` which sets `maxAge: 0` on `auth_token`.

### 2.3. `GET /api/auth/me` (`src/app/api/auth/me/route.ts`)
- **Implementation** (lines 1–78):
  - Calls `const session = await getCurrentUser()`. If null, returns 401 `{ user: null }`.
  - Queries `prisma.user.findFirst` for user and profile.
  - Still contains fallback to `initialUsers` (line 28).
  - Used by `Navbar.tsx` and `/auth/pending/page.tsx` to poll and inspect current session and status.

### 2.4. `POST /api/auth/register` (`src/app/api/auth/register/route.ts`)
- **Implementation** (lines 1–120):
  - Validates `registerSchema`.
  - Persists new candidate user with `status: 'PENDING'` and `isVerified: false`.
  - Sets `profile` relations.
  - Signs JWT token with `status: 'PENDING'`.
  - Also pushes to memory array `initialUsers` (line 90) as fallback.

### 2.5. `POST /api/auth/demo-login` (`src/app/api/auth/demo-login/route.ts`)
- **Implementation** (lines 1–82):
  - Used by UI evaluator buttons on `/auth/login` and in `Navbar` persona switcher.
  - Queries database first for `targetEmail` or falls back to `initialUsers`.

---

## 3. Mock Data Fallbacks & Backdoors Analysis

| Location | Code Pattern | Problem / Violation | Required Remedy |
| :--- | :--- | :--- | :--- |
| `src/app/api/auth/login/route.ts:28-35` | `const mockUser = initialUsers.find(...)`<br>`const user = dbUser \|\| mockUser;` | Bypasses database verification; allows authentication even if PostgreSQL is offline or user was deleted from DB. | Remove `mockUser` and `initialUsers` import. Query Prisma strictly. If DB throws, return 500. If user not found, return 401. |
| `src/app/api/auth/login/route.ts:45-47` | `password === 'Password123!' \|\| (await comparePassword(...))` | Master password backdoor; allows logging in with any user account using `Password123!` without verifying hash. | Delete `password === 'Password123!' \|\|`. Enforce `await comparePassword(password, user.passwordHash)`. |
| `src/app/api/auth/login/route.ts:55-87` | No status condition for `SUSPENDED` or `REJECTED` | Suspended or rejected users receive a valid JWT and cookie and are redirected to dashboards. | Add status checks: if `user.status === 'SUSPENDED'` return 403. If `user.status === 'REJECTED'` return 403. |
| `src/app/api/auth/me/route.ts:28-30` | `const fullUser = initialUsers.find(...)` | Unnecessary fallback to mock data when database record exists. | Rely on Prisma query for user and profile; fall back to JWT claims only if database is unreachable. |

---

## 4. Auth Utilities & Cryptography (`src/lib/auth.ts`)

### 4.1. JWT Token Signing & Verification
- **Library**: `jose` (`SignJWT`, `jwtVerify`) version `5.9.6`.
- **Edge Compatibility**: Fully edge-compatible! `jose` is built on top of the standard Web Cryptography API (`crypto.subtle`) and `Uint8Array`, meaning it runs seamlessly in Edge runtimes, Route Handlers, and Server Components without native C++ Node.js dependencies.
- **Algorithm**: `HS256` (HMAC with SHA-256).
- **Secret Key Configuration**:
  ```typescript
  const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'capacity-connect-super-secure-jwt-secret-key-2026'
  );
  ```
  - In `.env`:
    `JWT_SECRET="capacity-connect-super-secure-jwt-secret-key-2026-production"`
  - High-entropy production secret is properly defined in `.env`.
- **Payload Claims Structure**:
  ```typescript
  export interface TokenPayload {
    userId: string;
    email: string;
    role: UserRole;       // 'TRAINEE' | 'TRAINER' | 'ADMIN'
    status: UserStatus;   // 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'
    fullName: string;
    [key: string]: unknown;
  }
  ```
- **Token Expiry**: `7d` (7 days), configured via `.setExpirationTime('7d')`.
- **Token Verification**:
  - `verifyToken(token)` handles signature validation and expiration checks.
  - Safely catches errors (`JWTExpired`, `JWSSignatureVerificationFailed`) and returns `null`.

### 4.2. Password Hashing with Bcrypt
- **Library**: `bcryptjs` version `2.4.3` with `@types/bcryptjs` `2.4.6`.
- **Hashing Function**:
  ```typescript
  export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
  ```
  - Standard 10 salt rounds provides optimal security-to-latency balance for route handlers (~70-100ms per verification).
- **Verification Function**:
  ```typescript
  export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  ```
  - Correctly performs constant-time bcrypt hash comparison.

---

## 5. Cookie Handling & Session Lifecycle

### 5.1. Cookie Setting (`setAuthCookie`)
```typescript
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 604,800 seconds (7 days)
  });
}
```
- `name`: `'auth_token'` (standard across application).
- `httpOnly: true`: Prevents client-side script access, protecting against XSS session hijacking.
- `secure: process.env.NODE_ENV === 'production'`: Ensures cookies are transmitted over HTTPS in production, while permitting local HTTP development.
- `sameSite: 'lax'`: Provides protection against cross-site request forgery (CSRF) while allowing smooth top-level navigation.
- `path: '/'`: Cookie is transmitted with all requests across the entire application domain.
- `maxAge`: 604,800 seconds (7 days), synchronizing cookie lifetime with JWT token expiration.

### 5.2. Cookie Invalidation (`clearAuthCookie`)
```typescript
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
```
- Sets `value: ''` and `maxAge: 0`.
- All major browsers immediately discard the cookie upon receiving `maxAge: 0`.

---

## 6. `getCurrentUser()` Helper & Session Validation

### 6.1. Implementation in `src/lib/auth.ts`
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
- **Next.js 15/16 Compatibility**: Uses `await cookies()`, complying with Next.js asynchronous cookie API.
- **Efficiency**: Pure cryptographic token decode and validation; does not introduce database round-trips for every component render.
- **Caller Usages**:
  - `src/app/api/admin/users/route.ts` (checks `session.role === 'ADMIN'`)
  - `src/app/api/assessments/[id]/quiz/route.ts` (checks `!session`)
  - `src/app/api/assessments/[id]/submit/route.ts` (checks `!session`)
  - `src/app/api/trainee/progress/route.ts` (checks `session.userId`)
  - `src/app/api/auth/me/route.ts` (fetches full user details)

### 6.2. Status Validation Considerations (Requirement R2)
Requirement R2 states:
> "Ensure `getCurrentUser()` and session validation helpers accurately decode and validate active tokens against current user status."

**Observations**:
1. If an account is suspended *after* token issuance, a purely stateless JWT might still consider the user valid until expiration.
2. In `TokenPayload`, `status` is already present (`status: UserStatus`).
3. We can enhance `getCurrentUser` or add a helper `validateSession()` such that:
   - If token payload contains `status === 'SUSPENDED'` or `status === 'REJECTED'`, it is rejected (`return null`).
   - For database-backed validation when needed, we can provide `getCurrentUserFromDb()` or an optional parameter `getCurrentUser({ verifyDb: true })`.

---

## 7. Database Models & State Verification

### 7.1. Database Schema (`prisma/schema.prisma`)
- `User` model:
  - `id`: String (UUID, primary key)
  - `email`: String (unique, indexed)
  - `passwordHash`: String
  - `role`: Enum `UserRole` (`TRAINEE`, `TRAINER`, `ADMIN`, default `TRAINEE`, indexed)
  - `status`: Enum `UserStatus` (`PENDING`, `APPROVED`, `SUSPENDED`, `REJECTED`, default `PENDING`, indexed)
  - `isVerified`: Boolean (default `false`)
- `Profile` model:
  - `id`: String (UUID)
  - `userId`: String (unique foreign key to `User.id` with `onDelete: Cascade`)
  - `fullName`: String
  - `avatarUrl`, `headline`, `bio`, `organization`, `department`, `phone`, `location`: String?

### 7.2. Live Database Verification (Executed via `scripts/inspect-db.ts`)
A live inspection of the PostgreSQL database connected via Neon serverless pooler confirmed that 16 users exist in the database, with properly hashed passwords matching `'Password123!'`:
- **Admins**: `admin@capacityconnect.gov`, `dg.imd@moes.gov.in`
- **Trainers**: `trainer@capacityconnect.gov`, `vikram.trainer@capacityconnect.gov`, `vikram.sen@imd.gov.in`, `ananya.roy@moes.gov.in`, `rameshwar.radar@imd.gov.in`, `ramesh@gmail.com`
- **Trainees**: `trainee@capacityconnect.gov`, `aarav.trainee@capacityconnect.gov`, `aarav.patel@imd.gov.in`, `priya.sharma@capacityconnect.gov`, `priya.sharma.1787592967258@gov.in`, `sneha.forecaster@imd.gov.in`, `kavita.drstc@imd.gov.in`, `ujuj8@gmail.com`

All 16 users currently have `status: 'APPROVED'`.  
To test `403 Forbidden` for suspended and rejected accounts, we should add dedicated test accounts in the seed script:
- `suspended.user@capacityconnect.gov` (`status: 'SUSPENDED'`)
- `rejected.user@capacityconnect.gov` (`status: 'REJECTED'`)
- `pending.user@capacityconnect.gov` (`status: 'PENDING'`)

---

## 8. Concrete Implementation Blueprint for R1 & R2

### 8.1. Blueprint for `POST /api/auth/login` (`src/app/api/auth/login/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { signToken, setAuthCookie, comparePassword } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid login credentials', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Strictly query PostgreSQL database via Prisma
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 2. Strict Bcrypt verification - NO hardcoded password backdoor
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 3. Strict Status Access Control
    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact the administrator.' },
        { status: 403 }
      );
    }

    if (user.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'Your registration request has been rejected. Access denied.' },
        { status: 403 }
      );
    }

    const currentStatus = user.status;
    const userRole = user.role;
    const fullName = user.profile?.fullName || 'Valued User';

    // 4. Issue Edge-compatible signed JWT session token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: userRole,
      status: currentStatus,
      fullName: fullName,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: userRole,
        status: currentStatus,
        fullName: fullName,
        avatarUrl: user.profile?.avatarUrl,
        headline: user.profile?.headline,
      },
      redirectUrl:
        currentStatus === 'PENDING'
          ? '/auth/pending'
          : userRole === 'ADMIN'
          ? '/admin'
          : userRole === 'TRAINER'
          ? '/trainer'
          : '/trainee',
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error during authentication', details: error.message },
      { status: 500 }
    );
  }
}
```

### 8.2. Blueprint for `src/lib/auth.ts` Enhancements
1. Ensure `getCurrentUser()` invalidates tokens if status in claim is `SUSPENDED` or `REJECTED`:
   ```typescript
   export async function getCurrentUser(): Promise<TokenPayload | null> {
     try {
       const cookieStore = await cookies();
       const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
       if (!token) return null;
       const payload = await verifyToken(token);
       if (!payload) return null;
       // Reject suspended or rejected sessions immediately
       if (payload.status === 'SUSPENDED' || payload.status === 'REJECTED') {
         return null;
       }
       return payload;
     } catch (error) {
       return null;
     }
   }
   ```
2. Export `TOKEN_COOKIE_NAME` so test suites and routes can reference the cookie name cleanly.

### 8.3. Blueprint for `prisma/seed.ts` (Requirement R3)
Update `prisma/seed.ts` to include:
- Standard users for each role (`ADMIN`, `TRAINER`, `TRAINEE`).
- Test accounts for each status:
  - `admin@capacityconnect.gov` (ADMIN, APPROVED)
  - `trainer@capacityconnect.gov` (TRAINER, APPROVED)
  - `trainee@capacityconnect.gov` (TRAINEE, APPROVED)
  - `pending.trainee@capacityconnect.gov` (TRAINEE, PENDING)
  - `suspended.user@capacityconnect.gov` (TRAINEE, SUSPENDED)
  - `rejected.user@capacityconnect.gov` (TRAINEE, REJECTED)
- Ensure all passwords are hashed with `await bcrypt.hash('Password123!', 10)`.

### 8.4. Blueprint for Programmatic Verification Suite (`scripts/test-auth-db.ts`) (Requirement R4)
The script can directly invoke route handlers (`POST` from `login/route.ts` and `POST` from `logout/route.ts`) using `NextRequest` or perform HTTP calls:
1. **Scenario 1**: Valid credentials (`admin@capacityconnect.gov` + `Password123!`)
   - Asserts HTTP 200.
   - Asserts `auth_token` cookie is present in response headers/cookies.
   - Asserts response JSON contains user details and correct `redirectUrl`.
2. **Scenario 2**: Invalid password (`admin@capacityconnect.gov` + `WrongPassword!`)
   - Asserts HTTP 401.
   - Asserts NO `auth_token` cookie is set.
3. **Scenario 3**: Non-existent user (`nonexistent@capacityconnect.gov` + `Password123!`)
   - Asserts HTTP 401.
   - Asserts NO `auth_token` cookie is set.
4. **Scenario 4**: Logout
   - Calls `POST /api/auth/logout`.
   - Asserts HTTP 200.
   - Asserts `auth_token` cookie has `maxAge: 0` (or expired).
5. **Scenario 5**: Session token decoding & claims verification
   - Takes token generated in Scenario 1.
   - Calls `verifyToken(token)`.
   - Asserts `userId`, `email`, `role`, `status`, and `fullName` match.
6. **Scenario 6 (Bonus/Comprehensive)**: Suspended/Rejected status access denial
   - Calls login with `suspended.user@capacityconnect.gov`.
   - Asserts HTTP 403 Forbidden and no cookie set.

---

## 9. Conclusion

The existing codebase has a sound foundation with `jose`, `bcryptjs`, and PostgreSQL via Prisma. Removing the mock fallbacks, eliminating the `'Password123!'` bypass, enforcing 403 status codes for suspended/rejected accounts, updating the seed script, and creating `scripts/test-auth-db.ts` will achieve 100% compliance with Requirements R1–R4.
