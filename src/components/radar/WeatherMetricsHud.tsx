'use strict';
'use client';

import React, { useState } from 'react';
import {
  WeatherData,
  WeatherUnitsPreference,
  TemperatureUnit,
  WindSpeedUnit,
  PressureUnit,
} from '@/types/weather';
import {
  convertTemperature,
  convertWindSpeed,
  convertPressure,
  getWindDirectionCompass,
} from '@/lib/weatherService';
import { getWmoDetails } from '@/lib/wmoCodes';
import {
  Sun,
  SunMedium,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudHail,
  Zap,
  Wind,
  Tornado,
  Droplets,
  Gauge,
  Eye,
  Compass,
  ArrowUp,
  ArrowDown,
  CloudRainWind,
  Layers,
  Thermometer,
  ShieldAlert,
  Radio,
  SlidersHorizontal,
  Info,
} from 'lucide-react';

export interface WeatherMetricsHudProps {
  weatherData: WeatherData | null;
  units?: WeatherUnitsPreference;
  onUnitsChange?: (units: WeatherUnitsPreference) => void;
  isLoading?: boolean;
  className?: string;
  showLocationHeader?: boolean;
}

const DEFAULT_UNITS: WeatherUnitsPreference = {
  temperature: 'celsius',
  windSpeed: 'kmh',
  pressure: 'hPa',
};

// Helper for rendering WMO Lucide Icon
function renderWmoIcon(iconName: string, className = 'w-6 h-6') {
  switch (iconName) {
    case 'Sun':
      return <Sun className={`${className} text-amber-400`} />;
    case 'SunMedium':
      return <SunMedium className={`${className} text-amber-400`} />;
    case 'CloudSun':
      return <CloudSun className={`${className} text-sky-400`} />;
    case 'Cloud':
      return <Cloud className={`${className} text-slate-300`} />;
    case 'CloudFog':
      return <CloudFog className={`${className} text-zinc-400`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={`${className} text-blue-400`} />;
    case 'CloudRain':
      return <CloudRain className={`${className} text-cyan-400`} />;
    case 'CloudSnow':
      return <CloudSnow className={`${className} text-teal-300`} />;
    case 'CloudLightning':
      return <CloudLightning className={`${className} text-purple-400`} />;
    case 'CloudHail':
      return <CloudHail className={`${className} text-pink-400`} />;
    case 'Zap':
      return <Zap className={`${className} text-red-400 animate-pulse`} />;
    case 'Wind':
      return <Wind className={`${className} text-orange-400`} />;
    case 'Tornado':
      return <Tornado className={`${className} text-red-500 animate-bounce`} />;
    default:
      return <Cloud className={`${className} text-slate-400`} />;
  }
}

// UV Danger classification
function getUvClassification(uv: number) {
  if (uv < 3) return { label: 'Low', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  if (uv < 6) return { label: 'Moderate', badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
  if (uv < 8) return { label: 'High', badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
  if (uv < 11) return { label: 'Very High', badgeClass: 'bg-red-500/20 text-red-300 border-red-500/30' };
  return { label: 'Extreme', badgeClass: 'bg-purple-600/30 text-purple-200 border-purple-500/40 animate-pulse' };
}

// Humidity rating
function getHumidityRating(humidity: number) {
  if (humidity < 30) return 'Dry';
  if (humidity <= 60) return 'Comfortable';
  if (humidity <= 80) return 'Humid';
  return 'Saturated';
}

export const WeatherMetricsHud: React.FC<WeatherMetricsHudProps> = ({
  weatherData,
  units = DEFAULT_UNITS,
  onUnitsChange,
  isLoading = false,
  className = '',
  showLocationHeader = true,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  // Fallback / Loading Skeleton
  if (isLoading || !weatherData) {
    return (
      <div className={`p-4 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl animate-pulse space-y-4 ${className}`}>
        <div className="h-7 w-48 bg-slate-800 rounded-lg" />
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-8 w-24 bg-slate-800 rounded-lg" />
            <div className="h-4 w-32 bg-slate-800 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-800/60 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const { current, daily, coordinates, stormSeverityIndex, derivedDbz, isFallback, lastUpdated } = weatherData;
  const wmo = getWmoDetails(current.weatherCode);

  // Derived Temp Min/Max for today
  const todayForecast = daily && daily.length > 0 ? daily[0] : null;
  const maxTemp = todayForecast ? todayForecast.temperatureMax : current.temperature + 4;
  const minTemp = todayForecast ? todayForecast.temperatureMin : current.temperature - 5;

  // Temperature conversions
  const curTempFormatted = convertTemperature(current.temperature, units.temperature);
  const feelsLikeFormatted = convertTemperature(current.apparentTemperature, units.temperature);
  const maxTempFormatted = convertTemperature(maxTemp, units.temperature);
  const minTempFormatted = convertTemperature(minTemp, units.temperature);
  const dewPointFormatted = convertTemperature(current.dewPoint, units.temperature);
  const tempUnitSymbol = units.temperature === 'fahrenheit' ? '°F' : '°C';

  // Wind speed conversions
  const windSpeedFormatted = convertWindSpeed(current.windSpeed, units.windSpeed);
  const windGustsFormatted = convertWindSpeed(current.windGusts, units.windSpeed);
  const windUnitSymbol = units.windSpeed === 'mph' ? 'mph' : units.windSpeed === 'ms' ? 'm/s' : units.windSpeed === 'knots' ? 'kts' : 'km/h';
  const windDirCompass = getWindDirectionCompass(current.windDirection);

  // Pressure conversions
  const pressureFormatted = convertPressure(current.surfacePressure, units.pressure);
  const pressureUnitSymbol = units.pressure;

  // Visibility formatted (km / mi)
  const visibilityKm = (current.visibility / 1000).toFixed(1);
  const visibilityMi = (current.visibility * 0.000621371).toFixed(1);
  const visibilityFormatted = units.windSpeed === 'mph' ? `${visibilityMi} mi` : `${visibilityKm} km`;

  const uvClass = getUvClassification(current.uvIndex);

  const handleUnitToggle = (
    category: keyof WeatherUnitsPreference,
    value: TemperatureUnit | WindSpeedUnit | PressureUnit
  ) => {
    if (onUnitsChange) {
      onUnitsChange({
        ...units,
        [category]: value,
      });
    }
  };

  return (
    <div className={`relative bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl text-slate-100 ${className}`}>
      {/* Offline / Fallback Badge */}
      {isFallback && (
        <div className="mb-3 px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Procedural Telemetry Active (Offline Resilient Mode)</span>
          </div>
          {lastUpdated && <span className="text-[10px] text-amber-400/80 font-mono">{lastUpdated}</span>}
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        {showLocationHeader && (
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {coordinates.name || 'Selected Target'}
              </h2>
              {coordinates.country && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-800 text-amber-300 border border-slate-700">
                  {coordinates.country}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {coordinates.admin1 ? `${coordinates.admin1} • ` : ''}
              <span className="font-mono text-slate-400">
                {coordinates.lat.toFixed(2)}°N, {coordinates.lon.toFixed(2)}°E
              </span>
            </p>
          </div>
        )}

        {/* Quick Unit Preference Switcher Button */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 transition-colors"
            title="Toggle Weather Metric Units"
            aria-label="Unit preferences"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Unit Settings Dropdown Bar */}
      {showSettings && (
        <div className="mb-4 p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Temperature:</span>
            <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => handleUnitToggle('temperature', 'celsius')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  units.temperature === 'celsius'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                °C
              </button>
              <button
                type="button"
                onClick={() => handleUnitToggle('temperature', 'fahrenheit')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  units.temperature === 'fahrenheit'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                °F
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Wind Speed:</span>
            <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
              {(['kmh', 'mph', 'ms', 'knots'] as WindSpeedUnit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => handleUnitToggle('windSpeed', u)}
                  className={`px-2 py-0.5 rounded-md uppercase text-[10px] transition-all ${
                    units.windSpeed === u
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Barometric Pressure:</span>
            <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
              {(['hPa', 'inHg', 'mmHg'] as PressureUnit[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleUnitToggle('pressure', p)}
                  className={`px-2 py-0.5 rounded-md text-[10px] transition-all ${
                    units.pressure === p
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Temperature & Primary Condition Showcase */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl shadow-inner flex items-center justify-center">
            {renderWmoIcon(wmo.iconName, 'w-12 h-12')}
          </div>
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
                {curTempFormatted}
              </span>
              <span className="text-2xl text-amber-400 font-semibold">{tempUnitSymbol}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-300 mt-0.5">
              <span>Feels like <strong className="text-white">{feelsLikeFormatted}{tempUnitSymbol}</strong></span>
              <span>•</span>
              <div className="flex items-center space-x-1 text-slate-400">
                <ArrowUp className="w-3 h-3 text-red-400" />
                <span>{maxTempFormatted}°</span>
                <ArrowDown className="w-3 h-3 text-sky-400" />
                <span>{minTempFormatted}°</span>
              </div>
            </div>
          </div>
        </div>

        {/* Condition Badge & Radar Reflectivity Badge */}
        <div className="flex flex-col sm:items-end space-y-1.5">
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center space-x-2 ${wmo.badgeClass}`}>
            <span>{wmo.label}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-[11px]">
              <Radio className="w-3 h-3 text-amber-400" />
              <span>Est. Radar: <strong className="text-amber-300 font-mono">{derivedDbz} dBZ</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* Glassmorphic 8-Card Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
        {/* 1. Relative Humidity */}
        <div className="p-3 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-xl transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center space-x-1">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>Humidity</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium">{getHumidityRating(current.relativeHumidity)}</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">{current.relativeHumidity}%</div>
          <div className="w-full bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${current.relativeHumidity}%` }}
            />
          </div>
        </div>

        {/* 2. Precipitation Probability & Rain Rate */}
        <div className="p-3 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-xl transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center space-x-1">
              <CloudRainWind className="w-3.5 h-3.5 text-cyan-400" />
              <span>Precipitation</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{current.precipitation} mm/h</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {current.precipitationProbability}%
          </div>
          <div className="w-full bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${current.precipitationProbability}%` }}
            />
          </div>
        </div>

        {/* 3. Wind Velocity & Compass Dial */}
        <div className="p-3 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-xl transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center space-x-1">
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              <span>Wind</span>
            </span>
            <div className="flex items-center space-x-1 text-[11px] font-mono text-amber-300">
              <Compass
                className="w-3 h-3 text-amber-400 transition-transform duration-500"
                style={{ transform: `rotate(${current.windDirection}deg)` }}
              />
              <span>{windDirCompass}</span>
            </div>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {windSpeedFormatted} <span className="text-xs font-normal text-slate-400">{windUnitSymbol}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate">
            Gusts: <strong className="text-slate-200">{windGustsFormatted} {windUnitSymbol}</strong>
          </div>
        </div>

        {/* 4. UV Solar Index */}
        <div className="p-3 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-xl transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center space-x-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>UV Index</span>
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${uvClass.badgeClass}`}>
              {uvClass.label}
            </span>
          </div>
          <div className="text-lg font-bold text-white font-mono">{current.uvIndex} <span className="text-xs text-slate-500 font-normal">/ 12</span></div>
          <div className="w-full bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (current.uvIndex / 11) * 100)}%` }}
            />
          </div>
        </div>

        {/* 5. Barometric Pressure */}
        <div className="p-3 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-xl transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center space-x-1">
              <Gauge className="w-3.5 h-3.5 text-purple-400" />
              <span>Pressure</span>
            </span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {pressureFormatted} <span className="text-xs font-normal text-slate-400">{pressureUnitSymbol}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {current.surfacePressure >= 1013 ? 'High pressure system' : 'Low pressure trough'}
          </div>
        </div>

        {/* 6. Dew Point */}
        <div className="p-3 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-xl transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center space-x-1">
              <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dew Point</span>
            </span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {dewPointFormatted}{tempUnitSymbol}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {current.dewPoint > 21 ? 'Muggy / Sticky' : current.dewPoint > 15 ? 'Pleasant' : 'Crisp & Dry'}
          </div>
        </div>

        {/* 7. Cloud Cover */}
        <div className="p-3 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-xl transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-sky-300" />
              <span>Cloud Cover</span>
            </span>
          </div>
          <div className="text-lg font-bold text-white font-mono">{current.cloudCover}%</div>
          <div className="w-full bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-sky-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${current.cloudCover}%` }}
            />
          </div>
        </div>

        {/* 8. Visibility */}
        <div className="p-3 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-xl transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5 text-amber-300" />
              <span>Visibility</span>
            </span>
          </div>
          <div className="text-lg font-bold text-white font-mono">{visibilityFormatted}</div>
          <div className="text-[10px] text-slate-400 mt-1">
            {current.visibility >= 10000 ? 'Clear horizon' : current.visibility >= 4000 ? 'Moderate haze' : 'Dense obstruction'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherMetricsHud;
