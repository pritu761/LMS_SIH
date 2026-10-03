# DISPATCH — Test Writer: UI/UX & Design System E2E Suite

## Mission
Build a robust, programmatic verification suite for the UI/UX, Typography, Navbar, Palette, and Contrast overhaul (all acceptance criteria from ORIGINAL_REQUEST.md).

## Context & Authoritative References
- MANDATORY: Read `c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md` (specifically 'Follow-up — 2026-09-03T17:04:20Z').
- Read `c:\Users\pknat\LMS_SIH\PROJECT.md`.
- Read the survey reports:
  - `c:\Users\pknat\LMS_SIH\.agents\explorer_survey_typography\survey_report.md`
  - `c:\Users\pknat\LMS_SIH\.agents\explorer_survey_navbar\survey_report.md`
  - `c:\Users\pknat\LMS_SIH\.agents\explorer_survey_palette_spacing\survey_report.md`

## Exclusive Write Boundaries
You have exclusive write access to:
- `scripts/verify-ui-ux.ts`
- `package.json` (to add `"verify:ui": "tsx scripts/verify-ui-ux.ts"`)
- `TEST_INFRA.md` and `TEST_READY.md` at the project root

## Required Test Coverage
Create `scripts/verify-ui-ux.ts` (executable via `npx tsx scripts/verify-ui-ux.ts`) implementing checks across 5 tiers:
1. **Tier 1: Typography & Font Hierarchy (R1)**:
   - Verify `src/app/globals.css` selection highlight contains `#0b1e36` and `#c59b48`, zero `#E0234E` or `#e0234e`.
   - Verify `src/components/layout/Navbar.tsx` uses `font-sans` for navigation links, not `font-mono`.
   - Verify radar coordinates/metrics in `WeatherMetricsHud.tsx` and `WeatherSearchBar.tsx` retain `font-mono`.
2. **Tier 2: Responsive Navbar Architecture & Clearance (R2)**:
   - Verify `Navbar.tsx` navigation expands on `lg` (e.g. `lg:flex` or `hidden lg:flex`, not `hidden xl:flex`).
   - Verify Persona/Role switcher in `Navbar.tsx` does not have un-overridden `text-[#0b1e36]` in dark mode.
   - Verify clearance system: `--navbar-height` and `scroll-padding-top` in `globals.css`, `scroll-mt-24` on anchor sections in `page.tsx`.
3. **Tier 3: Rogue Palette Elimination (R3)**:
   - Scan all `.tsx`, `.ts`, `.css` files in `src/` (excluding mock test data if any) for zero occurrences of `#e0234e` and `#ff4d6d`.
4. **Tier 4: Dark Mode Contrast (R4)**:
   - Verify `src/components/layout/Sidebar.tsx` workspace tags (`IMD {role} Workspace`) and active pills have dark mode styling (`dark:text-`, `dark:bg-`).
   - Verify `src/app/architecture/page.tsx` contains proper dark mode classes (`dark:text-`, `dark:bg-`).
5. **Tier 5: Layout & Spacing Rhythms (R5)**:
   - Verify landing page journey bar and radar page containers adhere to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.

When the script is created and tested, generate `TEST_READY.md` at the project root documenting test results and execution command. Write your handoff to `c:\Users\pknat\LMS_SIH\.agents\test_writer_ui\handoff.md`.

## 2026-09-03T17:18:00Z
You are the Test Writer for CapacityConnect UI/UX & Design System E2E Suite.
Your working directory is c:\Users\pknat\LMS_SIH\.agents\test_writer_ui.
Read your instructions in c:\Users\pknat\LMS_SIH\.agents\test_writer_ui\DISPATCH.md.
MANDATORY: Read c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md (specifically 'Follow-up — 2026-09-03T17:04:20Z').
Read c:\Users\pknat\LMS_SIH\PROJECT.md.

Mission:
Build a comprehensive, programmatic verification suite for the UI/UX overhaul:
1. Create `scripts/verify-ui-ux.ts` that programmatically tests all acceptance criteria across the 5 tiers:
   - Tier 1: Typography & Selection Highlight (`globals.css` selection highlight, `Navbar.tsx` font-sans, preservation of telemetry mono in `WeatherMetricsHud.tsx`).
   - Tier 2: Responsive Navbar Architecture & Clearance (`Navbar.tsx` expanded on `lg`, Persona switcher dark mode contrast, dynamic clearance system).
   - Tier 3: Rogue Palette Elimination (scans `src/` for zero occurrences of `#e0234e` and `#ff4d6d`).
   - Tier 4: Dark Mode Contrast (verifies `Sidebar.tsx` workspace tags and active pills, `TechnicalArchitecturePage` dark mode classes).
   - Tier 5: Layout & Spacing Rhythms (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` on landing and radar pages).
2. Add `"verify:ui": "tsx scripts/verify-ui-ux.ts"` to `package.json`.
3. Create `TEST_INFRA.md` at project root documenting the test architecture and tiers.
4. Run `npx tsx scripts/verify-ui-ux.ts` to verify the runner executes cleanly (it will report current pass/fail per tier).
5. When complete, publish `TEST_READY.md` at project root and write handoff to `c:\Users\pknat\LMS_SIH\.agents\test_writer_ui\handoff.md`. Send completion message to orchestrator.
