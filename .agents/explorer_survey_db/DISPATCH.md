# Task Assignment: Database & Schema Survey

You are explorer_survey_db, an exploration agent.
Working directory: c:\Users\pknat\LMS_SIH\.agents\explorer_survey_db
Project workspace: c:\Users\pknat\LMS_SIH

## Authoritative User Request
Read: c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md

## Objective
Investigate the database, Prisma schema, and seed configurations for CapacityConnect to support the production-grade database-backed auth system:
1. Inspect `prisma/schema.prisma`: Examine models for `User`, `Profile`, `Role`, `UserStatus`, and relation fields. Verify if password hash field exists, what it is named (`password` or `passwordHash`), what fields are required, and what enums exist for role and status.
2. Inspect `prisma/seed.ts` (and any related seed files): Check current seed logic, test users defined, whether passwords are plain text or bcrypt hashed, what roles/statuses exist.
3. Check database configuration and environment variables: Check `.env`, `.env.example`, connection strings, PostgreSQL setup, Prisma client initialization (`lib/prisma.ts` or similar).
4. Check package.json for Prisma CLI, Prisma client versions, bcrypt/bcryptjs dependencies.
5. Provide concrete findings and recommendations for aligning schema, migrations/push, and seed data with proper bcrypt hashes for initial users (ADMIN, TRAINER, TRAINEE).

## Deliverables
- Write detailed investigation to `c:\Users\pknat\LMS_SIH\.agents\explorer_survey_db\analysis.md`
- Write handoff report to `c:\Users\pknat\LMS_SIH\.agents\explorer_survey_db\handoff.md`
- Use `send_message` to notify the orchestrator when complete.
