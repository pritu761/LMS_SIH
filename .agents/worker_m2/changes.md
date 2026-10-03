# Changes Recorded - Milestone 2 (worker_m2)

## Summary of Modifications
Milestone 2 implementation enforces strict database-backed authentication, eliminating mock fallbacks and backdoors, asserting appropriate HTTP status codes (200, 400, 401, 403), managing secure cookies, and protecting route guards.

### 1. `src/app/api/auth/login/route.ts`
- **Removed**:
  - Removed import of `initialUsers` from `@/lib/mockData`.
  - Removed mock fallback logic (`const mockUser = initialUsers.find(...)` and `dbUser || mockUser`).
  - Removed insecure backdoor bypass `password === 'Password123!' ||`.
  - Removed unused `loginSchema` import in favor of explicit HTTP contract validation.
- **Implemented**:
  - Strict input validation: returns HTTP 400 Bad Request (`{ error: 'Email and password are required' }`) when email or password is missing, blank, or improperly formatted.
  - Strict Prisma database query:
    ```typescript
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true },
    });
    ```
  - Rejection of missing user: returns HTTP 401 Unauthorized (`{ error: 'Invalid email or password' }`).
  - Strict Bcrypt password verification via `await comparePassword(password, user.passwordHash)`: returns HTTP 401 Unauthorized (`{ error: 'Invalid email or password' }`) on failure.
  - Account status enforcement:
    - If `user.status === 'SUSPENDED'`: returns HTTP 403 Forbidden (`{ error: 'Account is suspended. Please contact administration.' }`).
    - If `user.status === 'REJECTED'`: returns HTTP 403 Forbidden (`{ error: 'Account has been rejected.' }`).
  - Role & status dynamic redirects:
    - If `user.status === 'PENDING'` -> `redirectUrl = '/auth/pending'`
    - If `user.status === 'APPROVED'`:
      - `ADMIN` -> `'/admin'`
      - `TRAINER` -> `'/trainer'`
      - `TRAINEE` / default -> `'/trainee'`
  - Edge-compatible JWT signing with `generateToken` claims: `userId`, `email`, `role`, `status`, `fullName`.
  - Secure cookie issuance via `setAuthCookie(response, token)`.
  - HTTP 200 OK response containing `{ success: true, user: { id, email, role, status, fullName }, redirectUrl }`.

### 2. `src/lib/auth.ts`
- **Enhanced `getCurrentUser()`**:
  - Decodes and verifies token with `verifyToken`.
  - Strictly rejects tokens whose claims indicate `status === 'SUSPENDED'` or `status === 'REJECTED'` by returning `null`.
- **Added `generateToken` Export**:
  - Exported `generateToken = signToken` as an edge-compatible alias.
- **Verified Cookie Attributes**:
  - `setAuthCookie`: sets `auth_token` with `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, `maxAge: 7 * 24 * 60 * 60` (604800s).
  - `clearAuthCookie`: sets `auth_token` with `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, `maxAge: 0`.

### 3. `src/proxy.ts`
- Added `'/radar'`, `'/api/radar'`, and `'/architecture'` to `PUBLIC_ROUTES` to guarantee public weather radar and architecture views are accessible without authentication, while preserving operational RBAC on `/admin`, `/trainer`, `/trainee`, and API routes.

### 4. `src/app/auth/login/page.tsx`
- Refined UI typography to align with sovereign design requirements, removing unnecessary `font-mono` on demo header labels in favor of clean sans typography.
- Verified that HTTP 400, 401, and 403 error messages returned by `/api/auth/login` are rendered directly in the danger notification box.
