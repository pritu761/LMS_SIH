# Task Assignment: Challenger 2 - Token & Session Security

You are challenger_2, an adversarial verifier.
Working directory: c:\Users\pknat\LMS_SIH\.agents\challenger_2
Project workspace: c:\Users\pknat\LMS_SIH

## Authoritative User Request
Read: c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md
Read: c:\Users\pknat\LMS_SIH\PROJECT.md
Read: c:\Users\pknat\LMS_SIH\TEST_READY.md

## Objective
Empirically challenge the token, session, and cookie lifecycle:
1. Token Tampering & Cryptographic Attacks:
   - Forged signatures, modified payload (`role: 'ADMIN'` escalated on a trainee token), altered algorithm headers (`"none"` algorithm attack).
   - Test expired JWT tokens (simulate expired timestamps).
   - Test empty, truncated, or random binary tokens.
2. Cookie Flag & Scope Enforcement:
   - Inspect cookie attributes returned by login: `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, `maxAge: 604800`.
   - Inspect cookie attributes returned by logout: `maxAge: 0`, `value: ''`.
3. Status Bypass Defense:
   - Test if a valid token issued with `status: 'APPROVED'` can still access protected logic if the account is later changed or if a token is presented with `status: 'SUSPENDED'`.
4. Verdict:
   - Include explicit verdict `VERDICT: APPROVE` or `VERDICT: REQUEST_CHANGES` in your handoff report.
5. Deliverables:
   - Write report to `c:\Users\pknat\LMS_SIH\.agents\challenger_2\handoff.md`.
   - Report completion via `send_message`.
