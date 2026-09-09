/**
 * Core Weather & Radar Domain Types
 * Compliant with PROJECT.md Interface Contracts and WMO 4677 standard
 */

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
  estimatedDbz?: number;
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
  lastUpdated?: string;
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

export interface WmoCodeInfo {
  code: number;
  label: string;
  description: string;
  category: WeatherCategory;
  severity: WeatherSeverity;
  iconName: string;
  badgeClass: string;
  estRadarDbz: number;
}

export type WmoWeatherCodeInfo = WmoCodeInfo;

export interface SearchSuggestion {
  id: number | string;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  countryCode?: string;
  admin1?: string;
  admin2?: string;
  elevation?: number;
  timezone?: string;
  population?: number;
}

export type GeocodingLocation = SearchSuggestion;

export type RadarColorScheme = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type BasemapType = 'dark' | 'light' | 'voyager' | 'osm' | 'satellite';

export interface RadarLayerSettings {
  colorScheme: RadarColorScheme;
  smooth: boolean;
  snow: boolean;
  opacity: number;
  tileSize: 256 | 512;
  basemap: BasemapType;
  showRangeRings?: boolean;
  showStormCells?: boolean;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'ms' | 'knots';
export type PressureUnit = 'hPa' | 'inHg' | 'mmHg';

export interface WeatherUnitsPreference {
  temperature: TemperatureUnit;
  windSpeed: WindSpeedUnit;
  pressure: PressureUnit;
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
  next6Hours?: HourlyForecastItem[];
}
