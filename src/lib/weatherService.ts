import {
  Coordinates,
  WeatherData,
  CurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
  RadarMetadata,
  RadarFrame,
  SearchSuggestion,
  TemperatureUnit,
  WindSpeedUnit,
  PressureUnit,
  RadarColorScheme,
  BasemapType,
} from '@/types/weather';
import { getWmoDetails } from './wmoCodes';
import { generateMockWeatherData, getMatchingPresetLocations } from './mockWeatherData';
import { generateMockRadarMetadata } from './mockRadarData';

// Cache TTL configurations (milliseconds)
const GEO_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const WEATHER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const RADAR_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

// In-memory cache storage
const geocodingCache = new Map<string, { timestamp: number; data: SearchSuggestion[] }>();
const weatherCache = new Map<string, { timestamp: number; data: WeatherData }>();
let cachedRadarMetadata: { timestamp: number; data: RadarMetadata } | null = null;

// Carto API Key for student/pro accounts
const CARTO_API_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY || process.env.CARTO_API_KEY || '';
const cartoAuthQuery = CARTO_API_KEY ? `?api_key=${encodeURIComponent(CARTO_API_KEY)}` : '';

/**
 * Standard Slippy Basemap Layer Configurations
 */
export const BASEMAP_CONFIGS: Record<
  BasemapType,
  {
    name: string;
    url: string;
    attribution: string;
    subdomains?: string[];
    maxZoom: number;
  }
> = {
  dark: {
    name: 'CartoDB Dark Matter',
    url: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${cartoAuthQuery}`,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 19,
  },
  light: {
    name: 'CartoDB Positron',
    url: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${cartoAuthQuery}`,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 19,
  },
  voyager: {
    name: 'CartoDB Voyager (Student/Pro)',
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${cartoAuthQuery}`,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 19,
  },
  osm: {
    name: 'OpenStreetMap Standard',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19,
  },
  satellite: {
    name: 'ESRI World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 18,
  },
};

export const BASEMAP_URLS = BASEMAP_CONFIGS;

/**
 * Marshall-Palmer Radar Reflectivity Formula:
 * Z = 200 * R^1.6
 * dBZ = 10 * log10(Z) = 23.01 + 16 * log10(R)
 */
export function calculateMarshallPalmerDbz(rainRateMmH: number): number {
  if (!rainRateMmH || rainRateMmH <= 0.01) return 0;
  const z = 200 * Math.pow(rainRateMmH, 1.6);
  const dbz = 10 * Math.log10(z);
  return Math.max(0, Math.min(75, Math.round(dbz * 10) / 10));
}

/**
 * Calculates a composite storm severity risk index (0 to 100)
 * based on synoptic WMO codes, wind gusts, radar reflectivity, and precipitation rates.
 */
export function calculateStormSeverityIndex(
  current: CurrentWeather,
  hourly?: HourlyForecastItem[]
): number {
  let score = 0;

  // 1. Convective Weather Code Assessment (up to 45 pts)
  if ([99].includes(current.weatherCode)) score += 45;
  else if ([95, 96, 19].includes(current.weatherCode)) score += 40;
  else if ([82, 65, 67, 18].includes(current.weatherCode)) score += 28;
  else if ([63, 81, 75, 86].includes(current.weatherCode)) score += 18;
  else if ([55, 57, 61, 80].includes(current.weatherCode)) score += 8;

  // 2. Wind Gust Severity (up to 25 pts)
  if (current.windGusts >= 75) score += 25;
  else if (current.windGusts >= 55) score += 18;
  else if (current.windGusts >= 40) score += 10;
  else if (current.windGusts >= 25) score += 4;

  // 3. Radar Reflectivity / Rain Intensity (up to 20 pts)
  const dbz = calculateMarshallPalmerDbz(current.precipitation);
  if (dbz >= 55 || current.precipitation >= 25) score += 20;
  else if (dbz >= 45 || current.precipitation >= 10) score += 15;
  else if (dbz >= 35 || current.precipitation >= 3) score += 8;

  // 4. Forecast Trend Escalation (next 3 hours) (up to 10 pts)
  if (hourly && hourly.length > 0) {
    const next3 = hourly.slice(0, 3);
    const maxUpcomingProb = Math.max(...next3.map((h) => h.precipitationProbability), 0);
    const maxUpcomingRain = Math.max(...next3.map((h) => h.precipitation), 0);
    if (maxUpcomingRain > 15 || maxUpcomingProb >= 85) score += 10;
    else if (maxUpcomingRain > 5 || maxUpcomingProb >= 60) score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Temperature conversion utility.
 */
export function convertTemperature(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'fahrenheit') {
    return Math.round((celsius * 1.8 + 32) * 10) / 10;
  }
  return Math.round(celsius * 10) / 10;
}

/**
 * Wind speed conversion utility.
 */
export function convertWindSpeed(kmh: number, unit: WindSpeedUnit): number {
  switch (unit) {
    case 'mph':
      return Math.round(kmh * 0.621371 * 10) / 10;
    case 'ms':
      return Math.round((kmh / 3.6) * 10) / 10;
    case 'knots':
      return Math.round(kmh * 0.539957 * 10) / 10;
    case 'kmh':
    default:
      return Math.round(kmh * 10) / 10;
  }
}

/**
 * Atmospheric pressure conversion utility.
 */
export function convertPressure(hPa: number, unit: PressureUnit): number {
  switch (unit) {
    case 'inHg':
      return Math.round(hPa * 0.02953 * 100) / 100;
    case 'mmHg':
      return Math.round(hPa * 0.750062 * 10) / 10;
    case 'hPa':
    default:
      return Math.round(hPa * 10) / 10;
  }
}

/**
 * Converts wind azimuth degrees (0-360) to 16-point compass quadrant string.
 */
export function getWindDirectionCompass(degrees: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ];
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return directions[index];
}

/**
 * Parse direct coordinate text input (e.g., "28.61, 77.20" or "28.61°N, 77.20°E").
 */
function parseDirectCoordinates(query: string): Coordinates | null {
  const clean = query.trim();
  const match = clean.match(
    /^\s*([-+]?(?:[1-8]?\d(?:\.\d+)?|90(?:\.0+)?))\s*([NnSs])?\s*[,\s/]\s*([-+]?(?:180(?:\.0+)?|(?:1[0-7]\d|[1-9]?\d)(?:\.\d+)?))\s*([EeWw])?\s*$/
  );

  if (!match) return null;

  let lat = parseFloat(match[1]);
  if (match[2] && match[2].toUpperCase() === 'S') lat = -Math.abs(lat);

  let lon = parseFloat(match[3]);
  if (match[4] && match[4].toUpperCase() === 'W') lon = -Math.abs(lon);

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null;
  }

  const name = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;
  return { lat, lon, name, country: 'Custom Coordinates' };
}

/**
 * Resolves place name queries into coordinates via Open-Meteo Geocoding API,
 * with caching and deterministic preset fallbacks.
 */
export async function fetchLocationCoordinates(
  query: string,
  signal?: AbortSignal
): Promise<Coordinates[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // Check direct coordinate string match
  const directCoord = parseDirectCoordinates(trimmed);
  if (directCoord) {
    return [directCoord];
  }

  const cacheKey = trimmed.toLowerCase();
  const cached = geocodingCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < GEO_CACHE_TTL) {
    return cached.data.map((item) => ({
      lat: item.latitude,
      lon: item.longitude,
      name: item.name,
      admin1: item.admin1,
      country: item.country,
    }));
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      trimmed
    )}&count=10&language=en&format=json`;

    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Geocoding API responded with HTTP status ${res.status}`);

    const json = await res.json();
    const results: SearchSuggestion[] = json.results || [];

    if (results.length > 0) {
      geocodingCache.set(cacheKey, { timestamp: Date.now(), data: results });
      return results.map((r) => ({
        lat: r.latitude,
        lon: r.longitude,
        name: r.name,
        admin1: r.admin1,
        country: r.country,
      }));
    }

    // If API returned 0 results, check local presets
    const fallbackPresets = getMatchingPresetLocations(trimmed);
    return fallbackPresets.map((r) => ({
      lat: r.latitude,
      lon: r.longitude,
      name: r.name,
      admin1: r.admin1,
      country: r.country,
    }));
  } catch (error: any) {
    if (error?.name === 'AbortError') throw error;
    console.warn('Geocoding API unavailable, using preset locations fallback:', error);
    const fallbackPresets = getMatchingPresetLocations(trimmed);
    return fallbackPresets.map((r) => ({
      lat: r.latitude,
      lon: r.longitude,
      name: r.name,
      admin1: r.admin1,
      country: r.country,
    }));
  }
}

/**
 * Fetch 7-day weather forecast, 72-hour nowcasts, and current conditions
 * from Open-Meteo Weather Forecast API with fallback to deterministic mock engine.
 */
export async function fetchWeatherForecast(
  lat: number,
  lon: number,
  name?: string,
  admin1?: string,
  country?: string,
  signal?: AbortSignal
): Promise<WeatherData> {
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_TTL) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation',
        'rain',
        'showers',
        'snowfall',
        'weather_code',
        'cloud_cover',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
        'uv_index',
        'is_day',
      ].join(','),
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'dew_point_2m',
        'apparent_temperature',
        'precipitation_probability',
        'precipitation',
        'rain',
        'showers',
        'snowfall',
        'weather_code',
        'surface_pressure',
        'cloud_cover',
        'visibility',
        'wind_speed_10m',
        'wind_direction_10m',
        'uv_index',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'apparent_temperature_max',
        'apparent_temperature_min',
        'sunrise',
        'sunset',
        'uv_index_max',
        'precipitation_sum',
        'rain_sum',
        'showers_sum',
        'snowfall_sum',
        'precipitation_hours',
        'precipitation_probability_max',
        'wind_speed_10m_max',
        'wind_gusts_10m_max',
        'wind_direction_10m_dominant',
      ].join(','),
      timezone: 'auto',
      forecast_days: '7',
    });

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, { signal });
    if (!res.ok) throw new Error(`Weather Forecast API responded with HTTP status ${res.status}`);

    const raw = await res.json();
    const transformed = transformOpenMeteoResponse(raw, { lat, lon, name, admin1, country });

    weatherCache.set(cacheKey, { timestamp: Date.now(), data: transformed });
    return transformed;
  } catch (error: any) {
    if (error?.name === 'AbortError') throw error;
    console.warn('Open-Meteo Weather API unavailable, generating realistic fallback:', error);
    return generateMockWeatherData(lat, lon, name, admin1, country);
  }
}

/**
 * Transforms raw Open-Meteo API JSON response into strictly typed WeatherData contract.
 */
function transformOpenMeteoResponse(raw: any, coordinates: Coordinates): WeatherData {
  const cur = raw.current || {};
  const hourlyRaw = raw.hourly || {};
  const dailyRaw = raw.daily || {};

  const curRain = cur.precipitation ?? cur.rain ?? 0;
  const curDbz = calculateMarshallPalmerDbz(curRain);
  const curDewPoint = (hourlyRaw.dew_point_2m && hourlyRaw.dew_point_2m[0]) ?? 16;
  const curPrecipProb = (hourlyRaw.precipitation_probability && hourlyRaw.precipitation_probability[0]) ?? (curRain > 0 ? 80 : 10);
  const curVisibility = (hourlyRaw.visibility && hourlyRaw.visibility[0]) ?? 10000;

  const current: CurrentWeather = {
    temperature: cur.temperature_2m ?? 24,
    apparentTemperature: cur.apparent_temperature ?? cur.temperature_2m ?? 24,
    relativeHumidity: cur.relative_humidity_2m ?? 50,
    precipitation: curRain,
    precipitationProbability: curPrecipProb,
    weatherCode: cur.weather_code ?? 0,
    surfacePressure: cur.surface_pressure ?? 1013,
    windSpeed: cur.wind_speed_10m ?? 8,
    windDirection: cur.wind_direction_10m ?? 0,
    windGusts: cur.wind_gusts_10m ?? (cur.wind_speed_10m ? cur.wind_speed_10m * 1.3 : 12),
    uvIndex: cur.uv_index ?? 0,
    dewPoint: curDewPoint,
    cloudCover: cur.cloud_cover ?? 20,
    visibility: curVisibility,
    isDay: cur.is_day === 1 || cur.is_day === true,
    timestamp: cur.time || new Date().toISOString(),
  };

  const hourly: HourlyForecastItem[] = [];
  const totalHourly = Math.min(hourlyRaw.time?.length || 0, 72);

  for (let i = 0; i < totalHourly; i++) {
    const rainVal = hourlyRaw.precipitation?.[i] ?? hourlyRaw.rain?.[i] ?? 0;
    const hDbz = calculateMarshallPalmerDbz(rainVal);

    hourly.push({
      time: hourlyRaw.time[i],
      temperature: hourlyRaw.temperature_2m?.[i] ?? 20,
      apparentTemperature: hourlyRaw.apparent_temperature?.[i] ?? 20,
      relativeHumidity: hourlyRaw.relative_humidity_2m?.[i] ?? 50,
      dewPoint: hourlyRaw.dew_point_2m?.[i] ?? 14,
      precipitationProbability: hourlyRaw.precipitation_probability?.[i] ?? 0,
      precipitation: rainVal,
      weatherCode: hourlyRaw.weather_code?.[i] ?? 0,
      surfacePressure: hourlyRaw.surface_pressure?.[i] ?? 1013,
      cloudCover: hourlyRaw.cloud_cover?.[i] ?? 0,
      visibility: hourlyRaw.visibility?.[i] ?? 10000,
      windSpeed: hourlyRaw.wind_speed_10m?.[i] ?? 0,
      windDirection: hourlyRaw.wind_direction_10m?.[i] ?? 0,
      uvIndex: hourlyRaw.uv_index?.[i] ?? 0,
      estimatedDbz: hDbz,
    });
  }

  const daily: DailyForecastItem[] = [];
  const totalDaily = Math.min(dailyRaw.time?.length || 0, 7);

  for (let d = 0; d < totalDaily; d++) {
    daily.push({
      date: dailyRaw.time[d],
      weatherCode: dailyRaw.weather_code?.[d] ?? 0,
      temperatureMax: dailyRaw.temperature_2m_max?.[d] ?? 28,
      temperatureMin: dailyRaw.temperature_2m_min?.[d] ?? 18,
      apparentTemperatureMax: dailyRaw.apparent_temperature_max?.[d] ?? 30,
      apparentTemperatureMin: dailyRaw.apparent_temperature_min?.[d] ?? 17,
      precipitationSum: dailyRaw.precipitation_sum?.[d] ?? 0,
      precipitationProbabilityMax: dailyRaw.precipitation_probability_max?.[d] ?? 0,
      windSpeedMax: dailyRaw.wind_speed_10m_max?.[d] ?? 15,
      windGustsMax: dailyRaw.wind_gusts_10m_max?.[d] ?? 25,
      windDirectionDominant: dailyRaw.wind_direction_10m_dominant?.[d] ?? 0,
      uvIndexMax: dailyRaw.uv_index_max?.[d] ?? 6,
      sunrise: dailyRaw.sunrise?.[d] ?? '06:00',
      sunset: dailyRaw.sunset?.[d] ?? '18:30',
    });
  }

  const stormSeverityIndex = calculateStormSeverityIndex(current, hourly);

  return {
    coordinates,
    current,
    hourly,
    daily,
    stormSeverityIndex,
    derivedDbz: curDbz,
    isFallback: false,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

/**
 * Fetch live RainViewer radar metadata index with past 2 hours and nowcast projection frames.
 */
export async function fetchRadarMetadata(signal?: AbortSignal): Promise<RadarMetadata> {
  if (cachedRadarMetadata && Date.now() - cachedRadarMetadata.timestamp < RADAR_CACHE_TTL) {
    return cachedRadarMetadata.data;
  }

  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json', { signal });
    if (!res.ok) throw new Error(`RainViewer API responded with HTTP status ${res.status}`);

    const json = await res.json();
    const host: string = json.host || 'https://tilecache.rainviewer.com';

    const past: RadarFrame[] = (json.radar?.past || []).map((frame: { time: number; path: string }) => ({
      time: frame.time,
      path: frame.path,
      isNowcast: false,
    }));

    const nowcast: RadarFrame[] = (json.radar?.nowcast || []).map((frame: { time: number; path: string }) => ({
      time: frame.time,
      path: frame.path,
      isNowcast: true,
    }));

    const metadata: RadarMetadata = {
      version: json.version || '2.0',
      generated: json.generated || Math.floor(Date.now() / 1000),
      host,
      past,
      nowcast,
      isFallback: false,
    };

    cachedRadarMetadata = { timestamp: Date.now(), data: metadata };
    return metadata;
  } catch (error: any) {
    if (error?.name === 'AbortError') throw error;
    console.warn('RainViewer API unavailable, activating simulated Doppler radar fallback:', error);
    const mockMetadata = generateMockRadarMetadata();
    return mockMetadata;
  }
}

/**
 * Constructs a standardized slippy map tile URL for a RainViewer radar frame.
 *
 * URL Schema: {host}{path}/{size}/{z}/{x}/{y}/{colorScheme}/{smooth}_{snow}.png
 */
export function getRadarTileUrl(
  host: string,
  path: string,
  z: number,
  x: number,
  y: number,
  colorScheme: RadarColorScheme | number = 2,
  smooth = true,
  snow = true,
  size: 256 | 512 = 256
): string {
  const cleanHost = host.endsWith('/') ? host.slice(0, -1) : host;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const smoothOpt = smooth ? '1' : '0';
  const snowOpt = snow ? '1' : '0';

  return `${cleanHost}${cleanPath}/${size}/${z}/${x}/${y}/${colorScheme}/${smoothOpt}_${snowOpt}.png`;
}
