# Plan: Production-Grade Database-Backed Authentication System

## Mission Objective
Implement a complete, production-grade database-backed user authentication system (login and logout) using PostgreSQL and Prisma ORM for CapacityConnect, replacing temporary mock fallbacks with strict database verification, secure bcrypt password hashing, and HTTP-only cookie-based session management.

## Phases

### Phase 0: Survey & Codebase Investigation
- Spawn 3 parallel Explorers to investigate:
  1. Explorer 1: Prisma schema, migrations, database models (User, Profile, Role, Status), seed script (`prisma/seed.ts`), database connectivity/config.
  2. Explorer 2: Existing authentication endpoints (`/api/auth/login`, `/api/auth/logout`), auth helpers (`lib/auth.ts`, session handling, JWT generation, cookie setting), bcrypt integration.
  3. Explorer 3: Frontend login UI (`app/login/page.tsx` or similar), client-side auth context/hooks, role-based redirects (`/admin`, `/trainer`, `/trainee`, `/auth/pending`), existing test scripts/runners.
- Aggregate findings into `PROJECT.md` Feature Inventory and Architecture.

### Phase 1: Decomposition & Interface Contracts
- Create `PROJECT.md` at project root with Architecture, Feature Inventory, Milestones, and Interface Contracts.
- Define explicit write ownership and boundary guidelines.

### Phase 2: Implementation Track - Database & Seed Consistency (M1)
- Dispatch Worker to ensure Prisma schema is up to date, run `prisma generate` / db push if needed, and update seed script to create initial ADMIN, TRAINER, and TRAINEE users with bcrypt hashed passwords.
- Dispatch Reviewers to review schema, seed script, and database verification.

### Phase 3: Implementation Track - Database-Backed Endpoints & Cookie Session Management (M2)
- Dispatch Worker to implement strict database verification in `POST /api/auth/login` and `POST /api/auth/logout`.
- Implement JWT token generation, `auth_token` HTTP-only cookie management (7-day expiry, path=/, sameSite: lax), and `getCurrentUser()`.
- Update login UI to properly redirect authenticated users based on role and status.
- Dispatch Reviewers to review endpoint logic and security attributes.

### Phase 4: Verification Suite & E2E Testing Track (M3)
- Dispatch Test Writer / Worker to create `scripts/test-auth-db.ts` and add `test:auth` npm script.
- Verify all 5 core test scenarios:
  1. Valid credentials -> 200 OK + auth_token cookie.
  2. Invalid password -> 401 Unauthorized + no auth cookie.
  3. Non-existent user -> 401 Unauthorized.
  4. Logout -> clears auth_token cookie (`maxAge: 0`).
  5. Session helper / token verification correctly extracts user metadata.
- Ensure build succeeds (`npm run build`).

### Phase 5: Adversarial & Forensic Audit Verification (Gate)
- Dispatch 2 Challengers to test edge cases (SQL/Prisma injection, token tampering, status bypass, case sensitivity, cookie attributes).
- Dispatch Forensic Auditor to verify no mock data fallbacks, authentic bcrypt comparison, proper database querying, and zero cheating.
- Evaluate Gate criteria in `GATE_STATUS.md`.

### Phase 6: Final Handoff & Reporting
- Prepare final handoff report (`handoff.md`).
- Report complete results to Sentinel/parent.
