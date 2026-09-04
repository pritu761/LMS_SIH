'use strict';
'use client';

import React, { useState, useRef } from 'react';
import {
  HourlyForecastItem,
  CurrentWeather,
  WeatherUnitsPreference,
  NowcastAssessment,
} from '@/types/weather';
import { convertTemperature, convertWindSpeed } from '@/lib/weatherService';
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
  CloudRainWind,
  Radio,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  Eye,
  Layers,
  Thermometer,
  Compass,
} from 'lucide-react';

export interface HourlyNowcastStripProps {
  hourly: HourlyForecastItem[];
  currentWeather?: CurrentWeather;
  units?: WeatherUnitsPreference;
  nowcast?: NowcastAssessment;
  className?: string;
  maxHours?: number;
}

const DEFAULT_UNITS: WeatherUnitsPreference = {
  temperature: 'celsius',
  windSpeed: 'kmh',
  pressure: 'hPa',
};

function renderWmoIcon(iconName: string, className = 'w-5 h-5') {
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

export const HourlyNowcastStrip: React.FC<HourlyNowcastStripProps> = ({
  hourly = [],
  currentWeather,
  units = DEFAULT_UNITS,
  nowcast,
  className = '',
  maxHours = 48,
}) => {
  const [selectedHourIdx, setSelectedHourIdx] = useState<number | null>(null);
  const [viewWindow, setViewWindow] = useState<12 | 24 | 48>(24);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const displayedHours = hourly.slice(0, Math.min(hourly.length, viewWindow));

  // Compute 6-hour nowcast summary if not explicitly provided
  const next6 = hourly.slice(0, 6);
  const peakProb6h = nowcast?.peakPrecipProbability6h ?? Math.max(...next6.map((h) => h.precipitationProbability), 0);
  const peakRain6h = nowcast?.peakPrecipRate6h ?? Math.max(...next6.map((h) => h.precipitation), 0);
  const peakDbz6h = nowcast?.peakDbz6h ?? Math.max(...next6.map((h) => h.estimatedDbz ?? 0), 0);

  let nowcastBadgeText = 'Clear conditions projected over the next 6 hours';
  let nowcastBadgeStyle = 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30';

  if (currentWeather && currentWeather.precipitation > 0) {
    nowcastBadgeText = `Active precipitation underway (${currentWeather.precipitation.toFixed(1)} mm/h, ~${(currentWeather.precipitation > 0 ? (23 + 16 * Math.log10(currentWeather.precipitation)).toFixed(0) : '0')} dBZ)`;
    nowcastBadgeStyle = 'bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-500/40';
  } else if (peakRain6h > 10 || peakProb6h >= 75) {
    const firstRain = next6.findIndex((h) => h.precipitationProbability >= 60 || h.precipitation > 0.5);
    const targetTime = firstRain >= 0 ? new Date(next6[firstRain].time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : 'within 2h';
    nowcastBadgeText = `Heavy precipitation likely around ${targetTime} (${peakProb6h}% chance, peak ${peakRain6h.toFixed(1)} mm/h)`;
    nowcastBadgeStyle = 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40';
  } else if (peakProb6h >= 40 || peakRain6h > 0.2) {
    const firstRain = next6.findIndex((h) => h.precipitationProbability >= 40);
    const targetTime = firstRain >= 0 ? new Date(next6[firstRain].time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : 'within 3h';
    nowcastBadgeText = `Scattered showers possible around ${targetTime} (${peakProb6h}% probability)`;
    nowcastBadgeStyle = 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-500/30';
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  const tempSymbol = units.temperature === 'fahrenheit' ? '°F' : '°C';
  const windUnitSymbol = units.windSpeed === 'mph' ? 'mph' : units.windSpeed === 'ms' ? 'm/s' : units.windSpeed === 'knots' ? 'kts' : 'km/h';

  const activeHour = selectedHourIdx !== null && selectedHourIdx < displayedHours.length ? displayedHours[selectedHourIdx] : null;

  return (
    <div className={`relative bg-white dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl dark:shadow-2xl text-slate-900 dark:text-slate-100 ${className}`}>
      {/* Top Header & Window Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#c59b48]" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Hourly Nowcast & Progression
          </h3>
        </div>

        {/* View Window Range Toggle */}
        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-950/80 p-0.5 border border-slate-200 dark:border-slate-800 text-xs">
            {([12, 24, 48] as const).map((hours) => (
              <button
                key={hours}
                type="button"
                onClick={() => {
                  setViewWindow(hours);
                  setSelectedHourIdx(null);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewWindow === hours
                    ? 'bg-[#c59b48] text-[#0b1e36] font-bold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {hours}h
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center space-x-1">
            <button
              type="button"
              onClick={scrollLeft}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Immediate 6-Hour Nowcast Summary Banner */}
      <div className={`mb-3.5 px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 shadow-sm ${nowcastBadgeStyle}`}>
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{nowcast?.onsetSummary || nowcastBadgeText}</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-mono flex-shrink-0">
          <span className="flex items-center space-x-1 text-cyan-600 dark:text-cyan-300">
            <CloudRainWind className="w-3.5 h-3.5" />
            <span>Peak: {peakProb6h}%</span>
          </span>
          <span className="flex items-center space-x-1 text-[#9a7224] dark:text-amber-300">
            <Radio className="w-3.5 h-3.5" />
            <span>Max dBZ: {peakDbz6h.toFixed(0)}</span>
          </span>
        </div>
      </div>

      {/* Horizontally Scrollable Timeline Strip */}
      <div
        ref={scrollContainerRef}
        className="flex space-x-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent select-none"
      >
        {displayedHours.map((hour, idx) => {
          const isSelected = selectedHourIdx === idx;
          const isCurrentHour = idx === 0;
          const dateObj = new Date(hour.time);
          const timeLabel = isCurrentHour
            ? 'Now'
            : dateObj.toLocaleTimeString([], { hour: 'numeric', hour12: true });
          const dayLabel = dateObj.toLocaleDateString([], { weekday: 'short' });
          const wmo = getWmoDetails(hour.weatherCode);
          const tempVal = convertTemperature(hour.temperature, units.temperature);
          const windVal = convertWindSpeed(hour.windSpeed, units.windSpeed);

          return (
            <div
              key={`${hour.time}-${idx}`}
              onClick={() => setSelectedHourIdx(isSelected ? null : idx)}
              className={`flex-shrink-0 w-24 sm:w-28 p-2.5 rounded-xl border flex flex-col items-center justify-between cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-[#c59b48]/20 border-[#c59b48] shadow-md ring-1 ring-[#c59b48]/50'
                  : isCurrentHour
                  ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              {/* Hour & Day Timestamp */}
              <div className="text-center mb-1">
                <span className={`text-xs font-semibold block ${isCurrentHour ? 'text-[#9a7224] dark:text-amber-400 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                  {timeLabel}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {dayLabel}
                </span>
              </div>

              {/* Weather Icon */}
              <div className="my-1.5 p-1 rounded-lg bg-slate-200/60 dark:bg-slate-950/40">
                {renderWmoIcon(wmo.iconName, 'w-6 h-6')}
              </div>

              {/* Temperature Badge */}
              <div className="text-sm font-bold text-slate-900 dark:text-white font-mono my-0.5">
                {tempVal}{tempSymbol}
              </div>

              {/* Precipitation Probability Bar & Label */}
              <div className="w-full mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] text-cyan-600 dark:text-cyan-300 font-mono mb-1">
                  <span className="flex items-center space-x-0.5">
                    <Droplets className="w-2.5 h-2.5" />
                    <span>{hour.precipitationProbability}%</span>
                  </span>
                  {hour.precipitation > 0 && (
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">
                      {hour.precipitation}mm
                    </span>
                  )}
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      hour.precipitationProbability > 70
                        ? 'bg-purple-500'
                        : hour.precipitationProbability > 40
                        ? 'bg-blue-500'
                        : hour.precipitationProbability > 15
                        ? 'bg-cyan-500 dark:bg-cyan-400'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    style={{ width: `${hour.precipitationProbability}%` }}
                  />
                </div>
              </div>

              {/* Wind Speed Subtitle */}
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center space-x-1">
                <Wind className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400" />
                <span>{windVal} {windUnitSymbol}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Hour Telemetry Inspector Popover */}
      {activeHour && (
        <div className="mt-3 p-3.5 bg-white dark:bg-slate-950/90 border border-[#c59b48]/40 rounded-xl shadow-xl animate-fadeIn text-xs text-slate-800 dark:text-slate-300">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-[#c59b48] text-[#0b1e36] font-bold text-xs">
                {new Date(activeHour.time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                {new Date(activeHour.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">{getWmoDetails(activeHour.weatherCode).label}</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedHourIdx(null)}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 dark:text-slate-300">
            <div className="flex items-center space-x-2 p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg">
              <Thermometer className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
              <div>
                <div className="text-[10px] text-slate-500">Feels Like</div>
                <div className="font-mono font-bold text-slate-900 dark:text-white">{convertTemperature(activeHour.apparentTemperature, units.temperature)}{tempSymbol}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg">
              <Droplets className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <div>
                <div className="text-[10px] text-slate-500">Humidity / Dew Pt</div>
                <div className="font-mono font-bold text-slate-900 dark:text-white">{activeHour.relativeHumidity}% • {convertTemperature(activeHour.dewPoint, units.temperature)}{tempSymbol}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg">
              <Layers className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <div>
                <div className="text-[10px] text-slate-500">Cloud Cover / UV</div>
                <div className="font-mono font-bold text-slate-900 dark:text-white">{activeHour.cloudCover}% • UV {activeHour.uvIndex}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg">
              <Radio className="w-3.5 h-3.5 text-[#c59b48]" />
              <div>
                <div className="text-[10px] text-slate-500">Est. Radar / Precip</div>
                <div className="font-mono font-bold text-[#9a7224] dark:text-amber-300">{activeHour.estimatedDbz ?? 0} dBZ • {activeHour.precipitation} mm</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HourlyNowcastStrip;
