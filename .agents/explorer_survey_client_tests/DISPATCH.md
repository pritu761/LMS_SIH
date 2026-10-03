# Task Assignment: Client UI & Testing Survey

You are explorer_survey_client_tests, an exploration agent.
Working directory: c:\Users\pknat\LMS_SIH\.agents\explorer_survey_client_tests
Project workspace: c:\Users\pknat\LMS_SIH

## Authoritative User Request
Read: c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md

## Objective
Investigate the frontend authentication flow, role-based redirection, and testing suite setup in CapacityConnect:
1. Inspect Login UI: Locate and examine login page (e.g., `app/login/page.tsx` or `app/(auth)/login/page.tsx`) and components (e.g. `LoginForm`). How does it submit credentials? How does it handle success, 400, 401, 403 errors?
2. Inspect Role-based Redirects: Where does the UI redirect after successful login? Verify requirements: redirect to `/admin`, `/trainer`, `/trainee`, or `/auth/pending` based on user role and status.
3. Inspect client-side auth state / context: How does the app track logged-in user in client components? (e.g. `useAuth`, `AuthContext`, session fetching).
4. Inspect current testing setup: Check `package.json` for test dependencies (`jest`, `vitest`, `playwright`, `tsx`, etc.). Are there existing test scripts?
5. Review requirement R4 for programmatic verification suite:
   - Automated script `scripts/test-auth-db.ts` (or `npm run test:auth`).
   - The 5 core test scenarios to cover:
     1. Login with valid database credentials returns HTTP 200 and an `auth_token` cookie.
     2. Login with invalid password returns HTTP 401 and no auth cookie.
     3. Non-existent user returns HTTP 401.
     4. Logout clears the `auth_token` cookie (`maxAge: 0`).
     5. Session helper or token verification correctly extracts user metadata.
6. Provide concrete recommendations for UI alignment and test script design.

## Deliverables
- Write detailed investigation to `c:\Users\pknat\LMS_SIH\.agents\explorer_survey_client_tests\analysis.md`
- Write handoff report to `c:\Users\pknat\LMS_SIH\.agents\explorer_survey_client_tests\handoff.md`
- Use `send_message` to notify the orchestrator when complete.

## 2026-09-03T16:56:44Z
You are explorer_survey_client_tests. Read your task assignment in c:\Users\pknat\LMS_SIH\.agents\explorer_survey_client_tests\DISPATCH.md and the authoritative request in c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md. Investigate the frontend login UI, role-based redirects (/admin, /trainer, /trainee, /auth/pending), client auth state, and existing test setup. Analyze requirements for scripts/test-auth-db.ts covering the 5 core test scenarios. Write your detailed analysis to c:\Users\pknat\LMS_SIH\.agents\explorer_survey_client_tests\analysis.md and your handoff report to c:\Users\pknat\LMS_SIH\.agents\explorer_survey_client_tests\handoff.md. Use send_message to report completion.
