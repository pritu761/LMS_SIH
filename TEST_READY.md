# Multi-Tier Automated Test Suite: Weather Radar & Prediction System

**Status**: ✅ **TEST SUITE READY (151/151 Tests Passing)**  
**Target Module**: Weather Radar, Doppler Precipitation Nowcasting & Geocoding (`/radar`)  
**Test Harness**: `src/lib/__tests__/weatherRadarSuite.test.ts`  
**Test Runner**: `scripts/test-weather-radar.ts`  
**Execution Command**: `npm test` or `npx tsx scripts/test-weather-radar.ts`  

---

## 1. Executive Summary & Verification Metrics

| Tier | Focus Area | Features Covered | Test Count | Passed | Failed | Pass Rate |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Tier 1** | Feature Coverage (Isolation & Happy Paths) | 13 Features | 65 | 65 | 0 | 100% |
| **Tier 2** | Boundary, Corner & Edge Cases | 13 Features | 65 | 65 | 0 | 100% |
| **Tier 3** | Cross-Feature Combinations & Pairwise Interactions | Multi-module | 16 | 16 | 0 | 100% |
| **Tier 4** | Real-World Workload & Application Scenarios | End-to-End | 5 | 5 | 0 | 100% |
| **TOTAL** | **Comprehensive Multi-Tier Validation** | **All 13** | **151** | **151** | **0** | **100.0%** |

---

## 2. Feature Inventory & Coverage Matrix

| # | Feature Name | Tier 1 (Coverage) | Tier 2 (Boundaries) | Tier 3 (Cross-Feature) | Tier 4 (Real-World) | Status |
|---|---|:---:|:---:|:---:|:---:|:---:|
| 1 | Weather & Radar Core Types & Schema Parsing | 5 Tests | 5 Tests | ✓ | ✓ | ✅ Verified |
| 2 | WMO Weather Code Interpretation (28 codes) | 5 Tests | 5 Tests | ✓ | ✓ | ✅ Verified |
| 3 | Weather Forecast Service & Open-Meteo Client | 5 Tests | 5 Tests | ✓ | ✓ | ✅ Verified |
| 4 | Geocoding Search & Map Coordinate Resolution | 5 Tests | 5 Tests | ✓ | ✓ | ✅ Verified |
| 5 | Offline / High-Latency Fallback Engine | 5 Tests | 5 Tests | ✓ | ✓ | ✅ Verified |
| 6 | RainViewer Radar Metadata & Tile URL Generator | 5 Tests | 5 Tests | ✓ | ✓ | ✅ Verified |
| 7 | Radar Timeline Scrubber & Animation State Player | 5 Tests | 5 Tests | ✓ | ✓ | ✅ Verified |
| 8 | Meteorological dBZ Legend & Marshall-Palmer Scale | 5 Tests | 5 Tests | ✓ | ✓ | ✅ Verified |
| 9 | Hourly Nowcasting 24-48h Metrics & Derivation | 5 Tests | 5 Tests | ✓ | ✓ | ✅ Verified |
| 10 | 7-Day Multi-Day Daily Forecast Processing | 5 Tests | 5 Tests | ✓ | ✓ | ✅ Verified |
| 11 | Storm Severity Index (0-100) & Convective Alerts | 5 Tests | 5 Tests | ✓ | ✓ | ✅ Verified |
| 12 | Navigation & App Routing Integration (`/radar`) | 5 Tests | 5 Tests | ✓ | ✓ | ✅ Verified |
| 13 | Responsive HUD Layout & Theme / Units Adaptability | 5 Tests | 5 Tests | ✓ | ✓ | ✅ Verified |

---

## 3. Tier Breakdown & Test Specifications

### Tier 1: Feature Coverage (65 Tests)
- **F1 (Core Types)**: Validates `Coordinates`, `CurrentWeather`, `HourlyForecastItem`, `DailyForecastItem`, and `RadarMetadata` interfaces and schema parsing.
- **F2 (WMO Codes)**: Verifies standard WMO codes: 0 (Clear sky), 45 (Fog), 65 (Heavy rain), 75 (Heavy snowfall), and 99 (Severe thunderstorm with hail).
- **F3 (Forecast Service)**: Tests Open-Meteo URL generator parameters, hourly response transformer, 7-day daily aggregation, cache key rounding, and nowcasting derivation.
- **F4 (Geocoding Search)**: Tests comma-separated coordinates parsing, space-separated coordinates, non-numeric rejection, URL encoding for UTF-8 place names, and admin hierarchy preservation.
- **F5 (Offline Fallback Engine)**: Tests deterministic latitude-based solar temperature modeling, fallback flags (`isFallback: true`), 48h hourly mock generation, 7-day daily mock generation, and procedural radar frame sequence generation.
- **F6 (RainViewer Tile Generator)**: Tests standard 256px Universal Blue tile URL, 512px Retina NEXRAD tile URL, unsmoothed raw radar grid URL, host trailing slash safety, and metadata JSON parser.
- **F7 (Timeline Animation Player)**: Tests latest frame index initialization, `stepForward` wrap-around, `stepBackward` reverse wrap, `togglePlay` state engine, and variable speed timer settings.
- **F8 (dBZ Legend & Marshall-Palmer)**: Tests 0 dBZ threshold for zero rain, ~30 dBZ for moderate rain (2.5 mm/h), ~45 dBZ for heavy downpour (25 mm/h), color band mappings (Clear, Drizzle, Moderate, Heavy, Severe, Hail), and scale step definitions.
- **F9 (Hourly Nowcasting)**: Tests immediate 6h window extraction, peak precipitation probability evaluation, rain intensity categorization, human-readable hour formatting, and hourly estimated dBZ.
- **F10 (7-Day Forecast Cards)**: Tests 7 daily cards count, max >= min temperature property, sunrise/sunset time formats, precipitation sum accumulation, and WMO badge mappings.
- **F11 (Storm Severity Score)**: Tests extreme score >= 75 for severe thunderstorms (WMO 99), normal score < 25 for sunny weather, advisory score for heavy rain, wind gust risk weighting (+25 for >60 km/h), and [0, 100] clamping.
- **F12 (App Route `/radar`)**: Tests route path `/radar`, active route matcher, navigation label and icon, Next.js metadata title/description, and query parameter deep linking (`lat`, `lon`, `name`).
- **F13 (HUD Units & Basemaps)**: Tests Celsius to Fahrenheit conversion, km/h to mph conversion, km/h to knots conversion, 16-point wind compass dial mapping, and basemap URL providers registry (Dark, Light, OSM, Satellite).

### Tier 2: Boundary & Corner Cases (65 Tests)
- **F1-B**: Empty hourly array protection, optional `country`/`admin1` undefined safety, extreme poles (-90/90) and antimeridian (-180/180) coordinates, Unix timestamp 0, and empty radar frame arrays.
- **F2-B**: Negative WMO codes fallback, unmapped positive codes (e.g. 42), out-of-bounds codes (999), `NaN` code resilience, and adjacent boundary codes (0 vs 1).
- **F3-B**: HTTP 500 server error recovery, HTTP 429 rate limit fallback, high-precision coordinates floating point resilience, empty hourly rain array default (0 mm/h), and malformed JSON recovery.
- **F4-B**: Empty search query `""`, whitespace query `"   "`, out-of-bounds latitude (95.0), out-of-bounds longitude (195.0), and XSS/HTML tag query sanitization.
- **F5-B**: Fallback forecast at North Pole (90.0°N), South Pole (-90.0°S), Equator (0.0°N), monotonically increasing radar timestamps, and fallback risk score bounds.
- **F6-B**: Zoom level 0 tile URL, max zoom level 18 tile URL, missing leading slash in path, color scheme 7 (Rainbow), and snow disabled mode (rain-only).
- **F7-B**: Single-frame timeline stepping in-place, empty frame array protection, index overflow clamping, negative index clamping, and speed clamping [100ms, 10000ms].
- **F8-B**: Extreme torrential rain (200 mm/h -> ~59.8 dBZ, 5000 mm/h -> capped at 75 dBZ), negative rain rate -> 0 dBZ, sub-threshold rain (0.005 mm/h -> 0 dBZ), extreme dBZ > 60 purple hail color mapping, and exact 10 dBZ boundary.
- **F9-B**: Flat 0% precipitation probability, all 100% precipitation probability, mid-window rain onset detection at index 3, smooth diurnal hourly curve continuity across 24h, and 72-hour hourly strip support.
- **F10-B**: Zero temperature spread (max == min), sub-zero daily temperatures (-20°C to -10°C), 0.0 mm rain accumulation formatting, extreme UV index > 11, and 0 km/h calm wind.
- **F11-B**: All zero inputs floor clamp (0), all maximum inputs ceiling clamp (100), contradictory inputs (Clear sky with 100 km/h hurricane gusts), exact 25 advisory boundary, and exact 50 warning boundary.
- **F12-B**: Trailing slash `/radar/` matching, query parameters stripping `/radar?lat=...`, hash anchor stripping `/radar#nowcast`, case-insensitive route matching `/RADAR`, and nested sub-route `/radar/settings`.
- **F13-B**: Absolute zero temperature (-273.15°C -> -459.7°F), boiling point (100°C -> 212°F), 0 km/h wind speed conversion, negative compass bearing wrap-around, and >360° compass wrap-around.

### Tier 3: Cross-Feature Combinations (16 Tests)
- **T3-1**: Geocoding search -> Coordinate extraction -> Weather forecast fetch -> WMO code interpretation.
- **T3-2**: RainViewer metadata fetch -> Frame path extraction -> Tile URL generation -> Color Scheme mapping.
- **T3-3**: Forecast precipitation rate -> Marshall-Palmer dBZ calculation -> Reflectivity legend color band alignment.
- **T3-4**: Current weather telemetry + hourly nowcast -> Composite storm severity score -> Storm alert banner generation.
- **T3-5**: Location coordinate change -> Map recenter coordinates -> Weather forecast reload -> Hourly nowcasting refresh.
- **T3-6**: Timeline scrubber playback -> Frame timestamp update -> Relative time formatting -> Opacity layer swap.
- **T3-7**: Unit toggle switch (Celsius to Fahrenheit) -> Current weather HUD update -> 7-day forecast cards min/max update.
- **T3-8**: Unit toggle switch (km/h to mph) -> Current wind metric update -> Wind compass dial direction formatting.
- **T3-9**: Network dropout during forecast fetch -> Offline mock fallback trigger -> Preset matching -> Fallback HUD badge active.
- **T3-10**: Network dropout during radar fetch -> Fallback procedural radar frames generation -> Timeline scrubber population.
- **T3-11**: High dBZ radar echo detection (>50 dBZ) -> WMO code thunderstorm correlation -> Convective alert state.
- **T3-12**: Zero precipitation weather code (0 Clear) -> dBZ calculation 0 -> Nowcast summary "No precipitation expected".
- **T3-13**: Rapid search query change simulation -> Coordinate resolution precedence.
- **T3-14**: 7-day forecast precipitation sum -> Correlation with daily weather codes (Rain vs Clear).
- **T3-15**: Basemap switch (Dark to Light) -> Radar tile layer opacity preservation -> Map center/zoom retention.
- **T3-16**: Extreme weather scenario (WMO 99, 100 mm/h rain, 90 km/h gusts) -> Storm severity 100 -> Extreme alert banner -> Max dBZ clamp.

### Tier 4: Real-World Workload & Application Scenarios (5 Tests)
- **Scenario 1 (Monsoon Storm Tracking over Mumbai)**:
  Simulates searching Mumbai (19.0760°N, 72.8777°E), verifying coastal tropical humidity, calculating Marshall-Palmer Doppler reflectivity for active precipitation, checking 7-day multi-day monsoon rainfall sums, and resolving RainViewer Doppler radar tile overlay for the Western Ghats sector.
- **Scenario 2 (Global City Geocoding & Rapid Relocation Workload)**:
  Simulates continuous rapid switching across 5 global capitals (New Delhi, Tokyo, London, New York, Srinagar), verifying coordinate parsing, automatic diurnal temperature modeling across different climate zones, and live metric unit conversions (°C to °F, km/h to knots).
- **Scenario 3 (Radar Time Travel: 2-Hour Past Playback to Forward Nowcast Loop)**:
  Initializes radar timeline with 13 historical Doppler frames + 1 projected nowcasting frame, steps backward through 2 hours of past radar imagery to oldest frame (T-120m), starts 2x automated animation playback, verifies loop wrap-around and nowcast frame labeling.
- **Scenario 4 (Offline / Low-Connectivity Graceful Degradation & Auto-Recovery)**:
  Simulates sudden network drop during live polling, asserts immediate fallback activation with `isFallback: true` and `isMockFallback: true`, validates complete population of 48-hour hourly sequence and 7-day forecast without UI crashing, and confirms deterministic nowcast alert generation.
- **Scenario 5 (Extreme Convective Alert & Severe Weather Hazard Triggering)**:
  Simulates violent convective hailstorm (WMO 99, 85 km/h gusts, 65 mm/h rain rate, 52+ dBZ radar return), verifies composite storm severity risk computes to 100 (extreme hazard), confirms convective alert banner trigger, and validates dBZ legend color mapping to Extreme / Hail.

---

## 4. How to Run the Test Suite

Execute via standard npm script or direct TypeScript execution:

```powershell
# Run using npm
npm test

# Or run dedicated radar test script
npm run test:radar

# Or run directly via tsx
npx tsx scripts/test-weather-radar.ts
```

All 151 test cases execute in ~30 milliseconds with zero dependencies and complete isolation.
