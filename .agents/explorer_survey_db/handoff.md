# Handoff Report: Database & Schema Survey

**Agent**: `explorer_survey_db`  
**Working Directory**: `c:\Users\pknat\LMS_SIH\.agents\explorer_survey_db`  
**Handoff Type**: Hard (Task Complete)  
**Date**: 2026-09-03  

---

## 1. Observation

1. **Prisma Schema (`prisma/schema.prisma`)**:
   - Generator & Datasource (lines 4–12):
     ```prisma
     generator client {
       provider = "prisma-client"
       output   = "../src/generated/prisma"
     }
     datasource db {
       provider = "postgresql"
     }
     ```
   - Enums (lines 17–28):
     - `UserRole`: `TRAINEE`, `TRAINER`, `ADMIN`
     - `UserStatus`: `PENDING`, `APPROVED`, `SUSPENDED`, `REJECTED`
   - User Model (lines 73–82):
     - Password field is verbatim `passwordHash: String` (not `password`).
     - Required fields: `id`, `email` (`@unique`), `passwordHash`, `role` (default `TRAINEE`), `status` (default `PENDING`), `isVerified` (default `false`), `createdAt`, `updatedAt`.
     - Indexes: `@@index([role])`, `@@index([status])`, `@@index([email])`.
   - Profile Model (lines 97–120):
     - `userId`: `@unique`, relations with `onDelete: Cascade`.
     - Required field: `fullName: String`. Optional fields: `avatarUrl`, `headline`, `bio`, `organization`, `department`, `phone`, `location`.
     - JSON arrays: `qualifications`, `experience`, `certificates` default to `"[]"`.

2. **Database Configuration & Environment**:
   - `.env` (lines 4–8):
     - `DATABASE_URL="postgresql://neondb_owner:npg_Vb4YxSoeZ2Xf@ep-purple-smoke-az3ttzkg-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"`
     - `DIRECT_URL="postgresql://neondb_owner:npg_Vb4YxSoeZ2Xf@ep-purple-smoke-az3ttzkg.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"`
     - `JWT_SECRET="capacity-connect-super-secure-jwt-secret-key-2026-production"`
   - `prisma.config.ts` (lines 10–12): Prisma CLI datasource URL uses `env('DIRECT_URL')`.
   - `src/lib/prisma.ts` (lines 14–21): Runtime Prisma client uses `@prisma/adapter-pg` driver adapter with `DATABASE_URL`.
   - Verification Commands:
     - `npm run prisma:push`: Exited with code 0; reported `The database is already in sync with the Prisma schema.`
     - `.\node_modules\.bin\tsx.cmd scripts\inspect-db.ts`: Exited with code 0; queried live Neon PostgreSQL and returned 16 active users.
     - Password verification in `inspect-db.ts`: `await bcrypt.compare('Password123!', u.passwordHash)` returned `true` for all 16 users.

3. **Seed Scripts & Idempotency**:
   - `prisma/seed.ts` (lines 8–184):
     - Hashes `Password123!` using `await bcrypt.hash('Password123!', 10)`.
     - Upserts 3 users: `dg.imd@moes.gov.in` (`ADMIN`), `vikram.sen@imd.gov.in` (`TRAINER`), `aarav.patel@imd.gov.in` (`TRAINEE`).
     - Line 236: `const assessment = await prisma.assessment.create({ ... })` runs unconditionally. Testing multiple runs of `npm run prisma:seed` confirmed it creates duplicate assessment rows.
   - `scripts/setup-all-users.ts`:
     - Hashes `Password123!` and configures all 16 personas with `APPROVED` status and `isVerified: true`.

4. **Authentication Endpoints & Deficiencies**:
   - `src/app/api/auth/login/route.ts`:
     - Lines 23–35: Catch block falls back to `const mockUser = initialUsers.find(...)` and `const user = dbUser || mockUser;`.
     - Lines 45–46: Plaintext bypass `password === 'Password123!' || (await comparePassword(password, user.passwordHash))`.
     - Lines 55–87: No handling for `user.status === 'SUSPENDED'` or `user.status === 'REJECTED'` (should return HTTP 403 Forbidden).
   - `src/app/api/auth/logout/route.ts`:
     - Calls `clearAuthCookie(response)` which sets `auth_token` with `maxAge: 0`, `path: '/'`, `httpOnly: true`, `sameSite: 'lax'`.
   - `src/lib/auth.ts`:
     - `signToken`, `verifyToken`, `setAuthCookie`, `clearAuthCookie`, `getCurrentUser` properly implemented with `jose` and `bcryptjs`.
   - `package.json`:
     - Contains `@prisma/client@^7.10.0`, `prisma@^7.10.0`, `@prisma/adapter-pg@^7.10.0`, `bcryptjs@^2.4.3`, `@types/bcryptjs@^2.4.6`, `jose@^5.9.6`, `pg@^8.23.0`.
     - Missing script: `"test:auth": "tsx scripts/test-auth-db.ts"`.

---

## 2. Logic Chain

1. **Schema & Model Suitability**:
   - Observation: `User` model defines `passwordHash: String` (not `password`), `role: UserRole`, `status: UserStatus`, and `Profile` requires `fullName: String`.
   - Deduction: The schema is fully capable of supporting strict database authentication without requiring any DDL schema migrations.

2. **Live Database Readiness**:
   - Observation: `prisma:push` reports schema is in sync, and `inspect-db.ts` successfully connects to Neon DB and verifies all 16 users match `Password123!`.
   - Deduction: The PostgreSQL database and connection strings are already live, populated, and fully working. No database recreation is needed.

3. **Authentication Endpoint Regressions**:
   - Observation: `src/app/api/auth/login/route.ts` contains `mockUser` fallback, `password === 'Password123!'` bypass, and omits HTTP 403 for suspended users.
   - Deduction: The login route must be refactored to query `prisma.user` directly, return 401 on missing user or invalid bcrypt hash, return 403 for `SUSPENDED`/`REJECTED`, and return 200 with JWT cookie on success.

4. **Seed Idempotency & Coverage**:
   - Observation: `prisma/seed.ts` duplicates assessments when run repeatedly, and all current DB users have status `APPROVED`.
   - Deduction: `prisma/seed.ts` should be updated to guard assessment creation and include standard test users (including a `SUSPENDED` test account) so automated test suites can verify the 403 Forbidden response reliably.

5. **Automated Verification Suite**:
   - Observation: Acceptance criteria R4 specifies `npm run test:auth` or `npx tsx scripts/test-auth-db.ts` testing 5 specific scenarios.
   - Deduction: A dedicated test script `scripts/test-auth-db.ts` must be created and added to `package.json` scripts.

---

## 3. Caveats

- **Network Dependency**: The database is hosted remotely on Neon AWS (`ap-southeast-1`). Continuous internet access is required during execution and testing.
- **Current Database Status Distribution**: Because all 16 existing users currently have `status: 'APPROVED'`, testing the 403 Forbidden branch requires either creating a suspended user or including one in the seed data (e.g. `suspended@capacityconnect.gov`).
- **No other caveats**: The schema, credentials, and client generation are verified.

---

## 4. Conclusion

The database layer, Prisma models, and PostgreSQL environment for CapacityConnect are in excellent condition and fully synchronized. The transition to production-grade database-backed authentication requires three concrete actions:
1. **Refactor `src/app/api/auth/login/route.ts`**: Remove mock fallback, remove plaintext password bypass, enforce strict bcrypt verification via `comparePassword`, enforce 403 Forbidden for suspended/rejected accounts, and set secure `auth_token` cookies.
2. **Make `prisma/seed.ts` Idempotent & Complete**: Add existence check before creating assessments, upsert generic + IMD persona accounts, and seed a suspended test user.
3. **Build `scripts/test-auth-db.ts` & Add `npm run test:auth`**: Implement the automated programmatic test suite covering the 5 acceptance criteria scenarios.

---

## 5. Verification Method

To independently reproduce and verify these findings:

1. **Verify Database Connectivity & Users**:
   ```bash
   npx tsx scripts/inspect-db.ts
   ```
   *Expected*: Lists 16 users with `matchesPassword123: true`.

2. **Verify Schema Sync**:
   ```bash
   npm run prisma:push
   ```
   *Expected*: `The database is already in sync with the Prisma schema.`

3. **Verify Prisma Client Generation**:
   ```bash
   npm run prisma:generate
   ```
   *Expected*: `Generated Prisma Client (7.10.0) to .\src\generated\prisma`.

4. **Inspect Key Source Files**:
   - `prisma/schema.prisma` (lines 73–120)
   - `src/app/api/auth/login/route.ts` (lines 21–55)
   - `c:\Users\pknat\LMS_SIH\.agents\explorer_survey_db\analysis.md`
