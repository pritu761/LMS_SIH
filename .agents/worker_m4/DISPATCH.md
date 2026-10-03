## 2026-09-02T02:40:21+05:30
Milestone 4 Worker: Route, Layout & Global Navigation Integration
Working directory: c:\Users\pknat\LMS_SIH\.agents\worker_m4

Tasks:
1. Implement `src/components/radar/RadarPageContent.tsx`:
   - Complete interactive radar HUD orchestrator unifying `WeatherRadarMap`, `WeatherSearchBar`, `WeatherMetricsHud`, `HourlyNowcastStrip`, `MultiDayForecast`, and `StormSeverityIndicator`.
   - Manages state: active coordinates (default to New Delhi or user geolocated position), active location name, weather data, radar metadata, loading states, error fallbacks, unit preferences (°C/°F, km/h/mph), mobile drawer/tabs vs desktop split view.
   - Glassmorphic dark/light HUD layout adhering to the Sovereign Navy & Gold design system (`#0b1e36`, `#c59b48`).
2. Implement `src/app/radar/layout.tsx`:
   - Metadata for the Weather Radar & Nowcasting system ("Live Weather Radar & Doppler Precipitation Nowcasting | LMS_SIH").
3. Implement `src/app/radar/page.tsx`:
   - Server component rendering `<RadarPageContent />` with dynamic client boundary.
4. Update Global Navigation:
   - Update `src/components/layout/Navbar.tsx` to include "Live Radar" (`/radar`) with `Radio` / `CloudRain` icon and active state highlight.
   - Update `src/components/layout/Sidebar.tsx` to include "Weather Radar" (`/radar`) in navigation cadre lists.
   - Add footer / home page link where appropriate.
5. Verify application builds cleanly with `npm run build` and zero errors.
