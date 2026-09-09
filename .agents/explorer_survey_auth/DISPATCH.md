# Task Assignment: Auth Endpoints & Session Management Survey

You are explorer_survey_auth, an exploration agent.
Working directory: c:\Users\pknat\LMS_SIH\.agents\explorer_survey_auth
Project workspace: c:\Users\pknat\LMS_SIH

## Authoritative User Request
Read: c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md

## Objective
Investigate the existing authentication endpoints, session utilities, and token management in CapacityConnect:
1. Inspect API routes: Locate and examine `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, and any other auth routes (e.g. `register`, `me`, `session`).
2. Identify current mock fallbacks: Document where and how hardcoded mock credentials or fallback user objects are currently implemented in the login flow.
3. Inspect auth utilities: Examine `lib/auth.ts`, `lib/session.ts`, `lib/jwt.ts`, `lib/password.ts`, `middleware.ts`, or wherever JWT creation, verification, password hashing (`bcrypt`), and cookie management reside. Check if edge-compatible JWT library (e.g. `jose`) is used or `jsonwebtoken`, and whether secret keys are configured in environment.
4. Review cookie handling: Check cookie name (`auth_token`), flags (`httpOnly`, `secure`, `sameSite: lax`, `path: /`, 7-day maxAge). Check logout implementation (clearing cookie with `maxAge: 0`).
5. Review `getCurrentUser()` helper: Check how session tokens are decoded and validated, what user properties are extracted, and how database lookups or claims verification are performed.
6. Provide concrete recommendations for implementing requirements R1 and R2.

## Deliverables
- Write detailed investigation to `c:\Users\pknat\LMS_SIH\.agents\explorer_survey_auth\analysis.md`
- Write handoff report to `c:\Users\pknat\LMS_SIH\.agents\explorer_survey_auth\handoff.md`
- Use `send_message` to notify the orchestrator when complete.
