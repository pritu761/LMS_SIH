# Typography & Font Hierarchy Survey Report
**Project**: CapacityConnect (LMS_SIH)  
**Survey Scope**: Requirement R1 (Sovereign Typography & Font Hierarchy Alignment)  
**Surveyed By**: Typography Survey Explorer  
**Date**: 2026-09-03  

---

## 1. Executive Summary

A comprehensive survey of the entire CapacityConnect Next.js application was conducted to audit all typography configurations, font imports, Tailwind CSS font definitions, selection highlights, and instances of `font-mono` across the codebase.

### Key Audit Metrics:
- **Total Files Audited Containing `font-mono`**: **41 files**
- **Total `font-mono` Occurrences**: **250 instances**
- **Inappropriate Monospace Occurrences**: **118 instances** (47.2%)
  - *Identified Categories*: Navigation links (Navbar), buttons, journey badges, section subtitles, card headers, tabs, breadcrumbs, and UI status tags.
  - *Recommended Target*: `font-sans` (`var(--font-sans)` - Plus Jakarta Sans) or `font-display` (`var(--font-display)` - Outfit).
- **Legitimate Monospace Occurrences**: **132 instances** (52.8%)
  - *Identified Categories*: Numerical metrics (temperatures, percentages, scores), radar telemetry (dBZ, PRF, power, azimuth, elevation, CAPE), radar coordinates & lat/long readouts, timestamps (video timers, exam countdowns, frame times), credential hashes, and code snippets.
  - *Target*: Retained as `font-mono` (`var(--font-mono)` - JetBrains Mono).
- **Rogue Selection Highlight Defect**:
  - Found in `src/app/globals.css` on line 67: `@apply text-foreground antialiased selection:bg-[#E0234E] selection:text-white;`. This injects rogue `#E0234E` magenta across the entire DOM tree unless locally overridden.

---

## 2. Global Font Configuration Audit

### 2.1 `src/app/layout.tsx`
- **Google Fonts Imported via `next/font/google`** (Lines 4, 12-31):
  - `Plus_Jakarta_Sans` -> CSS variable: `--font-sans`, weights: `['400', '500', '600', '700', '800']`, `display: 'swap'`.
  - `Outfit` -> CSS variable: `--font-display`, weights: `['500', '600', '700', '800', '900']`, `display: 'swap'`.
  - `JetBrains_Mono` -> CSS variable: `--font-mono`, weights: `['400', '500', '700']`, `display: 'swap'`.
- **HTML Element Injection** (Line 78):
  ```tsx
  <html lang="en" className={`light ${jakarta.variable} ${outfit.variable} ${jetbrains.variable}`} suppressHydrationWarning>
  ```
- **Body Class Declaration** (Line 104):
  ```tsx
  <body className="min-h-screen bg-white text-slate-900 dark:bg-[#070f1a] dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-[#0b1e36] selection:text-[#c59b48] transition-colors duration-300" suppressHydrationWarning>
  ```
- **Internal `layout.tsx` Inappropriate `font-mono` Occurrences** (Global Footer):
  - Line 144: `<Link href="/radar" className="... text-[11px] font-mono text-emerald-300 ...">` -> Live Doppler Weather Radar badge/link. Target: `font-sans font-semibold`.
  - Line 155: `<div className="font-mono font-bold uppercase tracking-wider text-[#dfb76c]">Core Engine</div>` -> Column header. Target: `font-display` or `font-sans font-bold`.
  - Line 167: `<div className="font-mono font-bold uppercase tracking-wider text-[#dfb76c]">Technical Specs</div>` -> Column header. Target: `font-display` or `font-sans font-bold`.
  - Line 178: `<div className="font-mono font-bold uppercase tracking-wider text-[#dfb76c]">Governance</div>` -> Column header. Target: `font-display` or `font-sans font-bold`.
  - Line 190: `<div className="... text-[11px] text-slate-300 font-mono gap-2">` -> Copyright footer bar. Target: `font-sans`.

### 2.2 `tailwind.config.js`
- **Font Family Extends** (Lines 56-60):
  ```javascript
  fontFamily: {
    sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
    display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
    mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
  }
  ```
- *Assessment*: Configured cleanly. The utility classes `font-sans`, `font-display`, and `font-mono` correctly map to the CSS variables declared in `layout.tsx`.

### 2.3 `src/app/globals.css`
- **Base Font Rules** (Lines 66-95):
  - `body` (Line 68): `font-family: var(--font-sans), system-ui, -apple-system, sans-serif;`
  - `h1, h2, h3, h4, h5` (Line 85): `font-family: var(--font-display), var(--font-sans), sans-serif;`
  - `code, pre, .font-mono` (Line 93-95): `font-family: var(--font-mono), ui-monospace, monospace;`
  - `[data-mode='light'] h1..h4` (Line 342): `font-family: var(--font-display), var(--font-sans), sans-serif;`
- **Text Selection Bug (CRITICAL)**:
  - Line 67:
    ```css
    body {
      @apply text-foreground antialiased selection:bg-[#E0234E] selection:text-white;
    ```
    This directly violates Requirement R1 ("Harmonize selection highlight colors in `globals.css` with the portal's sovereign navy and gold identity, no `#e0234e` magenta tint").
  - **Remediation**:
    ```css
    body {
      @apply text-foreground antialiased selection:bg-[#0b1e36] selection:text-[#c59b48] dark:selection:bg-[#c59b48] dark:selection:text-[#0b1e36];
    ```

---

## 3. Comprehensive File-by-File `font-mono` Audit

### 3.1 Group A: Core Navigation & Layout

| File | Line | Current Snippet | Context | Classification | Recommended Target |
|---|---|---|---|---|---|
| `src/components/layout/Navbar.tsx` | 115 | `return \`px-2.5 py-1 rounded-full text-xs font-semibold font-mono whitespace-nowrap transition-all duration-200 ...\`` | Main desktop navbar links in `getLinkStyle()` | **Inappropriate** | `font-sans font-semibold tracking-normal` |
| `src/components/layout/Navbar.tsx` | 189 | `<span className="... text-[8px] font-mono font-bold bg-[#c59b48]/15 text-[#9a7224] ...">SOVEREIGN METEOROLOGY</span>` | Brand subtitle badge | **Inappropriate** | `font-sans font-bold tracking-wider` |
| `src/components/layout/Navbar.tsx` | 261 | `<div className="... text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 font-mono ...">Switch Role / Persona</div>` | Role switcher dropdown header | **Inappropriate** | `font-sans font-bold tracking-wider` |
| `src/components/layout/Navbar.tsx` | 300 | `className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-rose-600 ... font-mono ..."` | Sign Out button | **Inappropriate** | `font-sans font-semibold` |
| `src/components/layout/Navbar.tsx` | 340 | `className="pointer-events-auto xl:hidden ... space-y-2 font-mono text-xs ..."` | Mobile navigation drawer wrapper | **Inappropriate** | `font-sans` |
| `src/components/layout/Sidebar.tsx` | 176 | `<span className="text-[10px] text-emerald-700 font-bold font-mono">Telemetry Active</span>` | Telemetry active status label | **Inappropriate** | `font-sans font-bold` |
| `src/components/layout/ThemeSwitcher.tsx` | 48 | `<span className="hidden sm:inline font-mono text-[11px] font-bold">{activeConfig.name}</span>` | Active theme button label | **Inappropriate** | `font-sans font-bold` |
| `src/components/layout/ThemeSwitcher.tsx` | 70 | `<div className={\`... text-[10px] font-mono font-bold uppercase tracking-wider ...\`}>Theme Palette / Mode</div>` | Theme popover header | **Inappropriate** | `font-sans font-bold tracking-wider` |
| `src/app/layout.tsx` | 144 | `className="... text-[11px] font-mono text-emerald-300 ..."` | Live Doppler Radar footer badge | **Inappropriate** | `font-sans font-semibold` |
| `src/app/layout.tsx` | 155 | `<div className="font-mono font-bold uppercase tracking-wider text-[#dfb76c]">Core Engine</div>` | Footer Column 2 Header | **Inappropriate** | `font-display font-bold` or `font-sans font-bold` |
| `src/app/layout.tsx` | 167 | `<div className="font-mono font-bold uppercase tracking-wider text-[#dfb76c]">Technical Specs</div>` | Footer Column 3 Header | **Inappropriate** | `font-display font-bold` or `font-sans font-bold` |
| `src/app/layout.tsx` | 178 | `<div className="font-mono font-bold uppercase tracking-wider text-[#dfb76c]">Governance</div>` | Footer Column 4 Header | **Inappropriate** | `font-display font-bold` or `font-sans font-bold` |
| `src/app/layout.tsx` | 190 | `<div className="... text-[11px] text-slate-300 font-mono gap-2">` | Copyright & SIH acknowledgement | **Inappropriate** | `font-sans` |

---

### 3.2 Group B: Landing, Architecture & Auth Pages

#### `src/app/page.tsx` (59 Occurrences)
| Lines | Snippet / Element Description | Context | Classification | Recommended Target |
|---|---|---|---|---|
| 286 | `<div className="text-xs font-mono font-extrabold text-[#0b1e36] ... tracking-wider uppercase ...">` | GOVT OF INDIA • MOES banner title | **Inappropriate** | `font-sans font-extrabold tracking-wider` |
| 289 | `<div className="text-[11px] font-mono text-[#c59b48] ... font-bold tracking-wide">` | IMD MAUSAM BHAVAN subtitle | **Inappropriate** | `font-sans font-bold tracking-wide` |
| 296 | `<span className="... text-xs font-mono font-black shadow-lg">` | Hero Pill: MISSION MAUSAM CADRE MAPPING | **Inappropriate** | `font-sans font-extrabold` |
| 306 | `<span className="... text-xs font-mono font-black shadow-sm">` | Hero Pill: WMO RTC CERTIFIED | **Inappropriate** | `font-sans font-extrabold` |
| 319 | `<div className="... text-xs font-mono font-bold ...">` | Hero Pill: NOWCASTING & TELEMETRY READY | **Inappropriate** | `font-sans font-bold` |
| 347 | `<div className="text-[11px] font-mono font-black ... uppercase tracking-wider ...">` | END-TO-END CADRE LIFECYCLE section tag | **Inappropriate** | `font-sans font-black tracking-wider` |
| 356 | `className={\`... text-xs font-mono font-extrabold border shadow-sm ... \${stage.color}\`}` | **Journey badges (Steps 1 to 5)** | **Inappropriate** | `font-sans font-bold` |
| 401 | `<span className="... text-[10px] font-mono font-bold uppercase tracking-wider">` | STEP 01-05 stage tag | **Inappropriate** | `font-sans font-bold` |
| 405 | `<span className="text-[10px] font-mono text-slate-500 ... font-bold">` | SYSTEM ACTION tag | **Inappropriate** | `font-sans font-semibold` |
| 423 | `<div className="... text-[9px] font-mono font-black shadow-md">` | LIVE ALGORITHM ACTIVE status pill | **Inappropriate** | `font-sans font-bold` |
| 433 | `<div className="text-xs font-mono font-bold text-[#c59b48] ...">` | IMD METEOROLOGIST CADRE subtitle | **Inappropriate** | `font-sans font-bold` |
| 447 | `<div className="w-full grid grid-cols-3 gap-2 pt-1 text-center font-mono">` | Numerical scorecard grid | **Legitimate** | Retain `font-mono` (tabular nums) |
| 463 | `<div className="... text-[10px] font-mono text-slate-500 ...">` | Timestamp: "Verified: 2026-09-03" | **Legitimate** | Retain `font-mono` |
| 481 | `<span className="text-xs font-mono font-bold text-[#c59b48] uppercase tracking-wider">` | Section tag: NATIONAL CADRE MATRIX | **Inappropriate** | `font-sans font-bold tracking-wider` |
| 507 | `<span className="font-mono text-xs font-black text-slate-400 ...">` | Matrix index "01", "02" | **Legitimate** | Retain `font-mono` |
| 526 | `<div className="... text-xs font-mono gap-2">` | Cadre header container | **Inappropriate** | `font-sans` |
| 543, 561, 579 | `<span className="text-[9px] font-mono font-bold ... px-2 py-0.5 rounded ...">` | Standards badges (WMO-258, etc.) | **Inappropriate** | `font-sans font-bold` |
| 596 | `<div className="font-mono text-xs text-slate-500 ...">` | Radar telemetry sync status text | **Inappropriate** | `font-sans` |
| 606 | `className="... text-xs font-mono text-slate-700 ..."` | Live IMD Feed action button | **Inappropriate** | `font-sans font-semibold` |
| 618 | `<span className="... text-xs font-bold ... font-mono">` | PHASE 2 badge | **Inappropriate** | `font-sans font-bold` |
| 641 | `<span className="font-mono text-xs font-bold text-rose-700 ...">` | CADRE 01 track code badge | **Inappropriate** | `font-sans font-bold` |
| 648 | `<div className="text-xs ... font-mono font-bold mt-0.5">{p.subtitle}</div>` | **Card subtitles** | **Inappropriate** | `font-sans font-semibold` |
| 656 | `<div className="... flex items-center justify-between font-mono">` | Cadre track metrics footer | **Legitimate** | Retain `font-mono` |
| 671 | `<span className="... font-mono">` | PHASE 3 badge | **Inappropriate** | `font-sans font-bold` |
| 693, 706, 719 | `<div className="pt-2 text-xs font-mono ... font-bold">` | Radar card subtitles | **Inappropriate** | `font-sans font-semibold` |
| 736 | `<span className="rounded-md ... font-mono font-bold ...">` | Station code (`DWR-DEL`) | **Legitimate** | Retain `font-mono` |
| 757 | `<div className="... text-[11px] font-mono ...">` | Station coordinates lat/long | **Legitimate** | Retain `font-mono` |
| 773 | `<span className="... font-mono">` | PHASE 4 badge | **Inappropriate** | `font-sans font-bold` |
| 793 | `<span className={\`... text-[10px] font-mono font-bold uppercase ...\`}>` | Rubric domain badge | **Inappropriate** | `font-sans font-bold` |
| 811 | `<div className="... text-[11px] font-mono ...">` | Rubric metric scores | **Legitimate** | Retain `font-mono` |
| 826 | `<span className="... font-mono">` | PHASE 5 badge | **Inappropriate** | `font-sans font-bold` |
| 847, 860, 873 | `<div className="pt-2 text-xs font-mono ... font-bold">` | Allocation card subtitles | **Inappropriate** | `font-sans font-semibold` |
| 888 | `<span className="... text-xs font-mono font-bold ...">` | 55/30/15 ALGORITHM badge | **Inappropriate** | `font-sans font-bold` |
| 891 | `<span className="... font-mono">Pedagogical Algorithm</span>` | Algorithm label | **Inappropriate** | `font-sans` |
| 906 | `<span className="... text-[10px] font-bold ... font-mono">` | TOTAL ALLOCATION SCORE label | **Inappropriate** | `font-sans font-bold` |
| 909 | `<div className="text-5xl font-black ... tabular-nums font-mono">` | Big calculation score (`88.5`) | **Legitimate** | Retain `font-mono` |
| 913 | `className={\`... text-[9px] font-black ... font-mono ...\`}` | OPTIMAL FIT status badge | **Inappropriate** | `font-sans font-bold` |
| 938, 949, 959, 971, 981, 992 | Score contribution metrics (`55 pts`, `30 pts`, etc.) | Numerical weighted contributions | **Legitimate** | Retain `font-mono` |
| 1003 | `<span className="... font-mono">` | PHASE 6 badge | **Inappropriate** | `font-sans font-bold` |
| 1018, 1024, 1030, 1036 | `<div className="text-4xl font-black ... font-mono">` | National impact numbers (`85%`, `100%`, `38 / 38`) | **Legitimate** | Retain `font-mono` |
| 1053 | `<span className="text-[10px] font-mono font-bold ...">{t.badge}</span>` | Testimonial role badges | **Inappropriate** | `font-sans font-bold` |
| 1075 | `<div className="... text-xs font-mono font-bold ...">` | Technical callout badge | **Inappropriate** | `font-sans font-bold` |
| 1103 | `<span className="... font-mono">` | OFFICIAL CURRICULUM badge | **Inappropriate** | `font-sans font-bold` |
| 1128 | `<span className="... font-mono">{course.code} • {course.cadreTrack} TRACK</span>` | Course cadre track badge | **Inappropriate** | `font-sans font-bold` |
| 1160 | `<span className="... font-mono font-bold ...">` | Final CTA banner badge | **Inappropriate** | `font-sans font-bold` |

#### `src/app/architecture/page.tsx` (10 Occurrences)
| Line | Current Snippet | Context | Classification | Recommended Target |
|---|---|---|---|---|
| 95 | `<div className="flex items-center gap-2 text-xs font-mono text-slate-500">` | Top breadcrumb navigation | **Inappropriate** | `font-sans font-medium` |
| 106 | `<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full ... text-xs font-mono font-bold ...">` | Hero badge (SYSTEM ARCHITECTURE SPEC) | **Inappropriate** | `font-sans font-bold` |
| 146 | `<span className="inline-flex items-center gap-2 rounded-full ... font-mono">CORE ARCHITECTURAL PILLARS</span>` | Section 1 badge | **Inappropriate** | `font-sans font-bold` |
| 167 | `className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase ..."` | Pillar badge (`IOC CONTAINER`, etc.) | **Inappropriate** | `font-sans font-bold` |
| 189 | `<div key={i} className="flex items-center gap-2 text-[11px] text-slate-700 font-mono">` | Pillar feature highlight bullet text | **Inappropriate** | `font-sans font-normal` |
| 197 | `<div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">` | Card metadata footer | **Inappropriate** | `font-sans` |
| 214 | `<span className="inline-flex items-center gap-2 rounded-full ... font-mono">EXECUTION PIPELINE</span>` | Section 2 badge | **Inappropriate** | `font-sans font-bold` |
| 230 | `<span className="text-xs font-mono font-black ...">STAGE {s.step}</span>` | Stage step badge | **Inappropriate** | `font-sans font-extrabold` |
| 248 | `<span className="inline-flex items-center gap-2 rounded-full ... font-mono">LIVE CODE PLAYGROUND</span>` | Section 3 badge | **Inappropriate** | `font-sans font-bold` |
| 267 | `<span className="inline-flex items-center gap-2 rounded-full ... font-mono">INTEGRATED CAPACITY SUITE</span>` | Section 4 badge | **Inappropriate** | `font-sans font-bold` |

#### `src/app/auth/login/page.tsx` (2 Occurrences)
| Line | Current Snippet | Context | Classification | Recommended Target |
|---|---|---|---|---|
| 109 | `<div className="text-[11px] font-bold uppercase tracking-wider text-[#0b1e36] flex items-center gap-1.5 font-mono">Instant Evaluator Demo Login</div>` | Demo Login card header | **Inappropriate** | `font-sans font-bold tracking-wider` |
| 112 | `<span className="ml-auto text-[10px] text-emerald-700 font-mono flex items-center gap-1.5">Live</span>` | Live status indicator | **Inappropriate** | `font-sans font-bold` |

---

### 3.3 Group C: Admin Pages & Components

| File | Line | Snippet | Context | Classification | Target |
|---|---|---|---|---|---|
| `src/app/admin/page.tsx` | 73 | `<span className="ml-auto ... text-[10px] font-mono">... All Systems Operational</span>` | Status bar text | **Inappropriate** | `font-sans font-bold` |
| `src/app/admin/cms/page.tsx` | 272 | `<span className="... font-mono ...">{new Date(ann.createdAt).toLocaleDateString(...)}</span>` | Announcement timestamp | **Legitimate** | Retain `font-mono` |
| `src/app/admin/cms/page.tsx` | 320 | `<div className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">Live Broadcast Active</div>` | Status pill text | **Inappropriate** | `font-sans font-semibold` |
| `src/app/admin/radar/page.tsx` | 83 | `<span className="... text-xs font-mono font-bold ...">NATIONAL RADAR TELEMETRY</span>` | Header badge | **Inappropriate** | `font-sans font-bold` |
| `src/app/admin/radar/page.tsx` | 87 | `<span className="text-xs font-mono text-emerald-600 ...">38 / 38 Nodes Synchronized</span>` | Status count | **Inappropriate** | `font-sans font-bold` (tabular nums) |
| `src/app/admin/radar/page.tsx` | 116 | `<div className="... text-[11px] font-mono text-slate-500 ...">ACTIVE RADAR NODES</div>` | Metric card 1 header | **Inappropriate** | `font-sans font-bold tracking-wider` |
| `src/app/admin/radar/page.tsx` | 129 | `<div className="... text-[11px] font-mono text-slate-500 ...">AVG INGRESS LATENCY</div>` | Metric card 2 header | **Inappropriate** | `font-sans font-bold tracking-wider` |
| `src/app/admin/radar/page.tsx` | 142 | `<div className="... text-[11px] font-mono text-slate-500 ...">NATIONAL COVERAGE</div>` | Metric card 3 header | **Inappropriate** | `font-sans font-bold tracking-wider` |
| `src/app/admin/radar/page.tsx` | 155 | `<div className="... text-[11px] font-mono text-slate-500 ...">TRAINEE OBSERVERS</div>` | Metric card 4 header | **Inappropriate** | `font-sans font-bold tracking-wider` |
| `src/app/admin/radar/page.tsx` | 183 | `<div className="... font-mono text-xs text-white ...">` | Telemetry packet stream log ticker | **Legitimate** | Retain `font-mono` |
| `src/app/admin/radar/page.tsx` | 227 | `className="... text-xs font-mono ..."` | Filter station search input | **Inappropriate** | `font-sans` |
| `src/app/admin/radar/page.tsx` | 231 | `<div className="... text-xs font-mono">` | Radar band filter tabs (`ALL`, `S-Band`) | **Inappropriate** | `font-sans font-medium` |
| `src/app/admin/radar/page.tsx` | 253 | `<tr className="... text-[10px] font-mono text-slate-500 ... uppercase">` | Station table column headers | **Inappropriate** | `font-sans font-bold tracking-wider` |
| `src/app/admin/radar/page.tsx` | 264 | `<tbody className="... font-mono">` | Station table rows (TX power, PRF, dBZ, ms) | **Legitimate** | Retain `font-mono` for metrics |
| `src/app/admin/radar/page.tsx` | 325 | `className="... text-[10px] font-mono ..."` | "Test Node" button | **Inappropriate** | `font-sans font-bold` |
| `src/components/admin/CompetencyGapAnalyzer.tsx` | 184 | `className="fill-slate-300 text-[9px] font-bold font-mono"` | Radar chart SVG skill code labels | **Legitimate** | Retain `font-mono` |
| `src/components/admin/CompetencyGapAnalyzer.tsx` | 231 | `<span className="text-xs text-slate-500 ... font-mono">Mission Mausam Protocol</span>` | Protocol subtitle | **Inappropriate** | `font-sans` |
| `src/components/admin/CompetencyGapAnalyzer.tsx` | 307 | `Cadre Duration: <span className="... font-mono">{analysis.cadreBenchmarkDuration}</span>` | Cadre benchmark duration | **Legitimate** | Retain `font-mono` or `font-sans` |
| `src/components/admin/CompetencyGapAnalyzer.tsx` | 392 | `<span className="text-xs ... font-mono">{analysis.gaps.length} Target Skills</span>` | Skills counter text | **Inappropriate** | `font-sans font-medium` |
| `src/components/admin/CompetencyGapAnalyzer.tsx` | 421 | `<span className="text-[10px] font-mono text-indigo-400 font-bold ...">{item.code}</span>` | Skill code (`SAT-MET-301`) | **Legitimate** | Retain `font-mono` |
| `src/components/admin/CompetencyGapAnalyzer.tsx` | 455 | `<span className="text-[10px] font-bold text-emerald-400 font-mono">{item.recommendedTrainer.matchScore}% Match Index</span>` | Match percentage metric | **Legitimate** | Retain `font-mono` |
| `src/components/admin/CompetencyRadarCard.tsx` | 179 | `<span className="text-xs ... font-mono">Mission Mausam Weighted Matrix v2.4</span>` | Version subtitle | **Inappropriate** | `font-sans font-medium` |
| `src/components/admin/CompetencyRadarCard.tsx` | 232, 253, 274 | `<span className="text-xs font-black ... font-mono">{weight}%</span>` | 55/30/15 slider weights | **Legitimate** | Retain `font-mono` |
| `src/components/admin/CompetencyRadarCard.tsx` | 300 | `<span className="text-xs text-slate-500 ... font-mono">... Available Faculty Ranked</span>` | Faculty count text | **Inappropriate** | `font-sans` |
| `src/components/admin/CompetencyRadarCard.tsx` | 333 | `<span className="... font-mono shadow-sm">#{res.rank}</span>` | Numerical rank badge | **Legitimate** | Retain `font-mono` |
| `src/components/admin/CompetencyRadarCard.tsx` | 346 | `<p className="text-[10px] text-indigo-600 ... font-mono mt-0.5">{res.organization}</p>` | Organization name | **Inappropriate** | `font-sans font-medium` |
| `src/components/admin/CompetencyRadarCard.tsx` | 359 | `<div className="... text-slate-600 ... font-mono">Skill: 52.3/55 ...</div>` | Weighted breakdown numbers | **Legitimate** | Retain `font-mono` |
| `src/components/admin/CompetencyRadarCard.tsx` | 392 | `<div className="... text-[11px] text-slate-500 ... font-mono">Req: Lvl 4 ...</div>` | Proficiency level metrics | **Legitimate** | Retain `font-mono` |
| `src/components/admin/TrainerDiscoveryDirectory.tsx` | 90 | `<span className="text-xs ... font-mono">{filteredTrainers.length} Faculty Members</span>` | Count subtitle | **Inappropriate** | `font-sans` |
| `src/components/admin/TrainerDiscoveryDirectory.tsx` | 182 | `<span className="text-emerald-400 font-bold font-mono">Lvl {c.proficiencyLevel}</span>` | Proficiency level number | **Legitimate** | Retain `font-mono` |
| `src/components/admin/UserApprovalTable.tsx` | 227 | `<div className="text-[11px] text-slate-500 ... font-mono">{u.email}</div>` | User email address in table | **Inappropriate** | `font-sans` |
| `src/components/admin/UserDetailModal.tsx` | 109 | `<span className="text-[10px] font-mono text-indigo-400 uppercase">{comp.code}</span>` | Competency ID code | **Legitimate** | Retain `font-mono` |

---

### 3.4 Group D: Trainer & Trainee Pages & Components

| File | Line | Snippet | Context | Classification | Target |
|---|---|---|---|---|---|
| `src/app/trainer/page.tsx` | 177 | `<span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">{course.code} • {course.cadreTrack} TRACK</span>` | Course cadre track subtitle | **Inappropriate** | `font-sans font-bold` |
| `src/app/trainer/analytics/page.tsx` | 168 | `<div className="text-[11px] text-slate-500 ... font-mono">{t.email}</div>` | Trainee email in table | **Inappropriate** | `font-sans` |
| `src/app/trainer/courses/create/page.tsx` | 322 | `<span className="text-[10px] font-mono text-[#c59b48] uppercase font-bold">{compInfo.code} • {compInfo.category}</span>` | Competency code + category tag | **Inappropriate** | `font-sans font-bold` |
| `src/app/trainee/profile/page.tsx` | 186 | `<span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">{comp.code} • {comp.category}</span>` | Competency code + category tag | **Inappropriate** | `font-sans font-bold` |
| `src/components/trainee/CoursePlayer.tsx` | 281 | `<span className="... text-[11px] font-mono ...">HD Topic Stream</span>` | Stream quality badge | **Inappropriate** | `font-sans font-medium` |
| `src/components/trainee/CoursePlayer.tsx` | 353 | `<span className="text-xs font-mono text-slate-500 ...">{formatVideoTime(currentTime)} / {formatVideoTime(duration)}</span>` | Video player timestamp | **Legitimate** | Retain `font-mono` |
| `src/components/trainee/CoursePlayer.tsx` | 392 | `<span className="text-[11px] text-slate-500 ... font-mono">File: {activeMaterial.fileSize}</span>` | Document file size metric | **Legitimate** | Retain `font-mono` |
| `src/components/trainee/TraineeSkillGapCard.tsx` | 72 | `<span className="text-xs text-slate-500 ... font-mono">Mission Mausam Protocol</span>` | Protocol subtitle | **Inappropriate** | `font-sans` |
| `src/components/trainee/TraineeSkillGapCard.tsx` | 154 | `<span className="text-[10px] font-mono text-[#ff4d6d] font-bold">{item.code}</span>` | Competency ID code | **Legitimate** | Retain `font-mono` |
| `src/components/trainee/TraineeSkillGapCard.tsx` | 159 | `<span className="text-[9px] text-slate-500 ... font-mono">Lvl {item.currentProficiency} → Target {item.benchmarkProficiency}</span>` | Proficiency level transition | **Legitimate** | Retain `font-mono` |
| `src/components/assessment/QuizEngine.tsx` | 136 | `className={\`... text-sm font-mono font-bold ...\`}>... {formatTimer(timeLeftSeconds)}` | Timed proctor countdown | **Legitimate** | Retain `font-mono` |
| `src/components/assessment/QuizEngine.tsx` | 207 | `className={\`h-7 w-7 ... font-mono text-xs font-bold ...\`}>{letter}</div>` | MCQ option letter ("A", "B") | **Legitimate** | Retain `font-mono` or `font-sans` |

---

### 3.5 Group E: Radar Telemetry & GIS Scope Components (95 Occurrences)

| Component | Inappropriate Occurrences | Legitimate Occurrences | Details |
|---|---|---|---|
| `HourlyNowcastStrip.tsx` | 0 | 7 | All 7 are numerical weather telemetry readouts (temperatures, precipitation, dBZ, humidity %, dew point, cloud cover %, UV index). |
| `IndiaRadarMap.tsx` | 6 | 2 | **Inappropriate (6)**: Line 98 (Mosaic title badge), Line 110 (Band tabs), Lines 129 & 141 (Range Rings & Reflectivity Echoes toggle buttons), Line 162 (Search input), Line 172 (Region filter buttons).<br>**Legitimate (2)**: Line 446 (Map coordinates legend), Line 469 (Station tooltip coordinates & dBZ). |
| `LeafletRadarContainer.tsx` | 0 | 2 | **Legitimate (2)**: Line 232 (Station code badge), Line 314 (dBZ hotspot telemetry readout). |
| `LiveRadarScope.tsx` | 4 | 13 | **Inappropriate (4)**: Line 94 (LIVE PPI SCOPE badge), Line 107 (Run Calibration button), Line 214 (SELECT PRODUCT header), Line 239 (Product title).<br>**Legitimate (13)**: Lines 97 (node code), 121 & 125 (compass marks N/S/E/W), 137-139 (range rings 50/150/250km), 204 (azimuth/elevation), 224 (product codes Z/V/ZDR/KDP), 241 (peak dBZ), 256 (Nyquist interval), 267 (PRF), 273 (kW/GHz parameters). |
| `MultiDayForecast.tsx` | 0 | 6 | All 6 are numerical synoptic forecast metrics (min/max temps, wind speed, rain prob, pressure hPa, solar radiation). |
| `RadarDbzLegend.tsx` | 2 | 6 | **Inappropriate (2)**: Line 124 (Legend title), Line 128 (WMO dBZ SCALE badge).<br>**Legitimate (6)**: Lines 166 (Scale values), 185 (Hovered dBZ), 187 (Rain rate), 198 (Table header), 226 & 227 (dBZ values and rain rates). |
| `RadarDiagnosticsModal.tsx` | 5 | 2 | **Inappropriate (5)**: Line 76 (DIAGNOSTIC TEST HARNESS badge), Line 95 (Form procedure label), Line 107 (Procedure selector buttons), Line 121 (Station header), Line 129 (Execute Diagnostic Test button).<br>**Legitimate (2)**: Line 150 (Terminal diagnostic log console), Line 198 (Packet loss % & latency ms readouts). |
| `RadarPageContent.tsx` | 4 | 4 | **Inappropriate (4)**: Line 190 (LIVE DOPPLER NETWORK badge), Line 194 (WMO RTC Compliant tagline), Line 264 (Mobile tabs: Map, HUD, Stations), Line 410 (38/38 ONLINE badge).<br>**Legitimate (4)**: Line 247 (Frames count & host info), Line 337 (Active target lat/long coordinates), Line 438 (Radar band badge), Line 447 (Range km and reflectivity dBZ metrics). |
| `RadarTimelineControls.tsx` | 2 | 4 | **Inappropriate (2)**: Line 133 (+30m NOWCAST badge), Line 264 (SPEED label).<br>**Legitimate (4)**: Line 142 (Frame time timestamp), Line 145 (Relative offset -20m), Line 209 (Start/end timeline bounds), Line 273 (Playback speed multipliers 0.5x, 1x, 2x). |
| `StormSeverityIndicator.tsx` | 0 | 5 | All 5 are telemetry readouts (Severity Index 0-100, derived dBZ, gauge scale marks, CAPE energy J/kg, peak hour timestamp + dBZ). |
| `WeatherMetricsHud.tsx` | 0 | 14 | All 14 are meteorological telemetry readouts (Last updated timestamp, lat/long coordinates, big temp display, dBZ, humidity %, rain rate, wind speed, gust, pressure hPa, UV index, dew point, apparent temp, cloud cover %, visibility km). |
| `WeatherRadarMap.tsx` | 4 | 3 | **Inappropriate (4)**: Line 58 (Loading subtitle), Line 403 (Map Projection Base label), Line 425 (Color Palette label), Line 452 (Layer Opacity slider label).<br>**Legitimate (3)**: Line 54 (Loading status), Line 349 (Radar mosaic status overlay), Line 452 (Opacity percentage value). |
| `WeatherSearchBar.tsx` | 0 | 1 | **Legitimate (1)**: Line 334 (Location lat/long coordinates in search dropdown). |

---

### 3.6 Group F: Shared & Chat Components

| File | Line | Snippet | Context | Classification | Target |
|---|---|---|---|---|---|
| `src/components/chat/CourseChatbot.tsx` | 78 | `<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-cyan-300 ...">{part.slice(1, -1)}</code>` | Markdown inline code snippets | **Legitimate** | Retain `font-mono` |
| `src/components/shared/AnnouncementFeed.tsx` | 84 | `<span className="... font-mono ...">{timeAgo(ann.createdAt)}</span>` | Relative timestamp pill | **Legitimate** | Retain `font-mono` |
| `src/components/shared/CertificateModal.tsx` | 54 | `<div className="flex items-center gap-2 text-xs font-mono">Digital Verified Credential...</div>` | Modal top control bar label | **Inappropriate** | `font-sans font-medium` |
| `src/components/shared/CertificateModal.tsx` | 105 | `<p className="text-[10px] font-mono text-slate-500 ...">Ministry of Earth Sciences...</p>` | Gov ministry subtitle | **Inappropriate** | `font-sans` |
| `src/components/shared/CertificateModal.tsx` | 114 | `<span className="... text-[11px] font-mono font-bold ...">Official Certificate of Competency Mastery</span>` | Certificate top badge | **Inappropriate** | `font-display font-bold` or `font-sans font-bold` |
| `src/components/shared/CertificateModal.tsx` | 130 | `<p className="text-xs text-slate-500 ... font-mono">Cadre Track: ...</p>` | Cadre track description | **Inappropriate** | `font-sans` |
| `src/components/shared/CertificateModal.tsx` | 145 | `<span className="font-black text-emerald-600 ... font-mono text-sm">{scorePercentage}%</span>` | Assessment score readout | **Legitimate** | Retain `font-mono` |
| `src/components/shared/CertificateModal.tsx` | 164, 188 | `<div className="text-[9px] ... font-mono">IMD Training Institute, Pune / IMD HQ</div>` | Signatory location subtitle | **Inappropriate** | `font-sans` |
| `src/components/shared/CertificateModal.tsx` | 174 | `<span className="text-[9px] font-mono font-black ...">VERIFIED SEAL • 2026</span>` | Center seal badge | **Inappropriate** | `font-sans font-bold` |
| `src/components/shared/CertificateModal.tsx` | 195 | `<div className="... text-[10px] font-mono text-slate-500 ...">Issued Date / Credential ID</div>` | Date & Credential hash ID | **Legitimate** | Retain `font-mono` |
| `src/components/shared/NestCodePlayground.tsx` | 195 | `<span className="text-xs font-mono font-bold ...">Architecture Code Sandbox</span>` | Playground header title | **Inappropriate** | `font-sans font-bold` |
| `src/components/shared/NestCodePlayground.tsx` | 209 | `className={\`... text-xs font-mono font-semibold ...\`}>{snippet.filename}` | Code snippet filenames | **Legitimate** | Retain `font-mono` |
| `src/components/shared/NestCodePlayground.tsx` | 225 | `className="... text-xs text-slate-200 font-mono ..."` | "Copy" code button | **Inappropriate** | `font-sans font-bold` |
| `src/components/shared/NestCodePlayground.tsx` | 244 | `className="... text-xs font-bold font-mono ..."` | "Run Test" action button | **Inappropriate** | `font-sans font-bold` |
| `src/components/shared/NestCodePlayground.tsx` | 253 | `<div className="... text-xs text-slate-300 font-mono">` | Description bar | **Inappropriate** | `font-sans` |
| `src/components/shared/NestCodePlayground.tsx` | 264 | `<div className="... font-mono text-xs sm:text-[13px] ...">` | Interactive code editor block | **Legitimate** | Retain `font-mono` |
| `src/components/shared/NestCodePlayground.tsx` | 300 | `<div className="... font-mono text-xs text-slate-200">` | Live IoC terminal console output | **Legitimate** | Retain `font-mono` |
| `src/components/shared/NestCodePlayground.tsx` | 339 | `<span className="text-[#ff4d6d] font-mono">100% NestJS Compliant</span>` | Compliance tag | **Inappropriate** | `font-sans font-bold` |
| `src/components/shared/NestEcosystemShowcase.tsx` | 134 | `className={\`... rounded-2xl font-mono text-xs ...\`}` | Tool selector tabs/buttons | **Inappropriate** | `font-sans font-semibold` |
| `src/components/shared/NestEcosystemShowcase.tsx` | 181 | `className="... text-xs font-mono font-bold uppercase border"` | Active tool badge | **Inappropriate** | `font-sans font-bold` |
| `src/components/shared/NestEcosystemShowcase.tsx` | 219 | `className="... text-[11px] font-mono font-bold ..."` | Tool feature tag pills | **Inappropriate** | `font-sans font-medium` |
| `src/components/shared/NestEcosystemShowcase.tsx` | 243 | `<div className="... font-mono text-xs">` | Code & telemetry mock window | **Legitimate** | Retain `font-mono` |

---

## 4. Text Selection Highlight Audit

### 4.1 Defect in `src/app/globals.css`
Line 67:
```css
body {
  @apply text-foreground antialiased selection:bg-[#E0234E] selection:text-white;
  font-family: var(--font-sans), system-ui, -apple-system, sans-serif;
```
- **Impact**: `@layer base` applies this rule globally. Any text selected on any page (unless specifically overridden by local `selection:` utilities) defaults to bright magenta (`#E0234E`).
- **Required Action**: Remove `selection:bg-[#E0234E] selection:text-white`. Replace with sovereign navy and gold palette:
  ```css
  @apply text-foreground antialiased selection:bg-[#0b1e36] selection:text-[#c59b48] dark:selection:bg-[#c59b48] dark:selection:text-[#0b1e36];
  ```

### 4.2 Codebase Selection Highlights Inventory
Local overrides were surveyed across `src/`:
1. `src/app/layout.tsx`: Line 104 -> `selection:bg-[#0b1e36] selection:text-[#c59b48]` (Compliant)
2. `src/app/page.tsx`: Line 270 -> `selection:bg-[#0b1e36] selection:text-[#c59b48]` (Compliant)
3. `src/app/architecture/page.tsx`: Line 91 -> `selection:bg-[#0b1e36] selection:text-[#c59b48]` (Compliant)
4. `src/components/radar/RadarPageContent.tsx`: Line 179 -> `selection:bg-[#c59b48] selection:text-[#0b1e36]` (Compliant)
5. `src/components/shared/NestCodePlayground.tsx`: Line 265 -> `selection:bg-[#0b1e36] selection:text-white` (Compliant)

Fixing line 67 in `globals.css` eliminates the last remaining source of rogue magenta text selection across the entire platform.

---

## 5. Architectural Recommendations for Implementation Workers

1. **Global Class Replacements**:
   - Replace inappropriate `font-mono` on UI navigation, buttons, badges, and headers with `font-sans` or `font-display`.
   - Ensure `font-display` (Outfit) is used for expressive headings, section badges, and prominent card headers.
   - Restrict `font-mono` (JetBrains Mono) strictly to numerical metrics, coordinates, telemetry readouts, code snippets, timestamps, and hashes.
2. **Navbar Alignment**:
   - In `src/components/layout/Navbar.tsx`, change `getLinkStyle` from `font-mono` to `font-sans font-semibold tracking-normal`.
   - Update mobile drawer in `Navbar.tsx` from `font-mono` to `font-sans`.
3. **Selection Styling Harmonization**:
   - Update `globals.css` line 67 to Sovereign Navy (`#0b1e36`) and Warm Gold (`#c59b48`).
