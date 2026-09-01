## 2026-09-02T02:40:21Z

You are teamwork_preview_worker_m2 (Milestone 2 Worker: Interactive Radar Map Engine).
Your working directory is c:\Users\pknat\LMS_SIH\.agents\worker_m2.
Read:
- c:\Users\pknat\LMS_SIH\ORIGINAL_REQUEST.md
- c:\Users\pknat\LMS_SIH\PROJECT.md
- c:\Users\pknat\LMS_SIH\.agents\explorer_radar_1\handoff.md
- c:\Users\pknat\LMS_SIH\src\types\weather.ts
- c:\Users\pknat\LMS_SIH\src\lib\weatherService.ts
- c:\Users\pknat\LMS_SIH\src\lib\mockRadarData.ts

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your write ownership (exclusive):
- `src/components/radar/WeatherRadarMap.tsx`
- `src/components/radar/RadarTimelineControls.tsx`
- `src/components/radar/RadarDbzLegend.tsx`
- `src/components/radar/LeafletRadarContainer.tsx` (if helper component is needed)

Tasks:
1. Install `leaflet` and `@types/leaflet` via `npm install leaflet @types/leaflet` if needed for client-side map rendering.
2. Implement `src/components/radar/LeafletRadarContainer.tsx` (or dynamic Leaflet wrapper) that mounts a Leaflet map in client `useEffect` with `next/dynamic(..., { ssr: false })` to guarantee zero SSR errors. Support:
   - Basemaps: CartoDB Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`), CartoDB Positron (`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`), and OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
   - Center, zoom, pin marker for active location.
   - Click map event to dispatch `onSelectLocation(lat, lon)`.
   - Dual radar tile layers with opacity transitions to eliminate flickering during time step changes.
   - Real-time RainViewer Doppler reflectivity tiles (`getRadarTileUrl`).
   - Layer switcher (Precipitation reflectivity vs Cloud coverage, Universal Blue vs NEXRAD color schemes).
3. Implement `src/components/radar/RadarTimelineControls.tsx`:
   - Interactive time slider scrubber spanning past 2h frames to nowcast frames.
   - Play/Pause toggle with smooth frame animation timer (configurable 1x/2x speed).
   - Step forward / Step backward buttons.
   - Live badge ("LIVE", "-40m", "+20m (Nowcast)"), timestamp label formatted to user's local time.
4. Implement `src/components/radar/RadarDbzLegend.tsx`:
   - Visual horizontal/vertical dBZ color scale (0 to 60+ dBZ, mm/h rain rates, color steps from Drizzle `#00a3e0` to Moderate `#1c47e8`/`#c80f86` to Heavy `#d2883b`/`#fe9a58` to Severe Hail `#fd341c`/`#ffffff`).
   - Interactive hover tooltip or badge explaining meteorological intensity.
5. Implement `src/components/radar/WeatherRadarMap.tsx`: Top-level radar map module combining the Leaflet container, timeline controls, layer toggles, and dBZ legend with smooth HUD overlays.
6. Verify compilation with `npx tsc --noEmit`.

Write your handoff report to `c:\Users\pknat\LMS_SIH\.agents\worker_m2\handoff.md`. Include verification commands and outputs. Send a message to parent when done.
