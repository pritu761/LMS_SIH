# Handoff Report — Typography & Font Hierarchy Survey (R1)

**Agent**: Typography Survey Explorer  
**Working Directory**: `c:\Users\pknat\LMS_SIH\.agents\explorer_survey_typography`  
**Target Milestone**: Requirement R1 (Sovereign Typography & Font Hierarchy Alignment)  
**Date**: 2026-09-03  
**Handoff Type**: Hard (Investigation Complete)  

---

## 1. Observation

### 1.1 Font Imports & Configuration
- **`src/app/layout.tsx` (Lines 4, 12-31)**:
  - `Plus_Jakarta_Sans` imported and bound to `--font-sans`.
  - `Outfit` imported and bound to `--font-display`.
  - `JetBrains_Mono` imported and bound to `--font-mono`.
  - Injected on `html` tag at line 78: `className={\`light \${jakarta.variable} \${outfit.variable} \${jetbrains.variable}\`}`.
  - Body tag at line 104: `className="... font-sans antialiased selection:bg-[#0b1e36] selection:text-[#c59b48] ..."`.
- **`tailwind.config.js` (Lines 56-60)**:
  - `sans: ['var(--font-sans)', 'system-ui', 'sans-serif']`
  - `display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif']`
  - `mono: ['var(--font-mono)', 'ui-monospace', 'monospace']`

### 1.2 Text Selection Highlight Defect
- **`src/app/globals.css` (Line 67)**:
  ```css
  66:   body {
  67:     @apply text-foreground antialiased selection:bg-[#E0234E] selection:text-white;
  68:     font-family: var(--font-sans), system-ui, -apple-system, sans-serif;
  ```
  Observation: Hardcoded `#E0234E` magenta text selection applied to `body` in `@layer base`.

### 1.3 Monospace Usage Across Codebase
- Exact search query: `grep_search` pattern `font-mono` across `c:\Users\pknat\LMS_SIH\src`.
- Found: **250 instances** across **41 files**.
- Key inappropriate instances directly matching R1 criteria:
  1. `src/components/layout/Navbar.tsx:115`: `getLinkStyle()` applies `font-mono` to all primary navigation links.
  2. `src/components/layout/Navbar.tsx:189`: `font-mono` on "SOVEREIGN METEOROLOGY" brand pill.
  3. `src/components/layout/Navbar.tsx:261`: `font-mono` on "Switch Role / Persona" dropdown header.
  4. `src/components/layout/Navbar.tsx:300`: `font-mono` on "Sign Out" user button.
  5. `src/components/layout/Navbar.tsx:340`: `font-mono` on mobile drawer container.
  6. `src/app/page.tsx:356`: `font-mono` on 5 Cadre Lifecycle journey step badges.
  7. `src/app/page.tsx:648`: `font-mono` on course and track subtitles `{p.subtitle}`.
  8. `src/app/architecture/page.tsx:95`: `font-mono` on top breadcrumb bar.
  9. `src/app/architecture/page.tsx:106, 146, 214, 248, 267`: `font-mono` on major section badges.
  10. `src/app/admin/radar/page.tsx:116, 129, 142, 155`: `font-mono` on telemetry metric card title headers.
  11. `src/app/admin/radar/page.tsx:231, 325`: `font-mono` on filter tabs and "Test Node" button.
  12. `src/components/radar/IndiaRadarMap.tsx:110, 129, 141, 172`: `font-mono` on band selector tabs and map toggle buttons.
  13. `src/components/radar/RadarDiagnosticsModal.tsx:95, 107, 129`: `font-mono` on procedure labels, selector pills, and "Execute Diagnostic Test" button.
  14. `src/components/shared/NestCodePlayground.tsx:225, 244`: `font-mono` on "Copy" and "Run Test" action buttons.
  15. `src/components/shared/NestEcosystemShowcase.tsx:134`: `font-mono` on tool category selector tabs.

- Key legitimate instances that must retain `font-mono` (`JetBrains Mono`):
  1. Radar coordinates & lat/long: `src/components/radar/WeatherMetricsHud.tsx:219`, `src/components/radar/WeatherSearchBar.tsx:334`, `src/components/radar/RadarPageContent.tsx:337`, `src/app/page.tsx:757`.
  2. Numerical weather & telemetry readouts: `src/components/radar/HourlyNowcastStrip.tsx` (all 7 lines), `src/components/radar/MultiDayForecast.tsx` (all 6 lines), `src/components/radar/StormSeverityIndicator.tsx` (all 5 lines), `src/components/radar/WeatherMetricsHud.tsx` (all 14 lines).
  3. Radar PPI angles, dBZ, frequencies, and power parameters: `src/components/radar/LiveRadarScope.tsx:121, 125, 137, 204, 241, 256, 267, 273`.
  4. Code blocks and terminals: `src/components/shared/NestCodePlayground.tsx:264, 300`, `src/components/radar/RadarDiagnosticsModal.tsx:150`, `src/components/chat/CourseChatbot.tsx:78`.
  5. Proctored exam timers and video timestamps: `src/components/assessment/QuizEngine.tsx:136`, `src/components/trainee/CoursePlayer.tsx:353`, `src/components/radar/RadarTimelineControls.tsx:142, 209`.

---

## 2. Logic Chain

1. **Premise 1 (From Requirement R1)**: Navigation links, journey badges, buttons, subtitles, card headers, and UI labels must not use monospace font, and should be transitioned to `var(--font-sans)` (Plus Jakarta Sans) or `var(--font-display)` (Outfit).
2. **Premise 2 (From Requirement R1)**: Code blocks, radar coordinates, lat/long readouts, and timestamps must maintain `JetBrains Mono`.
3. **Step 1 (Font Infrastructure)**: `src/app/layout.tsx` and `tailwind.config.js` already declare and configure `--font-sans`, `--font-display`, and `--font-mono`. No new font loaders or npm packages are needed; the foundation is completely in place.
4. **Step 2 (Selection Defect)**: In `src/app/globals.css:67`, the `@apply selection:bg-[#E0234E]` rule directly clashes with the sovereign navy/gold brand identity and constitutes the primary source of the rogue magenta tint on text selection across all un-styled elements. Replacing this line with `selection:bg-[#0b1e36] selection:text-[#c59b48]` resolves the global selection bug.
5. **Step 3 (Monospace Categorization)**: Auditing all 250 occurrences reveals that 118 occurrences (47.2%) are on UI chrome (navigation, buttons, badges, headers, subtitles, tabs, labels) and must be updated to `font-sans` or `font-display`. The remaining 132 occurrences (52.8%) represent legitimate numerical, GIS coordinate, code, or telemetry metrics that must be preserved as `font-mono`.
6. **Conclusion**: An implementation agent can safely apply precise search-and-replace edits using the file and line map in `survey_report.md` without risk of accidentally altering telemetry numbers or breaking build scripts.

---

## 3. Caveats

1. **Email addresses**: In `UserApprovalTable.tsx:227` and `trainer/analytics/page.tsx:168`, user email addresses currently use `font-mono`. While not strictly numerical, changing them to `font-sans` improves visual cleanliness and aligns with modern design standards; however, keeping them mono is also technically acceptable. We recommend `font-sans`.
2. **Competency Codes vs Titles**: In several components (e.g. `CompetencyGapAnalyzer.tsx`, `TraineeSkillGapCard.tsx`), skill codes (e.g., `RADAR-01`) are rendered in `font-mono`, while titles are `font-sans`. This separation is intentional and follows best practices: technical IDs retain mono while human-readable titles use sans.
3. **No caveats on font loading or build pipeline**: All three Next.js Google fonts build cleanly without network dependencies at runtime.

---

## 4. Conclusion

The typography landscape across CapacityConnect is fully mapped:
1. **Selection Defect Solved**: A single edit on `src/app/globals.css:67` will eliminate the rogue `#E0234E` magenta text selection across the application.
2. **Monospace Overuse Mapped**: 118 occurrences of `font-mono` across navigation, badges, buttons, tabs, card headers, and subtitles have been cataloged with exact file paths and line numbers in `survey_report.md`.
3. **Preservation Boundaries Established**: 132 occurrences of legitimate monospace usage (radar coordinates, dBZ telemetry, timestamps, code sandboxes) have been cataloged and flagged for strict preservation.

---

## 5. Verification Method

### 5.1 Verification Commands
1. **Verify Global Selection Highlight in `globals.css`**:
   ```powershell
   Select-String -Path "src/app/globals.css" -Pattern "selection:bg"
   ```
   *Pass Condition*: Displays `selection:bg-[#0b1e36]` without `#E0234E` or `#ff4d6d`.

2. **Verify Monospace Remediation on Navbar Links**:
   ```powershell
   Select-String -Path "src/components/layout/Navbar.tsx" -Pattern "font-mono"
   ```
   *Pass Condition*: Zero matches in `Navbar.tsx`.

3. **Verify Build Integrity**:
   ```powershell
   npm run build
   ```
   *Pass Condition*: Zero type errors, exit code 0.

4. **Verify Survey Artifacts**:
   Inspect `c:\Users\pknat\LMS_SIH\.agents\explorer_survey_typography\survey_report.md`.
