# TEST_READY — UI/UX & Design System Verification Suite

## Status: READY FOR MILESTONE IMPLEMENTATION & GATEKEEPING
**Date:** 2026-09-03  
**Target Suite:** CapacityConnect UI/UX, Typography, Navbar, Palette & Contrast Overhaul  
**Verification Script:** `scripts/verify-ui-ux.ts`  
**NPM Script:** `npm run verify:ui`  

---

## 1. Test Architecture Summary

The verification suite provides automated programmatic enforcement of all acceptance criteria across the 5 core overhaul tiers defined in `ORIGINAL_REQUEST.md` (Follow-up — 2026-09-03T17:04:20Z) and `PROJECT.md`:

| Tier | Category & Requirement | Checks | Current Status | Milestone Owner |
|---|---|---|---|---|
| **Tier 1** | Sovereign Typography & Font Hierarchy (R1) | 5 checks | **5 / 5 Passed (100.0%)** | M1 Worker |
| **Tier 2** | Responsive Navbar Architecture & Clearance (R2) | 4 checks | **0 / 4 Passed (0.0%)** | M2 Worker |
| **Tier 3** | Rogue Palette Elimination (#e0234e, #ff4d6d) (R3) | 4 checks | **0 / 4 Passed (0.0%)** | M3 Worker |
| **Tier 4** | Dark Mode Contrast & WCAG AA Compliance (R4) | 4 checks | **0 / 4 Passed (0.0%)** | M3 Worker |
| **Tier 5** | Layout Rhythm & Spacing Standardization (R5) | 4 checks | **2 / 4 Passed (50.0%)** | M4 Worker |
| **TOTAL** | **Comprehensive Full Suite** | **21 checks** | **7 / 21 Passed (33.3%)** | **M1–M5** |

---

## 2. Test Execution Commands

### Full Suite Run (Standard Gatekeeper Mode)
```bash
npm run verify:ui
# or
npx tsx scripts/verify-ui-ux.ts
```
*Note: Exits with code `1` when any check fails; exits with code `0` when all 21 checks pass.*

### Milestone Isolation Runs
```bash
# Tier 1 (Typography & Selection Highlight)
npx tsx scripts/verify-ui-ux.ts --tier=1

# Tier 2 (Navbar Breakpoints & Clearance)
npx tsx scripts/verify-ui-ux.ts --tier=2

# Tier 3 (Rogue Palette Elimination)
npx tsx scripts/verify-ui-ux.ts --tier=3

# Tier 4 (Dark Mode Contrast)
npx tsx scripts/verify-ui-ux.ts --tier=4

# Tier 5 (Layout & Spacing Rhythms)
npx tsx scripts/verify-ui-ux.ts --tier=5
```

### Pre-Implementation Baseline Scan (Exit Code 0)
```bash
npx tsx scripts/verify-ui-ux.ts --allow-failure
```

---

## 3. Baseline Verification Results (Detailed Findings)

### Tier 1: Sovereign Typography & Font Hierarchy (R1) — [5/5 Passed ✓]
- `[T1.1]` **Selection Highlight Harmonization (globals.css)**: `PASS` (1.8ms)  
  *Verified*: Global body rule uses `selection:bg-[#0b1e36]` and `selection:text-[#c59b48]` in light mode and `dark:selection:bg-[#c59b48]` and `dark:selection:text-[#0b1e36]` in dark mode. Zero occurrences of rogue `#E0234E` in selection rules.
- `[T1.2]` **Navbar Navigation Links Typography (font-sans)**: `PASS` (1.3ms)  
  *Verified*: `navLinkClass` helper in `Navbar.tsx` strictly uses `font-sans font-semibold tracking-tight`, with zero `font-mono`.
- `[T1.3]` **Navbar Mobile Drawer & Header Chrome Typography**: `PASS` (1.4ms)  
  *Verified*: Mobile navigation drawer wrapper, persona dropdown header, and sign-out button utilize `font-sans`.
- `[T1.4]` **Preservation of Monospace for Telemetry & Coordinates**: `PASS` (2.1ms)  
  *Verified*: `WeatherMetricsHud.tsx` retains 14 `font-mono` instances; `WeatherSearchBar.tsx` retains 1 coordinate `font-mono`; `HourlyNowcastStrip.tsx` retains 7 `font-mono` instances for meteorological readouts.
- `[T1.5]` **Global Font Token Architecture (layout.tsx & tailwind.config.js)**: `PASS` (1.2ms)  
  *Verified*: `layout.tsx` imports and binds `Plus_Jakarta_Sans` (`--font-sans`), `Outfit` (`--font-display`), and `JetBrains_Mono` (`--font-mono`); `tailwind.config.js` correctly maps `sans`, `display`, and `mono` utilities.

### Tier 2: Responsive Navbar Architecture & Dynamic Clearance (R2) — [0/4 Passed ✗]
- `[T2.1]` **Desktop Navbar Breakpoint Expansion to lg (1024px+)**: `FAIL` (0.8ms)  
  *Defect*: Desktop `<nav>` is currently configured as `hidden xl:flex`, collapsing prematurely on viewports below 1280px. Mobile hamburger button and drawer use `xl:hidden`.  
  *Remediation*: M2 Worker must replace `hidden xl:flex` with `hidden lg:flex` and `xl:hidden` with `lg:hidden`.
- `[T2.2]` **Persona / Role Switcher Contrast Compliance in Dark Mode**: `FAIL` (0.8ms)  
  *Defect*: `roleEntries` for `ADMIN` and `TRAINEE` contains hardcoded `text-[#0b1e36]` in `iconBg` and `group-hover:text-[#0b1e36]` in `hoverText` without `dark:*` variants, rendering text and icons invisible against dark navy background.  
  *Remediation*: M2 Worker must add `dark:text-[#dfb76c]`, `dark:bg-[#c59b48]/20`, and `dark:hover:bg-white/10`.
- `[T2.3]` **Dynamic Top Clearance System (globals.css)**: `FAIL` (0.5ms)  
  *Defect*: `src/app/globals.css` does not yet define `--navbar-height` or `scroll-padding-top`.  
  *Remediation*: M2 Worker must add `--navbar-height: 4.25rem;` in `:root` and `scroll-padding-top: var(--navbar-height);` to `html`.
- `[T2.4]` **Landing Page Anchor Scroll Clearance Margins (page.tsx)**: `FAIL` (0.8ms)  
  *Defect*: Section anchors (`#problem`, `#cadres`, `#algorithm`) lack `scroll-mt-24` offsets, causing headings to tuck behind the floating navbar pill upon anchor jumps.  
  *Remediation*: M2 Worker must add `scroll-mt-24` to all section IDs.

### Tier 3: Rogue Palette Elimination (R3) — [0/4 Passed ✗]
- `[T3.1]` **Purge of Legacy Magenta #e0234e Across src/**: `FAIL` (45.3ms)  
  *Defect*: 63 occurrences of `#e0234e` detected across 11 files in `src/`.  
  *Remediation*: M3 Worker must replace with Sovereign Navy (`#0b1e36`) and Warm Gold (`#c59b48`).
- `[T3.2]` **Purge of Legacy Hot Pink #ff4d6d Across src/**: `FAIL` (30.8ms)  
  *Defect*: 47 occurrences of `#ff4d6d` detected across 11 files in `src/`.  
  *Remediation*: M3 Worker must replace with Warm Gold (`#dfb76c`) and Emerald (`#10b981`).
- `[T3.3]` **Purge of Legacy Aurora Gradients in globals.css**: `FAIL` (0.9ms)  
  *Defect*: `.text-aurora` and `.btn-conic-glow` in `globals.css` contain pink and magenta gradient color stops.  
  *Remediation*: M3 Worker must replace with sovereign navy and gold conic/linear gradients.
- `[T3.4]` **Course Catalog & Chat Components Palette Purge**: `FAIL` (1.7ms)  
  *Defect*: `trainee/courses/page.tsx` (24 #e0234e, 6 #ff4d6d), `trainee/page.tsx` (8 #e0234e, 2 #ff4d6d), `CourseChatbot.tsx` (22 #e0234e, 13 #ff4d6d), `ChatCourseCard.tsx` (6 #e0234e, 4 #ff4d6d), `ChatSuggestedPills.tsx` (4 #e0234e, 2 #ff4d6d).  
  *Remediation*: M3 Worker must reskin all components to Mission Mausam tokens.

### Tier 4: Dark Mode Contrast & WCAG AA Compliance (R4) — [0/4 Passed ✗]
- `[T4.1]` **Sidebar.tsx Workspace Header Contrast in Dark Mode**: `FAIL` (0.4ms)  
  *Defect*: `roleColors` in `Sidebar.tsx` has `ADMIN` and `TRAINEE` labels hardcoded to `text-[#0b1e36]` without `dark:text-`, rendering `IMD {role} Workspace` invisible against dark navy sidebar.  
  *Remediation*: M3 Worker must add `dark:text-[#dfb76c]`.
- `[T4.2]` **Sidebar.tsx Active Indicator Pill & Interactive Hover Contrast**: `FAIL` (0.3ms)  
  *Defect*: Active sliding pill `sidebar-active-pill-${role}` has `bg-[#0b1e36]` without `dark:bg-`, blending invisibly in dark mode. Hover icons lack `dark:group-hover:text-`.  
  *Remediation*: M3 Worker must add `dark:bg-[#122c4d]` to active pill and `dark:group-hover:text-white` to icons.
- `[T4.3]` **TechnicalArchitecturePage Dark Mode Classes (/architecture)**: `FAIL` (0.4ms)  
  *Defect*: `src/app/architecture/page.tsx` contains only 2 `dark:` utility classes, leaving cards, breadcrumbs, titles, and badges unstyled for dark mode.  
  *Remediation*: M3 Worker must add 20+ `dark:*` variants across surface, card, and text elements.
- `[T4.4]` **Admin Radar & Auth Login Dark Mode Surfaces**: `FAIL` (0.5ms)  
  *Defect*: `src/app/auth/login/page.tsx` lacks `dark:bg-[#070f1a]` and dark card surface classes; `/admin/radar` active filters blend into dark table background.  
  *Remediation*: M3 Worker must add dark mode elevation classes.

### Tier 5: Layout Rhythm & Spacing Standardization (R5) — [2/4 Passed ✓]
- `[T5.1]` **Landing Page Trust Marquee & Journey Container Rhythms (page.tsx)**: `FAIL` (0.8ms)  
  *Defect*: Line 595 marquee header uses `px-4` without `sm:px-6 lg:px-8`; Line 602 badges container uses non-standard `max-w-6xl mx-auto px-4`.  
  *Remediation*: M4 Worker must standardize both to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- `[T5.2]` **Radar Page Container Width & Gutter Harmonization (RadarPageContent.tsx)**: `FAIL` (0.5ms)  
  *Defect*: Line 182 header and Line 302 main container use `max-w-[1600px]`, causing an abrupt horizontal pop when navigating from standard 1280px routes.  
  *Remediation*: M4 Worker must standardize to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6`.
- `[T5.3]` **Canonical Dashboard Container Rhythm Across Portals**: `PASS` (0.6ms)  
  *Verified*: `/admin`, `/trainer`, and `/trainee` portals strictly adhere to `max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6`.
- `[T5.4]` **Root Layout Top Clearance & Architecture Breadcrumb Clearance**: `PASS` (0.6ms)  
  *Verified*: Layout structure provides top clearance offset for the sticky floating header.

---

## 4. Acceptance Criteria Gate for Milestone Sign-off

The orchestrator and downstream workers must achieve the following milestones:
1. **Milestone M1 Complete**: Tier 1 remains 5/5 passing (verified).
2. **Milestone M2 Complete**: Tier 2 achieves 4/4 passing (`npx tsx scripts/verify-ui-ux.ts --tier=2`).
3. **Milestone M3 Complete**: Tier 3 achieves 4/4 passing and Tier 4 achieves 4/4 passing (`--tier=3`, `--tier=4`).
4. **Milestone M4 Complete**: Tier 5 achieves 4/4 passing (`--tier=5`).
5. **Milestone M5 Gate Sign-off**: Full suite `npm run verify:ui` returns exit code `0` with **21/21 (100.0%) Passing**.
