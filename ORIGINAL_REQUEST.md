# Original User Request

## Initial Request â€” 2026-09-02T02:12:52+05:30

Build a dedicated, real-time weather radar and prediction page integrated into the application, enabling users to explore live radar imagery (regional Doppler/precipitation data) and view weather forecasts and short-term nowcasting for any selected location.

Requirements & Acceptance Criteria:
1. Interactive Live Radar Map:
   - Interactive map displaying live weather radar feeds (reflectivity/precipitation, storm cells, cloud overlays) with time playback controls for historical frames and forward nowcasting.
   - Pan, zoom, layer toggle capabilities (reflectivity, clouds, wind/precipitation if available via free public open radar/weather tile APIs like RainViewer or Open-Meteo or similar reliable free APIs with no required paywalled API keys or graceful fallback with mock/sample radar tiles if offline).
   - Time slider / animation controls step through past radar frames and projected nowcasts.
   - Intensity/reflectivity legend displayed for clear reading of weather severity (dBZ scale / color scale).
2. Location Search & Weather Nowcasting / Prediction:
   - Search bar resolves location queries (geocoding via Open-Meteo geocoding or Nominatim or similar free geocoding API) and recenters map.
   - Clicking any map point or selecting a place displays real-time weather metrics (temperature, rain probability, wind, humidity, pressure, UV/dew point) and hourly nowcasts (next 24-48h) + multi-day forecasts (7-day forecast).
   - Radar-derived precipitation likelihood and storm indicators.
   - Graceful fallback and loading states handling API latencies or missing radar tile coverage smoothly.
3. Application Integration & UI Polish:
   - Integrate into the existing Next.js application as a dedicated route (e.g., /radar or /weather-radar or dedicated navigation link in the existing navbar/sidebar).
   - Modern responsive styling (matching Tailwind / existing design system, dark/light theme compatible, polished glassmorphic / clean radar HUD design).
   - Ensure mobile & desktop responsiveness.
4. Build & Verification:
   - Must build cleanly via `npm run build` with zero TypeScript or Next.js errors.
   - Verified functionality and automated/component tests if appropriate.

## Follow-up â€” 2026-09-03T16:54:39Z

Implement a complete, production-grade database-backed user authentication system (login and logout) using PostgreSQL and Prisma ORM for CapacityConnect, replacing temporary mock fallbacks with strict database verification, secure bcrypt password hashing, and HTTP-only cookie-based session management.

Working directory: c:\Users\pknat\LMS_SIH
Integrity mode: development

## Requirements

### R1. Database-Backed Authentication Endpoints
- Implement strict database-driven credential verification in `POST /api/auth/login` querying the `User` and `Profile` models via Prisma.
- Passwords must be verified against bcrypt hashes stored in PostgreSQL. Reject fallback to hardcoded mock credentials.
- Return appropriate HTTP status codes (200 OK with user details on success, 400 Bad Request for validation errors, 401 Unauthorized for invalid credentials, and 403 Forbidden for suspended/rejected accounts).
- Implement `POST /api/auth/logout` that clears the session cookie with proper expiration and security attributes.

### R2. Secure Cookie & Session Lifecycle Management
- Issue signed, edge-compatible JWT session tokens with necessary claims (`userId`, `email`, `role`, `status`, `fullName`) set in secure, `httpOnly`, `sameSite: lax` cookies.
- Ensure `getCurrentUser()` and session validation helpers accurately decode and validate active tokens against current user status.
- Ensure the login UI and navigation dynamically respond to authentication status and redirect users to their appropriate role dashboards (`/admin`, `/trainer`, `/trainee`, or `/auth/pending`).

### R3. Seed Data & Database Consistency
- Provide or update Prisma seed logic to ensure standard initial users for each role (`ADMIN`, `TRAINER`, `TRAINEE`) exist with properly hashed bcrypt passwords in PostgreSQL.
- Ensure Prisma schema, client generation, and database migrations/push are aligned and functional.

### R4. Programmatic Verification Suite
- Provide an automated test script (e.g. `scripts/test-auth-db.ts`) executable via command line that programmatically tests:
  1. Login with valid database credentials returns HTTP 200 and an `auth_token` cookie.
  2. Login with invalid password returns HTTP 401 and no auth cookie.
  3. Non-existent user returns HTTP 401.
  4. Logout clears the `auth_token` cookie (`maxAge: 0`).
  5. Session helper or token verification correctly extracts user metadata.

## Acceptance Criteria

### Credential & Database Verification
- [ ] User authentication queries the PostgreSQL database via Prisma client; mock data fallback is removed from the real login path.
- [ ] Password validation uses bcrypt hash comparison (`comparePassword`).
- [ ] Suspended or rejected user statuses are handled with appropriate access denial.

### Session & Cookie Security
- [ ] Successful login sets an `httpOnly` cookie named `auth_token` with 7-day expiry and `path=/`.
- [ ] Logout requests clear the `auth_token` cookie by setting maxAge to 0.
- [ ] The `getCurrentUser` utility correctly verifies valid tokens and returns null for expired/cleared tokens.

### Automated Testing & Verification
- [ ] The programmatic test script (`npm run test:auth` or `npx tsx scripts/test-auth-db.ts`) runs and passes all 5 test scenarios without human intervention.
- [ ] Database seed script successfully inserts or updates valid test accounts without duplicate constraint errors.

## Follow-up — 2026-09-03T17:04:20Z

Comprehensive overhaul of the UI/UX, typography hierarchy (removing inappropriate monospace font usage, aligning Plus Jakarta Sans and Outfit), underlying page spacing rhythms, and navbar responsiveness/contrast across the CapacityConnect Next.js application.

Working directory: c:\Users\pknat\LMS_SIH
Integrity mode: development

## Requirements

### R1. Sovereign Typography & Font Hierarchy Alignment
Establish a clean, consistent typography system. Replace the overused `font-mono` on navigation links, journey badges, buttons, and UI labels with `var(--font-sans)` (Plus Jakarta Sans) and `var(--font-display)` (Outfit). Restrict `JetBrains Mono` strictly to numerical data, radar telemetry, coordinates, and code blocks. Harmonize selection highlight colors in `globals.css` with the portal's sovereign navy and gold identity.

### R2. Responsive Navbar Architecture & Dynamic Clearance
Redesign the floating sticky navbar to remain fully functional across all viewports (expanding desktop navigation to `lg` 1024px+ rather than collapsing prematurely at `xl`). Eliminate cramped link padding, fix the role switcher and mobile drawer contrast, and implement a consistent top clearance system across routes so page content never tucks behind or clashes with the floating navbar pill.

### R3. Design System & Rogue Palette Elimination
Purge all legacy magenta/pink (`#e0234e`, `#ff4d6d`) color codes across the codebase (such as in course catalog, chat cards, and radar telemetry cards). Unify all components under the Mission Mausam palette: Sovereign Navy (`#0b1e36`), Warm Gold (`#c59b48` / `#dfb76c`), Emerald (`#10b981`), and Slate neutrals.

### R4. Theme Contrast & Dark Mode Rectification
Fix dark mode contrast regressions where hardcoded navy text (`text-[#0b1e36]`) renders invisibly against dark backgrounds (specifically in `Sidebar.tsx`, `TechnicalArchitecturePage`, and admin radar views). Ensure all badges, breadcrumbs, borders, and interactive states meet WCAG AA contrast standards in both light and dark themes.

### R5. Underlying Spacing & Layout Rhythm Standardization
Standardize page container widths, horizontal gutters (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`), and vertical section rhythms across landing, dashboard, and radar views to eliminate abrupt jumps and uneven margins.

## Acceptance Criteria

### Typography & Fonts
- [ ] Navbar links, buttons, and section subtitles render in `Plus Jakarta Sans` or `Outfit` instead of `font-mono`.
- [ ] Code blocks, radar coordinates, lat/long readouts, and timestamps maintain `JetBrains Mono`.
- [ ] Text selection in both light and dark mode displays sovereign navy/gold styling without any `#e0234e` magenta tint.

### Navbar & Header
- [ ] Navigation links remain visible and accessible on screen sizes from 1024px (`lg`) upwards without collapsing into the hamburger menu.
- [ ] Floating navbar does not obscure page titles, hero headers, or status bars on any route (`/`, `/radar`, `/architecture`, `/admin`, `/trainee`).
- [ ] Persona/Role switch dropdown items display high contrast and clear active checkmarks in both light and dark modes.

### Visual Polish & Theme Integrity
- [ ] No hardcoded `#e0234e` or `#ff4d6d` references remain in active UI components or CSS.
- [ ] `IMD {role} Workspace` tags and navigation links in `Sidebar.tsx` remain crisp and legible in dark mode.
- [ ] Page titles and breadcrumbs in `/architecture` and `/admin/radar` render with proper contrast in both light and dark themes.
- [ ] Next.js build (`npm run build`) completes with zero type errors or lint failures.
