# Progress — explorer_survey_auth

Last visited: 2026-09-03T17:10:00Z
Status: Completed

## Tasks
- [x] Initialized BRIEFING.md and progress.md
- [x] Locate and inspect auth API routes (`/api/auth/*`)
  - Found `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/register`, `/api/auth/demo-login`
- [x] Trace mock data fallbacks and current credential check logic
  - Identified database error swallow + mockUser fallback
  - Identified hardcoded backdoor `password === 'Password123!'` bypass
  - Identified missing 403 Forbidden guard for SUSPENDED / REJECTED users
- [x] Inspect JWT signing/verifying utilities and edge compatibility
  - Confirmed `jose` (v5.9.6) HS256, 7d expiry, edge-compatible Web Crypto API
  - Confirmed `JWT_SECRET` in `.env` and fallback
- [x] Inspect password hashing utilities (`bcryptjs`)
  - Confirmed `bcryptjs` with 10 salt rounds
- [x] Inspect session helper (`getCurrentUser`) and cookie management
  - Confirmed `cookies()` async API (Next.js 15/16 compatible)
  - Confirmed `auth_token` cookie flags: httpOnly, secure (prod), sameSite lax, path /, maxAge 7d
  - Confirmed logout clears cookie with maxAge 0
- [x] Inspect database models and current PostgreSQL user state
  - Confirmed 16 users seeded in live Neon DB with bcrypt hashes
  - Analyzed `prisma/seed.ts` and `scripts/setup-all-users.ts`
- [x] Compile comprehensive `analysis.md`
- [x] Compile structured `handoff.md`
- [x] Send completion message to parent
