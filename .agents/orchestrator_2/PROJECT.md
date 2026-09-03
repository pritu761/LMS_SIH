# Project: CapacityConnect Database-Backed Authentication

## Architecture
CapacityConnect is a Next.js 16 (React 19) web application utilizing PostgreSQL hosted on AWS Neon serverless, managed through Prisma ORM v7 with custom client generation at `src/generated/prisma`.

Authentication Architecture:
- **Transport & Storage**: HTTP-Only cookie named `auth_token` containing a signed JSON Web Token (JWT).
- **Token Primitives**: Edge-compatible `jose` library (HS256) with 7-day expiration, signing claims: `userId`, `email`, `role`, `status`, `fullName`.
- **Password Security**: `bcryptjs` salted hashing (10 rounds).
- **Data Access**: Prisma client queries against PostgreSQL `User` and `Profile` models with relations.
- **Route Protection**: Server-side proxy routing (`src/proxy.ts`) and client layout headers (`src/components/layout/Navbar.tsx`) enforcing RBAC (`/admin`, `/trainer`, `/trainee`, `/auth/pending`).

```
[Browser / Client] 
   │
   ├─► POST /api/auth/login ──► Prisma.user.findUnique ──► PostgreSQL
   │       ▲                      │
   │       └─ Set Cookie (JWT) ◄──┘ (Bcrypt compare & status check)
   │
   ├─► POST /api/auth/logout ─► Clear Cookie (maxAge: 0)
   │
   └─► NextRequest / Route Guards (src/proxy.ts) ──► decode JWT ──► RBAC / Redirect
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Strict DB Credential Verification | Query `prisma.user.findUnique` with `include: { profile: true }`, reject missing users | M2 | R1 |
| 2 | Elimination of Mock Fallbacks | Completely remove `initialUsers` fallback from `POST /api/auth/login` | M2 | R1 |
| 3 | Strict Bcrypt Verification | Enforce `await comparePassword(password, user.passwordHash)`, remove `Password123!` bypass | M2 | R1 |
| 4 | Accurate HTTP Status Codes | Return 200 (success), 400 (validation), 401 (invalid credentials / user not found), 403 (suspended / rejected) | M2 | R1 |
| 5 | Session Cookie Issuance | Set `auth_token` cookie with `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, 7-day maxAge | M2 | R2 |
| 6 | Session Termination (Logout) | `POST /api/auth/logout` clearing `auth_token` with `maxAge: 0` and security attributes | M2 | R1 |
| 7 | Edge-Compatible JWT Signing | Sign JWT using `jose` with `userId`, `email`, `role`, `status`, `fullName` claims | M2 | R2 |
| 8 | `getCurrentUser` Validation | Decode JWT cookie and validate status (reject if SUSPENDED or REJECTED) | M2 | R2 |
| 9 | Dynamic Login UI & Redirects | Verify client login flow redirects based on role and status (`/admin`, `/trainer`, `/trainee`, `/auth/pending`) | M2 | R2 |
| 10 | Seed Initial Users | Ensure `prisma/seed.ts` seeds ADMIN, TRAINER, TRAINEE users with bcrypt hashed passwords | M1 | R3 |
| 11 | Seed Script Idempotency | Fix assessment duplication in `prisma/seed.ts` to ensure clean repeat execution | M1 | R3 |
| 12 | Status Personas for Testing | Seed test accounts with `SUSPENDED`, `REJECTED`, and `PENDING` statuses for R1/R4 verification | M1 | R3 |
| 13 | Database & Client Alignment | Confirm Prisma schema, migrations/push, and `src/generated/prisma` client are in sync | M1 | R3 |
| 14 | Programmatic Test Suite | Create `scripts/test-auth-db.ts` testing all 5 core scenarios + status denial against DB | M3 | R4 |
| 15 | NPM Script Integration | Add `"test:auth": "tsx scripts/test-auth-db.ts"` to `package.json` | M3 | R4 |
| 16 | Production Build Verification | Confirm zero TypeScript errors and successful `npm run build` | M3 | Acceptance Criteria |
| 17 | Adversarial Hardening & Audit | Reviewers, Challengers, and Forensic Auditor verify integrity, zero mocks, and robustness | M4 | Gate |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Database & Seed Consistency | Idempotent `prisma/seed.ts`, bcrypt hashed passwords for ADMIN/TRAINER/TRAINEE, status personas (APPROVED, PENDING, SUSPENDED, REJECTED), schema/client sync | none | DONE |
| M2 | Auth Endpoints & Session Management | Strict DB verification in `login/route.ts`, remove mock fallback and backdoor, 403 Forbidden check, cookie management, `getCurrentUser` enhancement | M1 | DONE |
| M3 | Verification Suite & E2E Testing | `scripts/test-auth-db.ts`, `"test:auth"` in `package.json`, 5 core test scenarios passing, clean `npm run build` | M2 | DONE |
| M4 | Gate Verification & Audit | Independent Reviewers, Challengers (adversarial test cases), and Forensic Auditor verification | M3 | IN_PROGRESS |

## Interface Contracts
### Auth API Contract: `POST /api/auth/login`
- **Request**:
  ```json
  {
    "email": "string (valid email format, case-insensitive)",
    "password": "string (min 1 char)"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "user": {
        "id": "string",
        "email": "string",
        "role": "ADMIN | TRAINER | TRAINEE",
        "status": "APPROVED | PENDING",
        "fullName": "string"
      },
      "redirectUrl": "string (/admin | /trainer | /trainee | /auth/pending)"
    }
    ```
    Header `Set-Cookie`: `auth_token=<JWT>; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
  - `400 Bad Request`: `{ "error": "Email and password are required" }`
  - `401 Unauthorized`: `{ "error": "Invalid email or password" }` (for nonexistent user or wrong password)
  - `403 Forbidden`: `{ "error": "Account is suspended. Please contact administration." }` or `{ "error": "Account has been rejected." }`

### Auth API Contract: `POST /api/auth/logout`
- **Request**: Empty body
- **Response**:
  - `200 OK`: `{ "success": true, "message": "Logged out successfully" }`
  - Header `Set-Cookie`: `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`

### Session Helper Contract: `getCurrentUser()`
- **Signature**: `export async function getCurrentUser(): Promise<TokenPayload | null>`
- **Behavior**:
  - Reads `auth_token` from `cookies()`.
  - Verifies signature and expiry using `verifyToken(token)`.
  - Rejects if token is null, invalid, expired, or status is `SUSPENDED` / `REJECTED`.
  - Returns `TokenPayload` or `null`.

## Code Layout
- Exclusive Write Boundaries:
  - **M1 Worker**: `prisma/seed.ts`, `prisma/schema.prisma` (if needed)
  - **M2 Worker**: `src/app/api/auth/login/route.ts`, `src/lib/auth.ts`, `src/proxy.ts` (if radar route needs updating)
  - **M3 Worker / Test Writer**: `scripts/test-auth-db.ts`, `package.json`
- Read-Only: All other files unless explicitly noted.
