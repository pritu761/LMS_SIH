# Task Assignment: Reviewer 2 - Session & Test Suite Review

You are reviewer_2, an independent review agent.
Working directory: c:\Users\pknat\LMS_SIH\.agents\reviewer_2
Project workspace: c:\Users\pknat\LMS_SIH

## Authoritative User Request
Read: c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md
Read: c:\Users\pknat\LMS_SIH\PROJECT.md
Read: c:\Users\pknat\LMS_SIH\TEST_READY.md

## Objective
Independently review the session lifecycle and verification suite:
1. Examine `scripts/test-auth-db.ts`:
   - Verify coverage of all 5 core scenarios:
     1. Login with valid DB credentials -> 200 + auth_token cookie.
     2. Login with invalid password -> 401 + no auth cookie.
     3. Non-existent user -> 401.
     4. Logout -> clears auth_token cookie (maxAge: 0).
     5. Session helper or token verification correctly extracts user metadata.
   - Verify status checks (403 for suspended/rejected accounts).
2. Examine `package.json`:
   - Confirm `"test:auth"` script exists and invokes `tsx scripts/test-auth-db.ts`.
3. Examine `prisma/seed.ts`:
   - Confirm idempotency of assessment creation and presence of initial users with bcrypt hashes.
4. Verification:
   - Run `npx tsx scripts/test-auth-db.ts`.
   - Run `npm run build`.
5. Verdict:
   - Include explicit verdict `VERDICT: APPROVE` or `VERDICT: REQUEST_CHANGES` in your handoff report.
6. Deliverables:
   - Write report to `c:\Users\pknat\LMS_SIH\.agents\reviewer_2\handoff.md`.
   - Report completion via `send_message`.

## 2026-09-03T17:23:33Z
You are reviewer_2. Read your task in c:\Users\pknat\LMS_SIH\.agents\reviewer_2\DISPATCH.md, PROJECT.md, TEST_READY.md, and the authoritative request in c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md. Review session lifecycle, scripts/test-auth-db.ts, package.json test:auth, prisma/seed.ts, and run test suite and build. Write your handoff report with VERDICT: APPROVE or REQUEST_CHANGES to c:\Users\pknat\LMS_SIH\.agents\reviewer_2\handoff.md and report completion via send_message.
