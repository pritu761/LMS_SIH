# Changes Report: Milestone 1 - Database & Seed Consistency

**Agent**: `worker_m1`  
**Date**: 2026-09-03  
**Milestone**: M1 (Database & Seed Consistency)  
**Status**: COMPLETE  

---

## 1. Summary of Changes

In accordance with `DISPATCH.md` and `PROJECT.md` Milestone 1 requirements, `prisma/seed.ts` has been completely upgraded to provide:
1. **Standard Bcrypt Password Hashing**:
   - Computes standard 10-round bcrypt hash matching `'Password123!'` using `bcryptjs`.
   - Applied consistently across all initial and status personas.
2. **Initial Personas for All Roles (`ADMIN`, `TRAINER`, `TRAINEE`)**:
   - `dg.imd@moes.gov.in` (`ADMIN`, `APPROVED`, `isVerified: true`)
   - `admin@capacityconnect.gov` (`ADMIN`, `APPROVED`, `isVerified: true`)
   - `vikram.sen@imd.gov.in` (`TRAINER`, `APPROVED`, `isVerified: true`, competencies linked)
   - `trainer@capacityconnect.gov` (`TRAINER`, `APPROVED`, `isVerified: true`)
   - `aarav.patel@imd.gov.in` (`TRAINEE`, `APPROVED`, `isVerified: true`, competencies linked)
   - `trainee@capacityconnect.gov` (`TRAINEE`, `APPROVED`, `isVerified: true`)
3. **Dedicated Status Personas**:
   - `suspended@capacityconnect.org` (`TRAINEE`, `SUSPENDED`, `isVerified: false`)
   - `rejected@capacityconnect.org` (`TRAINEE`, `REJECTED`, `isVerified: false`)
   - `pending@capacityconnect.org` (`TRAINEE`, `PENDING`, `isVerified: false`)
   - Plus `.gov` counterparts (`suspended@capacityconnect.gov`, `rejected@capacityconnect.gov`, `pending@capacityconnect.gov`) to ensure seamless testing across test suites.
4. **Seed Script Idempotency & Assessment Deduplication**:
   - Replaced unconditional `prisma.assessment.create` with `prisma.assessment.findFirst` guard on `courseId` and `title`.
   - Added automatic pruning of duplicate assessment records from prior runs to ensure database cleanliness.
   - Guarded competency associations with `prisma.userCompetency.upsert` using `userId_competencyId` compound unique key.
   - Synchronized profiles via `prisma.profile.upsert` on `userId`.

---

## 2. File Modification Details

### `prisma/seed.ts`
- **Line Additions**:
  - Added `SeedUserData` interface.
  - Added `seedUserWithProfile` helper: handles `prisma.user.upsert` (updating `passwordHash`, `role`, `status`, and `isVerified`) followed by `prisma.profile.upsert`.
  - Added `ensureUserCompetencies` helper: handles `prisma.userCompetency.upsert` across meteorological competencies.
  - Added dedicated status persona upserts for `SUSPENDED`, `REJECTED`, and `PENDING` test accounts.
  - Updated Assessment creation logic:
    ```typescript
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        courseId: course.id,
        title: 'DRSTC: Earth-System Modelling & HPC Certification Exam',
      },
    });

    let assessment;
    if (existingAssessment) {
      assessment = existingAssessment;
      const duplicateAssessments = await prisma.assessment.findMany({
        where: {
          courseId: course.id,
          title: 'DRSTC: Earth-System Modelling & HPC Certification Exam',
          id: { not: existingAssessment.id },
        },
      });
      if (duplicateAssessments.length > 0) {
        for (const dup of duplicateAssessments) {
          await prisma.assessment.delete({ where: { id: dup.id } });
        }
        console.log(`Pruned ${duplicateAssessments.length} duplicate assessment(s) from earlier non-idempotent runs.`);
      }
    } else {
      assessment = await prisma.assessment.create({ ... });
    }
    ```

---

## 3. Verification Commands & Results

1. **TypeScript Compilation**:
   ```bash
   npx tsc --noEmit
   ```
   *Result*: Code 0, zero errors.

2. **First Prisma Seed Execution**:
   ```bash
   npx prisma db seed
   ```
   *Result*: Code 0. Pruned 1 existing duplicate assessment from prior runs, seeded all 22 users with valid bcrypt hashes and profiles.

3. **Second Consecutive Prisma Seed Execution (Idempotency Verification)**:
   ```bash
   npx prisma db seed
   ```
   *Result*: Code 0. 0 errors, 0 duplicate assessments created, 100% idempotent.

4. **Prisma Client Generation**:
   ```bash
   npx prisma generate
   ```
   *Result*: Code 0. Generated Prisma Client (7.10.0) to `src/generated/prisma`.

5. **Direct Database Assertions**:
   - `dg.imd@moes.gov.in`: ADMIN | APPROVED | Password valid: true | Profile: Dr. Mrutyunjay Mohapatra
   - `admin@capacityconnect.gov`: ADMIN | APPROVED | Password valid: true | Profile: Dr. Rajeshwari Sharma
   - `vikram.sen@imd.gov.in`: TRAINER | APPROVED | Password valid: true | Profile: Prof. Vikramaditya Sen
   - `trainer@capacityconnect.gov`: TRAINER | APPROVED | Password valid: true | Profile: Senior Faculty Lead
   - `aarav.patel@imd.gov.in`: TRAINEE | APPROVED | Password valid: true | Profile: Aarav Patel
   - `trainee@capacityconnect.gov`: TRAINEE | APPROVED | Password valid: true | Profile: Meteorological Officer Trainee
   - `suspended@capacityconnect.org`: TRAINEE | SUSPENDED | Password valid: true | Profile: Suspended Trainee
   - `rejected@capacityconnect.org`: TRAINEE | REJECTED | Password valid: true | Profile: Rejected Applicant
   - `pending@capacityconnect.org`: TRAINEE | PENDING | Password valid: true | Profile: Pending Verification Trainee
   - `suspended@capacityconnect.gov`: TRAINEE | SUSPENDED | Password valid: true | Profile: Suspended Officer Trainee
   - `rejected@capacityconnect.gov`: TRAINEE | REJECTED | Password valid: true | Profile: Rejected Candidate
   - `pending@capacityconnect.gov`: TRAINEE | PENDING | Password valid: true | Profile: Pending Registration Officer
   - Total Target Assessments: Exactly 1 in PostgreSQL database.
