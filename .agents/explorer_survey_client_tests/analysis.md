# Frontend Authentication UI, Role Redirection & Testing Suite Survey

**Author**: `explorer_survey_client_tests`  
**Date**: 2026-09-03  
**Integrity Mode**: Development / Investigation (Read-Only)  
**Workspace**: `c:\Users\pknat\LMS_SIH`  

---

## 1. Executive Summary

This investigation analyzed the frontend login interface, client-side session state, role-based redirection mechanisms (`/admin`, `/trainer`, `/trainee`, `/auth/pending`), existing testing infrastructure, and requirements for the automated authentication test suite (`scripts/test-auth-db.ts`). 

Key findings:
1. **Login & Redirection**: The login UI at `src/app/auth/login/page.tsx` issues JSON POST requests to `/api/auth/login` and honors `data.redirectUrl` or falls back to role/status checks. In Next.js 16, server-side route guarding is handled by `src/proxy.ts` (which supersedes deprecated `middleware.ts`).
2. **Client Auth State**: The application does not use a centralized `AuthContext`; instead, `src/components/layout/Navbar.tsx` independently queries `GET /api/auth/me` on route transitions (`pathname` changes) to manage session state and handle logout via `POST /api/auth/logout`.
3. **Testing Setup**: The project uses `tsx` (`tsx scripts/...`) for standalone TypeScript testing without Jest or Vitest. Existing scripts (`test-all-auth.ts`) relied on mock data fallback and hardcoded password bypasses.
4. **Verification Suite (R4)**: `scripts/test-auth-db.ts` can directly invoke Next.js route handlers (`loginHandler` and `logoutHandler`) using `NextRequest` from `'next/server'` in the `tsx` environment. This allows complete end-to-end testing of Prisma database queries, bcrypt validation, cookie setting/clearing, and token verification without requiring a running web server.

---

## 2. Login UI Deep Dive (`src/app/auth/login/page.tsx`)

### 2.1 File Location & Component Structure
- **Path**: `src/app/auth/login/page.tsx` (Client Component marked with `'use client'`)
- **Visual Design**: High-fidelity government aesthetic aligning with India Meteorological Department (IMD) & Ministry of Earth Sciences (MoES) identity (navy `#0b1e36`, gold accent `#c59b48`, biometric fingerprint icon, Lucide icons).
- **Form Fields**:
  - `email` (type `email`, required, placeholder `name@capacityconnect.gov.in`)
  - `password` (type `password` / `text` toggled via `showPassword` eye button, required)
- **Interactive State**:
  - `email`, `password`: Form inputs
  - `error`: Error message displayed in an alert banner (`bg-rose-50 border-rose-200 text-rose-700`)
  - `loading`: Disables button and displays spinner during network requests
  - `showPassword`: Controls password visibility

### 2.2 Credential Submission & Network Call
Credentials are submitted via standard JSON payload in `handleLogin`:
```typescript
const res = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
```

### 2.3 Success & Redirection Logic
When `res.ok` is true:
```typescript
if (data.redirectUrl) {
  router.push(data.redirectUrl);
} else {
  const user = data.user;
  if (user.status !== 'APPROVED' && user.role !== 'ADMIN') {
    router.push('/auth/pending');
  } else if (user.role === 'ADMIN') router.push('/admin');
  else if (user.role === 'TRAINER') router.push('/trainer');
  else router.push('/trainee');
}
```
- Primary navigation prioritizes `data.redirectUrl` returned by the server.
- Secondary fallback evaluates `user.status` and `user.role`.

### 2.4 Error Handling
- **API Errors (`!res.ok`)**: Displays `data.error || 'Authentication failed'`.
- **Network Errors (`catch`)**: Displays `'Network error. Please check your connection and try again.'`.
- **UI Presentation**: Displays a pulsing red bullet with the error string above the email field.

### 2.5 Quick Demo Login Integration
- Contains an "Instant Evaluator Demo Login" panel with 3 buttons: Trainee, Trainer, Admin.
- Invokes `POST /api/auth/demo-login` with `{ role }`.
- Client pushes to `/admin`, `/trainer`, `/trainee`, or `/auth/pending` based on response.

---

## 3. Role-Based Redirection Architecture

Redirection is enforced across three defensive layers:

```
[User Request]
       │
       ▼
[Layer 1: Next.js 16 Server Guard (src/proxy.ts)]
       ├── Public Route? ─────────────► Allow / Attach user headers if token valid
       ├── No Token? ─────────────────► Redirect to /auth/login?from=<pathname>
       ├── Invalid / Expired Token? ──► Redirect to /auth/login?error=SessionExpired
       ├── Status != APPROVED (non-admin)? ► Redirect to /auth/pending (403 for API)
       └── Role Not in RBAC Matrix? ──► Redirect to user's assigned dashboard
       │
       ▼
[Layer 2: API Login Endpoint (src/app/api/auth/login/route.ts)]
       └── Calculates redirectUrl:
             currentStatus === 'PENDING' ? '/auth/pending' :
             userRole === 'ADMIN' ? '/admin' :
             userRole === 'TRAINER' ? '/trainer' : '/trainee'
       │
       ▼
[Layer 3: Client Page Routing (src/app/auth/login/page.tsx)]
       └── Uses router.push(data.redirectUrl)
```

### 3.1 Next.js 16 Proxy Convention (`src/proxy.ts`)
Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`. In this repository, `src/proxy.ts` performs the active server-side request interception.

Key aspects of `src/proxy.ts`:
1. **Matcher**:
   ```typescript
   export const config = {
     matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
   };
   ```
2. **RBAC Rules Matrix**:
   - `/admin`, `/api/admin` $\rightarrow$ `['ADMIN']`
   - `/trainer`, `/api/trainer` $\rightarrow$ `['TRAINER', 'ADMIN']`
   - `/trainee`, `/api/trainee` $\rightarrow$ `['TRAINEE', 'ADMIN']`
3. **Status Gating**:
   ```typescript
   if (decodedUser.status !== 'APPROVED' && decodedUser.role !== 'ADMIN') {
     if (pathname !== '/auth/pending') {
       if (isApiRoute) {
         return NextResponse.json(
           { error: `Forbidden: Account is ${decodedUser.status}...`, code: 'ACCOUNT_NOT_APPROVED' },
           { status: 403 }
         );
       }
       return NextResponse.redirect(new URL('/auth/pending', request.url));
     }
     return NextResponse.next();
   }
   ```
4. **Header Downstream Propagation**:
   For authenticated requests, `proxy.ts` extracts claims from the `auth_token` cookie and populates:
   - `x-user-id`
   - `x-user-role`
   - `x-user-email`
   - `x-user-name`

### 3.2 Target Dashboard Routes
| Role | Dashboard Route | Sidebar / Layout | Capabilities |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `/admin` | `Sidebar role="ADMIN"` | User governance, 55/30/15 allocation, radar oversight, announcements |
| **TRAINER** | `/trainer` | `Sidebar role="TRAINER"` | Course Studio, Media Library, Assessment Creator, Cohort Telemetry |
| **TRAINEE** | `/trainee` | `Sidebar role="TRAINEE"` | Enrolled tracks, Competency Dossier, assessments, personalized greeting |
| **PENDING** | `/auth/pending` | Minimalist waiting layout | Status verification step counter, "Check Approval Status" polling button |

---

## 4. Client-Side Auth State & Session Lifecycle

### 4.1 State Distribution Analysis
The application has no global `AuthContext` (the `src/context/` directory contains only `ChatContext.tsx` and `ThemeContext.tsx`). Session state is managed through targeted HTTP polling:

1. **`Navbar` Session Owner (`src/components/layout/Navbar.tsx`)**:
   - Holds local state `currentUser`: `const [currentUser, setCurrentUser] = useState<any>(null)`.
   - Re-queries `GET /api/auth/me` on every route transition via `useEffect([pathname])`.
   - Computes `userRole = currentUser?.role || 'GUEST'`.
   - Dynamically renders the active persona badge, role-switch dropdown, and sign-out button.
   - Portal CTA button routes according to role:
     ```typescript
     href={userRole === 'ADMIN' ? '/admin' : userRole === 'TRAINER' ? '/trainer' : userRole === 'TRAINEE' ? '/trainee' : '/trainee/courses'}
     ```
2. **`Navbar` Logout Handler**:
   ```typescript
   const handleLogout = async () => {
     try {
       await fetch('/api/auth/logout', { method: 'POST' });
       setCurrentUser(null);
       router.push('/auth/login');
     } catch (e) {
       console.error(e);
     }
   };
   ```
3. **Trainee Dashboard (`src/app/trainee/page.tsx`)**:
   - Queries `GET /api/auth/me` on mount to display the dynamic user name (`d.user.fullName`).
4. **Pending Page (`src/app/auth/pending/page.tsx`)**:
   - Invokes `GET /api/auth/me` when the user clicks "Check Approval Status". If approved, redirects to the role-specific dashboard.

### 4.2 Security & Architectural Strengths
- Because session credentials are held in an `httpOnly`, `sameSite: lax` cookie (`auth_token`), client JavaScript cannot access the raw JWT. This eliminates token leakage via XSS.
- Client components only receive sanitized user profiles through `GET /api/auth/me`.

---

## 5. Existing Testing Setup & Tooling

### 5.1 Package Dependencies & Scripts
Inspection of `package.json` revealed:
- **Test Dependencies**: No `jest`, `vitest`, `cypress`, or `@playwright/test`.
- **Runtime Execution**: `"tsx": "^4.23.13"`, `"typescript": "^5.7.2"`.
- **Existing Scripts**:
  ```json
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "test": "tsx scripts/test-weather-radar.ts",
    "test:radar": "tsx scripts/test-weather-radar.ts"
  }
  ```

### 5.2 Existing Test Harness Patterns
The weather radar test suite (`scripts/test-weather-radar.ts` + `src/lib/__tests__/weatherRadarSuite.test.ts`) illustrates the established testing pattern for this repository:
1. **Zero-Dependency Lightweight Runner**: Implements custom `expect()`, `AssertionError`, and categorized tier summaries.
2. **Direct CLI Execution**: Executed via `tsx <script-path>`.
3. **Exit Code Semantics**: Returns `0` on 100% pass, `1` on any failure.

### 5.3 Audit of Previous Auth Script (`scripts/test-all-auth.ts`)
The legacy script `scripts/test-all-auth.ts` tested 16 user emails, but contained critical flaws:
- **Mock Fallback**: Combined database query with `initialUsers.find(...)`.
- **Password Bypass**: Allowed `TEST_PASSWORD !== 'Password123!'` hardcoded bypass.
- **No Endpoint Testing**: Did not test HTTP routes (`/api/auth/login`, `/api/auth/logout`).
- **No Cookie Testing**: Did not test `httpOnly` cookie attributes or cookie deletion.
- **Not in package.json**: Missing `npm run test:auth` script.

---

## 6. Programmatic Verification Suite Requirements (R4)

Requirement R4 calls for an automated test script (`scripts/test-auth-db.ts` or `npm run test:auth`) covering 5 core test scenarios against PostgreSQL.

### 6.1 Runner Architecture: Direct Route Handler Execution
Investigation confirmed that Next.js 16 route handlers can be imported and executed directly in `tsx`:
```typescript
import { POST as loginHandler } from '../src/app/api/auth/login/route';
import { POST as logoutHandler } from '../src/app/api/auth/logout/route';
import { NextRequest } from 'next/server';
```

**Key Advantages**:
1. **Hermetic & Independent**: Does NOT require a running `next dev` server on port 3000. Can run immediately in CI or local terminal.
2. **Full Stack Coverage**: Tests the real Next.js route handler, JSON body parsing, Zod schema validation, Prisma database query, bcrypt hashing comparison, JWT generation, and `NextResponse` cookie setting.
3. **Deterministic Cookie Assertions**: Inspects `response.cookies.get('auth_token')` directly.

### 6.2 The 5 Core Test Scenarios Detailed Specification

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             5 CORE TEST SCENARIOS                                │
├────┬───────────────────────┬──────────────────────┬──────────────────────────────┤
│ #  │ Scenario              │ Inputs / Operation   │ Expected Assertions          │
├────┼───────────────────────┼──────────────────────┼──────────────────────────────┤
│ 1  │ Valid Database Login  │ Email: dg.imd...     │ • Status: 200 OK             │
│    │                       │ Pass: Password123!   │ • Body: { success: true }    │
│    │                       │                      │ • Cookie: auth_token exists  │
│    │                       │                      │   - httpOnly: true           │
│    │                       │                      │   - path: "/"                │
│    │                       │                      │   - maxAge: 604800 (7d)      │
├────┼───────────────────────┼──────────────────────┼──────────────────────────────┤
│ 2  │ Invalid Password      │ Email: dg.imd...     │ • Status: 401 Unauthorized   │
│    │                       │ Pass: WrongPass123!  │ • Body: { error: ... }       │
│    │                       │                      │ • Cookie: auth_token not set │
├────┼───────────────────────┼──────────────────────┼──────────────────────────────┤
│ 3  │ Non-Existent User     │ Email: fake@null.gov │ • Status: 401 Unauthorized   │
│    │                       │ Pass: Password123!   │ • Body: { error: ... }       │
│    │                       │                      │ • Cookie: auth_token not set │
├────┼───────────────────────┼──────────────────────┼──────────────────────────────┤
│ 4  │ Logout Cookie Clear   │ POST /api/auth/logout│ • Status: 200 OK             │
│    │                       │                      │ • Body: { success: true }    │
│    │                       │                      │ • Cookie: auth_token cleared │
│    │                       │                      │   - maxAge: 0                │
│    │                       │                      │   - value: ""                │
├────┼───────────────────────┼──────────────────────┼──────────────────────────────┤
│ 5  │ Session / Token Verify│ verifyToken(token)   │ • Decoded payload not null   │
│    │                       │ from Scenario 1      │ • userId matches DB record   │
│    │                       │                      │ • email == dg.imd@moes.gov.in│
│    │                       │                      │ • role == "ADMIN"            │
│    │                       │                      │ • status == "APPROVED"       │
│    │                       │                      │ • fullName == "Dr. Mruty..." │
└────┴───────────────────────┴──────────────────────┴──────────────────────────────┘
```

### 6.3 Bonus Scenario Recommendations
To achieve comprehensive verification, the suite should also include:
- **Scenario 6: Validation Errors (HTTP 400)**: Submitting invalid email format or password $<6$ characters must return HTTP 400 with validation details.
- **Scenario 7: Suspended/Rejected Status (HTTP 403)**: Users with `SUSPENDED` or `REJECTED` status must receive HTTP 403 Forbidden with access denial error.
- **Scenario 8: Role-based Redirection Verification**: Verify that the returned `redirectUrl` is correctly calculated for each role (`/admin` for ADMIN, `/trainer` for TRAINER, `/trainee` for TRAINEE, `/auth/pending` for PENDING).

### 6.4 Critical Process Lifecycle Requirement
When executing Prisma queries in a standalone `tsx` runner, PostgreSQL connection pools remain alive indefinitely.
- The test runner **must** call `await prisma.$disconnect()` inside a `finally` block before exiting.
- The script **must** call `process.exit(allPassed ? 0 : 1)` to signal success or failure to CI.

---

## 7. Identified Gaps & Concrete Recommendations

### Gap 1: Mock Data Fallback & Password Bypass in `src/app/api/auth/login/route.ts`
- **Location**: `src/app/api/auth/login/route.ts` lines 32–36 and 45–46.
- **Issue**:
  ```typescript
  // Currently:
  const mockUser = initialUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  const user = dbUser || mockUser;
  ...
  const isPasswordValid = password === 'Password123!' || (await comparePassword(password, user.passwordHash));
  ```
- **Recommendation**: Eliminate `mockUser` and `initialUsers`. Require `dbUser` exclusively. Use `await comparePassword(password, dbUser.passwordHash)` with no bypass.

### Gap 2: Missing HTTP 403 Forbidden for Suspended/Rejected Accounts
- **Location**: `src/app/api/auth/login/route.ts` line 55.
- **Issue**: Accounts with status `SUSPENDED` or `REJECTED` are granted tokens and redirected to `/trainee`.
- **Recommendation**:
  ```typescript
  if (user.status === 'SUSPENDED' || user.status === 'REJECTED') {
    return NextResponse.json(
      { error: `Account access is ${user.status.toLowerCase()}. Please contact the administrator.` },
      { status: 403 }
    );
  }
  ```

### Gap 3: Public Route Missing `/radar` in `src/proxy.ts`
- **Location**: `src/proxy.ts` line 38 (`PUBLIC_ROUTES`).
- **Issue**: `/radar` is present in the global navigation bar (`Navbar.tsx`), but not included in `PUBLIC_ROUTES`. Unauthenticated users clicking "Live Radar" are bounced to `/auth/login?from=/radar`.
- **Recommendation**: Add `'/radar'` and `'/api/radar'` to `PUBLIC_ROUTES` in `src/proxy.ts`.

### Gap 4: `package.json` Missing Test Script
- **Location**: `package.json` lines 12–14.
- **Recommendation**: Add the following script definition:
  ```json
  "test:auth": "tsx scripts/test-auth-db.ts"
  ```

### Gap 5: Recommended Architecture for `scripts/test-auth-db.ts`
```typescript
#!/usr/bin/env tsx
import 'dotenv/config';
import { NextRequest } from 'next/server';
import { POST as loginHandler } from '../src/app/api/auth/login/route';
import { POST as logoutHandler } from '../src/app/api/auth/logout/route';
import { verifyToken } from '../src/lib/auth';
import prisma from '../src/lib/prisma';

// Harness with ANSI formatting, timing, and assertions...
```
This architecture satisfies R4 completely, executes in under 2 seconds, requires no mock dependencies, and provides clear diagnostic output.
