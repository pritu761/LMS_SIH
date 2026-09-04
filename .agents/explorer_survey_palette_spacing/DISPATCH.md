# DISPATCH — Palette, Contrast & Spacing Survey Explorer

## Mission
Survey the codebase to map the rogue palette elimination (R3), dark mode contrast rectification (R4), and spacing rhythm standardization (R5) requirements from ORIGINAL_REQUEST.md.

## Instructions
1. Read `c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md` (focusing on "Follow-up — 2026-09-03T17:04:20Z").
2. Hunt for all rogue magenta/pink color codes:
   - Search for `#e0234e`, `#ff4d6d`, `rose-*`, `pink-*` across all files in `src/`.
   - Specifically check course catalog, chat cards, radar telemetry cards, badges, buttons, borders.
   - Map each rogue color to its Mission Mausam palette equivalent: Sovereign Navy (`#0b1e36`), Warm Gold (`#c59b48` / `#dfb76c`), Emerald (`#10b981`), or Slate neutral.
3. Investigate dark mode contrast regressions:
   - Search for hardcoded navy text (`text-[#0b1e36]`, `bg-[#0b1e36]`) that lacks dark mode variants (`dark:text-...`, `dark:bg-...`).
   - Specifically examine `Sidebar.tsx`, `TechnicalArchitecturePage` (`/architecture`), admin radar views (`/admin/radar`), breadcrumbs, and badges.
   - Identify any WCAG AA contrast failures in both light and dark themes.
4. Investigate page layout containers and vertical spacing rhythms:
   - Check container wrappers across landing page (`/`), dashboards (`/trainee`, `/admin`, `/trainer`), radar (`/radar`), and architecture (`/architecture`).
   - Identify inconsistent max-widths, paddings, gutters, and vertical section rhythms. Formulate standardization to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
5. Write your comprehensive survey report and handoff report to:
   `c:\Users\pknat\LMS_SIH\.agents\explorer_survey_palette_spacing\survey_report.md`


## 2026-09-03T17:09:22Z
You are the Palette, Contrast & Spacing Survey Explorer for CapacityConnect.
Your working directory is c:\Users\pknat\LMS_SIH\.agents\explorer_survey_palette_spacing.
Read your instructions in c:\Users\pknat\LMS_SIH\.agents\explorer_survey_palette_spacing\DISPATCH.md.
MANDATORY: Read c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md (specifically the latest section 'Follow-up — 2026-09-03T17:04:20Z').

Your Mission:
Map rogue palette codes (R3), dark mode contrast regressions (R4), and page spacing rhythms (R5):
1. Search all files in `src/` for legacy magenta/pink codes: `#e0234e`, `#ff4d6d`, `rose-*`, `pink-*`. Enumerate every component and recommend Mission Mausam replacements (Sovereign Navy `#0b1e36`, Warm Gold `#c59b48` / `#dfb76c`, Emerald `#10b981`, Slate neutrals).
2. Search for dark mode contrast regressions: identify hardcoded `text-[#0b1e36]`, `bg-[#0b1e36]`, or other unstyled dark elements in `Sidebar.tsx`, `TechnicalArchitecturePage` (`/architecture`), admin radar views (`/admin/radar`), breadcrumbs, badges.
3. Inspect page container widths and spacing rhythms across routes (`/`, `/trainee`, `/admin`, `/trainer`, `/radar`, `/architecture`). Identify inconsistencies and map standardization to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
4. Write your detailed findings to c:\Users\pknat\LMS_SIH\.agents\explorer_survey_palette_spacing\survey_report.md and completion handoff to c:\Users\pknat\LMS_SIH\.agents\explorer_survey_palette_spacing\handoff.md.
When finished, send a message to orchestrator with a summary of findings.
