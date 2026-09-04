# Database, Schema & Auth Infrastructure Survey Report

**Agent**: `explorer_survey_db`  
**Working Directory**: `c:\Users\pknat\LMS_SIH\.agents\explorer_survey_db`  
**Date**: 2026-09-03  
**Status**: COMPLETE  

---

## 1. Executive Summary

This report delivers a comprehensive technical investigation of the database layer, Prisma ORM schema, seed logic, environment configuration, and authentication subsystems for CapacityConnect. The investigation confirms that:
- The PostgreSQL database is a live, operational serverless Neon instance (`ap-southeast-1.aws.neon.tech`).
- The Prisma schema (`prisma/schema.prisma`) is fully in sync with the live database (verified via `prisma db push`).
- 16 user accounts spanning all three roles (`ADMIN`, `TRAINER`, `TRAINEE`) are already seeded in PostgreSQL with valid bcrypt-hashed passwords matching `Password123!`.
- The current authentication endpoint (`src/app/api/auth/login/route.ts`) contains critical security and architectural regressions that violate production requirements: a fallback to in-memory `mockUser` data, a hardcoded plaintext bypass (`password === 'Password123!'`), and an omission of HTTP 403 Forbidden checks for `SUSPENDED` / `REJECTED` accounts.
- The default seed script (`prisma/seed.ts`) contains an idempotency issue where `prisma.assessment.create()` executes unconditionally on each run, creating duplicate assessment records.
- All dependencies required for secure, production-grade, edge-compatible authentication (`@prisma/client@7.10.0`, `@prisma/adapter-pg@7.10.0`, `bcryptjs@2.4.3`, `jose@5.9.6`, `zod@3.23.8`, `pg@8.23.0`, `tsx@4.23.13`) are installed and functional.

---

## 2. Prisma Schema Deep-Dive

### 2.1 File Location & Generator Details
- **Schema file**: `prisma/schema.prisma` (Total lines: 378, size: 11.4 KB)
- **Generator**:
  ```prisma
  generator client {
    provider = "prisma-client"
    output   = "../src/generated/prisma"
  }

  datasource db {
    provider = "postgresql"
  }
  ```
  - Prisma v7 compiles TypeScript client artifacts directly to `src/generated/prisma`.
  - Generation was verified via `npm run prisma:generate` which completed cleanly in 407ms.

### 2.2 Core Authentication Models

#### Model: `User`
```prisma
model User {
  id            String      @id @default(uuid())
  email         String      @unique
  passwordHash  String
  role          UserRole    @default(TRAINEE)
  status        UserStatus  @default(PENDING)
  isVerified    Boolean     @default(false)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // Relations
  profile             Profile?
  competencies        UserCompetency[]
  coursesTaught       Course[]                @relation("TrainerCourses")
  enrollments         Enrollment[]
  submissions         AssessmentSubmission[]
  feedbacks           Feedback[]
  authoredAnnouncements Announcement[]       @relation("AdminAnnouncements")

  @@index([role])
  @@index([status])
  @@index([email])
}
```
**Key Observations**:
1. **Password Field Name**: The field is strictly named `passwordHash` (type `String`, non-nullable). There is no field named `password`.
2. **Primary Key**: `id` is a UUID string generated via `@default(uuid())`.
3. **Email**: Case-sensitive unique constraint and indexed (`@@index([email])`). When authenticating, queries should sanitize input (e.g. `email.toLowerCase().trim()`).
4. **Indexes**: Explicit B-tree indexes exist for `[role]`, `[status]`, and `[email]`.

#### Model: `Profile`
```prisma
model Profile {
  id             String    @id @default(uuid())
  userId         String    @unique
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  fullName       String
  avatarUrl      String?
  headline       String?
  bio            String?   @db.Text
  organization   String?
  department     String?
  phone          String?
  location       String?
  
  // Structured Qualifications, Experience, and Certificates as JSON arrays
  qualifications Json?     @default("[]")
  experience     Json?     @default("[]")
  certificates   Json?     @default("[]")

  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([userId])
}
```
**Key Observations**:
1. **Full Name**: `fullName` is mandatory (`String`).
2. **Cascade Rule**: `onDelete: Cascade` ensures deleting a user automatically removes their profile.
3. **Structured Data**: JSON arrays store qualifications, work experience, and certificates.

### 2.3 Enums

#### Enum: `UserRole`
```prisma
enum UserRole {
  TRAINEE
  TRAINER
  ADMIN
}
```
*Note*: The schema defines `enum UserRole` (not `Role`).

#### Enum: `UserStatus`
```prisma
enum UserStatus {
  PENDING
  APPROVED
  SUSPENDED
  REJECTED
}
```
*Note*: Default status for new users is `PENDING`. Only `APPROVED` users should receive dashboard access (with `ADMIN` having inherent platform privileges).

---

## 3. Database Configuration & Environment Analysis

### 3.1 Environment Variables
Inspected from `.env`:
- **`DATABASE_URL`**:
  `postgresql://neondb_owner:npg_Vb4YxSoeZ2Xf@ep-purple-smoke-az3ttzkg-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
  - Utilizes pgBouncer connection pooling (`-pooler` hostname) for application runtime queries.
- **`DIRECT_URL`**:
  `postgresql://neondb_owner:npg_Vb4YxSoeZ2Xf@ep-purple-smoke-az3ttzkg.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
  - Direct connection to Neon compute instance, avoiding pooler constraints during migrations and DDL operations.
- **`JWT_SECRET`**:
  `capacity-connect-super-secure-jwt-secret-key-2026-production`
  - 60-character high-entropy secret string suitable for HMAC-SHA256 token signing.
- **`NEXTAUTH_URL`**: `http://localhost:3000`
- **`NODE_ENV`**: `development`

### 3.2 Prisma Client & Configuration Setup
1. **`prisma.config.ts`**:
   ```typescript
   import 'dotenv/config';
   import { defineConfig, env } from 'prisma/config';

   export default defineConfig({
     schema: 'prisma/schema.prisma',
     migrations: {
       path: 'prisma/migrations',
       seed: 'tsx prisma/seed.ts',
     },
     datasource: {
       url: env('DIRECT_URL'),
     },
   });
   ```
   - Direct connection is used by the Prisma CLI for migrations and pushes.

2. **`src/lib/prisma.ts`**:
   ```typescript
   import { PrismaPg } from '@prisma/adapter-pg';
   import { PrismaClient } from '@/generated/prisma/client';

   const globalForPrisma = globalThis as unknown as {
     prisma: PrismaClient | undefined;
   };

   const connectionString = process.env.DATABASE_URL;
   if (!connectionString) {
     throw new Error('DATABASE_URL is required to initialize Prisma Client');
   }

   const adapter = new PrismaPg({ connectionString });

   export const prisma =
     globalForPrisma.prisma ??
     new PrismaClient({
       adapter,
       log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
     });

   if (process.env.NODE_ENV !== 'production') {
     globalForPrisma.prisma = prisma;
   }

   export default prisma;
   ```
   - Uses `@prisma/adapter-pg` driver adapter.
   - Singleton pattern on `globalThis` prevents connection exhaustion across Next.js fast-refresh cycles.

### 3.3 Connectivity & Push State Verification
- Executed `npm run prisma:push` with output:
  `Datasource "db": PostgreSQL database "neondb", schema "public" at "ep-purple-smoke-az3ttzkg.c-3.ap-southeast-1.aws.neon.tech"`
  `The database is already in sync with the Prisma schema.`
- Executed live database query via `scripts/inspect-db.ts`: Connection succeeded immediately, query retrieved all 16 users from `public.User` with profile joins.

---

## 4. Seed Scripts & Data Survey

### 4.1 Script Comparison: `prisma/seed.ts` vs `scripts/setup-all-users.ts`

| Dimension | `prisma/seed.ts` | `scripts/setup-all-users.ts` |
|---|---|---|
| **Invocation** | `npm run prisma:seed` | Standalone script (`tsx scripts/setup-all-users.ts`) |
| **Users Seeded** | 3 IMD users (`dg.imd@moes.gov.in`, `vikram.sen@imd.gov.in`, `aarav.patel@imd.gov.in`) | 16 users across generic and IMD personas |
| **Password Hashing** | `bcrypt.hash('Password123!', 10)` | `bcrypt.hash('Password123!', 10)` |
| **Other Data** | Competencies, Course (`IMD-DRSTC-101`), Assessment, Enrollment | Users and Profiles only |
| **Idempotency** | **Buggy**: `prisma.assessment.create` duplicates assessments on subsequent runs | **Idempotent**: Checks existence before update/create |

### 4.2 Current Database Users in PostgreSQL
The following 16 users were verified in the live Neon PostgreSQL database:

| # | Role | Email | Full Name | Status | Verified | Password Match (`Password123!`) |
|---|---|---|---|---|---|---|
| 1 | ADMIN | `admin@capacityconnect.gov` | Dr. Rajeshwari Sharma | APPROVED | true | Yes (`true`) |
| 2 | ADMIN | `dg.imd@moes.gov.in` | Dr. Mrutyunjay Mohapatra | APPROVED | true | Yes (`true`) |
| 3 | TRAINER | `trainer@capacityconnect.gov` | Senior Faculty Lead | APPROVED | true | Yes (`true`) |
| 4 | TRAINER | `vikram.trainer@capacityconnect.gov` | Prof. Vikramaditya Sen | APPROVED | true | Yes (`true`) |
| 5 | TRAINER | `vikram.sen@imd.gov.in` | Prof. Vikramaditya Sen | APPROVED | true | Yes (`true`) |
| 6 | TRAINER | `ananya.roy@moes.gov.in` | Dr. Ananya Roy | APPROVED | true | Yes (`true`) |
| 7 | TRAINER | `rameshwar.radar@imd.gov.in` | Dr. Rameshwar Rao | APPROVED | true | Yes (`true`) |
| 8 | TRAINER | `ramesh@gmail.com` | Ramesh Kumar | APPROVED | true | Yes (`true`) |
| 9 | TRAINEE | `trainee@capacityconnect.gov` | Meteorological Officer Trainee | APPROVED | true | Yes (`true`) |
| 10 | TRAINEE | `aarav.trainee@capacityconnect.gov` | Aarav Patel | APPROVED | true | Yes (`true`) |
| 11 | TRAINEE | `aarav.patel@imd.gov.in` | Aarav Patel | APPROVED | true | Yes (`true`) |
| 12 | TRAINEE | `priya.sharma@capacityconnect.gov` | Priya Sharma | APPROVED | true | Yes (`true`) |
| 13 | TRAINEE | `priya.sharma.1787592967258@gov.in` | Priya Sharma | APPROVED | true | Yes (`true`) |
| 14 | TRAINEE | `sneha.forecaster@imd.gov.in` | Sneha Kulkarni | APPROVED | true | Yes (`true`) |
| 15 | TRAINEE | `kavita.drstc@imd.gov.in` | Dr. Kavita Deshmukh | APPROVED | true | Yes (`true`) |
| 16 | TRAINEE | `ujuj8@gmail.com` | Trainee Officer (hfkif) | APPROVED | true | Yes (`true`) |

### 4.3 Observations & Gaps in Seed Data
1. **Idempotency Bug in `prisma/seed.ts`**:
   Line 236:
   ```typescript
   const assessment = await prisma.assessment.create({
     data: {
       courseId: course.id,
       title: 'DRSTC: Earth-System Modelling & HPC Certification Exam',
   ...
   ```
   Because `Assessment` does not have a unique constraint on `(courseId, title)`, every run of `npm run prisma:seed` creates an additional assessment row.
   **Fix**: Check if `prisma.assessment.findFirst({ where: { courseId: course.id, title: ... } })` exists, or use `upsert` if a unique key is available.
2. **Missing Suspended / Rejected Test User**:
   All 16 users in the database currently have `status: 'APPROVED'`. To properly test requirement R1 ("Return 403 Forbidden for suspended/rejected accounts") and R4 ("Automated verification suite"), a designated test user with `status: 'SUSPENDED'` (e.g. `suspended@capacityconnect.gov` or `test-suspended@imd.gov.in`) should be added to seed data or created dynamically in test assertions.

---

## 5. Authentication Endpoints & Security Audit

### 5.1 `POST /api/auth/login` (`src/app/api/auth/login/route.ts`)
Reviewing lines 21–56 of `src/app/api/auth/login/route.ts`:
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

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare Bcrypt password
    const isPasswordValid =
      password === 'Password123!' || (await comparePassword(password, user.passwordHash));
```

#### Deficiencies Identified:
1. **Mock Fallback**: If `dbUser` is null (or on DB exception), the endpoint silently falls back to `mockUser` from `initialUsers`. This violates Requirement R1: *"Reject fallback to hardcoded mock credentials"*.
2. **Plaintext Password Bypass**: `password === 'Password123!'` grants login access to any user whose email matches, completely bypassing bcrypt hash validation. This violates Requirement R1: *"Passwords must be verified against bcrypt hashes stored in PostgreSQL"*.
3. **Missing 403 Forbidden for Suspended/Rejected Accounts**:
   The current code checks:
   ```typescript
   redirectUrl: currentStatus === 'PENDING' ? '/auth/pending' : ...
   ```
   If a user is `SUSPENDED` or `REJECTED`, the endpoint still returns HTTP 200 OK and issues an active JWT cookie!
   Requirement R1 explicitly requires: *"403 Forbidden for suspended/rejected accounts"*.
4. **Case Sensitivity**:
   The query uses `where: { email }` without normalizing lowercase, while `mockUser` did `toLowerCase()`. In PostgreSQL, `dg.imd@moes.gov.in` will not match `DG.IMD@MOES.GOV.IN` unless normalized with `email.toLowerCase().trim()`.

### 5.2 `POST /api/auth/logout` (`src/app/api/auth/logout/route.ts`)
```typescript
export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  clearAuthCookie(response);
  return response;
}
```
- Calls `clearAuthCookie(response)` from `@/lib/auth`.
- Properly sets `auth_token` with `maxAge: 0`, `path: '/'`, `httpOnly: true`, and `sameSite: 'lax'`.
- Complies with Requirement R1 and R2.

### 5.3 Helper Utilities (`src/lib/auth.ts`)
- `signToken`: Uses `jose.SignJWT` with algorithm `HS256`, 7-day expiration (`7d`), and payload claims (`userId`, `email`, `role`, `status`, `fullName`).
- `verifyToken`: Uses `jose.jwtVerify` with `JWT_SECRET`.
- `setAuthCookie`: Sets cookie `auth_token` with:
  - `httpOnly: true`
  - `secure: process.env.NODE_ENV === 'production'`
  - `sameSite: 'lax'`
  - `path: '/'`
  - `maxAge: 7 * 24 * 60 * 60` (7 days in seconds)
- `clearAuthCookie`: Sets cookie `auth_token` with `value: ''` and `maxAge: 0`.
- `getCurrentUser()`: Correctly reads cookie asynchronously (`await cookies()`), compatible with Next.js 15/16.

### 5.4 `GET /api/auth/me` (`src/app/api/auth/me/route.ts`)
- Contains fallback to `initialUsers`.
- Should be cleaned up to query `prisma.user` directly using `session.userId`.

---

## 6. Dependency & Package Ecosystem Audit

From `package.json`:
- **ORM & DB**:
  - `@prisma/client`: `^7.10.0`
  - `@prisma/adapter-pg`: `^7.10.0`
  - `prisma`: `^7.10.0` (CLI in devDependencies)
  - `pg`: `^8.23.0`
  - `@types/pg`: `^8.23.1`
- **Authentication**:
  - `bcryptjs`: `^2.4.3`
  - `@types/bcryptjs`: `^2.4.6`
  - `jose`: `^5.9.6`
  - `zod`: `^3.23.8`
- **Execution & Runtime**:
  - `tsx`: `^4.23.13`
  - `dotenv`: `^17.4.2`
  - `next`: `^16.3.3`
  - `react`: `^19.2.0`

### Identified Gaps in `package.json`:
- Acceptance criteria R4 specifies:
  *"The programmatic test script (`npm run test:auth` or `npx tsx scripts/test-auth-db.ts`) runs and passes all 5 test scenarios without human intervention."*
- Currently `package.json` contains:
  ```json
  "test": "tsx scripts/test-weather-radar.ts",
  "test:radar": "tsx scripts/test-weather-radar.ts"
  ```
- Missing script: `"test:auth": "tsx scripts/test-auth-db.ts"`. This should be added.

---

## 7. Concrete Recommendations for Implementation

### Recommendation 1: Strict Database Login Route (`src/app/api/auth/login/route.ts`)
1. Remove all references to `initialUsers` and `mockUser`.
2. Normalize input email: `const email = parsed.data.email.toLowerCase().trim();`.
3. Query `prisma.user.findUnique({ where: { email }, include: { profile: true } })`.
4. If `user` is not found, return HTTP 401 `{ error: 'Invalid email or password' }`.
5. Check password strictly using `await comparePassword(password, user.passwordHash)`. Remove `password === 'Password123!'` bypass. If invalid, return HTTP 401 `{ error: 'Invalid email or password' }`.
6. Enforce account status:
   - If `user.status === 'SUSPENDED'`: Return HTTP 403 `{ error: 'Your account has been suspended. Please contact the administrator.' }`.
   - If `user.status === 'REJECTED'`: Return HTTP 403 `{ error: 'Your account registration was rejected. Please contact the administrator.' }`.
7. If `user.status === 'PENDING'`: Allow signing token with status `PENDING` and set `redirectUrl: '/auth/pending'`.
8. If `user.status === 'APPROVED'`: Set appropriate dashboard redirect (`/admin`, `/trainer`, `/trainee`).
9. Set `auth_token` cookie and return HTTP 200 with user payload.

### Recommendation 2: Update `prisma/seed.ts` for Complete Coverage & Idempotency
1. Fix assessment creation idempotency:
   ```typescript
   const existingAssessment = await prisma.assessment.findFirst({
     where: { courseId: course.id, title: 'DRSTC: Earth-System Modelling & HPC Certification Exam' },
   });
   if (!existingAssessment) {
     await prisma.assessment.create({ ... });
   }
   ```
2. Upsert standard test accounts for both generic test emails and IMD personas:
   - `admin@capacityconnect.gov` and `dg.imd@moes.gov.in` (`ADMIN`)
   - `trainer@capacityconnect.gov` and `vikram.sen@imd.gov.in` (`TRAINER`)
   - `trainee@capacityconnect.gov` and `aarav.patel@imd.gov.in` (`TRAINEE`)
   - Add a test account with status `SUSPENDED` (e.g. `suspended.officer@capacityconnect.gov`) with hashed `Password123!` to enable reliable automated verification of the 403 Forbidden flow.

### Recommendation 3: Implement Automated Verification Suite (`scripts/test-auth-db.ts`)
Develop a comprehensive test runner verifying:
1. Valid credentials for `ADMIN`, `TRAINER`, `TRAINEE` return HTTP 200 and set `auth_token` cookie.
2. Invalid password returns HTTP 401 and no cookie.
3. Non-existent email returns HTTP 401 and no cookie.
4. Suspended account returns HTTP 403 Forbidden.
5. Logout endpoint clears `auth_token` cookie (`maxAge: 0`).
6. Token verification correctly decodes claims (`userId`, `email`, `role`, `status`, `fullName`).

---

## 8. Investigation Sign-Off
All assigned investigation targets from `DISPATCH.md` have been fully explored, verified with live database queries, and documented.
