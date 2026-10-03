# DISPATCH — Typography Survey Explorer

## Mission
Survey the entire codebase to map the typography and font hierarchy alignment requirements (R1 from ORIGINAL_REQUEST.md).

## Instructions
1. Read `c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md` (focusing on "Follow-up — 2026-09-03T17:04:20Z").
2. Investigate font configurations in `src/app/layout.tsx`, `src/app/globals.css`, and `tailwind.config.ts` (or Tailwind CSS configuration).
3. Search for all instances of `font-mono` across `src/components/`, `src/app/`, etc. Classify each instance:
   - Inappropriate usage: navigation links, journey badges, buttons, UI labels, card headers, tabs, subtitles -> identify target font: `var(--font-sans)` (Plus Jakarta Sans) or `var(--font-display)` (Outfit).
   - Legitimate usage: numerical readouts, telemetry data, radar coordinates, lat/long, code snippets, timestamps.
4. Inspect selection highlight colors in `src/app/globals.css` (and any other CSS files) for any rogue `#e0234e` magenta tint.
5. Write your comprehensive survey report and handoff report to:
   `c:\Users\pknat\LMS_SIH\.agents\explorer_survey_typography\survey_report.md`

## 2026-09-03T17:09:22Z
You are the Typography Survey Explorer for CapacityConnect.
Your working directory is c:\Users\pknat\LMS_SIH\.agents\explorer_survey_typography.
Read your instructions in c:\Users\pknat\LMS_SIH\.agents\explorer_survey_typography\DISPATCH.md.
MANDATORY: Read c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md (specifically the latest section 'Follow-up — 2026-09-03T17:04:20Z').

Your Mission:
Map the full typography and font hierarchy landscape across the codebase for Requirement R1:
1. Search the entire codebase for all instances of `font-mono`.
2. Categorize every occurrence:
   - Inappropriate monospace usage (e.g. navigation links, buttons, journey badges, UI labels, subtitles, card headers, tabs) that must be changed to `var(--font-sans)` (Plus Jakarta Sans) or `var(--font-display)` (Outfit).
   - Legitimate monospace usage (numerical metrics, telemetry, radar coordinates, lat/long, code snippets, timestamps) that should retain `JetBrains Mono`.
3. Check font definitions in `src/app/layout.tsx`, `src/app/globals.css`, and `tailwind.config.ts`.
4. Inspect text selection highlights in `src/app/globals.css` to locate any rogue `#e0234e` magenta or improper colors.
5. Write your detailed findings to c:\Users\pknat\LMS_SIH\.agents\explorer_survey_typography\survey_report.md and your completion handoff to c:\Users\pknat\LMS_SIH\.agents\explorer_survey_typography\handoff.md.
When finished, send a message to orchestrator with a summary of findings.
