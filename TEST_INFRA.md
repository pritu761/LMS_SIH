# UI/UX, Design System & Contrast Test Infrastructure Architecture

## 1. Overview & Objective

The CapacityConnect UI/UX & Design System Verification Suite provides automated, programmatic end-to-end verification for the Mission Mausam portal visual and structural overhaul. It guards against regressions and enforces strict compliance with the specifications established in `ORIGINAL_REQUEST.md` and `PROJECT.md`.

The suite is implemented as a high-performance TypeScript test engine at `scripts/verify-ui-ux.ts`, executable across Windows, Linux, and macOS environments via:
```bash
npm run verify:ui
# or directly:
npx tsx scripts/verify-ui-ux.ts
```

---

## 2. Test Suite Architecture & 5-Tier Hierarchy

The verification runner organizes 21 distinct verification checks across 5 functional tiers corresponding directly to the project milestones and core requirements:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 scripts/verify-ui-ux.ts Test Engine                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ Tier 1: Sovereign Typography & Font Hierarchy (R1)                          │
│   ├── T1.1: Selection Highlight Harmonization (globals.css)                 │
│   ├── T1.2: Navbar Navigation Links Typography (font-sans)                  │
│   ├── T1.3: Navbar Mobile Drawer & Header Chrome Typography                 │
│   ├── T1.4: Preservation of Monospace for Telemetry & Coordinates          │
│   └── T1.5: Global Font Token Architecture (layout.tsx & tailwind.config)   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Tier 2: Responsive Navbar Architecture & Dynamic Clearance (R2)             │
│   ├── T2.1: Desktop Navbar Breakpoint Expansion to lg (1024px+)             │
│   ├── T2.2: Persona/Role Switcher Dark Contrast Compliance                  │
│   ├── T2.3: Dynamic Top Clearance System (globals.css)                      │
│   └── T2.4: Landing Page Anchor Scroll Clearance Margins (page.tsx)         │
├─────────────────────────────────────────────────────────────────────────────┤
│ Tier 3: Rogue Palette Elimination (#e0234e, #ff4d6d) (R3)                   │
│   ├── T3.1: Zero Occurrences of Legacy Magenta #e0234e Across src/          │
│   ├── T3.2: Zero Occurrences of Legacy Hot Pink #ff4d6d Across src/         │
│   ├── T3.3: Purge of Legacy Aurora Gradients in globals.css                 │
│   └── T3.4: Course Catalog & Chat Components Palette Purge                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Tier 4: Dark Mode Contrast & WCAG AA Compliance (R4)                        │
│   ├── T4.1: Sidebar.tsx Workspace Header Contrast in Dark Mode              │
│   ├── T4.2: Sidebar.tsx Active Indicator Pill & Interactive Hover Contrast   │
│   ├── T4.3: TechnicalArchitecturePage Dark Mode Classes (/architecture)     │
│   └── T4.4: Admin Radar & Auth Login Dark Mode Surfaces                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Tier 5: Layout Rhythm & Spacing Standardization (R5)                        │
│   ├── T5.1: Landing Page Trust Marquee & Journey Container Rhythms          │
│   ├── T5.2: Radar Page Container Width & Gutter Harmonization               │
│   ├── T5.3: Canonical Dashboard Container Rhythm Across Portals             │
│   └── T5.4: Root Layout Top Clearance & Breadcrumb Clearance                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tier Specifications & Verification Mechanics

### Tier 1: Sovereign Typography & Font Hierarchy (R1)
- **Target Components**: `src/app/globals.css`, `src/components/layout/Navbar.tsx`, `src/components/radar/WeatherMetricsHud.tsx`, `src/components/radar/WeatherSearchBar.tsx`, `src/components/radar/HourlyNowcastStrip.tsx`, `src/app/layout.tsx`, `tailwind.config.js`.
- **Authoritative Invariants**:
  1. Global selection highlight in `body` must utilize Sovereign Navy (`#0b1e36`) and Celestial Gold (`#c59b48`), completely purging `#E0234E` magenta.
  2. Navigation links in `Navbar.tsx` must use `font-sans` (`var(--font-sans)` Plus Jakarta Sans), never `font-mono`.
  3. Radar numerical readouts, lat/long coordinates, timestamps, and Doppler telemetry in `WeatherMetricsHud.tsx` and `WeatherSearchBar.tsx` must retain `font-mono` (JetBrains Mono).
  4. Google font loaders in `layout.tsx` must inject `--font-sans`, `--font-display`, and `--font-mono`, and `tailwind.config.js` must expose corresponding utilities.

### Tier 2: Responsive Navbar Architecture & Dynamic Clearance (R2)
- **Target Components**: `src/components/layout/Navbar.tsx`, `src/app/globals.css`, `src/app/page.tsx`.
- **Authoritative Invariants**:
  1. Desktop navigation `<nav>` must remain expanded at `lg:flex` (1024px+) rather than prematurely collapsing at `xl` (1280px).
  2. Mobile menu toggle button and drawer must be constrained to `lg:hidden`.
  3. Persona/Role switcher in `Navbar.tsx` must provide dark mode contrast overrides (`dark:text-[#dfb76c]`, `dark:bg-[#c59b48]/20`) so text and icons do not disappear against the `#0b1e36` background.
  4. Global clearance in `globals.css` must define `--navbar-height` and `scroll-padding-top` on `html`.
  5. Section anchors in `src/app/page.tsx` (`#problem`, `#cadres`, `#competency`, `#gap`, `#algorithm`, `#outcomes`) must provide `scroll-mt-24` offsets.

### Tier 3: Rogue Palette Elimination (R3)
- **Target Scope**: Recursive scan across all `.tsx`, `.ts`, and `.css` files under `src/`.
- **Authoritative Invariants**:
  1. Zero occurrences of legacy magenta `#e0234e` (case-insensitive) across all active source files.
  2. Zero occurrences of legacy hot pink `#ff4d6d` (case-insensitive) across all active source files.
  3. Elimination of `.text-aurora` and `.btn-conic-glow` pink gradients in `globals.css`.
  4. Complete purge of pink tokens from course catalog, chatbot, cards, and trainee components.

### Tier 4: Dark Mode Contrast & WCAG AA Compliance (R4)
- **Target Components**: `src/components/layout/Sidebar.tsx`, `src/app/architecture/page.tsx`, `src/app/admin/radar/page.tsx`, `src/app/auth/login/page.tsx`.
- **Authoritative Invariants**:
  1. `Sidebar.tsx` workspace tags (`IMD {role} Workspace`) must not render hardcoded navy text (`text-[#0b1e36]`) without dark mode variants (`dark:text-[#dfb76c]`).
  2. Active indicator pill in `Sidebar.tsx` must feature a dark mode background (`dark:bg-[#122c4d]`).
  3. `TechnicalArchitecturePage` must provide dark mode classes across cards, breadcrumbs, pillar headers, and badges (minimum 20+ `dark:` classes).
  4. Radar filter controls and login form surfaces must provide dark theme elevated backgrounds and readable text.

### Tier 5: Layout Rhythm & Spacing Standardization (R5)
- **Target Components**: `src/app/page.tsx`, `src/components/radar/RadarPageContent.tsx`, `src/app/admin/page.tsx`, `src/app/trainer/page.tsx`, `src/app/trainee/page.tsx`, `src/app/layout.tsx`.
- **Authoritative Invariants**:
  1. Landing page trust marquee header and badges must standardize to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` (eliminating `max-w-6xl` anomaly).
  2. Live Radar page header and main arena must standardize to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6` (eliminating `max-w-[1600px]` horizontal pop).
  3. Dashboard routes must consistently implement `max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6`.
  4. Top clearance padding must ensure the sticky floating pill does not obscure page titles or breadcrumbs on initial load.

---

## 4. CLI Execution Guide

### Standard Execution (All Tiers with Exit Code Enforcement)
```bash
npm run verify:ui
# or
npx tsx scripts/verify-ui-ux.ts
```
- Exits with status code `0` if all 21 checks pass.
- Exits with status code `1` if any check fails, displaying defect line numbers and remediation snippets.

### Milestone Isolation Mode
To verify a specific milestone during progressive implementation:
```bash
# Verify only Tier 1 (Typography)
npx tsx scripts/verify-ui-ux.ts --tier=1

# Verify only Tier 2 (Navbar Architecture)
npx tsx scripts/verify-ui-ux.ts --tier=2

# Verify only Tier 3 (Palette Elimination)
npx tsx scripts/verify-ui-ux.ts --tier=3

# Verify only Tier 4 (Dark Mode Contrast)
npx tsx scripts/verify-ui-ux.ts --tier=4

# Verify only Tier 5 (Layout & Spacing)
npx tsx scripts/verify-ui-ux.ts --tier=5
```

### Pre-Implementation Baseline / Inspection Mode
To inspect current pass/fail counts without failing CI or scripts:
```bash
npx tsx scripts/verify-ui-ux.ts --allow-failure
```

### Compact Summary Mode
```bash
npx tsx scripts/verify-ui-ux.ts --summary --allow-failure
```

### JSON Machine-Readable Mode (for CI or Multi-Agent Gate)
```bash
npx tsx scripts/verify-ui-ux.ts --json --allow-failure
```

---

## 5. Integration with Multi-Agent Workflow

Downstream milestone workers operate against this verification test suite:
- **Worker M1** (Typography): Runs `npx tsx scripts/verify-ui-ux.ts --tier=1`.
- **Worker M2** (Navbar & Clearance): Runs `npx tsx scripts/verify-ui-ux.ts --tier=2`.
- **Worker M3** (Palette & Contrast): Runs `npx tsx scripts/verify-ui-ux.ts --tier=3` and `--tier=4`.
- **Worker M4** (Layout & Spacing): Runs `npx tsx scripts/verify-ui-ux.ts --tier=5`.
- **M5 Gate / Auditor**: Executes full suite `npm run verify:ui` to verify 21/21 passes.
