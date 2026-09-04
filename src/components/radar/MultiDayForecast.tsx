'use strict';
'use client';

import React, { useState } from 'react';
import {
  DailyForecastItem,
  WeatherUnitsPreference,
} from '@/types/weather';
import {
  convertTemperature,
  convertWindSpeed,
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
  Sunrise,
  Sunset,
  Droplets,
  Calendar,
  ChevronDown,
  ChevronUp,
  Thermometer,
  Compass,
} from 'lucide-react';

export interface MultiDayForecastProps {
  daily: DailyForecastItem[];
  units?: WeatherUnitsPreference;
  className?: string;
  onDaySelect?: (day: DailyForecastItem) => void;
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

export const MultiDayForecast: React.FC<MultiDayForecastProps> = ({
  daily = [],
  units = DEFAULT_UNITS,
  className = '',
  onDaySelect,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!daily || daily.length === 0) {
    return null;
  }

  // Calculate the overall minimum and maximum temperatures across the 7-day period for the relative temperature range bars
  const weekMin = Math.min(...daily.map((d) => d.temperatureMin));
  const weekMax = Math.max(...daily.map((d) => d.temperatureMax));
  const tempSpan = Math.max(1, weekMax - weekMin);

  const tempSymbol = units.temperature === 'fahrenheit' ? '°F' : '°C';
  const windUnitSymbol = units.windSpeed === 'mph' ? 'mph' : units.windSpeed === 'ms' ? 'm/s' : units.windSpeed === 'knots' ? 'kts' : 'km/h';

  const toggleExpand = (idx: number, day: DailyForecastItem) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
    if (onDaySelect) {
      onDaySelect(day);
    }
  };

  return (
    <div className={`relative bg-white dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl dark:shadow-2xl text-slate-900 dark:text-slate-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-[#c59b48]" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            7-Day Synoptic Outlook
          </h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Extended Forecast & Range
        </span>
      </div>

      {/* Daily Cards List */}
      <div className="space-y-2">
        {daily.map((day, idx) => {
          const isToday = idx === 0;
          const isExpanded = expandedIndex === idx;
          const dateObj = new Date(day.date);
          const weekdayName = isToday
            ? 'Today'
            : dateObj.toLocaleDateString([], { weekday: 'short' });
          const formattedDate = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
          const wmo = getWmoDetails(day.weatherCode);

          const maxTemp = convertTemperature(day.temperatureMax, units.temperature);
          const minTemp = convertTemperature(day.temperatureMin, units.temperature);
          const maxWind = convertWindSpeed(day.windSpeedMax, units.windSpeed);
          const maxGusts = convertWindSpeed(day.windGustsMax, units.windSpeed);
          const windDirCompass = getWindDirectionCompass(day.windDirectionDominant);

          // Bar positioning
          const leftPercent = Math.max(0, Math.min(100, ((day.temperatureMin - weekMin) / tempSpan) * 100));
          const widthPercent = Math.max(8, Math.min(100 - leftPercent, ((day.temperatureMax - day.temperatureMin) / tempSpan) * 100));

          return (
            <div
              key={day.date}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'bg-slate-100/90 dark:bg-slate-800/80 border-[#c59b48]/60 shadow-md'
                  : isToday
                  ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Main Summary Row */}
              <div
                onClick={() => toggleExpand(idx, day)}
                className="p-3 sm:px-4 flex items-center justify-between cursor-pointer gap-2 select-none"
              >
                {/* Date & Weekday */}
                <div className="w-24 sm:w-28 flex-shrink-0">
                  <div className={`text-sm font-bold ${isToday ? 'text-[#9a7224] dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                    {weekdayName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{formattedDate}</div>
                </div>

                {/* Weather Condition Icon & Label */}
                <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                  <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-950/40 flex-shrink-0">
                    {renderWmoIcon(wmo.iconName, 'w-5 h-5')}
                  </div>
                  <div className="min-w-0 hidden xs:block">
                    <span className="text-xs text-slate-700 dark:text-slate-200 font-medium truncate block">
                      {wmo.label}
                    </span>
                    {day.precipitationProbabilityMax > 0 && (
                      <span className="text-[10px] text-cyan-600 dark:text-cyan-300 flex items-center space-x-1">
                        <Droplets className="w-2.5 h-2.5" />
                        <span>{day.precipitationProbabilityMax}% precip ({day.precipitationSum} mm)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Min / Max Temperature with Visual Range Bar */}
                <div className="flex items-center space-x-3 w-40 sm:w-52 flex-shrink-0 justify-end">
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 text-right w-8">
                    {minTemp}°
                  </span>

                  <div className="flex-1 bg-slate-200 dark:bg-slate-800/80 h-2 rounded-full relative overflow-hidden hidden sm:block">
                    <div
                      className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-red-400 shadow-sm"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white text-left w-8">
                    {maxTemp}°
                  </span>

                  <div className="text-slate-400 pl-1">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#c59b48]" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Day Details Drawer */}
              {isExpanded && (
                <div className="px-3 sm:px-4 pb-3 pt-1 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60 text-xs animate-fadeIn">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
                    {/* Sunrise & Sunset */}
                    <div className="p-2.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center space-x-2.5">
                      <Sunrise className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">Sunrise / Sunset</div>
                        <div className="font-mono text-slate-800 dark:text-slate-200">
                          {day.sunrise || '06:05'} • {day.sunset || '18:40'}
                        </div>
                      </div>
                    </div>

                    {/* Precipitation Accumulation */}
                    <div className="p-2.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center space-x-2.5">
                      <Droplets className="w-4 h-4 text-cyan-500 dark:text-cyan-400 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">Precip Accumulation</div>
                        <div className="font-mono text-cyan-600 dark:text-cyan-300">
                          {day.precipitationSum} mm ({day.precipitationProbabilityMax}% prob)
                        </div>
                      </div>
                    </div>

                    {/* Wind Extremes */}
                    <div className="p-2.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center space-x-2.5">
                      <Wind className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">Max Wind / Gusts</div>
                        <div className="font-mono text-slate-800 dark:text-slate-200">
                          {maxWind} {windUnitSymbol} ({windDirCompass})
                        </div>
                      </div>
                    </div>

                    {/* UV Solar Peak */}
                    <div className="p-2.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center space-x-2.5">
                      <Sun className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">Peak UV Index</div>
                        <div className="font-mono text-[#9a7224] dark:text-amber-300 font-bold">
                          {day.uvIndexMax} / 12
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultiDayForecast;
