# Weather Forecast, Nowcasting & Geocoding Technical Investigation

## 1. Observation

### 1.1 Existing Codebase & Environment Context
- **Next.js & React Framework**: Next.js 16.3.3, React 19.2.0, TypeScript 5.7.2, and Tailwind CSS 3.4.17 (`package.json`: lines 24-45).
- **Installed UI & Animation Libraries**: `lucide-react` (v0.468.0), `framer-motion` (v13.1.1), `clsx` (v2.1.1), `tailwind-merge` (v2.5.5).
- **Existing Radar Infrastructure**:
  - `src/types/radar.ts`: Doppler radar telemetry contracts (`RadarNode`, `RadarNetworkSummary`, `HydrometeorClass`, `PolarimetricProduct`).
  - `src/lib/radarNetworkData.ts`: 38 Indian Doppler Weather Radar (DWR) nodes across Northern Himalayas, Bay of Bengal, Arabian Sea, Central & Plains, Northeast, and Islands.
  - `src/app/admin/radar/page.tsx` & `src/components/radar/`: Admin Doppler Radar Command Center.
- **Requirement Target**: Build an integrated weather radar, short-term nowcasting, and 7-day multi-day forecast feature with geocoding location search, responsive glassmorphic HUD overlays, unit toggles, and offline fallback resilience (`ORIGINAL_REQUEST.md`: lines 1-25).

### 1.2 Open-Meteo Geocoding API Verification
Live API test executed with query `New Delhi`:
- **Endpoint**: `https://geocoding-api.open-meteo.com/v1/search?name=New%20Delhi&count=2&language=en&format=json`
- **Response Schema Verified**: Returns results array containing:
  - `id`: 1261481
  - `name`: "New Delhi"
  - `latitude`: 28.62137
  - `longitude`: 77.2148
  - `elevation`: 211
  - `country`: "India"
  - `admin1`: "National Capital Territory of Delhi"
  - `admin2`: "New Delhi"
  - `timezone`: "Asia/Kolkata"
- **Verified Characteristics**: Latency < 50ms, generation time 0.88ms, zero API keys required, full administrative hierarchy.

### 1.3 Open-Meteo Weather Forecast API Verification
Live API test executed for coordinates `28.6139, 77.2090` (New Delhi) with 7 forecast days:
- **Endpoint**: `https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,weather_code,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&timezone=auto&forecast_days=7`
- **Response Schema Verified**:
  - `current` provides instant telemetry: temperature 27.4°C, relative humidity 90%, apparent temperature 33.8°C, rain rate 0 mm/h, weather code 0, cloud cover 14%, surface pressure 980.8 hPa, wind speed 4.8 km/h, wind gusts 13 km/h, UV index 0.
  - `hourly` provides 168-hour continuous sequence for dew point, precipitation probability, rain rate, weather code, cloud cover, visibility, and wind.
  - `daily` provides 7-day summaries (min/max temp, rain sum, UV max, sunrise, sunset, max gusts).

---

## 2. Logic Chain

### 2.1 Geocoding Search & Location Resolution
- **Step 1**: User inputs text or coordinate string into the location search bar.
- **Step 2**: The input is matched against coordinate regex `^\s*([-+]?(?:[1-8]?\d(?:\.\d+)?|90(?:\.0+)?))\s*[,\s]\s*([-+]?(?:180(?:\.0+)?|(?:1[0-7]\d|[1-9]?\d)(?:\.\d+)?))\s*$`. If matched, instantly creates a coordinate target location without remote network lookup.
- **Step 3**: For textual place names, a 300ms debounce timer suppresses intermediate keystroke calls, and previous in-flight requests are cancelled using `AbortController`.
- **Step 4**: Search results are stored in an in-memory cache `Map<string, GeocodingLocation[]>` with a 24-hour TTL.
- **Step 5**: Selection recenters the radar map viewport (zoom level 10) and triggers the weather prediction engine.

### 2.2 WMO Weather Interpretation Mapping
Open-Meteo standardizes weather codes according to WMO code table 4677:
| Code | Condition Label | Category | Severity | Lucide Icon | Est. Radar dBZ |
|---|---|---|---|---|---|
| **0** | Clear sky | `clear` | Normal | `Sun` | 0 dBZ |
| **1** | Mainly clear | `clear` | Normal | `SunMedium` | 0 dBZ |
| **2** | Partly cloudy | `clouds` | Normal | `CloudSun` | 0 dBZ |
| **3** | Overcast | `clouds` | Normal | `Cloud` | 5 dBZ |
| **45** | Fog | `fog` | Advisory | `CloudFog` | 10 dBZ |
| **48** | Depositing rime fog | `fog` | Advisory | `CloudFog` | 12 dBZ |
| **51** | Light drizzle | `drizzle` | Normal | `CloudDrizzle` | 18 dBZ |
| **53** | Moderate drizzle | `drizzle` | Normal | `CloudDrizzle` | 22 dBZ |
| **55** | Dense drizzle | `drizzle` | Advisory | `CloudDrizzle` | 26 dBZ |
| **56** | Light freezing drizzle | `drizzle` | Advisory | `CloudSnow` | 22 dBZ |
| **57** | Dense freezing drizzle | `drizzle` | Warning | `CloudSnow` | 28 dBZ |
| **61** | Slight rain | `rain` | Normal | `CloudRain` | 24 dBZ |
| **63** | Moderate rain | `rain` | Normal | `CloudRain` | 34 dBZ |
| **65** | Heavy rain | `rain` | Warning | `CloudRain` | 44 dBZ |
| **66** | Light freezing rain | `rain` | Advisory | `CloudSnow` | 28 dBZ |
| **67** | Heavy freezing rain | `rain` | Warning | `CloudSnow` | 42 dBZ |
| **71** | Slight snowfall | `snow` | Normal | `CloudSnow` | 20 dBZ |
| **73** | Moderate snowfall | `snow` | Advisory | `CloudSnow` | 28 dBZ |
| **75** | Heavy snowfall | `snow` | Warning | `CloudSnow` | 38 dBZ |
| **77** | Snow grains | `snow` | Normal | `CloudSnow` | 18 dBZ |
| **80** | Slight rain showers | `showers` | Normal | `CloudRain` | 26 dBZ |
| **81** | Moderate rain showers | `showers` | Normal | `CloudRain` | 36 dBZ |
| **82** | Violent rain showers | `showers` | Warning | `CloudLightning` | 48 dBZ |
| **85** | Slight snow showers | `snow` | Normal | `CloudSnow` | 22 dBZ |
| **86** | Heavy snow showers | `snow` | Warning | `CloudSnow` | 36 dBZ |
| **95** | Thunderstorm | `thunderstorm` | Warning | `CloudLightning` | 50 dBZ |
| **96** | Thunderstorm with slight hail | `thunderstorm` | Warning | `CloudHail` | 55 dBZ |
| **99** | Thunderstorm with heavy hail | `thunderstorm` | Extreme | `Zap` | 65 dBZ |

### 2.3 Short-Term Nowcasting Derivation Engine
1. **Precipitation Probability & Onset**: Evaluates the immediate 0-6h projection window to compute peak precipitation probability and first onset time.
2. **Rain Rate Intensity Classification**: Categorizes rain rate into:
   - None: 0 mm/h
   - Trace: < 0.5 mm/h
   - Light: 0.5 - 2.5 mm/h
   - Moderate: 2.5 - 7.6 mm/h
   - Heavy: 7.6 - 50 mm/h
   - Torrential / Cloudburst: > 50 mm/h
3. **Radar Correlation via Marshall-Palmer Relationship**:
   - $Z = 200 \cdot R^{1.6} \implies \text{dBZ} = 10 \cdot \log_{10}(Z) \approx 23.01 + 16 \cdot \log_{10}(R)$
   - Converts forecast precipitation rate $R$ (mm/h) directly into Doppler radar reflectivity (0 to 75 dBZ).
4. **Storm Severity Index (0-100)**: Composite index factoring convective WMO codes (95-99), wind gusts (>40 km/h, >70 km/h), precipitation rate (>10 mm/h), and barometric pressure drops.

### 2.4 Fallback & Mock Data Generator
When offline or upon API request failure:
- Uses deterministic solar-hour and latitude modeling to produce realistic diurnal temperature curves, humidity, barometric pressure, and 48-hour/7-day data.
- Built-in presets for 15+ major global and Indian metropolises (New Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Srinagar, London, New York, Tokyo, etc.).

---

## 3. Caveats

1. **Open-Meteo Rate Limits**: Free non-commercial API rate limits allow 10,000 calls/day and 600 calls/minute. With 5-minute caching and search debouncing, client traffic remains well below rate limits.
2. **Reverse Geocoding**: When users click arbitrary map points, reverse geocoding can use BigDataCloud client API or format coordinates cleanly (e.g. `28.61°N, 77.21°E`).
3. **Local Timezone**: Using `timezone=auto` ensures that hourly and daily intervals are aligned with the target location's solar and standard clock times.

---

## 4. Conclusion & Architecture Deliverables

### 4.1 TypeScript Data Contracts (`src/types/weather.ts`)
```typescript
export type WeatherCategory =
  | 'clear'
  | 'clouds'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'showers'
  | 'thunderstorm';

export type WeatherSeverity = 'normal' | 'advisory' | 'watch' | 'warning' | 'extreme';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'ms' | 'knots';
export type PressureUnit = 'hPa' | 'inHg' | 'mmHg';

export interface WeatherUnitsPreference {
  temperature: TemperatureUnit;
  windSpeed: WindSpeedUnit;
  pressure: PressureUnit;
}

export interface WmoWeatherCodeInfo {
  code: number;
  label: string;
  category: WeatherCategory;
  severity: WeatherSeverity;
  iconName: string;
  badgeClass: string;
  estRadarDbz: number;
}

export interface GeocodingLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  admin1?: string;
  admin2?: string;
  timezone: string;
  population?: number;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  dewPoint: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weatherCode: number;
  weatherInfo: WmoWeatherCodeInfo;
  cloudCover: number;
  surfacePressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  uvIndex: number;
  visibility: number;
  estimatedDbz: number;
}

export interface HourlyForecastItem {
  time: string;
  timestampMs: number;
  formattedHour: string;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  dewPoint: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  weatherInfo: WmoWeatherCodeInfo;
  cloudCover: number;
  surfacePressure: number;
  visibility: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  estimatedDbz: number;
}

export interface DailyForecastItem {
  date: string;
  weekday: string;
  weatherCode: number;
  weatherInfo: WmoWeatherCodeInfo;
  temperatureMax: number;
  temperatureMin: number;
  apparentTemperatureMax: number;
  apparentTemperatureMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
  rainSum: number;
  precipitationProbabilityMax: number;
  precipitationHours: number;
  windSpeedMax: number;
  windGustsMax: number;
  windDirectionDominant: number;
}

export interface NowcastAssessment {
  riskScore: number; // 0 - 100
  severity: WeatherSeverity;
  rainIntensityCategory: 'None' | 'Trace' | 'Light' | 'Moderate' | 'Heavy' | 'Torrential';
  peakPrecipProbability6h: number;
  peakPrecipRate6h: number;
  peakDbz6h: number;
  onsetSummary: string;
  stormAlertSummary: string;
  next6Hours: HourlyForecastItem[];
}

export interface WeatherForecastData {
  location: {
    name: string;
    admin1?: string;
    country?: string;
    latitude: number;
    longitude: number;
    elevation?: number;
    timezone: string;
  };
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  nowcast: NowcastAssessment;
  lastUpdated: string;
  isMockFallback?: boolean;
}
```

### 4.2 Comprehensive WMO Weather Interpretation Dictionary (`src/lib/wmoCodes.ts`)
```typescript
import { WmoWeatherCodeInfo } from '@/types/weather';

export const WMO_CODE_MAP: Record<number, WmoWeatherCodeInfo> = {
  0: { code: 0, label: 'Clear sky', category: 'clear', severity: 'normal', iconName: 'Sun', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30', estRadarDbz: 0 },
  1: { code: 1, label: 'Mainly clear', category: 'clear', severity: 'normal', iconName: 'SunMedium', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30', estRadarDbz: 0 },
  2: { code: 2, label: 'Partly cloudy', category: 'clouds', severity: 'normal', iconName: 'CloudSun', badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30', estRadarDbz: 0 },
  3: { code: 3, label: 'Overcast', category: 'clouds', severity: 'normal', iconName: 'Cloud', badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/30', estRadarDbz: 5 },
  45: { code: 45, label: 'Fog', category: 'fog', severity: 'advisory', iconName: 'CloudFog', badgeClass: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30', estRadarDbz: 10 },
  48: { code: 48, label: 'Depositing rime fog', category: 'fog', severity: 'advisory', iconName: 'CloudFog', badgeClass: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30', estRadarDbz: 12 },
  51: { code: 51, label: 'Light drizzle', category: 'drizzle', severity: 'normal', iconName: 'CloudDrizzle', badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30', estRadarDbz: 18 },
  53: { code: 53, label: 'Moderate drizzle', category: 'drizzle', severity: 'normal', iconName: 'CloudDrizzle', badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30', estRadarDbz: 22 },
  55: { code: 55, label: 'Dense drizzle', category: 'drizzle', severity: 'advisory', iconName: 'CloudDrizzle', badgeClass: 'bg-blue-600/20 text-blue-300 border-blue-600/30', estRadarDbz: 26 },
  56: { code: 56, label: 'Light freezing drizzle', category: 'drizzle', severity: 'advisory', iconName: 'CloudSnow', badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', estRadarDbz: 22 },
  57: { code: 57, label: 'Dense freezing drizzle', category: 'drizzle', severity: 'warning', iconName: 'CloudSnow', badgeClass: 'bg-indigo-600/20 text-indigo-300 border-indigo-600/30', estRadarDbz: 28 },
  61: { code: 61, label: 'Slight rain', category: 'rain', severity: 'normal', iconName: 'CloudRain', badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', estRadarDbz: 24 },
  63: { code: 63, label: 'Moderate rain', category: 'rain', severity: 'normal', iconName: 'CloudRain', badgeClass: 'bg-cyan-600/20 text-cyan-300 border-cyan-600/30', estRadarDbz: 34 },
  65: { code: 65, label: 'Heavy rain', category: 'rain', severity: 'warning', iconName: 'CloudRain', badgeClass: 'bg-blue-600/25 text-blue-300 border-blue-500/40', estRadarDbz: 44 },
  66: { code: 66, label: 'Light freezing rain', category: 'rain', severity: 'advisory', iconName: 'CloudSnow', badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', estRadarDbz: 28 },
  67: { code: 67, label: 'Heavy freezing rain', category: 'rain', severity: 'warning', iconName: 'CloudSnow', badgeClass: 'bg-indigo-600/25 text-indigo-300 border-indigo-500/40', estRadarDbz: 42 },
  71: { code: 71, label: 'Slight snowfall', category: 'snow', severity: 'normal', iconName: 'CloudSnow', badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/30', estRadarDbz: 20 },
  73: { code: 73, label: 'Moderate snowfall', category: 'snow', severity: 'advisory', iconName: 'CloudSnow', badgeClass: 'bg-teal-600/20 text-teal-300 border-teal-600/30', estRadarDbz: 28 },
  75: { code: 75, label: 'Heavy snowfall', category: 'snow', severity: 'warning', iconName: 'CloudSnow', badgeClass: 'bg-teal-600/30 text-teal-200 border-teal-500/40', estRadarDbz: 38 },
  77: { code: 77, label: 'Snow grains', category: 'snow', severity: 'normal', iconName: 'CloudSnow', badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/30', estRadarDbz: 18 },
  80: { code: 80, label: 'Slight rain showers', category: 'showers', severity: 'normal', iconName: 'CloudRain', badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', estRadarDbz: 26 },
  81: { code: 81, label: 'Moderate rain showers', category: 'showers', severity: 'normal', iconName: 'CloudRain', badgeClass: 'bg-cyan-600/20 text-cyan-300 border-cyan-600/30', estRadarDbz: 36 },
  82: { code: 82, label: 'Violent rain showers', category: 'showers', severity: 'warning', iconName: 'CloudLightning', badgeClass: 'bg-amber-600/25 text-amber-300 border-amber-500/40', estRadarDbz: 48 },
  85: { code: 85, label: 'Slight snow showers', category: 'snow', severity: 'normal', iconName: 'CloudSnow', badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/30', estRadarDbz: 22 },
  86: { code: 86, label: 'Heavy snow showers', category: 'snow', severity: 'warning', iconName: 'CloudSnow', badgeClass: 'bg-teal-600/25 text-teal-300 border-teal-500/40', estRadarDbz: 36 },
  95: { code: 95, label: 'Thunderstorm', category: 'thunderstorm', severity: 'warning', iconName: 'CloudLightning', badgeClass: 'bg-purple-600/25 text-purple-300 border-purple-500/40', estRadarDbz: 50 },
  96: { code: 96, label: 'Thunderstorm with slight hail', category: 'thunderstorm', severity: 'warning', iconName: 'CloudHail', badgeClass: 'bg-pink-600/25 text-pink-300 border-pink-500/40', estRadarDbz: 55 },
  99: { code: 99, label: 'Thunderstorm with heavy hail', category: 'thunderstorm', severity: 'extreme', iconName: 'Zap', badgeClass: 'bg-red-600/30 text-red-200 border-red-500/50 animate-pulse', estRadarDbz: 65 }
};

export function getWmoWeatherInfo(code: number): WmoWeatherCodeInfo {
  return (
    WMO_CODE_MAP[code] || {
      code,
      label: 'Variable conditions',
      category: 'clouds',
      severity: 'normal',
      iconName: 'Cloud',
      badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      estRadarDbz: 10
    }
  );
}
```

### 4.3 Production Weather Service & Nowcasting Engine (`src/lib/weatherService.ts`)
```typescript
import {
  WeatherForecastData,
  GeocodingLocation,
  HourlyForecastItem,
  DailyForecastItem,
  NowcastAssessment,
  CurrentWeather,
  WeatherSeverity
} from '@/types/weather';
import { getWmoWeatherInfo } from './wmoCodes';
import { generateMockForecastData, getMatchingFallbackPresets } from './mockWeatherData';

const GEO_CACHE = new Map<string, { timestamp: number; data: GeocodingLocation[] }>();
const WEATHER_CACHE = new Map<string, { timestamp: number; data: WeatherForecastData }>();

const GEO_TTL = 24 * 60 * 60 * 1000; // 24 hours
const WEATHER_TTL = 5 * 60 * 1000; // 5 minutes

export function calculateEstimatedDbz(rainRateMmH: number): number {
  if (!rainRateMmH || rainRateMmH <= 0.01) return 0;
  // Marshall-Palmer relation: Z = 200 * R^1.6
  const z = 200 * Math.pow(rainRateMmH, 1.6);
  const dbz = 10 * Math.log10(z);
  return Math.max(0, Math.min(75, Math.round(dbz * 10) / 10));
}

export function convertTemperature(celsius: number, unit: 'celsius' | 'fahrenheit'): number {
  if (unit === 'fahrenheit') return Math.round((celsius * 1.8 + 32) * 10) / 10;
  return Math.round(celsius * 10) / 10;
}

export function convertWindSpeed(kmh: number, unit: 'kmh' | 'mph' | 'ms' | 'knots'): number {
  switch (unit) {
    case 'mph': return Math.round(kmh * 0.621371 * 10) / 10;
    case 'ms': return Math.round((kmh / 3.6) * 10) / 10;
    case 'knots': return Math.round(kmh * 0.539957 * 10) / 10;
    case 'kmh':
    default:
      return Math.round(kmh * 10) / 10;
  }
}

export function getWindDirectionCompass(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return directions[index];
}

// Open-Meteo Geocoding Search
export async function searchLocations(query: string, signal?: AbortSignal): Promise<GeocodingLocation[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // Check direct coordinate input
  const coordMatch = trimmed.match(/^\s*([-+]?(?:[1-8]?\d(?:\.\d+)?|90(?:\.0+)?))\s*[,\s]\s*([-+]?(?:180(?:\.0+)?|(?:1[0-7]\d|[1-9]?\d)(?:\.\d+)?))\s*$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    return [{
      id: Date.now(),
      name: `${lat >= 0 ? lat.toFixed(2) + '°N' : Math.abs(lat).toFixed(2) + '°S'}, ${lng >= 0 ? lng.toFixed(2) + '°E' : Math.abs(lng).toFixed(2) + '°W'}`,
      latitude: lat,
      longitude: lng,
      timezone: 'auto',
      country: 'Coordinate Target'
    }];
  }

  // Cache check
  const cacheKey = trimmed.toLowerCase();
  const cached = GEO_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < GEO_TTL) {
    return cached.data;
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=10&language=en&format=json`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Geocoding API status ${res.status}`);
    const data = await res.json();
    const results: GeocodingLocation[] = data.results || [];
    GEO_CACHE.set(cacheKey, { timestamp: Date.now(), data: results });
    return results;
  } catch (error: any) {
    if (error.name === 'AbortError') throw error;
    return getMatchingFallbackPresets(trimmed);
  }
}

// Fetch Full Forecast & Derive Nowcasting
export async function fetchWeatherForecast(
  lat: number,
  lng: number,
  locationName = 'Selected Location',
  admin1?: string,
  country?: string
): Promise<WeatherForecastData> {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const cached = WEATHER_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < WEATHER_TTL) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index',
      hourly: 'temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,weather_code,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,uv_index',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant',
      timezone: 'auto',
      forecast_days: '7'
    });

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!res.ok) throw new Error(`Forecast API status ${res.status}`);
    const raw = await res.json();

    const transformed = transformOpenMeteoResponse(raw, {
      name: locationName,
      admin1,
      country,
      latitude: lat,
      longitude: lng,
      timezone: raw.timezone || 'auto'
    });

    WEATHER_CACHE.set(cacheKey, { timestamp: Date.now(), data: transformed });
    return transformed;
  } catch (error) {
    console.warn('Weather API failed or offline, using realistic fallback:', error);
    return generateMockForecastData(lat, lng, locationName, admin1, country);
  }
}

function transformOpenMeteoResponse(raw: any, location: WeatherForecastData['location']): WeatherForecastData {
  const cur = raw.current || {};
  const weatherInfo = getWmoWeatherInfo(cur.weather_code ?? 0);
  const estDbz = calculateEstimatedDbz(cur.precipitation || cur.rain || 0);

  const current: CurrentWeather = {
    time: cur.time || new Date().toISOString(),
    temperature: cur.temperature_2m ?? 24,
    apparentTemperature: cur.apparent_temperature ?? cur.temperature_2m ?? 24,
    relativeHumidity: cur.relative_humidity_2m ?? 50,
    dewPoint: (raw.hourly?.dew_point_2m && raw.hourly.dew_point_2m[0]) ?? 18,
    precipitation: cur.precipitation ?? 0,
    rain: cur.rain ?? 0,
    showers: cur.showers ?? 0,
    snowfall: cur.snowfall ?? 0,
    weatherCode: cur.weather_code ?? 0,
    weatherInfo,
    cloudCover: cur.cloud_cover ?? 20,
    surfacePressure: cur.surface_pressure ?? 1013,
    windSpeed: cur.wind_speed_10m ?? 8,
    windDirection: cur.wind_direction_10m ?? 0,
    windGusts: cur.wind_gusts_10m ?? 12,
    uvIndex: cur.uv_index ?? 0,
    visibility: (raw.hourly?.visibility && raw.hourly.visibility[0]) ?? 10000,
    estimatedDbz: estDbz
  };

  const hourlyRaw = raw.hourly || {};
  const hourly: HourlyForecastItem[] = [];
  const totalHourly = Math.min(hourlyRaw.time?.length || 0, 72);

  for (let i = 0; i < totalHourly; i++) {
    const timeIso = hourlyRaw.time[i];
    const dateObj = new Date(timeIso);
    const rainVal = hourlyRaw.precipitation?.[i] ?? hourlyRaw.rain?.[i] ?? 0;
    const code = hourlyRaw.weather_code?.[i] ?? 0;
    const hDbz = calculateEstimatedDbz(rainVal);

    hourly.push({
      time: timeIso,
      timestampMs: dateObj.getTime(),
      formattedHour: i === 0 ? 'Now' : dateObj.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
      temperature: hourlyRaw.temperature_2m?.[i] ?? 20,
      apparentTemperature: hourlyRaw.apparent_temperature?.[i] ?? 20,
      relativeHumidity: hourlyRaw.relative_humidity_2m?.[i] ?? 50,
      dewPoint: hourlyRaw.dew_point_2m?.[i] ?? 15,
      precipitationProbability: hourlyRaw.precipitation_probability?.[i] ?? 0,
      precipitation: rainVal,
      weatherCode: code,
      weatherInfo: getWmoWeatherInfo(code),
      cloudCover: hourlyRaw.cloud_cover?.[i] ?? 0,
      surfacePressure: hourlyRaw.surface_pressure?.[i] ?? 1013,
      visibility: hourlyRaw.visibility?.[i] ?? 10000,
      windSpeed: hourlyRaw.wind_speed_10m?.[i] ?? 0,
      windDirection: hourlyRaw.wind_direction_10m?.[i] ?? 0,
      uvIndex: hourlyRaw.uv_index?.[i] ?? 0,
      estimatedDbz: hDbz
    });
  }

  const dailyRaw = raw.daily || {};
  const daily: DailyForecastItem[] = [];
  const totalDaily = Math.min(dailyRaw.time?.length || 0, 7);

  for (let d = 0; d < totalDaily; d++) {
    const dateStr = dailyRaw.time[d];
    const dateObj = new Date(dateStr);
    const code = dailyRaw.weather_code?.[d] ?? 0;

    daily.push({
      date: dateStr,
      weekday: d === 0 ? 'Today' : dateObj.toLocaleDateString([], { weekday: 'short' }),
      weatherCode: code,
      weatherInfo: getWmoWeatherInfo(code),
      temperatureMax: dailyRaw.temperature_2m_max?.[d] ?? 28,
      temperatureMin: dailyRaw.temperature_2m_min?.[d] ?? 18,
      apparentTemperatureMax: dailyRaw.apparent_temperature_max?.[d] ?? 30,
      apparentTemperatureMin: dailyRaw.apparent_temperature_min?.[d] ?? 17,
      sunrise: dailyRaw.sunrise?.[d] ?? '',
      sunset: dailyRaw.sunset?.[d] ?? '',
      uvIndexMax: dailyRaw.uv_index_max?.[d] ?? 5,
      precipitationSum: dailyRaw.precipitation_sum?.[d] ?? 0,
      rainSum: dailyRaw.rain_sum?.[d] ?? 0,
      precipitationProbabilityMax: dailyRaw.precipitation_probability_max?.[d] ?? 0,
      precipitationHours: dailyRaw.precipitation_hours?.[d] ?? 0,
      windSpeedMax: dailyRaw.wind_speed_10m_max?.[d] ?? 15,
      windGustsMax: dailyRaw.wind_gusts_10m_max?.[d] ?? 25,
      windDirectionDominant: dailyRaw.wind_direction_10m_dominant?.[d] ?? 0
    });
  }

  const nowcast = deriveNowcasting(hourly, current);

  return {
    location,
    current,
    hourly,
    daily,
    nowcast,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    isMockFallback: false
  };
}

function deriveNowcasting(hourly: HourlyForecastItem[], current: CurrentWeather): NowcastAssessment {
  const next6Hours = hourly.slice(0, 6);
  const peakProb = Math.max(...next6Hours.map((h) => h.precipitationProbability), 0);
  const peakRain = Math.max(...next6Hours.map((h) => h.precipitation), 0);
  const peakDbz = Math.max(...next6Hours.map((h) => h.estimatedDbz), current.estimatedDbz);

  let rainIntensity: NowcastAssessment['rainIntensityCategory'] = 'None';
  if (peakRain > 50) rainIntensity = 'Torrential';
  else if (peakRain > 7.6) rainIntensity = 'Heavy';
  else if (peakRain > 2.5) rainIntensity = 'Moderate';
  else if (peakRain > 0.5) rainIntensity = 'Light';
  else if (peakRain > 0) rainIntensity = 'Trace';

  // Storm Risk Evaluation
  let riskScore = 0;
  if ([95, 96, 99].includes(current.weatherCode)) riskScore += 50;
  else if ([82, 65, 67].includes(current.weatherCode)) riskScore += 35;
  else if ([63, 81, 75].includes(current.weatherCode)) riskScore += 20;

  if (current.windGusts > 60) riskScore += 25;
  else if (current.windGusts > 40) riskScore += 15;

  if (peakProb > 70) riskScore += 20;
  else if (peakProb > 40) riskScore += 10;

  if (peakDbz > 45) riskScore += 15;

  riskScore = Math.min(100, Math.max(0, riskScore));

  let severity: WeatherSeverity = 'normal';
  if (riskScore >= 75) severity = 'extreme';
  else if (riskScore >= 50) severity = 'warning';
  else if (riskScore >= 25) severity = 'advisory';

  let onsetSummary = 'No precipitation expected in the next 6 hours.';
  const firstRainIdx = next6Hours.findIndex((h) => h.precipitationProbability >= 40 || h.precipitation >= 0.2);
  if (firstRainIdx === 0) {
    onsetSummary = `Active precipitation underway (${current.precipitation.toFixed(1)} mm/h, est. ${current.estimatedDbz.toFixed(0)} dBZ).`;
  } else if (firstRainIdx > 0) {
    const targetHour = next6Hours[firstRainIdx].formattedHour;
    onsetSummary = `Precipitation likely starting around ${targetHour} (${next6Hours[firstRainIdx].precipitationProbability}% probability).`;
  }

  let stormAlertSummary = 'Atmospheric conditions stable. Doppler radar reflectivity within normal baseline.';
  if (severity === 'extreme' || severity === 'warning') {
    stormAlertSummary = `⚠️ Severe convective activity detected. Maximum projected radar return ${peakDbz.toFixed(0)} dBZ with gusts up to ${current.windGusts.toFixed(0)} km/h.`;
  } else if (severity === 'advisory') {
    stormAlertSummary = `Moderate weather systems approaching. Peak precipitation probability ${peakProb}% over next 6 hours.`;
  }

  return {
    riskScore,
    severity,
    rainIntensityCategory: rainIntensity,
    peakPrecipProbability6h: peakProb,
    peakPrecipRate6h: peakRain,
    peakDbz6h: peakDbz,
    onsetSummary,
    stormAlertSummary,
    next6Hours
  };
}
```

### 4.4 Realistic Mock Fallback Generator & Presets (`src/lib/mockWeatherData.ts`)
```typescript
import { WeatherForecastData, GeocodingLocation } from '@/types/weather';
import { getWmoWeatherInfo } from './wmoCodes';
import { calculateEstimatedDbz } from './weatherService';

export const MAJOR_LOCATION_PRESETS: GeocodingLocation[] = [
  { id: 101, name: 'New Delhi', admin1: 'Delhi NCR', country: 'India', latitude: 28.6139, longitude: 77.2090, elevation: 216, timezone: 'Asia/Kolkata' },
  { id: 102, name: 'Mumbai', admin1: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777, elevation: 14, timezone: 'Asia/Kolkata' },
  { id: 103, name: 'Kolkata', admin1: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.3639, elevation: 9, timezone: 'Asia/Kolkata' },
  { id: 104, name: 'Chennai', admin1: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707, elevation: 6, timezone: 'Asia/Kolkata' },
  { id: 105, name: 'Bengaluru', admin1: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946, elevation: 920, timezone: 'Asia/Kolkata' },
  { id: 106, name: 'Srinagar', admin1: 'Jammu & Kashmir', country: 'India', latitude: 34.0837, longitude: 74.7973, elevation: 1585, timezone: 'Asia/Kolkata' },
  { id: 107, name: 'Guwahati', admin1: 'Assam', country: 'India', latitude: 26.1445, longitude: 91.7362, elevation: 55, timezone: 'Asia/Kolkata' },
  { id: 108, name: 'Port Blair', admin1: 'Andaman & Nicobar', country: 'India', latitude: 11.6234, longitude: 92.7265, elevation: 16, timezone: 'Asia/Kolkata' },
  { id: 109, name: 'London', admin1: 'Greater London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, elevation: 25, timezone: 'Europe/London' },
  { id: 110, name: 'New York', admin1: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, elevation: 10, timezone: 'America/New_York' },
  { id: 111, name: 'Tokyo', admin1: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, elevation: 40, timezone: 'Asia/Tokyo' }
];

export function getMatchingFallbackPresets(query: string): GeocodingLocation[] {
  const q = query.toLowerCase();
  return MAJOR_LOCATION_PRESETS.filter(
    (loc) => loc.name.toLowerCase().includes(q) || (loc.admin1 && loc.admin1.toLowerCase().includes(q)) || (loc.country && loc.country.toLowerCase().includes(q))
  );
}

export function generateMockForecastData(
  lat: number,
  lng: number,
  name = 'Selected Location',
  admin1?: string,
  country?: string
): WeatherForecastData {
  const now = new Date();
  const currentHour = now.getHours();
  
  const baseTemp = Math.max(5, Math.min(36, 34 - Math.abs(lat - 20) * 0.65));
  const diurnalVar = 5.5 * Math.sin(((currentHour - 8) * Math.PI) / 12);
  const curTemp = Math.round((baseTemp + diurnalVar) * 10) / 10;
  const curHum = Math.max(30, Math.min(95, Math.round(82 - (curTemp - 15) * 1.7)));
  const curPrecip = lat > 15 && lat < 25 ? 1.2 : 0;
  const curCode = curPrecip > 0 ? 61 : (curHum > 75 ? 2 : 0);
  const estDbz = calculateEstimatedDbz(curPrecip);

  const current = {
    time: now.toISOString(),
    temperature: curTemp,
    apparentTemperature: Math.round((curTemp + (curHum > 65 ? 3.2 : -0.8)) * 10) / 10,
    relativeHumidity: curHum,
    dewPoint: Math.round((curTemp - (100 - curHum) / 5) * 10) / 10,
    precipitation: curPrecip,
    rain: curPrecip,
    showers: 0,
    snowfall: 0,
    weatherCode: curCode,
    weatherInfo: getWmoWeatherInfo(curCode),
    cloudCover: curPrecip > 0 ? 70 : 25,
    surfacePressure: Math.round((1013 - (lat > 30 ? 20 : 5)) * 10) / 10,
    windSpeed: 12.4,
    windDirection: 140,
    windGusts: 22.8,
    uvIndex: currentHour >= 7 && currentHour <= 18 ? Math.max(1, Math.round(9 * Math.sin(((currentHour - 6) * Math.PI) / 12))) : 0,
    visibility: 10000,
    estimatedDbz: estDbz
  };

  const hourly = [];
  for (let i = 0; i < 48; i++) {
    const hTime = new Date(now.getTime() + i * 3600 * 1000);
    const h = hTime.getHours();
    const hTemp = Math.round((baseTemp + 5.5 * Math.sin(((h - 8) * Math.PI) / 12)) * 10) / 10;
    const hHum = Math.max(30, Math.min(95, Math.round(82 - (hTemp - 15) * 1.7)));
    const hProb = Math.max(5, Math.min(90, Math.round(35 + 25 * Math.sin((i + 2) * 0.45))));
    const hRain = hProb > 55 ? Math.round((hProb - 55) * 0.12 * 10) / 10 : 0;
    const hCode = hRain > 3 ? 65 : (hRain > 0.4 ? 61 : (hProb > 40 ? 2 : 0));

    hourly.push({
      time: hTime.toISOString(),
      timestampMs: hTime.getTime(),
      formattedHour: i === 0 ? 'Now' : hTime.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
      temperature: hTemp,
      apparentTemperature: Math.round((hTemp + (hHum > 65 ? 3 : -1)) * 10) / 10,
      relativeHumidity: hHum,
      dewPoint: Math.round((hTemp - (100 - hHum) / 5) * 10) / 10,
      precipitationProbability: hProb,
      precipitation: hRain,
      weatherCode: hCode,
      weatherInfo: getWmoWeatherInfo(hCode),
      cloudCover: Math.min(100, Math.max(10, hProb + 15)),
      surfacePressure: 1012,
      visibility: hRain > 2 ? 6500 : 10000,
      windSpeed: Math.round((10 + 6 * Math.sin(i * 0.3)) * 10) / 10,
      windDirection: (130 + i * 5) % 360,
      uvIndex: h >= 7 && h <= 18 ? Math.max(1, Math.round(9 * Math.sin(((h - 6) * Math.PI) / 12))) : 0,
      estimatedDbz: calculateEstimatedDbz(hRain)
    });
  }

  const daily = [];
  for (let d = 0; d < 7; d++) {
    const dTime = new Date(now.getTime() + d * 86400 * 1000);
    const maxT = Math.round((baseTemp + 5 + (d % 3)) * 10) / 10;
    const minT = Math.round((baseTemp - 5 + (d % 2)) * 10) / 10;
    const pSum = d % 2 === 0 ? Math.round((2.0 + d * 0.8) * 10) / 10 : 0;
    const dCode = pSum > 4 ? 65 : (pSum > 0 ? 61 : 0);

    daily.push({
      date: dTime.toISOString().split('T')[0],
      weekday: d === 0 ? 'Today' : dTime.toLocaleDateString([], { weekday: 'short' }),
      weatherCode: dCode,
      weatherInfo: getWmoWeatherInfo(dCode),
      temperatureMax: maxT,
      temperatureMin: minT,
      apparentTemperatureMax: maxT + 2.5,
      apparentTemperatureMin: minT - 1,
      sunrise: '06:05',
      sunset: '18:40',
      uvIndexMax: 8.5,
      precipitationSum: pSum,
      rainSum: pSum,
      precipitationProbabilityMax: pSum > 0 ? 70 : 20,
      precipitationHours: pSum > 0 ? 3 : 0,
      windSpeedMax: 18.5,
      windGustsMax: 32.0,
      windDirectionDominant: 140
    });
  }

  return {
    location: { name, admin1, country, latitude: lat, longitude: lng, timezone: 'auto' },
    current,
    hourly,
    daily,
    nowcast: {
      riskScore: 28,
      severity: 'advisory',
      rainIntensityCategory: 'Light',
      peakPrecipProbability6h: 62,
      peakPrecipRate6h: 1.8,
      peakDbz6h: 26.5,
      onsetSummary: 'Scattered light showers expected in the local sector.',
      stormAlertSummary: 'Isolated convective cells present. Peak reflectivity ~27 dBZ.',
      next6Hours: hourly.slice(0, 6)
    },
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isMockFallback: true
  };
}
```

### 4.5 UI Presentation & Glassmorphic Radar HUD Architecture
1. **Search Bar & Geocoding Dropdown**:
   - Translucent floating search pill top-center with `lucide-react` Search & MapPin icons.
   - Quick preset chips: *Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Srinagar*.
   - Keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`).
   - Clear button & loading spinner indicator.
2. **Unit Toggles**:
   - °C / °F toggle switch for temperature.
   - km/h / mph / knots selector for wind metrics.
   - Persisted in `localStorage` key `weather_units_pref`.
3. **Floating Weather HUD Card (Collapsible Side Panel)**:
   - Current temperature large typography (e.g., 28°C / Feels like 31°C).
   - Dynamic WMO weather icon & animated severity badge.
   - Wind Directional Compass dial with degrees and speed.
   - Humidity gauge, Barometric pressure, and UV solar dial.
4. **Interactive 24h/48h Hourly Strip**:
   - Horizontally scrollable timeline with temperature curve, precipitation probability bars (0-100%), and estimated radar dBZ color indicators.
   - Interactive hover scrubbing to display details at any specific hour.
5. **7-Day Forecast Multi-Day Panel**:
   - Clean horizontal day cards showing day of week, weather icon, min/max range bar with color gradient (blue to orange), precipitation accumulation in mm, and max gusts.
6. **Nowcasting Storm Cell Alert Banner**:
   - Dynamic alert banner positioned at top of radar view when storm severity index > 50.
   - Displays Marshall-Palmer derived peak dBZ reflectivity, expected rain onset time, and gust speed warnings.

---

## 5. Verification Method

### 5.1 Verification Commands
1. **Build Verification**:
   ```powershell
   npm run build
   ```
   Expected result: Zero TypeScript compile errors, valid Next.js route compilation.

2. **API Live Probe**:
   ```powershell
   node -e "fetch('https://geocoding-api.open-meteo.com/v1/search?name=Delhi&count=1&format=json').then(r=>r.json()).then(d=>console.log('Geocoding OK:', d.results[0].name))"
   node -e "fetch('https://api.open-meteo.com/v1/forecast?latitude=28.61&longitude=77.20&current=temperature_2m,precipitation&daily=weather_code&timezone=auto').then(r=>r.json()).then(d=>console.log('Forecast OK:', d.current))"
   ```
   Expected result: Clean JSON output returning status 200 without API key errors.

3. **Marshall-Palmer Radar Reflectivity Formula Test**:
   ```powershell
   node -e "function dbz(r){ return r <= 0 ? 0 : Math.min(75, 10 * Math.log10(200 * Math.pow(r, 1.6))); } console.log('10mm/h ->', dbz(10).toFixed(1), 'dBZ');"
   ```
   Expected result: Output is ~39.0 dBZ.

### 5.2 Invalidation Conditions
- Any changes to Open-Meteo endpoint schema causing missing fields.
- Breaking TypeScript interface changes between `WeatherForecastData` and consuming UI components.
