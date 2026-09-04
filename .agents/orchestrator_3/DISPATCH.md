# DISPATCH

## 2026-09-03T17:08:01Z
You are the Project Orchestrator for CapacityConnect.

Your working directory is: c:\Users\pknat\LMS_SIH\.agents\orchestrator_3
Authoritative user request file: c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md (specifically see the latest "Follow-up — 2026-09-03T17:04:20Z").
Project root workspace: c:\Users\pknat\LMS_SIH
Integrity mode: development

Please heed project-specific rules in c:\Users\pknat\LMS_SIH\AGENTS.md regarding Next.js conventions and breaking changes.

Task Scope & Objectives:
Comprehensive overhaul of the UI/UX, typography hierarchy (removing inappropriate monospace font usage, aligning Plus Jakarta Sans and Outfit), underlying page spacing rhythms, and navbar responsiveness/contrast across the CapacityConnect Next.js application.

Requirements:
1. R1. Sovereign Typography & Font Hierarchy Alignment:
   - Establish clean, consistent typography system.
   - Replace overused `font-mono` on navigation links, journey badges, buttons, and UI labels with `var(--font-sans)` (Plus Jakarta Sans) and `var(--font-display)` (Outfit).
   - Restrict `JetBrains Mono` strictly to numerical data, radar telemetry, coordinates, and code blocks.
   - Harmonize selection highlight colors in `globals.css` with the portal's sovereign navy and gold identity (no `#e0234e` magenta tint).
2. R2. Responsive Navbar Architecture & Dynamic Clearance:
   - Redesign floating sticky navbar to remain fully functional across all viewports (desktop navigation visible on `lg` 1024px+ rather than collapsing prematurely at `xl`).
   - Eliminate cramped link padding, fix role switcher and mobile drawer contrast.
   - Implement consistent top clearance across routes (`/`, `/radar`, `/architecture`, `/admin`, `/trainee`) so page content never tucks behind or clashes with the floating navbar pill.
3. R3. Design System & Rogue Palette Elimination:
   - Purge all legacy magenta/pink (`#e0234e`, `#ff4d6d`) color codes across the codebase (such as in course catalog, chat cards, and radar telemetry cards).
   - Unify components under Mission Mausam palette: Sovereign Navy (`#0b1e36`), Warm Gold (`#c59b48` / `#dfb76c`), Emerald (`#10b981`), and Slate neutrals.
4. R4. Theme Contrast & Dark Mode Rectification:
   - Fix dark mode contrast regressions where hardcoded navy text (`text-[#0b1e36]`) renders invisibly against dark backgrounds (specifically in `Sidebar.tsx`, `TechnicalArchitecturePage`, and admin radar views).
   - Ensure all badges, breadcrumbs, borders, and interactive states meet WCAG AA contrast standards in both light and dark themes.
5. R5. Underlying Spacing & Layout Rhythm Standardization:
   - Standardize page container widths, horizontal gutters (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`), and vertical section rhythms across landing, dashboard, and radar views.
6. Verification & Build:
   - Clean Next.js build (`npm run build`) with zero type errors or lint failures.
   - Verify all acceptance criteria before claiming completion.

Maintain your `plan.md`, `progress.md`, and `BRIEFING.md` in your working directory (`c:\Users\pknat\LMS_SIH\.agents\orchestrator_3`). Dispatch specialized subagents to explore, implement, review, and verify. When fully complete and verified, send a completion report back to Sentinel.
