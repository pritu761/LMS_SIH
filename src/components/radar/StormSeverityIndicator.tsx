'use strict';
'use client';

import React from 'react';
import {
  CurrentWeather,
  NowcastAssessment,
  HourlyForecastItem,
  WeatherSeverity,
} from '@/types/weather';
import { calculateMarshallPalmerDbz } from '@/lib/weatherService';
import { getWmoDetails } from '@/lib/wmoCodes';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  Zap,
  Wind,
  Droplets,
  Flame,
  Activity,
  CheckCircle2,
  Info,
} from 'lucide-react';

export interface StormSeverityIndicatorProps {
  stormSeverityIndex: number; // 0 - 100
  current: CurrentWeather;
  derivedDbz?: number;
  nowcast?: NowcastAssessment;
  hourly?: HourlyForecastItem[];
  className?: string;
  compact?: boolean;
}

interface SeverityClassification {
  level: WeatherSeverity;
  label: string;
  subtitle: string;
  colorHex: string;
  badgeClass: string;
  bgGradient: string;
  advice: string;
}

function classifySeverity(score: number): SeverityClassification {
  if (score >= 85) {
    return {
      level: 'extreme',
      label: 'Tornado / Severe Hail Alert',
      subtitle: 'Critical convective supercell detected',
      colorHex: '#ef4444',
      badgeClass: 'bg-red-500/20 text-red-700 dark:text-red-200 border-red-500/50 animate-pulse',
      bgGradient: 'from-red-50/90 via-white to-slate-50 dark:from-red-950/40 dark:via-red-900/20 dark:to-slate-900/40',
      advice: 'Seek fortified indoor shelter immediately. High potential for severe hail, violent downbursts, and structural damage.',
    };
  }
  if (score >= 70) {
    return {
      level: 'warning',
      label: 'Convective Storm Warning',
      subtitle: 'High-intensity thunderstorm cells active',
      colorHex: '#f97316',
      badgeClass: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/50',
      bgGradient: 'from-orange-50/90 via-white to-slate-50 dark:from-orange-950/30 dark:via-orange-900/15 dark:to-slate-900/40',
      advice: 'Strong convective precipitation and hazardous squalls in progress. Avoid open terrain and flooded transit corridors.',
    };
  }
  if (score >= 50) {
    return {
      level: 'watch',
      label: 'Severe Thunderstorm Watch',
      subtitle: 'Elevated atmospheric instability',
      colorHex: '#eab308',
      badgeClass: 'bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border-yellow-500/50',
      bgGradient: 'from-yellow-50/90 via-white to-slate-50 dark:from-yellow-950/20 dark:via-yellow-900/10 dark:to-slate-900/40',
      advice: 'Atmospheric conditions favor convective updraft escalation. Monitor live Doppler radar reflectivity trends.',
    };
  }
  if (score >= 25) {
    return {
      level: 'advisory',
      label: 'Convective Advisory',
      subtitle: 'Isolated showers and moderate wind',
      colorHex: '#38bdf8',
      badgeClass: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/40',
      bgGradient: 'from-sky-50/90 via-white to-slate-50 dark:from-sky-950/20 dark:via-sky-900/10 dark:to-slate-900/40',
      advice: 'Scattered light to moderate precipitation cells present. Normal precautions advised.',
    };
  }
  return {
    level: 'normal',
    label: 'Normal Baseline',
    subtitle: 'Stable atmospheric environment',
    colorHex: '#10b981',
    badgeClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    bgGradient: 'from-emerald-50/90 via-white to-slate-50 dark:from-emerald-950/15 dark:via-emerald-900/5 dark:to-slate-900/40',
    advice: 'No hazardous convective storm activity detected. Radar reflectivity within nominal background range.',
  };
}

export const StormSeverityIndicator: React.FC<StormSeverityIndicatorProps> = ({
  stormSeverityIndex = 0,
  current,
  derivedDbz,
  nowcast,
  hourly,
  className = '',
  compact = false,
}) => {
  const score = Math.min(100, Math.max(0, stormSeverityIndex));
  const classification = classifySeverity(score);
  const wmo = getWmoDetails(current.weatherCode);

  // Marshall-Palmer calculation details
  const rainRate = current.precipitation;
  const calculatedDbz = derivedDbz ?? calculateMarshallPalmerDbz(rainRate);
  const mpZFactor = rainRate > 0 ? (200 * Math.pow(rainRate, 1.6)).toFixed(0) : '0';

  // Gauge circle math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Factor calculations
  const windFactor = current.windGusts >= 60 ? 'Severe (60+ km/h)' : current.windGusts >= 40 ? 'Elevated' : 'Calm';
  const precipFactor = rainRate >= 10 ? 'Heavy Downpour' : rainRate >= 2.5 ? 'Moderate' : rainRate > 0 ? 'Light' : 'None';

  return (
    <div
      className={`relative bg-gradient-to-br ${classification.bgGradient} backdrop-blur-xl border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl dark:shadow-2xl text-slate-900 dark:text-slate-100 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[#c59b48]">
            {score >= 70 ? (
              <Zap className="w-5 h-5 text-red-500 dark:text-red-400 animate-pulse" />
            ) : score >= 50 ? (
              <AlertTriangle className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-[#c59b48]" />
            )}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
              <span>Convective Storm Risk Meter</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{classification.subtitle}</p>
          </div>
        </div>

        {/* Severity Badge */}
        <div className={`px-3 py-1 rounded-xl border text-xs font-bold ${classification.badgeClass}`}>
          {classification.label}
        </div>
      </div>

      {/* Main Meter & Score Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 py-2">
        {/* Radial SVG Gauge */}
        <div className="flex items-center space-x-4">
          <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Animated Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={classification.colorHex}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-white leading-none">
                {score}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                / 100
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Composite Risk Index: <strong className="text-slate-900 dark:text-white">{score}%</strong>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
              {classification.advice}
            </p>
          </div>
        </div>

        {/* Radar dBZ Telemetry Box */}
        <div className="p-3 bg-slate-50/90 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-1.5 sm:w-60 flex-shrink-0">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center space-x-1">
              <Radio className="w-3.5 h-3.5 text-[#c59b48]" />
              <span>Doppler Return</span>
            </span>
            <span className="font-mono font-bold text-[#9a7224] dark:text-amber-300 text-sm">
              {calculatedDbz.toFixed(0)} dBZ
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                calculatedDbz >= 55
                  ? 'bg-purple-600'
                  : calculatedDbz >= 45
                  ? 'bg-red-500'
                  : calculatedDbz >= 30
                  ? 'bg-amber-400'
                  : calculatedDbz >= 15
                  ? 'bg-cyan-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (calculatedDbz / 75) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[9px] font-mono text-slate-400 dark:text-slate-500 pt-0.5">
            <span>0 dBZ</span>
            <span>35 dBZ</span>
            <span>75 dBZ</span>
          </div>
        </div>
      </div>

      {/* Marshall-Palmer Radar Reflectivity Relationship Callout */}
      <div className="mt-4 p-3 bg-slate-50/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/90 rounded-xl text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-[#9a7224] dark:text-amber-300 flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-[#c59b48]" />
            <span>Marshall-Palmer Z-R Formulation (Z = 200 · R^1.6)</span>
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            R = {rainRate.toFixed(1)} mm/h &rarr; Z &approx; {mpZFactor} mm⁶/m³
          </span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
          Calculates estimated radar reflectivity dBZ = 10 · log₁₀(Z) ≈ 23.01 + 16 · log₁₀(R) correlating precipitation rate with Doppler radar returns.
        </p>
      </div>

      {/* 4-Pillar Convective Risk Assessment Grid */}
      {!compact && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-1">
          <div className="p-2.5 bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-lg">
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Synoptic Code</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {wmo.label} ({current.weatherCode})
            </div>
          </div>

          <div className="p-2.5 bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-lg">
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Wind Gusts</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
              {current.windGusts} km/h • {windFactor}
            </div>
          </div>

          <div className="p-2.5 bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-lg">
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Precipitation Rate</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
              {rainRate} mm/h • {precipFactor}
            </div>
          </div>

          <div className="p-2.5 bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-lg">
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Convective Core</div>
            <div className="text-xs font-bold text-[#9a7224] dark:text-amber-300 mt-0.5 font-mono">
              {calculatedDbz.toFixed(0)} dBZ
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StormSeverityIndicator;
