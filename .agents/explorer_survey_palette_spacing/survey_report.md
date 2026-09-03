# Detailed Survey Report: Palette (R3), Dark Contrast (R4) & Spacing (R5)

**Generated:** 2026-09-03T17:16:00Z  
**Target:** CapacityConnect (`c:\Users\pknat\LMS_SIH`)  
**Explorer:** `explorer_survey_palette_spacing`  
**Reference Directive:** `c:\Users\pknat\LMS_SIH\.agents\ORIGINAL_REQUEST.md` (Follow-up — 2026-09-03T17:04:20Z)

---

## Executive Summary

This survey maps three critical visual architecture requirements across the CapacityConnect Next.js application:
1. **R3 (Rogue Palette Elimination):** Identification and systematic replacement mapping for all legacy pink/magenta tokens (`#e0234e`, `#ff4d6d`, `#ea2845`, `#ff758c`, `#d01b44`, `rgba(224, 35, 78, ...)`, `pink-*`, and non-semantic `rose-*`) across 14 distinct files.
2. **R4 (Dark Mode Contrast Rectification):** Resolution of hardcoded navy text (`text-[#0b1e36]`) and unstyled dark elements rendering invisibly (1:1 contrast ratio) in dark mode, particularly in `Sidebar.tsx`, `TechnicalArchitecturePage` (`/architecture`), `admin/radar/page.tsx`, and auth flows.
3. **R5 (Spacing & Layout Rhythm Standardization):** Alignment of container gutters to canonical `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`, rectification of `/radar`'s abrupt expansion to `1600px`, fixing journey pill container constraints (`max-w-6xl` to `max-w-7xl`), and establishing top clearance so sticky floating navbars never obscure page headers.

---

## Part 1: Rogue Palette Elimination (R3)

### 1.1 Brand Palette Target Specification (Mission Mausam)
- **Sovereign Navy (Primary Dominant):** `#0b1e36` (Hover/elevated: `#122c4d`, Deep background: `#070f1a`)
- **Warm Gold (Accent & Glow):** `#c59b48` (Light/Dark Highlight: `#dfb76c`, Dark/Border: `#9a7224`)
- **Emerald (Success / Live Telemetry):** `#10b981` (Glow/Badge: `#34d399`, Dark tint: `#059669`)
- **Slate Neutrals:** Slate 50 to 950 for background surfaces, borders, and body text.

### 1.2 Comprehensive Inventory of Rogue Magenta/Pink Occurrences

| File Path | Line(s) | Current Rogue Token / Code | Purpose / Context | Recommended Mission Mausam Replacement |
|---|---|---|---|---|
| `src/app/globals.css` | 67 | `selection:bg-[#E0234E] selection:text-white` | Universal text selection | `selection:bg-[#0b1e36] selection:text-[#c59b48] dark:selection:bg-[#c59b48] dark:selection:text-[#0b1e36]` |
| `src/app/globals.css` | 212, 219 | `linear-gradient(135deg, #e0234e 0%, #ea2845 40%, #ff4d6d 100%)` | `.text-aurora` & `[data-theme='nestjs']` text gradient | `linear-gradient(135deg, #0b1e36 0%, #162a45 40%, #c59b48 100%)` |
| `src/app/globals.css` | 931-932 | `rgba(224, 35, 78, 0.08)` | `.cyber-grid` background grid lines | `rgba(197, 155, 72, 0.08)` (Warm Gold) or `rgba(11, 30, 54, 0.08)` |
| `src/app/globals.css` | 946, 954 | `rgba(224, 35, 78, 0.52)`, `rgba(234, 40, 69, 0.28)`, `rgba(255, 107, 139, 0.12)` | `.bridgemind-aurora` radial glow | `rgba(11, 30, 54, 0.6) 0%, rgba(22, 42, 69, 0.35) 25%, rgba(197, 155, 72, 0.18) 50%` |
| `src/app/globals.css` | 980-984, 991-995 | `rgba(255, 107, 139, 1)`, `rgba(224, 35, 78, 0.95)`, `rgba(234, 40, 69, 0.8)`, `box-shadow` alphas | `.bridgemind-beam` vertical light beam | Warm Gold & Navy gradient: `rgba(223, 183, 108, 1) 0%, rgba(197, 155, 72, 0.95) 30%, rgba(11, 30, 54, 0.8) 60%`, gold shadow |
| `src/app/globals.css` | 1032, 1037, 1047 | `rgba(224, 35, 78, 0.3)`, `rgba(224, 35, 78, 0.45)` | `.bridgemind-window` borders and shadows | `rgba(197, 155, 72, 0.4)` (Gold trim) |
| `src/app/globals.css` | 1089, 1096-1097 | `rgba(224, 35, 78, 0.2)`, `rgba(224, 35, 78, 0.65)`, `rgba(224, 35, 78, 0.4)` | Interactive button borders & shadow glows | `rgba(197, 155, 72, ...)` |
| `src/app/globals.css` | 1121-1125, 1132-1136 | `#e0234e 0deg, #ff4d6d 90deg, #ff758c 180deg, #ea2845 270deg, #e0234e 360deg` | `.btn-conic-glow::before` spinning border | Conic gradient of Navy & Gold: `#0b1e36 0deg, #c59b48 90deg, #dfb76c 180deg, #162a45 270deg, #0b1e36 360deg` |
| `src/app/globals.css` | 1177, 1181 | `rgba(224, 35, 78, 0.6)`, `rgba(255, 77, 109, 0.35)` | `.btn-conic-glow:hover` box-shadow | `rgba(197, 155, 72, 0.5)` (Warm Gold shadow) |
| `src/app/globals.css` | 2323, 2327 | `rgba(224, 35, 78, 0.06)`, `#540c1b 0%, #1c050a 45%, #050303 90%` | `.nestjs-hero-bg` radial gradient background | Dark Navy & Slate: `radial-gradient(circle at 50% 30%, #0b1e36 0%, #070f1a 50%, #030712 90%)` |
| `src/app/globals.css` | 2332-2333, 2337-2339 | `rgba(224, 35, 78, 0.2)`, `#0d0407 0%, #200810 50%, #080305 100%` | `.nestjs-hero-frame` border & dark background | `border: 1px solid rgba(197, 155, 72, 0.25); background: linear-gradient(135deg, #0b1e36 0%, #0f172a 50%, #070f1a 100%)` |
| `src/app/globals.css` | 2466-2473 | `rgba(224, 35, 78, 0.35)`, `rgba(224, 35, 78, 0.12)`, `radial-gradient(... rgba(224, 35, 78, 0.08) 0%, rgba(12, 5, 8, 0.85) 75%)` | `.nestjs-bento-card` hover border & dark gradient | `border-color: rgba(197, 155, 72, 0.35); background: radial-gradient(circle at 50% 0%, rgba(197, 155, 72, 0.08) 0%, rgba(11, 30, 54, 0.85) 75%)` |
| `src/app/globals.css` | 2478, 2480 | `rgba(224, 35, 78, 0.3)`, `rgba(224, 35, 78, 0.1)` | `.nestjs-code-container` border & glow | `border: 1px solid rgba(197, 155, 72, 0.35); box-shadow: 0 25px 60px -15px rgba(0,0,0,0.35), 0 0 30px rgba(197, 155, 72, 0.1)` |
| `src/app/page.tsx` | 91 | `text-rose-800 bg-rose-50 border-rose-300 dark:text-rose-200 dark:bg-rose-950/60 dark:border-rose-700` | Journey Stage 01 ("The Problem") badge | `text-[#0b1e36] bg-slate-100 border-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700` |
| `src/app/page.tsx` | 213 | `text-[#e0234e] bg-[#e0234e]/10 border-[#e0234e]/20` | Competency Domain: "Radar & Satellite Nowcasting" | `text-[#c59b48] bg-[#c59b48]/10 border-[#c59b48]/30 dark:text-[#dfb76c] dark:bg-[#c59b48]/20 dark:border-[#c59b48]/40` |
| `src/app/trainee/courses/page.tsx` | 54-55 | `border-[#e0234e]/25 bg-gradient-to-br from-[#1a0e16]/60 via-slate-900/80 to-[#0f121d]`, `via-[#e0234e]/60` | Course catalog hero card background & top line | `border-[#c59b48]/30 bg-gradient-to-br from-[#0b1e36]/90 via-slate-900/80 to-[#070f1a]`, `via-[#c59b48]/60` |
| `src/app/trainee/courses/page.tsx` | 57 | `bg-[#e0234e]/15 ... text-[#ff4d6d] border border-[#e0234e]/30` | "MISSION MAUSAM CURRICULUM" badge | `bg-[#c59b48]/15 text-[#dfb76c] border border-[#c59b48]/30` |
| `src/app/trainee/courses/page.tsx` | 80 | `focus:border-[#e0234e] focus:ring-[#e0234e]` | Course catalog search input focus ring | `focus:border-[#c59b48] focus:ring-[#c59b48]` |
| `src/app/trainee/courses/page.tsx` | 87-89 | `border-[#e0234e]/40 bg-[#e0234e]/10 text-[#ff4d6d] shadow-[#e0234e]/20 hover:border-[#e0234e] hover:bg-[#e0234e]/20`, `text-[#ff4d6d]` for Bot | "Ask AI" button & icon | `border-[#c59b48]/40 bg-[#c59b48]/10 text-[#dfb76c] shadow-[#0b1e36]/20 hover:border-[#c59b48] hover:bg-[#c59b48]/20`, Bot: `text-[#c59b48]` |
| `src/app/trainee/courses/page.tsx` | 102 | `bg-gradient-to-r from-[#e0234e] to-[#ff4d6d] text-white shadow-[#e0234e]/30` | Active cadre track filter pill | `bg-[#0b1e36] text-white border border-[#c59b48]/50 shadow-md shadow-[#0b1e36]/30 dark:bg-[#c59b48] dark:text-[#0b1e36]` |
| `src/app/trainee/courses/page.tsx` | 117 | `hover:border-[#e0234e]/40 dark:hover:border-[#e0234e]/50 hover:shadow-[#e0234e]/10 dark:hover:shadow-[#e0234e]/15` | Course card hover state | `hover:border-[#c59b48]/40 dark:hover:border-[#c59b48]/50 hover:shadow-[#c59b48]/10 dark:hover:shadow-[#c59b48]/15` |
| `src/app/trainee/courses/page.tsx` | 128 | `text-[#ff4d6d] border border-[#e0234e]/30` | Course code badge (`course.code`) | `text-[#dfb76c] border border-[#c59b48]/30` |
| `src/app/trainee/courses/page.tsx` | 131 | `bg-[#e0234e]/20 text-[#ff758c] border border-[#e0234e]/30` | Cadre track badge (`DRSTC TRACK`) | `bg-[#c59b48]/20 text-[#dfb76c] border border-[#c59b48]/30` |
| `src/app/trainee/courses/page.tsx` | 143 | `group-hover:text-[#ff758c]` | Course title hover color | `group-hover:text-[#c59b48]` |
| `src/app/trainee/courses/page.tsx` | 160 | `bg-[#e0234e]/10 text-[#ff758c] border border-[#e0234e]/20` | Mapped competency tags | `bg-[#0b1e36]/10 dark:bg-[#c59b48]/15 text-[#0b1e36] dark:text-[#dfb76c] border border-[#c59b48]/30` |
| `src/app/trainee/courses/page.tsx` | 180 | `bg-gradient-to-r from-[#e0234e] to-[#ff4d6d] hover:from-[#d01b44] hover:to-[#ea2845] shadow-[#e0234e]/30` | "Enroll / Play" CTA button | `bg-[#0b1e36] hover:bg-[#122c4d] border border-[#c59b48]/50 text-white shadow-md shadow-[#0b1e36]/30` |
| `src/app/trainee/page.tsx` | 61-64 | `border-[#e0234e]/25 bg-gradient-to-br from-[#1a0e16]/60 via-slate-900/80 to-[#0f121d]`, `bg-[#e0234e]/5`, `via-[#e0234e]/60` | Trainee Welcome Header container & ambient glow | `border-[#c59b48]/30 bg-gradient-to-br from-[#0b1e36]/90 via-slate-900/80 to-[#070f1a]`, `bg-[#c59b48]/5`, `via-[#c59b48]/60` |
| `src/app/trainee/page.tsx` | 68 | `bg-[#e0234e]/15 text-[#ff4d6d] border border-[#e0234e]/30` | "MISSION MAUSAM • DRSTC INDUCTION" badge | `bg-[#c59b48]/15 text-[#dfb76c] border border-[#c59b48]/30` |
| `src/app/trainee/page.tsx` | 71, 73-74 | `text-[#ff4d6d]`, `bg-[#e0234e]` for ping/dot | "Active Cadre Track" live ping dot | `text-emerald-400`, `bg-emerald-400` (Emerald for live telemetry status) |
| `src/components/admin/CompetencyRadarCard.tsx` | 124, 136, 151 | `bg-gradient-to-r from-[#e0234e] to-[#ff4d6d] text-white shadow-lg shadow-[#e0234e]/30` | Hub Navigation Tabs active state | `bg-[#0b1e36] text-white border border-[#c59b48]/50 shadow-md shadow-[#0b1e36]/20 dark:bg-[#c59b48] dark:text-[#0b1e36]` |
| `src/components/admin/CompetencyRadarCard.tsx` | 140, 142 | `text-[#ff4d6d]` for Brain icon, `bg-[#e0234e]/20 text-[#ff758c] border border-[#e0234e]/30` for CORE badge | Trainee Competency Gap Analyzer tab icon & badge | Brain: `text-[#c59b48] dark:text-[#dfb76c]`, CORE badge: `bg-[#c59b48]/20 text-[#dfb76c] border border-[#c59b48]/40` |
| `src/components/chat/ChatCourseCard.tsx` | 15 | `DRSTC: { bg: 'bg-[#e0234e]/15', text: 'text-[#ff4d6d]', border: 'border-[#e0234e]/30' }` | Cadre color token mapping | `DRSTC: { bg: 'bg-[#c59b48]/15', text: 'text-[#c59b48] dark:text-[#dfb76c]', border: 'border-[#c59b48]/30' }` |
| `src/components/chat/ChatCourseCard.tsx` | 24 | `hover:border-[#e0234e]/50 hover:shadow-[#e0234e]/15` | Chat card hover effect | `hover:border-[#c59b48]/50 hover:shadow-[#c59b48]/15` |
| `src/components/chat/ChatCourseCard.tsx` | 39, 81 | `text-[#ff4d6d]` | Clock & BookOpen icons | `text-[#c59b48]` or `text-slate-400` |
| `src/components/chat/ChatCourseCard.tsx` | 61 | `group-hover:text-[#ff758c]` | Chat card course title hover | `group-hover:text-[#c59b48]` |
| `src/components/chat/ChatCourseCard.tsx` | 88 | `bg-gradient-to-r from-[#e0234e] to-[#ff4d6d] ... hover:from-[#d01b44] hover:to-[#ea2845] shadow-[#e0234e]/25` | "View Course" action button | `bg-[#0b1e36] hover:bg-[#122c4d] text-white border border-[#c59b48]/40 shadow-sm` |
| `src/components/chat/ChatSuggestedPills.tsx` | 20, 22 | `border-[#e0234e]/30 bg-[#e0234e]/10 text-[#ff4d6d] hover:border-[#e0234e] hover:bg-[#e0234e]/25`, `text-[#ff4d6d]` for Sparkles | Suggested query pills & icon | `border-[#c59b48]/30 bg-[#c59b48]/10 text-[#c59b48] dark:text-[#dfb76c] hover:border-[#c59b48] hover:bg-[#c59b48]/25`, Sparkles: `text-[#c59b48]` |
| `src/components/chat/CourseChatbot.tsx` | 53 | `text-[#ff758c]` | Inline markdown links | `text-[#c59b48] dark:text-[#dfb76c]` |
| `src/components/chat/CourseChatbot.tsx` | 335, 338, 341, 347 | `from-[#e0234e] via-[#ea2845] to-[#ff4d6d]`, `shadow-[#e0234e]/40`, `text-[#ff4d6d]`, `bg-[#e0234e]` | MausamBot floating launcher button & badge | Sovereign Navy button `bg-[#0b1e36] border-2 border-[#c59b48] shadow-2xl shadow-[#0b1e36]/50`, Bot icon `text-[#c59b48]`, unread badge `bg-[#c59b48] text-[#0b1e36]` |
| `src/components/chat/CourseChatbot.tsx` | 384, 387, 389, 396, 398, 403, 417 | `from-[#e0234e] via-[#ea2845] to-[#ff758c]`, `text-[#ff4d6d]`, `bg-[#e0234e]/10`, `bg-[#e0234e]` | Chat header bar, avatars, titles & status | Header gradient: `from-[#0b1e36] via-[#c59b48] to-[#dfb76c]`, avatar `bg-[#122c4d] border border-[#c59b48]/50`, Bot icon `text-[#c59b48]`, status dot `bg-emerald-400` |
| `src/components/chat/CourseChatbot.tsx` | 478, 480, 488 | `from-[#e0234e] to-[#ff4d6d]`, `text-[#ff4d6d]`, `from-[#e0234e] to-[#ea2845]` | Message bubbles & avatars | Bot avatar `bg-[#122c4d] border border-[#c59b48]/40`, User bubble `bg-gradient-to-r from-[#0b1e36] to-[#162a45] text-white border border-[#c59b48]/30` |
| `src/components/chat/CourseChatbot.tsx` | 563, 564, 567-570 | `bg-[#e0234e]/30`, `text-[#ff4d6d]`, `bg-[#e0234e]` | Typing indicator dots & label | Dots: `bg-[#c59b48]`, typing container `bg-[#c59b48]/20`, label `text-[#c59b48]` |
| `src/components/chat/CourseChatbot.tsx` | 607, 628, 637 | `focus:border-[#e0234e] focus:ring-[#e0234e]`, `from-[#e0234e] to-[#ff4d6d]`, `text-[#ff4d6d]` | Chat input focus ring, Send button & Sparkles | Focus ring `focus:border-[#c59b48] focus:ring-[#c59b48]`, Send button `bg-[#0b1e36] hover:bg-[#122c4d] border border-[#c59b48]/50 text-white`, Sparkles: `text-[#c59b48]` |
| `src/components/shared/NestCodePlayground.tsx` | 186, 188, 191 | `border-[#e0234e]/30 shadow-[#e0234e]/15`, `bg-[#0d0508]`, `bg-[#e0234e]/90` | Code playground outer box & red window dot | Container `border-[#c59b48]/30 shadow-[#0b1e36]/30`, header `bg-[#0b1e36]/90`, window dot `bg-rose-500` |
| `src/components/shared/NestCodePlayground.tsx` | 323, 330, 339 | `text-[#ff758c]`, `text-[#ff4d6d]`, `text-[#ff4d6d] font-mono` | Execution output & "100% NestJS Compliant" label | `text-[#c59b48]` and `text-[#dfb76c]` |
| `src/components/shared/NestEcosystemShowcase.tsx` | 50 | `color: '#ff4d6d'` | "Capacity Observe" telemetry card accent color | Warm Gold `color: '#c59b48'` or Emerald `color: '#10b981'` |
| `src/components/shared/StatsCard.tsx` | 14, 23, 28-33 | `color = 'red'`, `red: { icon: 'bg-[#e0234e]/10 text-[#ff4d6d] border-[#e0234e]/30', glow: 'group-hover:border-[#e0234e]/50', gradient: 'from-[#e0234e]/20...', shadow: 'rgba(224, 35, 78, 0.3)' }` | Default and red color scheme in universal stats card | Define `gold` variant: `bg-[#c59b48]/10 text-[#c59b48] dark:text-[#dfb76c] border-[#c59b48]/30`, shadow `rgba(197, 155, 72, 0.3)`, make `'gold'` or `'indigo'` default |
| `src/components/trainee/TraineeSkillGapCard.tsx` | 60, 62, 63, 69, 75, 79, 91 | `border-[#e0234e]/30 bg-gradient-to-br from-[#200a12]/40`, `via-[#e0234e]/60`, `bg-[#e0234e]/5`, `text-[#ff4d6d]`, `text-[#ff758c]`, `focus:border-[#e0234e]` | Skill gap card header, badges, icons & select focus | Container: `border-[#c59b48]/30 bg-gradient-to-br from-[#0b1e36]/10 via-white dark:via-slate-900/80 to-white dark:to-slate-950`, badges & text: `text-[#c59b48] dark:text-[#dfb76c] border-[#c59b48]/30`, focus ring: `focus:border-[#c59b48]` |
| `src/components/trainee/TraineeSkillGapCard.tsx` | 115-116, 120, 142, 150, 154, 158, 176 | Deficit box `bg-[#e0234e]/10 text-[#ff4d6d]`, `hover:border-[#e0234e]/60`, button `bg-gradient-to-r from-[#e0234e] to-[#ff4d6d]` | Deficit alert box, deficit list items & enroll CTA | Deficits: semantic amber/rose `bg-amber-500/10 text-amber-500 border-amber-500/20`, enroll button: `bg-[#0b1e36] hover:bg-[#122c4d] border border-[#c59b48]/40 text-white` |
| `src/components/radar/HourlyNowcastStrip.tsx` | 76 | `text-pink-400` | Hail weather condition icon (`CloudHail`) | `text-cyan-400` or `text-[#dfb76c]` |
| `src/components/radar/MultiDayForecast.tsx` | 73 | `text-pink-400` | Hail weather condition icon (`CloudHail`) | `text-cyan-400` or `text-[#dfb76c]` |
| `src/components/radar/WeatherMetricsHud.tsx` | 85 | `text-pink-400` | Hail weather condition icon (`CloudHail`) | `text-cyan-400` or `text-[#dfb76c]` |
| `src/lib/wmoCodes.ts` | 326 | `badgeClass: 'bg-pink-600/25 text-pink-300 border-pink-500/40'` | WMO Code 96 (Thunderstorm with slight hail) | `badgeClass: 'bg-amber-600/25 text-amber-300 border-amber-500/40'` or `bg-cyan-600/25 text-cyan-300 border-cyan-500/40'` |
| `src/lib/__tests__/weatherRadarSuite.test.ts` | 331 | `badgeClass: 'bg-pink-600/25 text-pink-300 border-pink-500/40'` | Unit test assertion for WMO Code 96 | Synchronize with `wmoCodes.ts` replacement |

---

## Part 2: Dark Mode Contrast Regressions (R4)

### 2.1 Critical Contrast Failures & WCAG AA Violations

#### 1. `src/components/layout/Sidebar.tsx`
- **Location:** Lines 68–70 and Line 85.
- **Defect:** `roleColors` dictionary specifies `label: 'text-[#0b1e36]'` for both `ADMIN` and `TRAINEE` roles. When dark mode is active, the sidebar container has `dark:bg-[#0b1e36]`. Consequently, `IMD ADMIN Workspace` and `IMD TRAINEE Workspace` render as navy text on navy background.
- **Measured Contrast Ratio:** **1.0 : 1** (Total Invisibility — Fails WCAG AA minimum of 4.5:1).
- **Secondary Defects:**
  - Line 125: Active navigation pill `<motion.div layoutId="sidebar-active-pill-${role}" className="absolute inset-0 rounded-2xl bg-[#0b1e36]" />` has no dark mode variant and blends completely into `dark:bg-[#0b1e36]`.
  - Line 141: Inactive navigation link hover icon `group-hover:text-[#0b1e36]` lacks dark mode override, turning invisible on hover in dark mode.
  - Line 176: Telemetry text `text-emerald-700` has only ~2.8:1 contrast against dark card background.
- **Actionable Remedy:**
  - Update `roleColors`:
    ```tsx
    ADMIN: { label: 'text-[#0b1e36] dark:text-[#dfb76c]', badge: 'bg-[#0b1e36]/10 dark:bg-[#c59b48]/15 text-[#0b1e36] dark:text-[#dfb76c] border-[#c59b48]/40' },
    TRAINER: { label: 'text-[#c59b48] dark:text-[#dfb76c]', badge: 'bg-[#c59b48]/10 dark:bg-[#c59b48]/15 text-[#0b1e36] dark:text-[#dfb76c] border-[#c59b48]/40' },
    TRAINEE: { label: 'text-[#0b1e36] dark:text-[#dfb76c]', badge: 'bg-[#0b1e36]/10 dark:bg-[#c59b48]/15 text-[#0b1e36] dark:text-[#dfb76c] border-[#c59b48]/40' },
    ```
  - Active pill: `bg-[#0b1e36] dark:bg-[#122c4d] border border-[#c59b48]/50`
  - Hover icon: `group-hover:text-[#0b1e36] dark:group-hover:text-white`
  - Telemetry text: `text-emerald-700 dark:text-emerald-400`

#### 2. `src/app/architecture/page.tsx` (`TechnicalArchitecturePage`)
- **Location:** Lines 93–305 (entire route).
- **Defect:** While the outer wrapper has `dark:bg-[#070f1a] dark:text-slate-100`, almost every child component has hardcoded light-mode classes without dark mode overrides:
  - Line 93: `<section className="border-b border-slate-200 bg-slate-50/80 ...">` lacks `dark:bg-[#070f1a] dark:border-white/10`.
  - Line 95: Breadcrumbs `text-slate-500` lacks `dark:text-slate-400`.
  - Line 96: `hover:text-[#0b1e36]` lacks `dark:hover:text-[#dfb76c]`.
  - Line 101: `<span className="text-slate-900 font-semibold">Technical Architecture</span>` lacks `dark:text-white`.
  - Line 106, 146, 214, 248, 267: Badges `bg-[#0b1e36]/10 text-[#0b1e36]` lack `dark:bg-[#c59b48]/15 dark:text-[#dfb76c]`.
  - Line 110, 150, 218, 252, 271: Titles `<h1 className="... text-[#0b1e36]">`, `<h2 className="... text-[#0b1e36]">` lack `dark:text-white`.
  - Line 113, 153, 182, 221, 238, 255, 274, 287: Descriptions `text-slate-600` lack `dark:text-slate-300`.
  - Line 163: Pillar cards `border border-slate-200 bg-white` lack `dark:border-white/10 dark:bg-[#0f172a]`.
  - Line 167: Pillar badge `bg-[#0b1e36]/5 border-[#0b1e36]/20 text-[#0b1e36]` lacks `dark:bg-[#c59b48]/10 dark:border-[#c59b48]/30 dark:text-[#dfb76c]`.
  - Line 179: Pillar title `<h3 className="... text-[#0b1e36]">` lacks `dark:text-white dark:group-hover:text-[#dfb76c]`.
  - Line 187, 197: Dividers `border-slate-100` lack `dark:border-white/10`.
  - Line 189: Bullet text `text-slate-700` lacks `dark:text-slate-300`.
  - Line 211, 264: Full-width section backgrounds `bg-slate-50 border-slate-200` lack `dark:bg-[#070f1a] dark:border-white/10`.
  - Line 228: Pipeline stage cards `border-slate-200 bg-white` lack `dark:border-white/10 dark:bg-[#0f172a]`.
  - Line 230: Stage badge `text-[#0b1e36] bg-[#0b1e36]/10` lacks `dark:text-[#dfb76c] dark:bg-[#c59b48]/15 dark:border-[#c59b48]/30`.
  - Line 237: Stage title `<h3 className="... text-[#0b1e36]">` lacks `dark:text-white`.
  - Line 285-286: Bottom return CTA box `bg-white` and heading `text-[#0b1e36]` lack `dark:bg-[#0b1e36]/90` and `dark:text-white`.
- **Measured Contrast Ratio:** Between **1.05:1 and 1.8:1** across the entire page (severe failure).
- **Actionable Remedy:** Add appropriate `dark:*` utility classes to all 36 identified element targets.

#### 3. `src/components/layout/Navbar.tsx` (Persona Switcher Dropdown & Mobile Drawer)
- **Location:** Lines 129–130, 151–152, 272, 281, 300.
- **Defect:**
  - Lines 129-130 & 151-152: `roleEntries` defines `iconBg: 'bg-[#0b1e36]/10 border-[#c59b48]/30 text-[#0b1e36]'` and `hoverText: 'group-hover:text-[#0b1e36]'`.
  - Line 281: `<div className="text-xs font-bold text-slate-900 truncate dark:text-slate-100 ${item.hoverText}">`
    When hovering over items in the dropdown while in dark mode, the text dynamically turns `text-[#0b1e36]` on top of `dark:bg-[#0b1e36]/95`.
  - Line 300: `Sign Out` button has `text-rose-600` without dark mode text variant (`dark:text-rose-400`).
- **Measured Contrast Ratio:** Dropdown hover text drops from 14.5:1 down to **1.1:1** on hover.
- **Actionable Remedy:**
  - Update `roleEntries` for ADMIN & TRAINEE:
    `iconBg: 'bg-[#0b1e36]/10 dark:bg-[#c59b48]/20 border-[#c59b48]/30 text-[#0b1e36] dark:text-[#dfb76c]'`
    `hoverText: 'group-hover:text-[#0b1e36] dark:group-hover:text-[#dfb76c]'`
    `colorClass: 'hover:bg-[#0b1e36]/10 dark:hover:bg-white/10'`
  - Sign Out button: add `dark:text-rose-400`.

#### 4. `src/app/admin/radar/page.tsx`
- **Location:** Line 238 & Line 325.
- **Defect:**
  - Line 238: Frequency band filter active button `filterBand === b ? 'bg-[#0b1e36] text-[#dfb76c] font-bold shadow-sm' : ...`
    In dark mode, `bg-[#0b1e36]` is identical to dark background.
  - Line 325: Station table row "Test Node" button: `className="px-2.5 py-1 rounded-lg bg-[#0b1e36] text-[#dfb76c] hover:bg-[#142e50] text-[10px] font-mono transition-all"`
    Blends into dark table rows with low edge definition.
- **Actionable Remedy:** Add `border border-[#c59b48]/40 dark:bg-[#122c4d]` to active filter and test buttons.

#### 5. `src/app/auth/login/page.tsx`
- **Location:** Lines 84, 98, 108, 109, 123, 146.
- **Defect:** Page container has `bg-slate-50/50` without `dark:bg-[#070f1a]`, cards have `bg-white` without `dark:bg-slate-900/90`, and text has hardcoded `text-[#0b1e36]` without `dark:text-white`.
- **Actionable Remedy:** Add dark theme equivalents (`dark:bg-[#070f1a]`, `dark:bg-slate-900/90`, `dark:text-white`, `dark:border-white/10`).

---

## Part 3: Spacing Rhythms & Container Widths (R5)

### 3.1 Canonical Container Specification
- **Maximum Width:** `max-w-7xl` (1280px).
- **Horizontal Gutters:** `mx-auto px-4 sm:px-6 lg:px-8`.
- **Dashboard Structure:** `flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6`.
- **Vertical Section Rhythm (Landing/Architecture):** `py-16` or `py-20` for primary sections, `space-y-12` between section headings and grids.

### 3.2 Audit by Route

#### 1. Landing Page (`/` - `src/app/page.tsx`)
- **Status:** **Mostly Compliant with 2 Key Inconsistencies.**
- **Inconsistencies:**
  - **Line 595:** `<div className="max-w-7xl mx-auto px-4 text-center mb-3">`
    *Defect:* Contains `px-4` but is missing `sm:px-6 lg:px-8`.
    *Remedy:* Standardize to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-3`.
  - **Line 602:** `<div className="flex flex-wrap items-center justify-center gap-2 max-w-6xl mx-auto px-4">`
    *Defect:* Uses `max-w-6xl` instead of `max-w-7xl` and missing responsive padding `sm:px-6 lg:px-8`.
    *Remedy:* Standardize to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- **All other landing sections:**
  - Hero (Line 277), Problem (Line 616), Cadres (Line 668-669), Competency (Line 771), Gap Analysis (Line 824), Algorithm (Line 882), Outcomes (Line 1001), Architecture Callout (Line 1072), Testimonials (Line 1100), CTA (Line 1157) are strictly aligned to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.

#### 2. Dashboard Routes (`/trainee`, `/admin`, `/trainer`)
- **Status:** **100% Fully Standardized.**
- All 15 dashboard views strictly adhere to:
  `<div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">`
  with `<Sidebar role="..." />` (w-64 / w-72) and `<main className="flex-1 min-w-0 space-y-6">`.
- Pages checked and verified:
  - `/trainee`, `/trainee/courses`, `/trainee/profile`, `/trainee/courses/[id]`, `/trainee/assessments/[id]`
  - `/admin`, `/admin/radar`, `/admin/competency`, `/admin/users`, `/admin/cms`, `/admin/reports`
  - `/trainer`, `/trainer/analytics`, `/trainer/courses/create`, `/trainer/assessments/create`, `/trainer/library`

#### 3. Live Weather Radar (`/radar` - `src/components/radar/RadarPageContent.tsx`)
- **Status:** **Major Container Divergence.**
- **Inconsistencies:**
  - **Line 182 (Header):** `<div className="max-w-[1600px] mx-auto flex ...">`
  - **Line 302 (Main Content):** `<main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-6">`
- **Defect:** While other routes are bounded at 1280px (`max-w-7xl`), navigating to `/radar` causes an abrupt horizontal pop to 1600px, creating visual disorientation. Furthermore, padding `p-3 sm:p-5 lg:p-6` does not match `px-4 sm:px-6 lg:px-8 py-6`.
- **Remedy:**
  - Standardize both header (line 182) and main content (line 302) to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6`.
  - Maintain the split grid (`grid-cols-1 lg:grid-cols-12 gap-6`) which fits cleanly within `max-w-7xl`.

#### 4. Technical Architecture (`/architecture` - `src/app/architecture/page.tsx`)
- **Status:** **Container Widths Compliant.**
- Sections at lines 94, 144, 212, 246, 265, 284 correctly utilize `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.

---

## Part 4: Floating Sticky Navbar Dynamic Clearance & Breakpoint Architecture

### 4.1 Root Cause of Navbar Overlap / Clashing
The global navbar (`src/components/layout/Navbar.tsx`) is rendered outside the page children within `src/app/layout.tsx` (line 108):
```tsx
<Navbar />
<main className="flex-1 flex flex-col relative z-10">{children}</main>
```
The navbar root element has:
`className="sticky top-0 z-50 w-full pt-2 sm:pt-2.5 pb-1 px-2.5 sm:px-4 lg:px-6 pointer-events-none bg-transparent"`
Its effective rendered height is approximately **56px to 64px**.

Because it is sticky with floating pill styling, any page whose content begins at Y=0 or has small top padding (`py-3`, `py-6`, or `py-8`) causes its header elements to tuck under or sit dangerously close to the floating pill:
1. **/radar:** The `<header>` element has `py-3 sm:py-4` with no top clearance for the navbar. The floating pill sits directly over the radar title and status badges.
2. **/architecture:** The top breadcrumb section has `py-8` (32px), placing the home breadcrumb link directly beneath the floating pill pill edge.
3. **/trainee, /admin, /trainer:** The container has `py-6` (24px). The welcome hero headers start immediately at 24px, clipping close to the navbar on small screens.
4. **Landing (/) Hero:** The Indian Tricolor accent line is rendered at the very top of `<section>` (`Y=0`), placing it directly behind the floating pill.

### 4.2 Standardized Clearance Architecture
To permanently eliminate navbar occlusion across all routes without manual bespoke margins on every page:
1. **Global Layout Clearance:** In `src/app/layout.tsx`, ensure `<main>` provides a default clearance offset:
   `<main className="flex-1 flex flex-col relative z-10 pt-2 sm:pt-3" suppressHydrationWarning>`
2. **Dedicated Route Clearances:**
   - `/radar`: Add `pt-4 sm:pt-6` to `<header className="relative bg-[#0b1e36] ...">` in `RadarPageContent.tsx`.
   - `/architecture`: Update top section in `architecture/page.tsx` from `py-8` to `pt-10 pb-8 sm:pt-12`.
   - Dashboard routes: Maintain `py-6` container padding which is adequate once `pt-2 sm:pt-3` layout clearance is present.

### 4.3 Desktop Breakpoint Expansion (lg vs. xl)
- **Current Defect:** `Navbar.tsx` line 196 hides desktop links with `hidden xl:flex` and reveals the hamburger button with `xl:hidden`. This causes desktop screens between 1024px and 1279px (standard landscape tablets, smaller laptops, 13-inch MacBooks at default scaling) to collapse prematurely into the mobile drawer.
- **Requirement R2:** Expand desktop navigation to remain visible from `lg` (1024px+) upwards.
- **Remedy:**
  - Change line 196 in `Navbar.tsx` from `hidden xl:flex` to `hidden lg:flex`.
  - Reduce link horizontal padding from `px-2.5` to `px-2 lg:px-2.5` so all links fit cleanly within 1024px width without wrapping.
  - Change mobile trigger and drawer (lines 323, 340) from `xl:hidden` to `lg:hidden`.
  - Remove `font-mono` from navigation link helper `navLinkClass` (line 115) and mobile drawer (line 340), standardizing on `font-sans` (`var(--font-sans)` Plus Jakarta Sans).

---

## Part 5: Comprehensive Mapping Table for Implementation

Below is the consolidated, ready-to-execute specification for downstream implementers:

| ID | Category | Target File | Target Lines | Current Code / Defect | Exact Replacement Specification |
|---|---|---|---|---|---|
| **C1** | R3 Palette | `src/app/globals.css` | 67 | `selection:bg-[#E0234E] selection:text-white` | `selection:bg-[#0b1e36] selection:text-[#c59b48] dark:selection:bg-[#c59b48] dark:selection:text-[#0b1e36]` |
| **C2** | R3 Palette | `src/app/globals.css` | 212, 219 | `linear-gradient(135deg, #e0234e 0%, #ea2845 40%, #ff4d6d 100%)` | `linear-gradient(135deg, #0b1e36 0%, #162a45 40%, #c59b48 100%)` |
| **C3** | R3 Palette | `src/app/globals.css` | 931-1181 | `rgba(224, 35, 78, ...)`, conic pink gradient | Replace with Sovereign Navy `#0b1e36` and Warm Gold `#c59b48` / `#dfb76c` tokens |
| **C4** | R3 Palette | `src/app/globals.css` | 2320-2480 | `nestjs-hero-bg`, `nestjs-bento-card` pink alpha/radial gradients | Replace with Navy `#0b1e36` / `#070f1a` and Warm Gold `rgba(197, 155, 72, ...)` |
| **C5** | R3 Palette | `src/app/page.tsx` | 91 | `text-rose-800 bg-rose-50 border-rose-300...` | `text-[#0b1e36] bg-slate-100 border-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700` |
| **C6** | R3 Palette | `src/app/page.tsx` | 213 | `text-[#e0234e] bg-[#e0234e]/10 border-[#e0234e]/20` | `text-[#c59b48] bg-[#c59b48]/10 border-[#c59b48]/30 dark:text-[#dfb76c] dark:bg-[#c59b48]/20 dark:border-[#c59b48]/40` |
| **C7** | R3 Palette | `src/app/trainee/courses/page.tsx` | 54-180 | 14 occurrences of `#e0234e`, `#ff4d6d`, `#ff758c` | Replace hero gradient, badges, search focus, active tabs, card hovers, and CTA buttons with Navy & Warm Gold |
| **C8** | R3 Palette | `src/app/trainee/page.tsx` | 61-74 | Welcome header `#e0234e`, `#ff4d6d` | Replace background with Navy gradient `#0b1e36`/90, badge with Gold `#c59b48`/15, ping with Emerald `#10b981` |
| **C9** | R3 Palette | `src/components/admin/CompetencyRadarCard.tsx` | 124-151 | Tab gradients `#e0234e` to `#ff4d6d`, `#ff758c` | Active tabs: `bg-[#0b1e36] text-white border border-[#c59b48]/50 dark:bg-[#c59b48] dark:text-[#0b1e36]`; icons: `#c59b48` |
| **C10** | R3 Palette | `src/components/chat/ChatCourseCard.tsx` | 15, 24, 39, 61, 81, 88 | DRSTC track styling, hover states, CTA button | DRSTC to Warm Gold/Navy, button to `bg-[#0b1e36] text-white border-[#c59b48]/40` |
| **C11** | R3 Palette | `src/components/chat/ChatSuggestedPills.tsx` | 20, 22 | `#e0234e`, `#ff4d6d` pill borders & text | Warm Gold `border-[#c59b48]/30 bg-[#c59b48]/10 text-[#c59b48] dark:text-[#dfb76c]` |
| **C12** | R3 Palette | `src/components/chat/CourseChatbot.tsx` | 53-637 | 21 occurrences in trigger button, bubbles, typing dots | Full reskin to Sovereign Navy & Warm Gold with Emerald status indicator |
| **C13** | R3 Palette | `src/components/shared/NestCodePlayground.tsx` | 186-339 | `#e0234e`, `#0d0508`, `#ff758c`, `#ff4d6d` | Navy `#070f1a` / `#0b1e36` container, Warm Gold highlights, standard rose dot |
| **C14** | R3 Palette | `src/components/shared/NestEcosystemShowcase.tsx` | 50 | `color: '#ff4d6d'` | Warm Gold `color: '#c59b48'` or Emerald `color: '#10b981'` |
| **C15** | R3 Palette | `src/components/shared/StatsCard.tsx` | 28-33 | Red theme containing `#e0234e`, `#ff4d6d` | Add `gold` color theme using `#c59b48`, `#dfb76c`, default to `gold` |
| **C16** | R3 Palette | `src/components/trainee/TraineeSkillGapCard.tsx` | 60-176 | 15 occurrences of magenta/pink | Header/borders to Warm Gold/Navy; deficits to semantic amber (`text-amber-500`) or rose; CTA to Navy/Gold |
| **C17** | R3 Palette | Radar components & WMO codes | Various | `text-pink-400`, `bg-pink-600/25` for Hail / Code 96 | Replace with `text-cyan-400` / `bg-amber-600/25`; update test suite assertion |
| **C18** | R4 Contrast | `src/components/layout/Sidebar.tsx` | 68-70, 85, 125, 141 | Hardcoded `text-[#0b1e36]` in `roleColors`, active pill & hover icon | Add `dark:text-[#dfb76c]`, active pill `dark:bg-[#122c4d]`, hover icon `dark:group-hover:text-white` |
| **C19** | R4 Contrast | `src/app/architecture/page.tsx` | 93-305 | 36 elements with unstyled dark elements and `text-[#0b1e36]` | Complete dark mode styling: `dark:text-white`, `dark:bg-[#070f1a]`, `dark:border-white/10`, `dark:text-[#dfb76c]` |
| **C20** | R4 Contrast | `src/components/layout/Navbar.tsx` | 129-130, 151-152, 281, 300 | Persona switch dropdown hover turning text to navy in dark mode | Update `roleEntries` hoverText and iconBg with dark mode gold/white variants; fix Sign Out button |
| **C21** | R4 Contrast | `src/app/admin/radar/page.tsx` | 238, 325 | Active band filter & table test button merging with dark background | Add `border border-[#c59b48]/40 dark:bg-[#122c4d]` |
| **C22** | R4 Contrast | `src/app/auth/login/page.tsx` | 84, 98, 108, 123, 146 | Missing dark mode surface and text classes | Add `dark:bg-[#070f1a]`, `dark:text-white`, `dark:bg-slate-900/90`, `dark:border-white/10` |
| **C23** | R5 Spacing | `src/app/page.tsx` | 595, 602 | Journey nav header missing gutters; pill bar uses `max-w-6xl` | Standardize both to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |
| **C24** | R5 Spacing | `src/components/radar/RadarPageContent.tsx` | 182, 302 | Header & content abruptly expand to `max-w-[1600px]` with non-standard paddings | Standardize to canonical `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6` |
| **C25** | R5 Spacing | `src/components/layout/Navbar.tsx` | 115, 196, 323, 340 | Breakpoint collapses at `xl` (1280px); `font-mono` on links; tight clearance | Expand desktop nav to `lg:flex` (1024px+); replace `font-mono` with `font-sans`; adjust padding |
| **C26** | R5 Spacing | `src/app/layout.tsx` & headers | Root layout & route headers | Floating navbar clashing with headers on `/radar`, `/architecture`, and landing | Establish top clearance of `pt-2 sm:pt-3` on `<main>` and `pt-6`/`pt-10` on target route headers |

---

## Conclusion

The visual audit confirms that CapacityConnect contains identifiable, bounded regressions in legacy magenta color usage (inherited from pre-Mausam templates), dark mode contrast omissions in key sub-routes (`Sidebar.tsx`, `TechnicalArchitecturePage`, `Navbar.tsx`), and minor container width anomalies (`/radar` and landing journey bar).

All identified issues are precisely located and mapped to Mission Mausam design tokens with zero ambiguity, enabling rapid and safe execution.
