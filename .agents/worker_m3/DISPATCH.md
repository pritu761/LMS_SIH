# Task Assignment: Milestone 3 - Programmatic Verification Suite & E2E Testing

You are worker_m3, a verification and testing worker.
Working directory: c:\Users\pknat\LMS_SIH\.agents\worker_m3
Project workspace: c:\Users\pknat\LMS_SIH

## Authoritative User Request
Read: c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md
Read: c:\Users\pknat\LMS_SIH\PROJECT.md

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You exclusively own:
- `scripts/test-auth-db.ts`
- `package.json` (add `"test:auth"` script)
- `TEST_READY.md` (at project root)
Do NOT modify other implementation files.

## Objective
Implement Milestone 3 according to Requirement R4 and acceptance criteria:
1. Create `scripts/test-auth-db.ts`:
   - Implement standalone TypeScript execution using `tsx` that imports `POST` from `@/app/api/auth/login/route` and `logoutPost` from `@/app/api/auth/logout/route` (or creates `NextRequest` and invokes them directly against the live PostgreSQL database).
   - Test Scenario 1: Login with valid database credentials returns HTTP 200, user payload, redirectUrl, and a valid `auth_token` cookie (`httpOnly: true`, `sameSite: lax`, 7-day maxAge).
   - Test Scenario 2: Login with invalid password returns HTTP 401 Unauthorized and no auth cookie.
   - Test Scenario 3: Login with non-existent user returns HTTP 401 Unauthorized and no auth cookie.
   - Test Scenario 4: Logout clears the `auth_token` cookie by setting `maxAge: 0`.
   - Test Scenario 5: Session helper or token verification (`verifyToken` / `getCurrentUser`) correctly extracts user metadata (`userId`, `email`, `role`, `status`, `fullName`).
   - Also test Scenario 6: Suspended / Rejected accounts return HTTP 403 Forbidden with no auth cookie.
   - Include clear, formatted console output (`PASS` / `FAIL`) and ensure process exits with code 0 on success, or code 1 on failure.
2. Update `package.json`:
   - Add `"test:auth": "tsx scripts/test-auth-db.ts"` to the `"scripts"` object.
3. Verification:
   - Run `npm run test:auth` and ensure all scenarios pass with exit code 0.
   - Run `npx tsx scripts/test-auth-db.ts` and ensure it also passes with exit code 0.
   - Run `npm run build` and ensure the Next.js production build succeeds with zero errors.
4. Create `TEST_READY.md` at project root using the standard template documenting the test runner, coverage, and results.
5. Deliverables:
   - Record modifications in `c:\Users\pknat\LMS_SIH\.agents\worker_m3\changes.md`
   - Write handoff report in `c:\Users\pknat\LMS_SIH\.agents\worker_m3\handoff.md`
   - Use `send_message` to report completion.

## 2026-09-03T17:15:00Z
You are worker_m3. Read your task in c:\Users\pknat\LMS_SIH\.agents\worker_m3\DISPATCH.md and the authoritative request in c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md. Implement Milestone 3: create scripts/test-auth-db.ts covering all 5 core test scenarios (plus status checks), add test:auth to package.json, verify with npm run test:auth and npm run build, and write TEST_READY.md. Write handoff to c:\Users\pknat\LMS_SIH\.agents\worker_m3\handoff.md and report completion via send_message.
