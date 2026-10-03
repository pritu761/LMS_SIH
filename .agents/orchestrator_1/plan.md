# Orchestration Plan: Real-time Weather Radar & Prediction Page

## Objective
Build a dedicated, real-time weather radar and prediction page integrated into the LMS/SIH application with live Doppler/precipitation radar tiles, time playback/animation, location search & geocoding, multi-day & hourly nowcasting, radar intensity legend, modern HUD UI, mobile/desktop responsiveness, and clean build verification.

## Phase 0: Survey & Scope Mapping (Current)
- Dispatch 3 Explorers:
  1. `teamwork_preview_explorer_survey_codebase`: Explore existing Next.js app structure, routing, UI component library (shadcn/radix/lucide/tailwind), theme provider, navigation layout (navbar/sidebar).
  2. `teamwork_preview_explorer_survey_radar_api`: Investigate free public open weather radar APIs (RainViewer API v2, Open-Meteo, OpenStreetMap / Leaflet / MapLibre tile providers) and fallback mechanisms.
  3. `teamwork_preview_explorer_survey_forecasting_geocoding`: Investigate free geocoding APIs (Open-Meteo Geocoding, Nominatim) and weather forecast/nowcast APIs (Open-Meteo Weather API), data models, response formats, metric calculations.

## Phase 1: Project Architecture & Specification
- Synthesize findings into `PROJECT.md` and `TEST_INFRA.md`.
- Define module boundaries:
  - M1: Weather & Radar Service Layer (API clients, cache, types, fallback providers).
  - M2: Interactive Radar Map Component (Map integration, Leaflet/MapLibre/Canvas, RainViewer precipitation tile layers, time scrubber/animator, dBZ legend).
  - M3: Location Search, Nowcasting & Forecast HUD Panels (Search autocomplete, current conditions, hourly nowcast chart/strip, 7-day forecast cards, severe weather alerts/indicators).
  - M4: Application Route & Navigation Integration (dedicated route e.g. `/radar` or `/weather-radar`, navbar link, responsive layout, dark/light HUD styling).
- Define E2E Test Suite and pass/fail criteria.

## Phase 2: Dual Track Execution
- Implementation Track: Dispatch subtasks with Workers, Reviewers, Challengers, and Forensic Auditor.
- Testing Track: Test Writer & validation suites.

## Phase 3: Integration, Gate Reviews, and Audit
- Verify 100% build pass with `npm run build`.
- Reviewer APPROVE checks.
- Challenger stress-testing checks.
- Forensic Auditor integrity verification.

## Phase 4: Final Acceptance & Handoff
- Produce handoff report and user summary.
