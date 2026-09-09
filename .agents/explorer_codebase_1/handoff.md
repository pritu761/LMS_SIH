# Codebase & UI Architecture Investigation Report

## 1. Observation

### 1.1 Project Metadata & Dependencies (`package.json`)
Direct observation from `c:\Users\pknat\LMS_SIH\package.json` (lines 17–46):
```json
"dependencies": {
  "@prisma/adapter-pg": "^7.10.0",
  "@prisma/client": "^7.10.0",
  "bcryptjs": "^2.4.3",
  "clsx": "^2.1.1",
  "framer-motion": "^13.1.1",
  "jose": "^5.9.6",
  "lucide-react": "^0.468.0",
  "next": "^16.3.3",
  "pg": "^8.23.0",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "tailwind-merge": "^2.5.5",
  "zod": "^3.23.8"
},
"devDependencies": {
  "@types/bcryptjs": "^2.4.6",
  "@types/node": "^20.17.10",
  "@types/pg": "^8.23.1",
  "@types/react": "^19.2.0",
  "@types/react-dom": "^19.2.0",
  "autoprefixer": "^10.4.20",
  "dotenv": "^17.4.2",
  "postcss": "^8.4.49",
  "prisma": "^7.10.0",
  "tailwindcss": "^3.4.17",
  "tsx": "^4.23.13",
  "typescript": "^5.7.2"
}
```
- **Next.js & React Core**: Next.js `16.3.3` with React `19.2.0` and React-DOM `19.2.0` using the modern Next.js App Router paradigm.
- **UI & Styling Libraries**: Tailwind CSS `3.4.17` with `clsx` and `tailwind-merge` configured (`src/lib/utils.ts`). Icon library is `lucide-react` (`0.468.0`). Animation library is `framer-motion` (`13.1.1`).
- **Mapping Libraries**: No external map packages (such as `leaflet`, `react-leaflet`, `mapbox-gl`, or `maplibre-gl`) are listed in `package.json`.
- **TypeScript Status**: `npx tsc --noEmit` completed with exit code `0` (clean, zero TypeScript compile errors).

### 1.2 Directory Structure & App Router Layout
- **App Router Directory**: `src/app/` contains all page routes.
- **Root Layout (`src/app/layout.tsx`)**:
  - Global providers: `<ThemeProvider>` (`src/context/ThemeContext.tsx`) and `<ChatProvider>` (`src/context/ChatContext.tsx`).
  - Global components: `<Navbar />` (sticky top header pill), `<main>` (flexible container), `<footer>` (navy & gold themed with institutional links), `<BackToTop />`, and `<CourseChatbot />`.
  - Google Fonts: Plus Jakarta Sans (`--font-sans`), Outfit (`--font-display`), JetBrains Mono (`--font-mono`).
- **Theme Management (`src/context/ThemeContext.tsx` & `src/app/globals.css`)**:
  - Supports 5 visual themes (`nestjs` Sovereign Navy & Gold as default, `emerald`, `violet`, `amber`, `cyan`).
  - Supports dual modes: `light` (default) and `dark`. Uses `data-theme` and `data-mode` attributes on `<html>` alongside CSS class `.dark` / `.light`.
  - Brand Palette: Primary Navy (`#0b1e36`), Accent Gold (`#c59b48` / `#dfb76c`), Dark Canvas (`#070f1a`), Light Canvas (`#ffffff` / `#fcfcfd`), Neon/Alert Accents (`#38bdf8` cyan, `#34d399` emerald, `#f59e0b` amber, `#ea580c` orange, `#dc2626` crimson).

### 1.3 Existing Navigation Architecture (`Navbar.tsx` & `Sidebar.tsx`)
- **Global Navbar (`src/components/layout/Navbar.tsx`)**:
  - Sticky glassmorphic pill bar with scroll progress indicator.
  - Links: `Problem` (`/#problem`), `Competency` (`/admin/competency`), `Cadres` (`/#cadres`), `55/30/15` (`/#algorithm`), `Courses` (`/trainee/courses`), `Architecture` (`/architecture`).
  - Tools: AI Guide trigger, Mode toggle (`<ModeToggle />`), Persona demo switcher (Admin/Trainer/Trainee), and Portal launcher CTA.
- **Role-Based Sidebar (`src/components/layout/Sidebar.tsx`)**:
  - Used in dashboard layouts across `ADMIN`, `TRAINER`, and `TRAINEE` workspaces.
  - Currently contains links:
    - Admin: `National Overview` (`/admin`), `Doppler Radar Network` (`/admin/radar`), `User Governance` (`/admin/users`), `Competency & Gap Engine` (`/admin/competency`), `Directives & CMS` (`/admin/cms`).
    - Trainer: `Faculty Hub` (`/trainer`), `Doppler Radar Feeds` (`/admin/radar`), `Course Studio` (`/trainer/courses/create`), `Media Library` (`/trainer/library`), `Cadre Assessment Creator` (`/trainer/assessments/create`), `Cohort Telemetry` (`/trainer/analytics`).
    - Trainee: `Learning Dashboard` (`/trainee`), `Live Doppler Radar Scope` (`/admin/radar`), `Mission Mausam Tracks` (`/trainee/courses`), `Competency Dossier` (`/trainee/profile`).

### 1.4 Existing Radar & Telemetry Implementations
- **Admin Radar Command Center (`src/app/admin/radar/page.tsx`)**:
  - Telemetry polling from `/api/radar/nodes` (interval 3000ms).
  - 4 summary metrics cards (Active Nodes 38/38, Avg Ingress Latency, National Coverage 3.28M km², Trainee Observers).
  - Interactive India vector map component (`<IndiaRadarMap />`).
  - Polarimetric PPI scope component (`<LiveRadarScope />`).
  - Real-time station telemetry ticker & table with band filters (S-Band, C-Band, X-Band).
  - Station diagnostics modal (`<RadarDiagnosticsModal />`).
- **India Vector Radar Map (`src/components/radar/IndiaRadarMap.tsx`)**:
  - Pure SVG mainland India boundary coordinate projection (`minLat: 6.5, maxLat: 37.5, minLng: 67.0, maxLng: 98.0`).
  - Interactive SVG circles for range rings (100km, 250km, 500km), animated 360° radar sweep cone, and reflectivity echo clusters.
- **Live Radar Scope (`src/components/radar/LiveRadarScope.tsx`)**:
  - High-tech circular PPI polar scope with azimuth compass markings, rotating sweep phosphor beam, and dual-pol product channels (`Z` Reflectivity, `V` Velocity, `ZDR` Differential Reflectivity, `CC` Correlation Coefficient, `KDP` Specific Differential Phase).
- **All 38 Radar Nodes Dataset (`src/lib/radarNetworkData.ts`)**:
  - Complete data array of all 38 IMD Doppler Radar stations across 6 regions (Northern Himalayas, Bay of Bengal Coast, Arabian Sea Coast, Central & Plains, Northeast India, Island Outposts) with precise coordinates, frequency bands, transmit power, PRF, and hydrometeor types.
- **API Routes (`src/app/api/radar/nodes/route.ts` & `src/app/api/radar/telemetry/route.ts`)**:
  - `/api/radar/nodes`: GET endpoint with filtering by band, region, status, and dynamic micro-fluctuation simulation.
  - `/api/radar/telemetry`: POST endpoint executing diagnostic hardware simulations.

### 1.5 Security & Headers Configuration (`next.config.js`)
- In `next.config.js` lines 29–39:
  - `Permissions-Policy: 'camera=(), microphone=(), geolocation=()'`.
  - Geolocation is restricted via HTTP header. Therefore, location search MUST rely on server/client-side Geocoding APIs (e.g. Open-Meteo Geocoding / Nominatim API over standard HTTPS requests) and preset station selectors rather than requiring `navigator.geolocation.getCurrentPosition()`.

---

## 2. Logic Chain

### 2.1 Route Architecture Decision
1. **Observation**: Currently, radar features reside exclusively under `/admin/radar` behind admin role paths, but the original request calls for a dedicated, real-time weather radar and prediction page integrated into the application for all users (trainees, trainers, admins, and public visitors).
2. **Deduction**: A new top-level public/authenticated App Router page should be established at `src/app/radar/page.tsx` (with optional alias/rewrite `/weather-radar` in `next.config.js`).
3. **Integration**:
   - Add "Weather Radar" link with live beacon to `src/components/layout/Navbar.tsx` in the primary nav bar.
   - Add / update navigation items in `src/components/layout/Sidebar.tsx` pointing to `/radar`.
   - Add direct links in `src/app/layout.tsx` (Footer) and `src/app/page.tsx` (Hero & Feature sections).

### 2.2 Interactive Map Engine Architecture (Next.js 16 Client Boundary)
1. **Observation**: In Next.js 16 + React 19, server components prerender during `next build`. Web map rendering engines (Leaflet / OpenLayers / MapLibre / Canvas) require browser DOM globals (`window`, `document`, `navigator`).
2. **Deduction**: The map component must be strictly isolated into a client-side component (e.g. `src/components/radar/InteractiveWeatherRadarMap.tsx` with `'use client'`) and dynamically imported on the page using:
   ```tsx
   import dynamic from 'next/dynamic';

   const InteractiveWeatherRadarMap = dynamic(
     () => import('@/components/radar/InteractiveWeatherRadarMap'),
     {
       ssr: false,
       loading: () => <WeatherRadarLoadingSkeleton />,
     }
   );
   ```
3. **Map Rendering Strategy**:
   - **Base Layer Options**: OpenStreetMap standard / CartoDB Dark Matter / CartoDB Positron / OpenTopoMap tiles.
   - **Radar Layer (RainViewer API)**:
     - Free, public open radar API: `https://api.rainviewer.com/public/weather-maps.json` provides available timestamps for past 2 hours + nowcast projections.
     - Radar overlay tiles: `https://tilecache.rainviewer.com/v2/radar/{timestamp}/256/{z}/{x}/{y}/2/1_1.png` (precipitation reflectivity) and `/256/{z}/{x}/{y}/1/0_0.png` (infrared satellite cloud cover).
     - Layer opacity slider, smooth playback interval, step-forward/step-backward controls, loop toggle.
   - **IMD 38 Doppler Radar Stations Layer**:
     - Custom overlay markers mapped from `src/lib/radarNetworkData.ts` representing all 38 IMD radar nodes with range ring overlays (100km, 250km, 500km) and clickable quick-station selector.
   - **Resilient Fallback**: If the external RainViewer API is unreachable or rate-limited, gracefully fall back to procedural radar reflectivity raster sweeps / simulated rain bands without breaking the UI.

### 2.3 Location Search & Weather Nowcasting Architecture
1. **Observation**: Acceptance criteria 2 requires location search, real-time weather metrics, hourly nowcast (24-48h), 7-day multi-day forecast, and radar-derived storm indicators.
2. **Deduction**:
   - **Geocoding API**: Open-Meteo Geocoding (`https://geocoding-api.open-meteo.com/v1/search?name={query}&count=6&language=en&format=json`) enables instant, free, unauthenticated search across all Indian & global cities, returning `{ name, latitude, longitude, admin1, country }`.
   - **Weather Nowcasting & Forecast API**: Open-Meteo Weather API (`https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max&timezone=auto&forecast_days=7`)
   - **Custom Radar Metrics Synthesizer**: Compute storm severity index, dBZ reflectivity estimate, cloud ceiling, and precipitation likelihood from the combined radar tile and meteorological data.

### 2.4 UI & Design System Synergy
1. **Observation**: The existing project uses an ultra-polished "Sovereign Navy & Gold" theme (`#0b1e36` / `#c59b48`) with glassmorphic cards (`SpotlightCard`), HUD statistics (`StatsCard`), animated counters, dark/light theme switching, and high-contrast typography.
2. **Deduction**: The new weather radar page should feature:
   - **Top HUD Bar**: Live sync status, active radar layer toggle (Reflectivity dBZ, Satellite IR Cloud, Wind Vector, Precipitation Accumulation), station count, quick location jump pills (e.g., Delhi, Mumbai, Chennai, Kolkata, Srinagar, Cherrapunji).
   - **Centerpiece Split View**:
     - Large interactive Map Canvas (70% width or responsive full height) with floating layer controls, time slider / playback controls, and WMO reflectivity color scale legend.
     - Side Intelligence Panel (30% width) showing live location weather HUD (Current Temp, Feels Like, Humidity, Dew Point, Barometric Pressure, Wind Gusts, UV Index, Air Density, Storm Severity Indicator), 24-Hour Nowcast graph/cards, and 7-Day Synoptic Outlook.
   - **Bottom IMD Radar Station Quick Grid**: Carousel or grid of the 38 IMD radar nodes allowing 1-click map centering and dual-pol polarimetric telemetry inspection.

---

## 3. Caveats

1. **Browser Geolocation Policy**:
   - `next.config.js` enforces `Permissions-Policy: 'geolocation=()'`. Browser GPS queries will be blocked by policy. Location search must use geocoding search input and preset buttons (e.g. popular cities, IMD radar stations), which work via HTTPS API and are unaffected by the policy.
2. **Third-Party Tile Latencies & Rate Limits**:
   - Free public APIs (RainViewer, Open-Meteo, CartoDB/OSM) may occasionally experience latency or rate limits. The implementation must include client caching (in-memory / SWR / React state), skeleton loaders, and synthetic radar fallback frames.
3. **Leaflet CSS / Dynamic Loading**:
   - If using Leaflet dynamically without installing heavy packages, Leaflet's CSS (`leaflet.css`) and script (`leaflet.js`) can be injected via Next.js `<Script>` or standard Leaflet module imports. All Leaflet DOM manipulation must be wrapped in client-side lifecycle hooks.

---

## 4. Conclusion & Precise Recommendations

### 4.1 Recommended Code Layout
```
src/
├── app/
│   ├── radar/
│   │   └── page.tsx                         # Dedicated Weather Radar & Nowcasting route
│   └── api/
│       └── weather/
│           ├── forecast/route.ts            # (Optional) Server proxy for Open-Meteo forecast
│           └── geocode/route.ts             # (Optional) Server proxy for geocoding search
├── components/
│   └── radar/
│       ├── WeatherRadarHub.tsx              # Main container coordinating map & telemetry state
│       ├── InteractiveWeatherRadarMap.tsx   # Client-only Leaflet / OpenLayers radar map
│       ├── RadarTimeSlider.tsx              # Timeline playback, play/pause, speed controls
│       ├── RadarLayerSelector.tsx           # Reflectivity, Satellite, Wind, Echoes layer toggles
│       ├── RadarReflectivityLegend.tsx      # WMO dBZ intensity scale HUD
│       ├── WeatherNowcastPanel.tsx          # Real-time metrics, hourly nowcasting & 7-day forecast
│       ├── LocationSearchBar.tsx            # Geocoding search input with autocomplete dropdown
│       ├── IndiaRadarMap.tsx                # (Existing) Vector SVG map component
│       ├── LiveRadarScope.tsx               # (Existing) Polarimetric PPI scope component
│       └── RadarDiagnosticsModal.tsx        # (Existing) Station diagnostic modal
├── lib/
│   ├── weatherService.ts                    # Open-Meteo & RainViewer API client + caching
│   └── radarNetworkData.ts                  # (Existing) 38 IMD Doppler Radar stations
└── types/
    ├── weather.ts                           # Weather, nowcast, forecast, and geocoding DTOs
    └── radar.ts                             # (Existing) RadarNode, PolarimetricProduct types
```

### 4.2 Navigation Integration Points
1. **`src/components/layout/Navbar.tsx`**:
   - Insert `<Link href="/radar" className={navLinkClass('/radar')}>Radar</Link>` in public nav links.
   - Add a "Live Radar" badge in the mobile dropdown navigation.
2. **`src/components/layout/Sidebar.tsx`**:
   - Update the Doppler Radar link from `/admin/radar` to `/radar` (or keep `/admin/radar` as admin command center and add `/radar` as Live Weather Radar for all roles).
3. **`src/app/layout.tsx` (Footer)**:
   - Add `/radar` to Core Engine / Technical Specs footer columns.
4. **`src/app/page.tsx`**:
   - Add "Live Doppler Weather Radar" CTA in hero section and journey step 02/05.

---

## 5. Verification Method

### 5.1 Independent Verification Steps
1. **TypeScript Type Safety Verification**:
   ```bash
   npx tsc --noEmit
   ```
   *Expected Result*: Exits with code `0` and 0 errors.
2. **Next.js Production Build Verification**:
   ```bash
   npm run build
   ```
   *Expected Result*: Prisma generates client schemas, Next.js compiles all routes including `/radar`, and outputs static/dynamic server routes without hydration or SSR window errors.
3. **Visual & Behavioral Verification**:
   - Navigate to `http://localhost:3000/radar`.
   - Verify interactive map renders with live radar tiles and smooth layer switching.
   - Verify time slider steps forward and backward across radar frames with play/pause animation.
   - Search for a city (e.g. "Mumbai", "Kolkata", "Bengaluru", "London", "Tokyo") and confirm map recenters and real-time weather metrics + 24h nowcast + 7-day forecast load.
   - Click on any of the 38 IMD radar station pins (e.g. "DWR Chennai", "DWR Srinagar") and confirm station polarimetric specs and local nowcasting appear.
   - Toggle dark/light theme mode via `<ModeToggle />` and verify full contrast, gold accents, and clean readability in both modes.
   - Test mobile viewport (<768px) and desktop viewport (>1280px) to confirm responsive layout.

### 5.2 Invalidation Conditions
- Any SSR failure caused by direct access to `window` or `document` during `next build`.
- Any TypeScript compilation failure caused by missing DTO interfaces or type mismatches.
- Missing radar tile fallback when external APIs are disconnected.
