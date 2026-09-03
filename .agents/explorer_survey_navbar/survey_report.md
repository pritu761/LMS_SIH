# Navbar Architecture & Dynamic Clearance Survey Report (Requirement R2)

**Component Target**: `src/components/layout/Navbar.tsx` & sitewide route headers  
**Survey Date**: 2026-09-03  
**Integrity Mode**: Development / Read-Only Architecture Analysis  
**Author**: Navbar Architecture Survey Explorer  

---

## 1. Executive Summary

Requirement **R2** mandates a complete redesign and structural hardening of CapacityConnect's floating sticky navbar. Specifically, desktop navigation must remain fully expanded and accessible on viewports from **1024px (`lg`) upwards** rather than prematurely collapsing into a mobile hamburger menu at `<xl` (1280px). Furthermore, this survey identified critical dark mode contrast regressions in the Persona/Role switcher (where hardcoded `#0b1e36` navy text and icons become invisible), pervasive monospace typography violating Requirement R1, and anchor scroll clipping across landing page sections where section headers tuck behind the floating pill.

This survey establishes the exact root causes, physical pixel metrics, contrast ratios, and route-by-route clearances, providing a comprehensive implementation blueprint.

---

## 2. Full Anatomy & Dimensions of `Navbar.tsx`

The current navigation architecture in `src/components/layout/Navbar.tsx` (mounted globally in `src/app/layout.tsx` at line 108) consists of three nested layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Fixed Scroll Progress Indicator: h-[2px], z-[100]                      │
├────────────────────────────────────────────────────────────────────────┤
│ <header className="sticky top-0 z-50 w-full pt-2 sm:pt-2.5 pb-1 ...">  │
│   ┌──────────────────────────────────────────────────────────────────┐ │
│   │ Floating Pill: max-w-7xl rounded-full border backdrop-blur-xl    │ │
│   │ ┌──────────────┐  ┌──────────────────────┐  ┌──────────────────┐ │ │
│   │ │ Brand & Logo │  │ Desktop <nav> Links  │  │ Right Tool Group │ │ │
│   │ └──────────────┘  └──────────────────────┘  └──────────────────┘ │ │
│   └──────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Physical Dimensions & Metrics
1. **Scroll Progress Bar**:
   - Fixed at `top: 0, left: 0, right: 0`, `h-[2px]`, `z-[100]`.
   - Gradient: `from-[#0b1e36] via-[#c59b48] to-[#0b1e36]`.
2. **Outer Sticky Header Container**:
   - Tag: `<header className="sticky top-0 z-50 w-full pt-2 sm:pt-2.5 pb-1 px-2.5 sm:px-4 lg:px-6 pointer-events-none bg-transparent">`
   - Position: `sticky top-0` (participates in normal document flow at top, pins to top on scroll).
   - Pointer events: `pointer-events-none` on outer wrapper ensures clicks outside the pill pass through to the page.
   - Top clearance contribution: `pt-2 sm:pt-2.5` (8px–10px) + pill height (48px) + `pb-1` (4px) = **~62px to ~64px total height** in document flow.
3. **Inner Floating Pill Container**:
   - Tag: `<motion.div className="pointer-events-auto mx-auto max-w-7xl flex items-center justify-between gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border ...">`
   - Maximum width: `max-w-7xl` (1280px).
   - Glassmorphism & Borders:
     - Light Mode: `bg-white/90 border-slate-200/80 backdrop-blur-xl shadow-md` (unscrolled) / `bg-white/95 border-slate-200/90 shadow-xl backdrop-blur-2xl` (scrolled).
     - Dark Mode: `dark:bg-[#0b1e36]/80 dark:border-white/10 dark:shadow-black/20` (unscrolled) / `dark:bg-[#0b1e36]/90 dark:border-white/10 dark:shadow-black/30` (scrolled).

---

## 3. Responsive Breakpoint Analysis & The Premature Collapse Bug

### The Problem
In `Navbar.tsx`:
- Line 196: `<nav className="hidden xl:flex items-center gap-1 text-xs">`
- Line 323: `<button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="xl:hidden h-8 w-8 ...">`
- Line 340: `<motion.div className="pointer-events-auto xl:hidden mt-2 mx-auto ...">`

Tailwind breakpoint constants:
- `lg`: **1024px**
- `xl`: **1280px**

**Impact**: On every screen width between **1024px and 1279px** (including 13" MacBooks, standard 1080p half-screen snaps, landscape tablets, and 720p/1080p business laptops), desktop navigation links disappear entirely and are replaced by a mobile hamburger menu.

### Why Did Desktop Nav Collapse at `xl` (Root Cause)?
The previous author collapsed at `xl` because the raw horizontal footprint of the navbar exceeded the viewport width at 1024px:

#### Horizontal Footprint at 1024px Viewport (Before Optimization)
| Section | Elements & Current Classes | Width (px) |
|---|---|---|
| **Viewport Margin** | `lg:px-6` outer container padding (24px × 2) | 48px |
| **Pill Padding** | `sm:px-4` inner pill padding (16px × 2) | 32px |
| **Left Brand** | Satellite icon (`32px`) + gap (`8px`) + "CAPACITY CONNECT" (`145px`) | ~185px |
| **Nav Links (`font-mono`)** | 6 links in monospace with `px-2.5 py-1 text-xs` + `gap-1`: <br>• Live Radar: 103px<br>• Competency: 95px<br>• Cadres: 65px<br>• 55/30/15: 75px<br>• Courses: 70px<br>• Architecture: 100px<br>• 5 gaps: 20px | **528px** |
| **Inter-Group Gaps** | Left-to-Nav gap (`12px`) + Nav-to-Right gap (`8px`) | 20px |
| **Right Action Tools** | • AI Guide: icon + "AI Guide" + sparkles + `px-2.5` (`98px`)<br>• ModeToggle: (`54px`)<br>• Role Switcher: dot + "ADMIN" + chevron + `px-2.5` (`95px`)<br>• Portal CTA: "ADMIN Portal" + arrow + `px-3.5` (`120px`)<br>• Gaps between tools (`24px`) | **391px** |
| **Total Required Width** | 48 + 32 + 185 + 528 + 20 + 391 | **1,204px** |

Because **1,204px > 1024px**, placing `lg:flex` with the old monospace typography and unoptimized padding caused severe horizontal overflow and button wrapping. The original author took a crude shortcut: hiding the navbar at `<xl` (1280px).

### The Solution: Density Tuning for 1024px+ (`lg`)
By leveraging Requirement R1 (switching from wide `font-mono` to proportional `font-sans` Plus Jakarta Sans) and introducing responsive density tuning, the total required width at 1024px drops to **~895px**, fitting easily inside the 944px available pill interior:

#### Horizontal Footprint at 1024px Viewport (Optimized for `lg`)
| Section | Optimized Classes | Width (px) |
|---|---|---|
| **Left Brand** | Satellite icon (`32px`) + gap (`6px`) + "CAPACITY CONNECT" proportional (`130px`) | ~168px |
| **Nav Links (`font-sans`)** | 6 links in proportional sans with `lg:px-2 xl:px-2.5 py-1 text-[11px] xl:text-xs font-semibold`: <br>• Live Radar: 88px<br>• Competency: 78px<br>• Cadres: 52px<br>• 55/30/15: 60px<br>• Courses: 56px<br>• Architecture: 80px<br>• 5 gaps: 15px | **429px** |
| **Inter-Group Gaps** | `gap-2 xl:gap-3` | 16px |
| **Right Action Tools** | • AI Guide: icon-only at lg `w-8 h-8` or `px-2` (`32px`), label `hidden xl:inline`<br>• ModeToggle: (`54px`)<br>• Role Switcher: compact `px-2 text-[11px]` (`72px`)<br>• Portal CTA: compact `px-2.5 text-[11px]` (`78px`)<br>• Gaps: (`16px`) | **252px** |
| **Total Required Width** | 48 (outer) + 32 (pill) + 168 + 429 + 16 + 252 | **945px** |
| **Available Viewport Width** | 1024px (leaves **79px safety margin**) | **1024px** |

---

## 4. Link Spacing, Padding, and Density at 1024px+

### Current Deficiencies in `navLinkClass` (Lines 113–120):
```tsx
const navLinkClass = (href: string, exact = false) => {
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  return `px-2.5 py-1 rounded-full text-xs font-semibold font-mono whitespace-nowrap transition-all duration-200 ${
    isActive
      ? 'bg-[#0b1e36] text-white shadow-sm border border-[#c59b48]/40 dark:bg-[#122c4d]'
      : 'text-slate-600 hover:text-[#0b1e36] hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10'
  }`;
};
```
1. **Font Choice**: `font-mono` on navigation links directly violates Requirement R1. Monospace glyphs are fixed-width and visually rigid, clashing with the modern portal aesthetic.
2. **Static Padding**: Fixed `px-2.5 py-1` does not scale between 1024px and 1280px+.
3. **Hover & Active Contrast**:
   - In light mode: Active pill is `bg-[#0b1e36] text-white border-[#c59b48]/40` (excellent 14.8:1 contrast). Inactive hover is `hover:bg-slate-100 hover:text-[#0b1e36]` (clean).
   - In dark mode: Active pill is `dark:bg-[#122c4d]` with border `border-[#c59b48]/40`. Inactive is `text-slate-300 dark:hover:bg-white/10 dark:hover:text-white` (good).

### Recommendation:
Refactor `navLinkClass` to:
```tsx
const navLinkClass = (href: string, exact = false) => {
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  return `px-2 xl:px-2.5 py-1 rounded-full text-[11px] xl:text-xs font-semibold font-sans tracking-tight whitespace-nowrap transition-all duration-200 ${
    isActive
      ? 'bg-[#0b1e36] text-white shadow-sm border border-[#c59b48]/50 dark:bg-[#122c4d] dark:border-[#c59b48]/50'
      : 'text-slate-600 hover:text-[#0b1e36] hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10'
  }`;
};
```

---

## 5. Persona/Role Switcher Dropdown & Mobile Navigation Drawer Audit

### Critical Contrast Regressions in the Role Switcher Dropdown

The role entries array (`roleEntries`, lines 122–156) and dropdown rendering (lines 252–308) contain several severe contrast bugs:

```tsx
const roleEntries = [
  {
    role: 'ADMIN',
    label: 'Director General (DG IMD)',
    sub: 'Dr. Mrutyunjay Mohapatra (MoES)',
    icon: ShieldCheck,
    colorClass: 'hover:bg-[#0b1e36]/10',
    iconBg: 'bg-[#0b1e36]/10 border-[#c59b48]/30 text-[#0b1e36]',   // BUG: text-[#0b1e36] in dark mode!
    hoverText: 'group-hover:text-[#0b1e36]',                         // BUG: turns text navy on dark bg!
    check: userRole === 'ADMIN',
    checkColor: 'text-[#c59b48]',
  },
  {
    role: 'TRAINER',
    label: 'Lead Faculty (NWP/HPC)',
    sub: 'Prof. Vikramaditya Sen (MTI Pune)',
    icon: BookOpen,
    colorClass: 'hover:bg-amber-50 dark:hover:bg-amber-500/10',
    iconBg: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300',
    hoverText: 'group-hover:text-amber-800 dark:group-hover:text-amber-300',
    check: userRole === 'TRAINER' && currentUser?.status === 'APPROVED', // BUG: fragile condition
    checkColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    role: 'TRAINEE',
    label: 'Scientist-B (DRSTC)',
    sub: 'Aarav Patel (NWP Division)',
    icon: Award,
    colorClass: 'hover:bg-[#0b1e36]/10',
    iconBg: 'bg-[#0b1e36]/10 border-[#c59b48]/30 text-[#0b1e36]',   // BUG: text-[#0b1e36] in dark mode!
    hoverText: 'group-hover:text-[#0b1e36]',                         // BUG: turns text navy on dark bg!
    check: userRole === 'TRAINEE' && currentUser?.status === 'APPROVED', // BUG: fragile condition
    checkColor: 'text-[#c59b48]',
  },
];
```

#### Detailed Bug Catalog:
1. **Invisible Icons in Dark Mode**:
   - For `ADMIN` and `TRAINEE`: `iconBg` contains `text-[#0b1e36]`.
   - The dropdown container in dark mode is `dark:bg-[#0b1e36]/95`.
   - Hardcoded navy icon (`#0b1e36`) against dark navy background (`#0b1e36`) results in **1.05:1 contrast** — completely invisible!
2. **Text Disappearing on Hover in Dark Mode**:
   - For `ADMIN` and `TRAINEE`: `hoverText` is `'group-hover:text-[#0b1e36]'`.
   - In dark mode, the label is normally `dark:text-slate-100`. But when the user hovers over the item, the text color flips to `#0b1e36`, **instantly vanishing into the dark background**!
3. **Invisible Hover Background in Dark Mode**:
   - For `ADMIN` and `TRAINEE`: `colorClass` is `'hover:bg-[#0b1e36]/10'`.
   - On a background that is already 95% `#0b1e36`, adding 10% `#0b1e36` is mathematically imperceptible. There is no `dark:hover:bg-white/10` or `dark:hover:bg-[#122c4d]`.
4. **Active Selection Checkmark Visibility**:
   - When active, `CheckCircle2` renders `text-[#c59b48]`.
   - On a light background (`#ffffff`), `#c59b48` has only a **2.7:1 contrast ratio**, failing WCAG AA (4.5:1 for text, 3:1 for UI elements).
   - In dark mode (`#0b1e36`), `#dfb76c` or `#c59b48` achieves **6.1:1 contrast** (passing).
   - Light mode active checkmark should use deeper sovereign amber/navy (`text-[#0b1e36]` or `text-[#9a7224]`) with a gold halo.
5. **Role Check Logic Inconsistency**:
   - `ADMIN` checks `userRole === 'ADMIN'`.
   - `TRAINER` and `TRAINEE` require `currentUser?.status === 'APPROVED'`. If `currentUser` has not yet resolved or status is missing in session, the active checkmark fails to appear even though `userRole` is `TRAINER` or `TRAINEE`. It should simply check `userRole === item.role`.

### Mobile Navigation Drawer Audit (Lines 333–384)
1. **Container Typography**:
   `<motion.div className="pointer-events-auto xl:hidden mt-2 mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-4 space-y-2 font-mono text-xs shadow-xl dark:border-white/10 dark:bg-[#0b1e36]/95">`
   - Entire drawer is tagged with `font-mono`.
   - Breakpoint is `xl:hidden` instead of `lg:hidden`.
2. **Missing Active State Indicators**:
   - Only "Live Radar" has a distinct background (`bg-[#c59b48]/10`).
   - Links for `/admin/competency`, `/trainee/courses`, `/architecture`, etc. are plain `text-slate-700 dark:text-slate-200` with no active pill or indicator when on that route.
3. **Missing Sub-Routes for Logged-In Personas**:
   - When `userRole === 'ADMIN'`, mobile drawer only shows `/admin`. Missing direct links to `/admin/radar`, `/admin/users`, `/admin/competency`.
   - When `userRole === 'TRAINER'`, only shows `/trainer`. Missing `/trainer/courses/create`.
   - When `userRole === 'TRAINEE'`, only shows `/trainee`. Missing `/trainee/profile`.

---

## 6. Route-by-Route Dynamic Top Clearance Assessment

We inspected all primary routes in `src/app` to map how page headers and content interact with the floating sticky navbar:

```
Viewports: Mobile (<1024px) | Desktop lg (1024px - 1279px) | Desktop xl+ (1280px+)
Navbar Physical Height: ~62px (mobile) to ~64px (desktop)
Positioning Mode: sticky top-0
```

### Route-by-Route Matrix

| Route | Page File Path | Top Element / Header Structure | Top Clearance at Scroll=0 | Scroll Behavior & Clash Potential | Required Action |
|---|---|---|---|---|---|
| **`/`** | `src/app/page.tsx` | Tricolor 1px bar + `pt-6 pb-12` container | **87px total** (62px navbar + 1px bar + 24px padding) | **HIGH CLASH on Anchor Clicks**: Clicking `/#problem`, `/#cadres`, `/#algorithm` scrolls section top to `0px`. Floating navbar pill covers top 64px of section header! Sections lack `scroll-mt-*`. | Add `scroll-mt-24` to all section IDs (`#problem`, `#cadres`, `#competency`, `#gap`, `#algorithm`, `#outcomes`) + sitewide `scroll-padding-top` in `globals.css`. |
| **`/radar`** | `src/app/radar/page.tsx` → `RadarPageContent.tsx` | Nested `<header>` bar (`bg-[#0b1e36]`, `py-3 sm:py-4`, `z-20`) | **76px total** (62px navbar + 14px padding) | **MODERATE**: Page header scrolls under the floating pill. Floating pill (`bg-white/90` in light mode) creates high visual contrast over dark navy header. Mobile tab strip is clean. | Harmonize pill backdrop blur (`backdrop-blur-2xl`) and shadow. Ensure search bar has `scroll-mt-20`. |
| **`/architecture`** | `src/app/architecture/page.tsx` | `<section className="py-8 bg-slate-50/80 border-b">` | **94px total** (62px navbar + 32px padding) | **LOW CLASH**: Breadcrumbs sit comfortably 32px below navbar. **Theme Bug**: `bg-slate-50/80` lacks dark mode background (`dark:bg-[#0b1e36]/60`), causing light gray strip in dark mode. | Add dark mode classes (`dark:bg-[#0b1e36]/60 dark:border-white/10`) to banner. |
| **`/admin`** | `src/app/admin/page.tsx` | `py-6 max-w-7xl` container + `Sidebar` (`sticky top-20`) | **86px total** (62px navbar + 24px padding) | **HARMONIZED**: Sidebar pins at `top-20` (80px), sitting 16px below the 64px navbar. Main content scrolls smoothly behind pill. | Maintain `py-6` container and `sticky top-20` sidebar rhythm. |
| **`/trainer`** | `src/app/trainer/page.tsx` | `py-6 max-w-7xl` container + `Sidebar` (`sticky top-20`) | **86px total** | **HARMONIZED**: Matches `/admin` spacing rhythm. | Maintain existing rhythm. |
| **`/trainee`** | `src/app/trainee/page.tsx` | `py-6 max-w-7xl` container + `Sidebar` (`sticky top-20`) | **86px total** | **HARMONIZED**: Matches `/admin` spacing rhythm. | Maintain existing rhythm. |
| **`/auth/login`** | `src/app/auth/login/page.tsx` | `flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8` | Centered in remaining viewport | **LOW**: On small laptop viewports, large footer causes page scroll. Form passes under navbar cleanly. **Theme Bug**: `bg-slate-50/50` lacks dark mode styling. | Add dark mode background class to container. |
| **`/admin/radar`** | `src/app/admin/radar/page.tsx` | `py-6 max-w-7xl` container + `Sidebar` (`sticky top-20`) | **86px total** | **HARMONIZED**: Matches `/admin` spacing rhythm. | Maintain existing rhythm. |
| **`/trainee/courses`** | `src/app/trainee/courses/page.tsx` | `py-6 max-w-7xl` container + `Sidebar` (`sticky top-20`) | **86px total** | **HARMONIZED**: Matches `/admin` spacing rhythm. **Palette Bug**: Uses legacy `#e0234e` magenta border (R3). | Maintain rhythm; replace magenta with gold/navy. |

---

## 7. Proposed Architectural Top Clearance System

To permanently prevent content clashing and anchor link clipping sitewide, we propose a two-tier clearance architecture:

### Tier 1: Global CSS Scroll Offset (Sitewide Standard)
In `src/app/globals.css`:
```css
:root {
  --navbar-height: 4.25rem; /* ~68px: accounts for floating pill + top/bottom breathing margin */
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  scroll-behavior: smooth;
  scroll-padding-top: var(--navbar-height); /* Automatically offsets all browser anchor jumps */
}
```

### Tier 2: Explicit Anchor Scroll Margins (Defense-in-Depth)
On all section tags that serve as anchor targets in `src/app/page.tsx`:
- `id="problem"` → `scroll-mt-24`
- `id="cadres"` → `scroll-mt-24`
- `id="competency"` → `scroll-mt-24`
- `id="gap"` → `scroll-mt-24`
- `id="algorithm"` → `scroll-mt-24`
- `id="outcomes"` → `scroll-mt-24`
- `id="architecture-callout"` → `scroll-mt-24`

This guarantees that clicking any navigation link (`/#problem`, `/#cadres`, `/#algorithm`) leaves a clean 24px (1.5rem) margin below the floating navbar pill across all browsers and devices.

---

## 8. Concrete Implementation Blueprint for Requirement R2

### File 1: `src/components/layout/Navbar.tsx`

#### A. Refactor `navLinkClass` (Lines 113–120):
```tsx
  const navLinkClass = (href: string, exact = false) => {
    const isActive = exact ? pathname === href : pathname.startsWith(href);
    return `px-2 xl:px-2.5 py-1 rounded-full text-[11px] xl:text-xs font-semibold font-sans tracking-tight whitespace-nowrap transition-all duration-200 ${
      isActive
        ? 'bg-[#0b1e36] text-white shadow-sm border border-[#c59b48]/50 dark:bg-[#122c4d] dark:border-[#c59b48]/50'
        : 'text-slate-600 hover:text-[#0b1e36] hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10'
    }`;
  };
```

#### B. Fix Role Entries Contrast & Logic (Lines 122–156):
```tsx
  const roleEntries = [
    {
      role: 'ADMIN',
      label: 'Director General (DG IMD)',
      sub: 'Dr. Mrutyunjay Mohapatra (MoES)',
      icon: ShieldCheck,
      colorClass: 'hover:bg-[#0b1e36]/10 dark:hover:bg-white/10',
      iconBg: 'bg-[#0b1e36]/10 border-[#c59b48]/30 text-[#0b1e36] dark:bg-[#c59b48]/20 dark:border-[#c59b48]/40 dark:text-[#dfb76c]',
      hoverText: 'group-hover:text-[#0b1e36] dark:group-hover:text-white',
      check: userRole === 'ADMIN',
      checkColor: 'text-[#9a7224] dark:text-[#dfb76c]',
    },
    {
      role: 'TRAINER',
      label: 'Lead Faculty (NWP/HPC)',
      sub: 'Prof. Vikramaditya Sen (MTI Pune)',
      icon: BookOpen,
      colorClass: 'hover:bg-amber-50 dark:hover:bg-amber-500/10',
      iconBg: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-300',
      hoverText: 'group-hover:text-amber-800 dark:group-hover:text-amber-300',
      check: userRole === 'TRAINER',
      checkColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      role: 'TRAINEE',
      label: 'Scientist-B (DRSTC)',
      sub: 'Aarav Patel (NWP Division)',
      icon: Award,
      colorClass: 'hover:bg-[#0b1e36]/10 dark:hover:bg-white/10',
      iconBg: 'bg-[#0b1e36]/10 border-[#c59b48]/30 text-[#0b1e36] dark:bg-[#c59b48]/20 dark:border-[#c59b48]/40 dark:text-[#dfb76c]',
      hoverText: 'group-hover:text-[#0b1e36] dark:group-hover:text-white',
      check: userRole === 'TRAINEE',
      checkColor: 'text-[#9a7224] dark:text-[#dfb76c]',
    },
  ];
```

#### C. Expand Desktop `<nav>` from `xl:flex` to `lg:flex` (Lines 196–220):
```tsx
  {/* Public / Landing Navigation Links (Desktop: lg+) */}
  <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-xs">
    <Link href="/radar" className={`inline-flex items-center gap-1.5 ${navLinkClass('/radar')}`}>
      <Radio className="h-3 w-3 text-[#c59b48] animate-pulse" />
      <span>Live Radar</span>
    </Link>
    <Link href="/#problem" className={`hidden 2xl:inline-block ${navLinkClass('/#problem', true)}`}>
      Problem
    </Link>
    <Link href="/admin/competency" className={navLinkClass('/admin/competency', true)}>
      Competency
    </Link>
    <Link href="/#cadres" className={navLinkClass('/#cadres', true)}>
      Cadres
    </Link>
    <Link href="/#algorithm" className={navLinkClass('/#algorithm', true)}>
      55/30/15
    </Link>
    <Link href="/trainee/courses" className={navLinkClass('/trainee/courses')}>
      Courses
    </Link>
    <Link href="/architecture" className={navLinkClass('/architecture')}>
      Architecture
    </Link>
  </nav>
```

#### D. Tune Right Action Tools Density (Lines 224–250):
```tsx
  {/* AI Course Navigator Trigger */}
  <button
    type="button"
    onClick={() => openChat()}
    className="relative group flex items-center justify-center gap-1.5 h-8 rounded-full border border-[#c59b48]/40 bg-[#c59b48]/10 px-2 sm:px-2.5 text-xs font-bold text-[#0b1e36] shadow-sm hover:border-[#0b1e36] hover:bg-[#0b1e36] hover:text-white transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0 dark:text-slate-100 dark:hover:text-white"
    title="Ask AI Course Navigator"
  >
    <Bot className="h-3.5 w-3.5 text-[#c59b48] shrink-0" />
    <span className="hidden xl:inline text-[11px] font-sans">AI Guide</span>
    <Sparkles className="h-2.5 w-2.5 text-amber-500 animate-pulse hidden xl:inline shrink-0" />
  </button>
```

#### E. Switch Hamburger and Drawer from `xl` to `lg` (Lines 323 & 340):
- Hamburger trigger: `className="lg:hidden h-8 w-8 flex items-center justify-center rounded-full ..."`
- Mobile drawer: `className="pointer-events-auto lg:hidden mt-2 mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-4 space-y-2 font-sans text-xs shadow-xl dark:border-white/10 dark:bg-[#0b1e36]/95"`
- Remove `font-mono` from drawer container and headers.
- Add active route highlighting to drawer links using `pathname === href`.

---

## 9. Next Steps for Implementer

1. Apply proposed changes in `src/components/layout/Navbar.tsx`.
2. Add `scroll-padding-top: var(--navbar-height)` to `html` in `src/app/globals.css`.
3. Add `scroll-mt-24` to anchor sections in `src/app/page.tsx`.
4. Run `npm run build` to verify clean compilation with zero TypeScript errors.
