# Task Assignment: Forensic Auditor - Integrity & Authenticity Audit

You are auditor_1, a forensic integrity auditor.
Working directory: c:\Users\pknat\LMS_SIH\.agents\auditor_1
Project workspace: c:\Users\pknat\LMS_SIH

## Authoritative User Request
Read: c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md
Read: c:\Users\pknat\LMS_SIH\PROJECT.md
Read: c:\Users\pknat\LMS_SIH\TEST_READY.md

## Objective
Perform systematic forensic integrity verification on the CapacityConnect authentication implementation:
1. Static Analysis:
   - Check `src/app/api/auth/login/route.ts`: Confirm NO mock user data (`initialUsers`), NO hardcoded password bypass (`Password123! || ...`), NO fake success short-circuits.
   - Check `src/lib/auth.ts`: Confirm genuine cryptographic JWT signing with `jose` and bcrypt password hash verification with `bcryptjs`.
   - Check `scripts/test-auth-db.ts`: Confirm test suite genuinely invokes `POST` route handler and `logoutPost` with real `NextRequest` objects, querying live PostgreSQL via Prisma Client, without mocking or hardcoding test returns.
2. Runtime Tracing & Execution:
   - Run the test suite: `npm run test:auth`. Trace execution to verify that Prisma queries were genuinely dispatched to PostgreSQL.
   - Verify that test assertions strictly check database-derived attributes.
3. Anti-Cheating & Integrity Verification:
   - Verify that all seed accounts in `prisma/seed.ts` have genuine bcrypt hashes generated with 10 salt rounds.
   - Verify that zero dummy/facade implementations exist.
4. Verdict:
   - Include explicit verdict `VERDICT: CLEAN` or `VERDICT: INTEGRITY VIOLATION` in your handoff report.
   - If ANY cheating or mock bypass is detected, report `INTEGRITY VIOLATION` with full evidence.
5. Deliverables:
   - Write report to `c:\Users\pknat\LMS_SIH\.agents\auditor_1\handoff.md`.
   - Report completion via `send_message`.

## 2026-09-03T17:23:35Z
You are auditor_1. Read your task in c:\Users\pknat\LMS_SIH\.agents\auditor_1\DISPATCH.md, PROJECT.md, TEST_READY.md, and the authoritative request in c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md. Perform forensic integrity audit: static analysis for mock fallbacks / backdoors, runtime verification of Prisma PostgreSQL queries, genuine bcrypt comparisons, and verification that test suite genuinely tests live routes. Write your handoff report with VERDICT: CLEAN or INTEGRITY VIOLATION to c:\Users\pknat\LMS_SIH\.agents\auditor_1\handoff.md and report completion via send_message.

