# E2E Test Infra: Weather Radar & Prediction System

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation internals.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Feature Interactions + Real-World Workload Testing.
- Verification covers both live API responses and offline mock fallback resilience.

## Feature Inventory
| # | Feature | Source | Tier 1 | Tier 2 | Tier 3 |
|---|---------|--------|:------:|:------:|:------:|
| 1 | Weather & Radar Core Types & Parsing | ORIGINAL_REQUEST §1, §2 | 5 | 5 | ✓ |
| 2 | WMO Weather Code Interpretation | ORIGINAL_REQUEST §2 | 5 | 5 | ✓ |
| 3 | Weather Forecast Service & API Client | ORIGINAL_REQUEST §2 | 5 | 5 | ✓ |
| 4 | Geocoding Search & Map Coordinate Resolution | ORIGINAL_REQUEST §2 | 5 | 5 | ✓ |
| 5 | Offline / Latency Fallback Engine | ORIGINAL_REQUEST §1, §2 | 5 | 5 | ✓ |
| 6 | RainViewer Live Radar Metadata & Tile URL Generator | ORIGINAL_REQUEST §1 | 5 | 5 | ✓ |
| 7 | Radar Timeline Scrubber & Animation State Engine | ORIGINAL_REQUEST §1 | 5 | 5 | ✓ |
| 8 | Meteorological dBZ Legend & Color Scaling | ORIGINAL_REQUEST §1 | 5 | 5 | ✓ |
| 9 | Hourly Nowcasting 24-48h Metrics & Derivation | ORIGINAL_REQUEST §2 | 5 | 5 | ✓ |
| 10 | 7-Day Multi-Day Daily Forecast Processing | ORIGINAL_REQUEST §2 | 5 | 5 | ✓ |
| 11 | Storm Severity & Convective Risk Calculation | ORIGINAL_REQUEST §2 | 5 | 5 | ✓ |
| 12 | Navigation & App Routing Integration (`/radar`) | ORIGINAL_REQUEST §3 | 5 | 5 | ✓ |
| 13 | Responsive HUD Layout & Theme Adaptability | ORIGINAL_REQUEST §3 | 5 | 5 | ✓ |

## Test Architecture
- Test Runner: Node.js / Jest or standalone TypeScript / Next.js verification runner (`npm run build` + custom test execution scripts in `src/lib/__tests__/`).
- Automated validation scripts executing test suites across all 4 tiers.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Monsoon Storm Tracking over Mumbai / Bay of Bengal | RainViewer radar tiles, high dBZ detection, heavy hourly rain nowcasting, convective alert index | High |
| 2 | Global City Geocoding & Rapid Relocation | Search auto-suggest, map pan/zoom, metric units conversion (C/F), 7-day forecast rendering | Medium |
| 3 | Radar Time Travel: Past 2h to Forward Nowcast | Timeline slider stepping, play/pause animation at 1x/2x speed, frame timestamp formatting | High |
| 4 | Offline / Low-Connectivity Graceful Degradation | Simulated network error, fallback procedural radar frames, fallback mock forecast generation | High |
| 5 | Extreme Weather Alert Threshold Verification | Severe Thunderstorm (WMO 95-99), 60+ dBZ hail classification, high UV index alert (>10) | Medium |

## Coverage Thresholds
- Tier 1 (Feature Coverage): >= 65 tests (5 per feature across 13 features)
- Tier 2 (Boundary & Corner Cases): >= 65 tests (empty query, extreme coords -90/90, 0dBZ, 80dBZ, missing frames, network timeouts)
- Tier 3 (Cross-Feature Combinations): >= 15 pairwise interaction tests
- Tier 4 (Real-World Application Scenarios): >= 5 comprehensive scenarios
- Total Target: >= 150 test verifications
