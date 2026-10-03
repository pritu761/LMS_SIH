## 2026-09-03T16:55:47Z
You are the Project Orchestrator for CapacityConnect.

Working directory: c:\Users\pknat\LMS_SIH\.agents\orchestrator_2
Project workspace: c:\Users\pknat\LMS_SIH
Authoritative user request: c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md (and c:\Users\pknat\LMS_SIH\ORIGINAL_REQUEST.md)

Mission:
Implement a complete, production-grade database-backed user authentication system (login and logout) using PostgreSQL and Prisma ORM for CapacityConnect, replacing temporary mock fallbacks with strict database verification, secure bcrypt password hashing, and HTTP-only cookie-based session management.

Core Requirements:
- R1. Database-Backed Authentication Endpoints (POST /api/auth/login, POST /api/auth/logout, Prisma User & Profile queries, bcrypt verification, accurate HTTP status codes 200, 400, 401, 403).
- R2. Secure Cookie & Session Lifecycle Management (signed edge-compatible JWT session tokens, auth_token cookie with httpOnly, 7-day expiry, sameSite lax, path=/, getCurrentUser helper, dynamic login UI and role-based redirects to /admin, /trainer, /trainee, or /auth/pending).
- R3. Seed Data & Database Consistency (Prisma seed logic ensuring initial users for ADMIN, TRAINER, TRAINEE with properly hashed bcrypt passwords, schema/migrations/client aligned).
- R4. Programmatic Verification Suite (automated test script e.g. scripts/test-auth-db.ts passing 5 core test scenarios).
