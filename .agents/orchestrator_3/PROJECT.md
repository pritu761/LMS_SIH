# Project: CapacityConnect Sovereign UI/UX, Typography, Navbar & Design System Overhaul

## Architecture
CapacityConnect is a Next.js 16 (React 19) web application utilizing Tailwind CSS v3, Plus Jakarta Sans (`--font-sans`), Outfit (`--font-display`), and JetBrains Mono (`--font-mono`).
The design system aligns with the Mission Mausam identity:
- **Primary Sovereign Navy**: `#0b1e36` (deep naval blue)
- **Secondary Warm Gold**: `#c59b48` / `#dfb76c` (celestial gold)
- **Accent Emerald**: `#10b981` (telemetry active / verified status)
- **Neutrals**: Slate scale (`slate-50` through `slate-900`) and dark theme surface `#070f1a` / `#0b1e36`

Navigation Architecture:
- **Top Sticky Header**: Floating pill navbar (`src/components/layout/Navbar.tsx`) with `top-0 z-50` floating pill (`max-w-7xl mx-auto`).
- **Responsive Breakpoint**: Desktop `<nav>` expanded from `lg` (1024px+) through responsive density tuning (`lg:px-2 xl:px-2.5`, compact AI tool, text `[11px] xl:text-xs`).
- **Clearance System**: Global `--navbar-height: 4.25rem`, `html { scroll-padding-top: var(--navbar-height); }`, anchor `scroll-mt-24`, and standard route top padding.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Selection Highlight Harmonization | Update `src/app/globals.css:67` from `#E0234E` to sovereign navy `#0b1e36` and warm gold `#c59b48` | M1 | R1 |
| 2 | Global Typography & Font Hierarchy | Replace 118 inappropriate `font-mono` occurrences on buttons, badges, nav links, tabs, breadcrumbs with `font-sans` or `font-display` | M1 | R1 |
| 3 | Preserve Legitimate Telemetry Monospace | Retain `JetBrains Mono` (`font-mono`) on coordinates, lat/long, weather metrics, dBZ, PRF, code blocks, timestamps | M1 | R1 |
| 4 | Desktop Navbar Expanded at 1024px+ | Refactor `Navbar.tsx` from `hidden xl:flex` to `hidden lg:flex` with responsive density tuning fitting in 945px footprint | M2 | R2 |
| 5 | Persona / Role Switcher Contrast Fix | Fix hardcoded `text-[#0b1e36]` in dropdown `iconBg` and `hoverText` for dark mode contrast compliance | M2 | R2 |
| 6 | Mobile Drawer Polish & Contrast | Ensure mobile drawer links, close button, and active state indicators meet WCAG AA in both themes | M2 | R2 |
| 7 | Dynamic Top Clearance System | Add `--navbar-height` and `scroll-padding-top` in `globals.css`, `scroll-mt-24` on landing sections, eliminate page clashes | M2 | R2 |
| 8 | Rogue Palette Purge (Globals & Layouts) | Eliminate `#e0234e`, `#ff4d6d`, and related pinks from `globals.css`, `page.tsx`, and shared components | M3 | R3 |
| 9 | Rogue Palette Purge (Courses & Chat) | Eliminate legacy pink codes from `trainee/courses`, `CourseChatbot`, `ChatCourseCard`, `ChatSuggestedPills` | M3 | R3 |
| 10 | Rogue Palette Purge (Radar & Trainee Cards)| Replace pink tokens in `CompetencyRadarCard`, `TraineeSkillGapCard`, `StatsCard`, and radar HUD with gold/emerald/slate | M3 | R3 |
| 11 | Sidebar Dark Mode Contrast Rectification | Fix `Sidebar.tsx` workspace tags (`IMD {role} Workspace`), active indicator pills, and telemetry badges for dark mode | M3 | R4 |
| 12 | Architecture Page Dark Mode Rectification| Add dark mode variants across 36 elements in `TechnicalArchitecturePage` (`/architecture`) | M3 | R4 |
| 13 | Admin Radar & Login Contrast Rectification| Ensure buttons, active filters, and login surfaces in `/admin/radar` and `/auth/login` meet WCAG AA contrast | M3 | R4 |
| 14 | Landing Page Spacing Standardization | Align landing page journey bar to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` | M4 | R5 |
| 15 | Radar Page Layout Harmonization | Standardize `/radar` header and main container to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6` | M4 | R5 |
| 16 | Comprehensive E2E Verification Suite | Create automated verification script testing typography, palette elimination, navbar breakpoints, contrast, and layout | M5 | AC |
| 17 | Production Build Verification | Ensure clean `npm run build` with zero TypeScript errors or lint failures | M5 | AC |
| 18 | Independent Multi-Agent Gate & Forensic Audit | Reviewers, Challengers, and Forensic Auditor verify integrity and compliance | M5 | Gate |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Sovereign Typography & Selection Highlight | Selection highlight in `globals.css`, replace inappropriate `font-mono` on buttons, badges, links, tabs, preserve telemetry mono | none | PLANNED |
| M2 | Responsive Navbar Architecture & Clearance | Expand navbar to `lg` (1024px+), responsive link/button density, fix role switcher dark contrast, dynamic clearance system | M1 | PLANNED |
| M3 | Rogue Palette Purge & Dark Mode Contrast | Purge 48 legacy pink/magenta instances, fix dark mode in `Sidebar.tsx`, `TechnicalArchitecturePage`, and admin radar | M1 | PLANNED |
| M4 | Spacing Rhythm & Layout Standardization | Standardize landing page journey bar and `/radar` containers to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` | M2, M3 | PLANNED |
| M5 | Automated Verification, Gate & Forensic Audit | E2E test script, clean `npm run build`, Reviewers, Challengers, and Forensic Auditor integrity verification | M4 | PLANNED |
