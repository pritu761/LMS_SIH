# DISPATCH — Worker M2: Responsive Navbar Architecture & Dynamic Clearance

## Mission
Implement Milestone 2 (Requirement R2: Responsive Navbar Architecture & Dynamic Clearance).

## Context & Authoritative References
- MANDATORY: Read `c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md` (specifically 'Follow-up — 2026-09-03T17:04:20Z').
- Read `c:\Users\pknat\LMS_SIH\PROJECT.md`.
- Read the survey report: `c:\Users\pknat\LMS_SIH\.agents\explorer_survey_navbar\survey_report.md`.
- Test Suite: `scripts/verify-ui-ux.ts` (run `npx tsx scripts/verify-ui-ux.ts --tier=2` to test your implementation).

## Exclusive Write Boundaries
You have exclusive write access to:
- `src/components/layout/Navbar.tsx`
- `src/app/globals.css` (for clearance variables and `scroll-padding-top`)
- `src/app/page.tsx` (for anchor section `scroll-mt-24` attributes)

DO NOT touch any other files.

## Specific Implementation Requirements
1. **Desktop Navigation Expanded from 1024px+ (`lg`)**:
   - In `src/components/layout/Navbar.tsx`:
     - Change `<nav className="hidden xl:flex ...">` to `<nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-xs">`.
     - Change mobile hamburger button from `xl:hidden` to `lg:hidden`.
     - Change mobile navigation drawer from `xl:hidden` to `lg:hidden`.
   - Update `navLinkClass` to responsive density:
     `px-2 xl:px-2.5 py-1 rounded-full text-[11px] xl:text-xs font-semibold font-sans tracking-tight whitespace-nowrap transition-all duration-200`
   - Tune right tool actions for compact density at `lg`:
     - AI Guide button: label `hidden xl:inline` (or compact text), padding `px-2 xl:px-2.5`.
     - Persona Switcher dropdown trigger: compact `px-2 text-[11px] xl:text-xs`.
     - Portal CTA button: compact `px-2.5 xl:px-3.5 text-[11px] xl:text-xs`.
     - Inter-tool gap: `gap-1.5 sm:gap-2`.
   - Ensure the total navbar footprint at 1024px fits within 945px with no horizontal overflow.

2. **Persona / Role Switcher Contrast Rectification**:
   - Fix `roleEntries` in `Navbar.tsx`:
     - Update `iconBg`: replace `text-[#0b1e36]` with `text-[#0b1e36] dark:text-[#dfb76c]`.
     - Update `hoverText`: replace `group-hover:text-[#0b1e36]` with `group-hover:text-[#0b1e36] dark:group-hover:text-[#dfb76c]`.
     - Ensure dropdown background and item hover states maintain high WCAG AA contrast in both light and dark themes.
     - Ensure active role checkmarks display clearly (`text-[#c59b48]`).

3. **Dynamic Clearance System**:
   - In `src/app/globals.css`:
     - Define `--navbar-height: 4.25rem;` in `:root`.
     - Add `html { scroll-padding-top: var(--navbar-height); }`.
   - In `src/app/page.tsx`:
     - Add `scroll-mt-24` to anchor sections (`#problem`, `#cadres`, `#algorithm`, `#curriculum`, `#radar`).
   - Verify top clearance across routes: page titles and hero headers on `/`, `/radar`, `/architecture`, `/admin`, `/trainee` must never tuck behind or clash with the floating navbar pill.

4. **Verification**:
   - Run `npx tsx scripts/verify-ui-ux.ts --tier=2` — ensure 4/4 checks pass (100%).
   - Run `npx tsc --noEmit` and `npm run build` to verify zero compile or type errors.
   - Document all changes and verification results in `c:\Users\pknat\LMS_SIH\.agents\worker_m2\handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
