# Investigation & Architecture Report: Real-Time Weather Radar & Map Rendering

**Specialist**: `teamwork_preview_explorer_2` (Weather Radar & Tile API Specialist)  
**Date**: 2026-09-02  
**Target Module**: Dedicated Weather Radar & Prediction System (`/radar` or `/weather-radar`)

---

## 1. Observation

### 1.1. RainViewer API v2 Endpoint & Data Structure

Direct inspection of `https://api.rainviewer.com/public/weather-maps.json` returned the following live response structure:

```json
{
  "version": "2.0",
  "generated": 1788295222,
  "host": "https://tilecache.rainviewer.com",
  "radar": {
    "past": [
      {"time": 1788288000, "path": "/v2/radar/4ff6f9e8556b"},
      {"time": 1788288600, "path": "/v2/radar/53e88e653727"},
      {"time": 1788289200, "path": "/v2/radar/9fa542bf2035"},
      {"time": 1788289800, "path": "/v2/radar/c2a46db656c3"},
      {"time": 1788290400, "path": "/v2/radar/4fb0b04c6920"},
      {"time": 1788291000, "path": "/v2/radar/1903360fda63"},
      {"time": 1788291600, "path": "/v2/radar/be6b2e128104"},
      {"time": 1788292200, "path": "/v2/radar/5ae39a259408"},
      {"time": 1788292800, "path": "/v2/radar/c8d247ea2868"},
      {"time": 1788293400, "path": "/v2/radar/553f0f515d66"},
      {"time": 1788294000, "path": "/v2/radar/b4776cb12281"},
      {"time": 1788294600, "path": "/v2/radar/9950695aa813"},
      {"time": 1788295200, "path": "/v2/radar/f26095f1eb84"}
    ],
    "nowcast": [
      {"time": 1788295800, "path": "/v2/radar/nowcast_4ff6f9e"}
    ]
  },
  "satellite": {
    "infrared": []
  }
}
```

#### Key Observations:
1. **Frame Timestamps & Paths**:
   - `radar.past`: Array of 13 historical frames covering the last 2 hours (~10-minute or 5-minute sampling interval).
   - `radar.nowcast`: Array of predictive/extrapolated nowcasting frames (0 to 6 frames for the next 30-60 minutes).
   - `satellite.infrared`: Discontinued for public free tier in 2026; returns an empty array.
2. **Tile URL Schema**:
   `{host}{path}/{size}/{z}/{x}/{y}/{color}/{smooth}_{snow}.png`
   - Example Tile URL: `https://tilecache.rainviewer.com/v2/radar/4ff6f9e8556b/256/4/11/7/2/1_1.png`
   - Parameters:
     - `{host}`: `https://tilecache.rainviewer.com` (extracted dynamically from API JSON).
     - `{path}`: Path string from frame object (e.g. `/v2/radar/4ff6f9e8556b`).
     - `{size}`: `256` (standard Leaflet tile size) or `512` (Retina / high-DPI).
     - `{z}`: Map zoom level (`0` to `7` native zoom).
     - `{x}`, `{y}`: Slippy map coordinate indices.
     - `{color}`: Color scheme index (Scheme `2` = Universal Blue, Scheme `6` = NEXRAD, Scheme `1` = Original, Scheme `7` = Rainbow, Scheme `4` = TWC).
     - `{smooth}`: `1` (bilinear anti-aliasing / smoothing enabled) or `0` (sharp raw radar grid).
     - `{snow}`: `1` (snow rendered in distinct blue/cyan/white hues) or `0` (rain colors only).
3. **CORS & Rate Limits**:
   - Headers: `Access-Control-Allow-Origin: *` is provided on both API metadata and tile CDN endpoints.
   - Caching: Frame paths are immutable hashes/timestamps, meaning tile PNGs are aggressively cached by browser HTTP cache (`Cache-Control: public, max-age=31536000`).
   - Refresh Interval: Metadata index `weather-maps.json` should be polled every 2-5 minutes.

---

### 1.2. Mapping Libraries in Next.js & React 19

The project uses Next.js `16.3.3` with React `19.2.0` (`package.json`).

| Library | Next.js SSR Compatibility | React 19 Compatibility | Radar Tile & Overlay Control | Verdict |
|---|---|---|---|---|
| **Direct Leaflet (`leaflet`)** | ✅ Safe with `next/dynamic` + `ssr: false` | ✅ 100% Compatible (Vanilla JS in `useEffect`) | ✅ Complete imperative control over TileLayers, opacity, marker pins, custom canvas | **Recommended Primary** |
| **`react-leaflet`** | ⚠️ Complex SSR wrapper | ❌ Peer dependency mismatch on React 19 (`react@^18`) | ⚠️ Unnecessary abstraction layer, can break on fast state updates | Not Recommended |
| **MapLibre GL / Mapbox** | ✅ Safe with `ssr: false` | ✅ Compatible | ⚠️ Requires WebGL, heavier bundle, raster tile rasterization | Overkill for 2D radar tiles |
| **OpenLayers** | ✅ Safe with `ssr: false` | ✅ Compatible | ✅ Heavy bundle size (~500KB vs Leaflet ~140KB) | Unnecessarily large |

---

### 1.3. Reflectivity (dBZ) Color Scales & RainViewer Universal Blue

From the RainViewer Color Schemes specification (`https://www.rainviewer.com/api/color-schemes.html`), the Universal Blue (Scheme 2) and Meteorological standard NEXRAD (Scheme 6) dBZ values map as follows:

| dBZ Range | RainViewer Color (Universal Blue) | NEXRAD Classic | Precipitation Intensity | Rain Rate (mm/hr) | Weather Severity Badge |
|---|---|---|---|---|---|
| **< 10 dBZ** | Transparent (`#00000000`) | Transparent | Clear Sky / Sub-threshold | < 0.1 mm/h | `Clear` |
| **10 - 20 dBZ** | Cyan / Blue (`#00a3e0` / `#087fdb`) | Light Blue (`#04e9e7`) | Mist / Very Light Drizzle | 0.1 - 1.0 mm/h | `Drizzle` |
| **20 - 30 dBZ** | Deep Blue / Violet (`#1c47e8` / `#6e0dc6`) | Green (`#00f000`) | Light Rain | 1.0 - 2.5 mm/h | `Light Rain` |
| **30 - 40 dBZ** | Magenta / Coral (`#c80f86` / `#c06487`) | Yellow (`#ffff00`) | Moderate Steady Rain | 2.5 - 7.5 mm/h | `Moderate` |
| **40 - 50 dBZ** | Amber / Bright Yellow (`#d2883b` / `#fac431`) | Orange (`#ff9200`) | Heavy Downpour | 7.5 - 25.0 mm/h | `Heavy Rain` |
| **50 - 60 dBZ** | Crimson Red (`#fe9a58` / `#fe5f05`) | Deep Red (`#ff0000`) | Severe Convective Storm | 25.0 - 50.0 mm/h | `Severe Storm` |
| **60+ dBZ** | Bright Purple / White (`#fd341c` / `#ffffffff`) | Magenta / Purple (`#ff33ff`) | Extreme Thunderstorm / Hail | > 50.0 mm/h | `Hail / Extreme` |

---

### 1.4. Free Public Basemap Tile Providers

To make radar reflectivity visually prominent, the basemap must support dark theme styling:

1. **CartoDB Dark Matter (Recommended Dark Basemap)**:
   - URL: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
   - Subdomains: `['a', 'b', 'c', 'd']`
   - Max Zoom: `19`
   - Attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>`
2. **CartoDB Positron (Light Basemap)**:
   - URL: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
3. **OpenStreetMap Standard (General Basemap)**:
   - URL: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
4. **ESRI World Imagery (Satellite Basemap)**:
   - URL: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`

---

### 1.5. Geocoding & Companion Weather Forecast (Open-Meteo)

Live verified responses from Open-Meteo:
1. **Geocoding API**: `https://geocoding-api.open-meteo.com/v1/search?name=New+Delhi&count=5&language=en&format=json`
   - Returns array of results with `latitude`, `longitude`, `name`, `admin1` (State/Region), `country_code`.
2. **Forecast & Nowcasting API**:
   - `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,cloud_cover&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=7`
   - Generates instant 24-hour precipitation probability curves, hourly nowcast predictions, and 7-day extended forecasts.

---

## 2. Logic Chain

```
[RainViewer v2 API /public/weather-maps.json] 
  │
  ├─► Extracts Host ("https://tilecache.rainviewer.com") & 13 Past + Nowcast Radar Frame Paths
  │
  ├─► Preloads Slippy Tile Layers in Leaflet Map Component (maxNativeZoom: 7, maxZoom: 18)
  │
  ├─► Time Slider & Playback Controller (Play/Pause, 0.5x/1x/2x Speed, Forward/Backward Step, Loop)
  │     └─ Multi-Layer Opacity Transition (Sets active frame opacity: 0.85, others: 0 to prevent flicker)
  │
  ├─► Interactive HUD Overlays:
  │     ├─ Reflectivity Legend (dBZ 10 -> 60+ with mm/h precipitation rates)
  │     ├─ Color Scheme Selector (Universal Blue vs NEXRAD vs Rainbow)
  │     ├─ Basemap Selector (CartoDB Dark Matter vs Positron vs OSM vs Satellite)
  │     └─ Layer Controls (Precipitation Radar, Range Rings, Doppler Storm Cells)
  │
  ├─► Location Search & Weather Nowcasting (Open-Meteo Geocoding + Hourly/7-Day API):
  │     ├─ Map Pan & Zoom to searched city coordinates
  │     ├─ Interactive Point-and-Click on map to inspect weather at any coordinate
  │     └─ Radar-derived precipitation probability & severe storm alert indicators
  │
  └─► Offline / Fallback State Machine:
        ├─ Detects network failure or API downtime
        ├─ Emits simulated Doppler radar frames & synthetic echo canvas
        └─ Displays clean HUD banner "Offline Radar Simulation Mode" with auto-reconnect
```

### Key Architectural Rationale:
1. **Leaflet Tile Native Zoom Scaling (`maxNativeZoom: 7`)**:
   RainViewer free radar tiles exist up to zoom 7. By configuring Leaflet with `maxNativeZoom: 7` and `maxZoom: 18`, Leaflet automatically scales and bilinearly interpolates zoom 7 tiles up to zoom 18. This prevents 404 tile errors when zooming into city streets while preserving radar coverage.
2. **Double-Buffering & Multi-Layer Tile Management**:
   Creating a single `L.TileLayer` and changing its URL on every animation tick causes a momentary white/blank flash while the new image loads. Instead, creating one `L.TileLayer` per frame and controlling `layer.setOpacity(opacity)` or maintaining a two-layer ping-pong buffer provides smooth 60fps radar animation.
3. **Vanilla Leaflet in Next.js Dynamic Client Component**:
   Using `const DynamicMap = dynamic(() => import('@/components/radar/LiveRadarMap'), { ssr: false })` completely decouples server-side execution from client-side DOM/Window dependencies and prevents React 19 hook incompatibilities.

---

## 3. Caveats

1. **Public API Fair Use & Rate Limiting**:
   - `weather-maps.json` should not be polled more frequently than once every 2 minutes. Tile requests are cached on Cloudflare/Fastly CDN and do not count against restrictive rate limits.
2. **RainViewer Satellite Data**:
   - RainViewer discontinued infrared satellite tiles in early 2026. Satellite basemap imagery should be provided via ESRI World Imagery or OpenStreetMap raster layers.
3. **Coordinate Precision & Projection**:
   - Slippy tiles use EPSG:3857 (Web Mercator), which is native to Leaflet and OpenStreetMap.

---

## 4. Conclusion & Architectural Blueprints

### 4.1. TypeScript Data Models (`src/types/weatherRadar.ts`)

```typescript
export interface RainViewerFrame {
  time: number; // Unix timestamp in seconds
  path: string; // e.g. "/v2/radar/4ff6f9e8556b"
}

export interface RainViewerResponse {
  version: string;
  generated: number;
  host: string;
  radar: {
    past: RainViewerFrame[];
    nowcast: RainViewerFrame[];
  };
  satellite?: {
    infrared: RainViewerFrame[];
  };
}

export type RadarColorScheme = 
  | '2' // Universal Blue (Default & Standard)
  | '6' // NEXRAD Classic
  | '1' // Original
  | '7' // Rainbow
  | '4'; // The Weather Channel

export type BasemapType = 'dark' | 'light' | 'osm' | 'satellite';

export interface RadarLayerSettings {
  colorScheme: RadarColorScheme;
  smooth: boolean;
  snow: boolean;
  opacity: number;
  tileSize: 256 | 512;
  basemap: BasemapType;
  showRangeRings: boolean;
  showStormCells: boolean;
}

export interface WeatherNowcastData {
  locationName: string;
  lat: number;
  lng: number;
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    precipitation: number;
    weatherCode: number;
    weatherDescription: string;
    windSpeed: number;
    windDirection: number;
    pressure: number;
  };
  hourly: {
    time: string[];
    temperature: number[];
    precipitationProbability: number[];
    weatherCode: number[];
  };
  daily: {
    time: string[];
    tempMax: number[];
    tempMin: number[];
    precipitationProbabilityMax: number[];
    weatherCode: number[];
  };
}

export interface GeocodingLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  admin1?: string; // State / Region
}
```

---

### 4.2. RainViewer Tile URL Construction Utility (`src/lib/rainViewer.ts`)

```typescript
import { RainViewerFrame, RadarColorScheme } from '@/types/weatherRadar';

export const RAINVIEWER_API_ENDPOINT = 'https://api.rainviewer.com/public/weather-maps.json';

export function getRadarTileUrl(
  host: string,
  frame: RainViewerFrame,
  colorScheme: RadarColorScheme = '2',
  smooth: boolean = true,
  snow: boolean = true,
  size: 256 | 512 = 256
): string {
  const smoothOption = smooth ? '1' : '0';
  const snowOption = snow ? '1' : '0';
  return `${host}${frame.path}/${size}/{z}/{x}/{y}/${colorScheme}/${smoothOption}_${snowOption}.png`;
}

export const BASEMAP_URLS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: ['a', 'b', 'c', 'd'],
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: ['a', 'b', 'c', 'd'],
  },
  osm: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: ['a', 'b', 'c'],
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    subdomains: ['a', 'b', 'c'],
  },
};
```

---

### 4.3. Radar Playback & Timeline State Hook (`src/hooks/useRainViewerRadar.ts`)

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';
import { RainViewerResponse, RainViewerFrame } from '@/types/weatherRadar';

export function useRainViewerRadar() {
  const [data, setData] = useState<RainViewerResponse | null>(null);
  const [frames, setFrames] = useState<RainViewerFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // 1 sec per frame (1x)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOfflineFallback, setIsOfflineFallback] = useState<boolean>(false);

  const fetchRadarData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json: RainViewerResponse = await res.json();
      
      const allFrames = [...(json.radar.past || []), ...(json.radar.nowcast || [])];
      setData(json);
      setFrames(allFrames);
      setCurrentFrameIndex(allFrames.length > 0 ? allFrames.length - 1 : 0);
      setIsOfflineFallback(false);
    } catch (err) {
      console.warn('RainViewer API unreachable, activating offline fallback simulator:', err);
      // Generate synthetic frames for fallback
      const now = Math.floor(Date.now() / 1000);
      const mockFrames: RainViewerFrame[] = Array.from({ length: 13 }, (_, i) => ({
        time: now - (12 - i) * 600,
        path: `/v2/radar/mock_${i}`,
      }));
      setData({
        version: '2.0-mock',
        generated: now,
        host: 'https://tilecache.rainviewer.com',
        radar: { past: mockFrames, nowcast: [] },
      });
      setFrames(mockFrames);
      setCurrentFrameIndex(mockFrames.length - 1);
      setIsOfflineFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRadarData();
    const interval = setInterval(fetchRadarData, 180000); // Refresh every 3 mins
    return () => clearInterval(interval);
  }, [fetchRadarData]);

  // Animation playback loop
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;
    const timer = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
    }, playbackSpeed);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, frames.length]);

  const togglePlay = () => setIsPlaying((p) => !p);
  const stepForward = () => setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
  const stepBackward = () => setCurrentFrameIndex((prev) => (prev - 1 + frames.length) % frames.length);
  const setFrame = (index: number) => setCurrentFrameIndex(Math.max(0, Math.min(index, frames.length - 1)));

  return {
    data,
    frames,
    currentFrame: frames[currentFrameIndex] || null,
    currentFrameIndex,
    isPlaying,
    playbackSpeed,
    isLoading,
    isOfflineFallback,
    togglePlay,
    stepForward,
    stepBackward,
    setFrame,
    setPlaybackSpeed,
    refresh: fetchRadarData,
  };
}
```

---

### 4.4. Leaflet Map Component Pattern (`src/components/radar/LiveRadarMap.tsx`)

```tsx
'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RainViewerFrame, RadarLayerSettings } from '@/types/weatherRadar';
import { BASEMAP_URLS, getRadarTileUrl } from '@/lib/rainViewer';

interface LiveRadarMapProps {
  host: string;
  frames: RainViewerFrame[];
  currentFrameIndex: number;
  settings: RadarLayerSettings;
  center: [number, number];
  zoom: number;
  onMapClick?: (lat: number, lng: number) => void;
}

export default function LiveRadarMap({
  host,
  frames,
  currentFrameIndex,
  settings,
  center,
  zoom,
  onMapClick,
}: LiveRadarMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const basemapLayerRef = useRef<L.TileLayer | null>(null);
  const radarLayersRef = useRef<Map<number, L.TileLayer>>(new Map());
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: true,
      maxBounds: [[-85, -180], [85, 180]],
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (basemapLayerRef.current) {
      map.removeLayer(basemapLayerRef.current);
    }

    const cfg = BASEMAP_URLS[settings.basemap] || BASEMAP_URLS.dark;
    const newBasemap = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      subdomains: cfg.subdomains,
      maxZoom: 19,
    }).addTo(map);

    basemapLayerRef.current = newBasemap;
  }, [settings.basemap]);

  // Update & Synchronize Radar Tile Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !host || frames.length === 0) return;

    // Ensure layers exist for all frames
    frames.forEach((frame, idx) => {
      let layer = radarLayersRef.current.get(idx);
      const tileUrl = getRadarTileUrl(host, frame, settings.colorScheme, settings.smooth, settings.snow, settings.tileSize);

      if (!layer) {
        layer = L.tileLayer(tileUrl, {
          maxZoom: 18,
          maxNativeZoom: 7,
          opacity: idx === currentFrameIndex ? settings.opacity : 0,
          zIndex: 100,
        }).addTo(map);
        radarLayersRef.current.set(idx, layer);
      } else {
        layer.setUrl(tileUrl);
        layer.setOpacity(idx === currentFrameIndex ? settings.opacity : 0);
      }
    });

    // Cleanup extra layers if frames changed
    radarLayersRef.current.forEach((layer, idx) => {
      if (idx >= frames.length) {
        map.removeLayer(layer);
        radarLayersRef.current.delete(idx);
      }
    });
  }, [host, frames, settings.colorScheme, settings.smooth, settings.snow, settings.tileSize]);

  // Frame Index Opacity Switching (Smooth 60fps frame change)
  useEffect(() => {
    radarLayersRef.current.forEach((layer, idx) => {
      if (idx === currentFrameIndex) {
        layer.setOpacity(settings.opacity);
      } else {
        layer.setOpacity(0);
      }
    });
  }, [currentFrameIndex, settings.opacity]);

  // FlyTo Map Center
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(center, zoom, { duration: 1.2 });
  }, [center[0], center[1], zoom]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-0 rounded-2xl overflow-hidden relative" />;
}
```

---

### 4.5. Reflectivity (dBZ) Legend Component Specification

The legend displays an illuminated HUD bar showing dBZ reflectivity intensity values with gradient mapping:

```tsx
export function RadarDbzLegend() {
  const steps = [
    { dbz: '10', color: '#00a3e0', label: 'Drizzle', rate: '0.1 mm/h' },
    { dbz: '20', color: '#00cc31', label: 'Light', rate: '1.0 mm/h' },
    { dbz: '30', color: '#ffff00', label: 'Moderate', rate: '3.0 mm/h' },
    { dbz: '40', color: '#ff9200', label: 'Heavy', rate: '10 mm/h' },
    { dbz: '50', color: '#ff0000', label: 'Severe', rate: '30 mm/h' },
    { dbz: '60+', color: '#ff00ff', label: 'Extreme / Hail', rate: '> 50 mm/h' },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur-md p-3 text-xs text-white shadow-xl space-y-2">
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>REFLECTIVITY (dBZ)</span>
        <span>RAIN RATE</span>
      </div>
      <div className="flex items-center h-3 rounded-full overflow-hidden w-full border border-white/20">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="flex-1 h-full"
            style={{ backgroundColor: s.color }}
            title={`${s.dbz} dBZ - ${s.label} (${s.rate})`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
        {steps.map((s, idx) => (
          <span key={idx}>{s.dbz}</span>
        ))}
      </div>
    </div>
  );
}
```

---

## 5. Verification Method

### 5.1. Independent Tool & Endpoint Verification

Execute the following commands to independently verify API responses:

1. **Verify RainViewer Metadata Endpoint**:
   ```bash
   curl -s "https://api.rainviewer.com/public/weather-maps.json" | grep -o '"version":"2.0"'
   ```
2. **Verify Radar Tile Download (HTTP 200 PNG)**:
   ```bash
   curl -I -s "https://tilecache.rainviewer.com/v2/radar/4ff6f9e8556b/256/4/11/7/2/1_1.png"
   # Verify Content-Type: image/png, Access-Control-Allow-Origin: *
   ```
3. **Verify Open-Meteo Geocoding & Weather**:
   ```bash
   curl -s "https://geocoding-api.open-meteo.com/v1/search?name=London&count=1"
   curl -s "https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.12&current=temperature_2m,precipitation"
   ```

### 5.2. Build & Typecheck Verification
```bash
npm run build
```
Verify zero TypeScript compilation errors and zero SSR hydration warnings.
