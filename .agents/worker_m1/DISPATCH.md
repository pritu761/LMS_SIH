# DISPATCH — Worker M1: Sovereign Typography & Selection Highlight Alignment

## Mission
Implement Milestone 1 (Requirement R1):
1. Fix text selection highlight in `src/app/globals.css` line 67.
2. Replace inappropriate `font-mono` usages across components with `font-sans` (`var(--font-sans)`, Plus Jakarta Sans) or `font-display` (`var(--font-display)`, Outfit).
3. Strictly preserve `font-mono` (`var(--font-mono)`, JetBrains Mono) on numerical data, radar telemetry, coordinates, lat/long, code blocks, and timestamps.

## Context & Authoritative References
- MANDATORY: Read `c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md` (specifically 'Follow-up — 2026-09-03T17:04:20Z').
- Read `c:\Users\pknat\LMS_SIH\PROJECT.md`.
- Read the comprehensive survey report: `c:\Users\pknat\LMS_SIH\.agents\explorer_survey_typography\survey_report.md`.

## Exclusive Write Boundaries
You have exclusive write access to:
- `src/app/globals.css` (selection highlight on lines 66–68)
- `src/components/layout/Navbar.tsx` (typography in `navLinkClass` and button font classes)
- `src/app/page.tsx` (badges, subtitles, buttons)
- `src/app/architecture/page.tsx` (breadcrumbs, headers, labels)
- `src/app/admin/radar/page.tsx` (card titles, metric labels, buttons)
- `src/components/radar/IndiaRadarMap.tsx` (layer toggles, tab triggers)
- `src/components/radar/RadarPageContent.tsx` (view tabs, HUD labels)
- `src/components/radar/LiveRadarScope.tsx` (action buttons)
- `src/components/radar/RadarDiagnosticsModal.tsx` (control buttons)
- `src/components/shared/NestCodePlayground.tsx` (UI buttons / labels while preserving code editor `font-mono`)

DO NOT touch any other files.

## Specific Implementation Requirements
1. `src/app/globals.css`:
   Update line 67 from:
   `@apply text-foreground antialiased selection:bg-[#E0234E] selection:text-white;`
   To:
   `@apply text-foreground antialiased selection:bg-[#0b1e36] selection:text-[#c59b48] dark:selection:bg-[#c59b48] dark:selection:text-[#0b1e36];`
2. Typography Hierarchy:
   - For navigation links in `src/components/layout/Navbar.tsx:115`, change `font-mono` to `font-sans font-semibold tracking-tight`.
   - For buttons, journey badges, UI labels, tabs, and subtitles across the files listed above, change inappropriate `font-mono` to `font-sans` or `font-display`.
   - Preserve `font-mono` for radar telemetry, lat/long coordinates, timestamps, metrics numbers, and code blocks.
3. Verification:
   - Run `npx next lint` or `npm run build` to ensure zero compilation or TypeScript errors.
   - Document all changes and verification results in `c:\Users\pknat\LMS_SIH\.agents\worker_m1\handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
