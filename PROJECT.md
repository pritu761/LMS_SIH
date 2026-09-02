# Project: Dedicated Real-Time Weather Radar & Prediction System

## Architecture
- **Framework**: Next.js 16.3.3 (App Router), React 19.2.0, Tailwind CSS 3.4.17, TypeScript 5.7.2, Lucide React icons.
- **Route**: Dedicated top-level route `/radar` (`src/app/radar/page.tsx`).
- **Map Engine**: Direct Leaflet integration with dynamic client component importing (`ssr: false`) to ensure SSR safety and smooth tile layer frame swapping.
- **Data Providers**:
  - RainViewer API v2 (`https://api.rainviewer.com/public/weather-maps.json` + `https://tilecache.rainviewer.com/...`) for real-time Doppler radar past & nowcast tile overlays.
  - Open-Meteo Geocoding API (`https://geocoding-api.open-meteo.com/v1/search`) for instant global place name search and coordinates resolution.
  - Open-Meteo Weather Forecast API (`https://api.open-meteo.com/v1/forecast`) for current weather metrics, 24-48h hourly nowcasts, and 7-day daily forecasts.
  - Deterministic Offline Fallback Engine (`src/lib/mockWeatherData.ts`, `src/lib/mockRadarData.ts`) providing resilient data even during network dropouts or API rate limits.
- **UI & Design System**: Modern radar glassmorphic HUD styling with dark/light mode support, matching the Sovereign Navy & Gold palette (`#0b1e36`, `#c59b48`), responsive desktop split-screen and mobile collapsible panels.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Weather & Radar Core Types | TypeScript interfaces for weather, radar frames, geocoding, WMO codes, and API responses | M1 | ORIGINAL_REQUEST §1, §2 |
| 2 | WMO Weather Interpretation Engine | Complete 28-code WMO mapping with labels, descriptions, Lucide icon keys, severity levels, and base reflectivity | M1 | ORIGINAL_REQUEST §2 |
| 3 | Weather & Geocoding Service Client | Robust Open-Meteo & RainViewer API client with caching, unit conversions, and error handling | M1 | ORIGINAL_REQUEST §1, §2 |
| 4 | Offline / High-Latency Fallback Engine | Deterministic procedural weather & radar frame generator for seamless offline resilience | M1 | ORIGINAL_REQUEST §1, §2 |
| 5 | Interactive Radar Leaflet Map | Dynamic client-side map with CartoDB Dark Matter / Positron / OSM basemaps, pan, zoom, click-to-pin, user geolocation | M2 | ORIGINAL_REQUEST §1 |
| 6 | RainViewer Precipitation & Cloud Layers | Multi-layer tile engine swapping past/nowcast Doppler reflectivity frames without visual flicker | M2 | ORIGINAL_REQUEST §1 |
| 7 | Radar Timeline Scrubber & Animation Player | Historical frame step-through, live timestamp, nowcasting forward projection, play/pause animation at variable speed | M2 | ORIGINAL_REQUEST §1 |
| 8 | Meteorological dBZ Scale Legend | Visual radar reflectivity scale (10 to 60+ dBZ, mm/hr rain rates, color steps from Drizzle to Severe Hail) | M2 | ORIGINAL_REQUEST §1 |
| 9 | Geocoding Search & Map Recentering | Debounced city/address search with dropdown suggestions, auto-recenter, and quick preset Indian and global capitals | M3 | ORIGINAL_REQUEST §2 |
| 10 | Current Weather Metrics HUD Panel | Live display of temperature, feels like, humidity, precipitation probability, pressure, wind speed/direction, UV index, dew point, visibility | M3 | ORIGINAL_REQUEST §2 |
| 11 | Hourly Nowcasting 24-48h Strip | Visual hourly progression showing temperature curves, precipitation probability bars, rain volume, and weather icons | M3 | ORIGINAL_REQUEST §2 |
| 12 | 7-Day Multi-Day Forecast Cards | Daily weather overview with high/low temperature ranges, precipitation sums, sunrise/sunset, and condition summaries | M3 | ORIGINAL_REQUEST §2 |
| 13 | Storm Severity & Convective Alert Indicator | Composite storm risk scoring (0-100), convective hail/thunderstorm badges, and radar-derived severity analysis | M3 | ORIGINAL_REQUEST §2 |
| 14 | Dedicated App Route `/radar` & Layout | Full-screen responsive HUD layout with collapsible side panels, glassmorphic styling, dark/light theme support | M4 | ORIGINAL_REQUEST §3 |
| 15 | Global Navigation & Header/Sidebar Links | Integrated navigation entry points in Navbar, Sidebar, and Footer pointing to `/radar` with active route highlight | M4 | ORIGINAL_REQUEST §3 |
| 16 | Zero-Error TypeScript & Next.js Build | Clean compilation with `npm run build` and zero type or lint errors | M4 / Final | ORIGINAL_REQUEST §4 |
| 17 | Comprehensive Opaque-Box E2E & Unit Test Suite | Multi-tier test suite covering feature coverage, boundaries, combinations, and real-world scenarios | E2E Track | ORIGINAL_REQUEST §4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Weather, Geocoding & Radar Service Layer | Types (`src/types/weather.ts`), WMO mapping (`src/lib/wmoCodes.ts`), API clients (`src/lib/weatherService.ts`), mock fallback generators (`src/lib/mockWeatherData.ts`, `src/lib/mockRadarData.ts`) | none | DONE |
| M2 | Interactive Weather Radar Map Engine | Dynamic Leaflet map container, RainViewer Doppler tile layers, timeline scrubber/animator, dBZ reflectivity legend (`src/components/radar/*`) | M1 | DONE |
| M3 | Location Search, Weather Forecast & Nowcasting HUD | Geocoding search bar, current weather metrics HUD, 24-48h hourly nowcast strip, 7-day forecast cards, storm severity indicator | M1 | DONE |
| M4 | Application Route & Navigation Integration | Dedicated `/radar` page and layout, Navbar/Sidebar/Footer links, responsive design, dark/light theme, build verification | M2, M3 | DONE |
| E2E | E2E Testing Track | Test harness, unit tests, mock API verifications, multi-tier test suite publishing TEST_READY.md | none (parallel) | DONE (151/151 tests) |
| Final | Final Acceptance & Adversarial Hardening | Pass 100% E2E tests, Tier 5 adversarial stress testing, clean `npm run build` | M4, E2E | DONE |

## Interface Contracts
### Service Layer (`src/lib/weatherService.ts`) ↔ UI Components (`src/components/radar/*`)
```typescript
export interface Coordinates {
  lat: number;
  lon: number;
  name?: string;
  country?: string;
  admin1?: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  precipitation: number;
  precipitationProbability: number;
  weatherCode: number;
  surfacePressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  uvIndex: number;
  dewPoint: number;
  cloudCover: number;
  visibility: number;
  isDay: boolean;
  timestamp: string;
}

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  dewPoint: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  surfacePressure: number;
  cloudCover: number;
  visibility: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
}

export interface DailyForecastItem {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  apparentTemperatureMax: number;
  apparentTemperatureMin: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  windGustsMax: number;
  windDirectionDominant: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  coordinates: Coordinates;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  stormSeverityIndex: number; // 0 - 100
  derivedDbz: number; // calculated dBZ
  isFallback?: boolean;
}

export interface RadarFrame {
  time: number;
  path: string;
  isNowcast: boolean;
}

export interface RadarMetadata {
  version: string;
  generated: number;
  host: string;
  past: RadarFrame[];
  nowcast: RadarFrame[];
  isFallback?: boolean;
}
```

### Functions:
- `fetchLocationCoordinates(query: string): Promise<Coordinates[]>`
- `fetchWeatherForecast(lat: number, lon: number): Promise<WeatherData>`
- `fetchRadarMetadata(): Promise<RadarMetadata>`
- `getRadarTileUrl(host: string, path: string, z: number, x: number, y: number, colorScheme?: number, smooth?: boolean, snow?: boolean): string`
- `getWmoDetails(code: number): WmoCodeInfo`

## Code Layout
- `src/types/weather.ts` — Core TypeScript interfaces
- `src/lib/wmoCodes.ts` — WMO code interpretation dictionary and helpers
- `src/lib/weatherService.ts` — Weather & Radar API client and caching service
- `src/lib/mockWeatherData.ts` — Deterministic mock weather generator & city presets
- `src/lib/mockRadarData.ts` — Fallback radar metadata & procedural tile generators
- `src/components/radar/WeatherRadarMap.tsx` — Main Leaflet client container
- `src/components/radar/RadarTimelineControls.tsx` — Radar playback timeline scrubber
- `src/components/radar/RadarDbzLegend.tsx` — Reflectivity dBZ scale legend
- `src/components/radar/WeatherSearchBar.tsx` — Location search input & suggestions dropdown
- `src/components/radar/WeatherMetricsHud.tsx` — Current condition HUD cards
- `src/components/radar/HourlyNowcastStrip.tsx` — 24-48h hourly nowcasting strip
- `src/components/radar/MultiDayForecast.tsx` — 7-day forecast cards
- `src/components/radar/StormSeverityIndicator.tsx` — Convective storm risk gauge
- `src/components/radar/RadarPageContent.tsx` — Integrated interactive HUD orchestrator component
- `src/app/radar/page.tsx` — Next.js page route
- `src/app/radar/layout.tsx` — Next.js metadata and route layout
- `src/components/Navbar.tsx` — Updated with Radar navigation link
- `src/components/Sidebar.tsx` — Updated with Radar navigation link
