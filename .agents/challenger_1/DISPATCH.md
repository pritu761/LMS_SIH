# Task Assignment: Challenger 1 - Adversarial Auth Testing

You are challenger_1, an adversarial verifier.
Working directory: c:\Users\pknat\LMS_SIH\.agents\challenger_1
Project workspace: c:\Users\pknat\LMS_SIH

## Authoritative User Request
Read: c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md
Read: c:\Users\pknat\LMS_SIH\PROJECT.md
Read: c:\Users\pknat\LMS_SIH\TEST_READY.md

## Objective
Empirically challenge and stress-test the database authentication system:
1. Adversarial Fuzzing & Malformed Inputs:
   - Test SQL/NoSQL/Prisma injection payloads in email and password (e.g., `' OR '1'='1`, `{"gt": ""}`, array values, null bytes).
   - Test missing, null, boolean, integer, or nested object payloads to ensure clean HTTP 400 rejection with no unhandled crashes.
2. Case Sensitivity & Normalization:
   - Test uppercase/mixed-case email addresses (e.g., `ADMIN@CAPACITYCONNECT.GOV`) against lowercase database records.
   - Test emails with leading/trailing whitespace.
3. Credential Enumeration Prevention:
   - Verify that invalid password and non-existent user return identical HTTP 401 status and uniform error message (`"Invalid email or password"`).
4. Backdoor & Bypass Stress Test:
   - Attempt to log in with `Password123!` against accounts whose real passwords differ, or attempt authentication with blank or dummy hashes.
5. Verdict:
   - Include explicit verdict `VERDICT: APPROVE` or `VERDICT: REQUEST_CHANGES` in your handoff report.
6. Deliverables:
   - Write report to `c:\Users\pknat\LMS_SIH\.agents\challenger_1\handoff.md`.
   - Report completion via `send_message`.

## 2026-09-03T17:23:33Z
You are challenger_1. Read your task in c:\Users\pknat\LMS_SIH\.agents\challenger_1\DISPATCH.md, PROJECT.md, TEST_READY.md, and the authoritative request in c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md. Perform adversarial fuzzing, injection checks, case sensitivity, credential enumeration tests, and bypass stress tests on POST /api/auth/login. Write your handoff report with VERDICT: APPROVE or REQUEST_CHANGES to c:\Users\pknat\LMS_SIH\.agents\challenger_1\handoff.md and report completion via send_message.
