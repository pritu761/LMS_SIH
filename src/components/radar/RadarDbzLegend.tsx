'use client';

import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Droplets, AlertTriangle } from 'lucide-react';
import { RadarColorScheme } from '@/types/weather';

export interface DbzScaleStep {
  dbz: string;
  minDbz: number;
  maxDbz: number;
  color: string;
  nexradColor: string;
  label: string;
  rainRate: string;
  description: string;
  severity: 'clear' | 'minor' | 'moderate' | 'heavy' | 'severe' | 'extreme';
}

export const DBZ_SCALE_STEPS: DbzScaleStep[] = [
  {
    dbz: '10',
    minDbz: 10,
    maxDbz: 20,
    color: '#00a3e0',
    nexradColor: '#04e9e7',
    label: 'Drizzle',
    rainRate: '0.1 - 1.0 mm/h',
    description: 'Very light drizzle, virga, or coastal mist.',
    severity: 'minor',
  },
  {
    dbz: '20',
    minDbz: 20,
    maxDbz: 30,
    color: '#1c47e8',
    nexradColor: '#00cc31',
    label: 'Light Rain',
    rainRate: '1.0 - 2.5 mm/h',
    description: 'Light steady rain showers, wet pavement.',
    severity: 'minor',
  },
  {
    dbz: '30',
    minDbz: 30,
    maxDbz: 40,
    color: '#c80f86',
    nexradColor: '#ffff00',
    label: 'Moderate',
    rainRate: '2.5 - 7.5 mm/h',
    description: 'Moderate steady rain, widespread stratiform precipitation.',
    severity: 'moderate',
  },
  {
    dbz: '40',
    minDbz: 40,
    maxDbz: 50,
    color: '#d2883b',
    nexradColor: '#ff9200',
    label: 'Heavy Rain',
    rainRate: '7.5 - 25.0 mm/h',
    description: 'Heavy torrential downpour, reduced visibility, water ponding.',
    severity: 'heavy',
  },
  {
    dbz: '50',
    minDbz: 50,
    maxDbz: 60,
    color: '#fe9a58',
    nexradColor: '#ff0000',
    label: 'Severe Storm',
    rainRate: '25.0 - 50.0 mm/h',
    description: 'Severe convective storm, intense lightning, wind squalls.',
    severity: 'severe',
  },
  {
    dbz: '60+',
    minDbz: 60,
    maxDbz: 75,
    color: '#fd341c',
    nexradColor: '#ff00ff',
    label: 'Extreme / Hail',
    rainRate: '> 50.0 mm/h',
    description: 'Violent convective core, large damaging hail, severe microburst.',
    severity: 'extreme',
  },
];

export interface RadarDbzLegendProps {
  currentDbz?: number;
  colorScheme?: RadarColorScheme | number;
  className?: string;
  compact?: boolean;
}

export function RadarDbzLegend({
  currentDbz,
  colorScheme = 2,
  className = '',
  compact = false,
}: RadarDbzLegendProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [hoveredStep, setHoveredStep] = useState<DbzScaleStep | null>(null);

  const isNexrad = colorScheme === 6;

  // Find matching step for currentDbz
  const activeStep = currentDbz !== undefined && currentDbz >= 10
    ? DBZ_SCALE_STEPS.find((s) => currentDbz >= s.minDbz && (currentDbz < s.maxDbz || s.maxDbz === 75))
    : null;

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl p-3 text-slate-900 dark:text-white select-none transition-all duration-300 ${className}`}
      role="region"
      aria-label="Meteorological Radar dBZ Reflectivity Legend"
    >
      {/* Header with expand/collapse toggle */}
      <div
        className="flex items-center justify-between gap-2 cursor-pointer"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          <span className="text-xs font-bold tracking-wider font-mono text-slate-800 dark:text-slate-200">
            REFLECTIVITY (dBZ)
          </span>
          {currentDbz !== undefined && (
            <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#c59b48]/20 text-[#9a7224] dark:text-amber-300 border border-[#c59b48]/30">
              {currentDbz.toFixed(1)} dBZ
            </span>
          )}
        </div>

        <button
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 rounded transition"
          aria-label={isExpanded ? 'Collapse Legend' : 'Expand Legend'}
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Horizontal Continuous Color Band */}
      <div className="mt-2 relative">
        <div className="flex items-center h-3 rounded-full overflow-hidden w-full border border-slate-300 dark:border-slate-700/80 shadow-inner">
          {DBZ_SCALE_STEPS.map((step, idx) => {
            const stepColor = isNexrad ? step.nexradColor : step.color;
            const isHovered = hoveredStep?.dbz === step.dbz;
            const isActive = activeStep?.dbz === step.dbz;

            return (
              <div
                key={idx}
                className={`flex-1 h-full cursor-pointer transition-all duration-150 relative ${
                  isHovered || isActive ? 'brightness-125 ring-1 ring-white' : ''
                }`}
                style={{ backgroundColor: stepColor }}
                onMouseEnter={() => setHoveredStep(step)}
                onMouseLeave={() => setHoveredStep(null)}
                title={`${step.dbz} dBZ: ${step.label} (${step.rainRate})`}
              />
            );
          })}
        </div>

        {/* dBZ tick numbers below bar */}
        <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 px-0.5 mt-1">
          {DBZ_SCALE_STEPS.map((step, idx) => (
            <span key={idx} className="cursor-pointer hover:text-[#9a7224] dark:hover:text-amber-300" onClick={() => setHoveredStep(step)}>
              {step.dbz}
            </span>
          ))}
        </div>
      </div>

      {/* Hovered or Active Step Details Popover */}
      {hoveredStep && (
        <div className="mt-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[11px] animate-fadeIn">
          <div className="flex items-center justify-between font-semibold">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: isNexrad ? hoveredStep.nexradColor : hoveredStep.color }}
              />
              <span className="text-slate-900 dark:text-slate-100">{hoveredStep.label}</span>
              <span className="text-[#9a7224] dark:text-amber-400 font-mono">({hoveredStep.dbz} dBZ)</span>
            </div>
            <span className="font-mono text-slate-500 dark:text-slate-400">{hoveredStep.rainRate}</span>
          </div>
          <div className="text-slate-600 dark:text-slate-300 text-[10px] mt-1 leading-snug">
            {hoveredStep.description}
          </div>
        </div>
      )}

      {/* Expanded Table Breakdown */}
      {isExpanded && !hoveredStep && (
        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-[11px]">
          <div className="grid grid-cols-12 text-[10px] font-mono text-slate-500 dark:text-slate-400 pb-1 border-b border-slate-200 dark:border-slate-800/60">
            <span className="col-span-3">INTENSITY</span>
            <span className="col-span-3">dBZ SCALE</span>
            <span className="col-span-6 text-right">EST. RAIN RATE</span>
          </div>

          {DBZ_SCALE_STEPS.map((step, idx) => {
            const stepColor = isNexrad ? step.nexradColor : step.color;
            const isActive = activeStep?.dbz === step.dbz;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredStep(step)}
                onMouseLeave={() => setHoveredStep(null)}
                className={`grid grid-cols-12 items-center py-1 px-1.5 rounded-lg cursor-pointer transition ${
                  isActive
                    ? 'bg-[#c59b48]/20 border border-[#c59b48]/40 text-[#9a7224] dark:text-amber-200 font-bold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="col-span-3 flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: stepColor }}
                  />
                  <span className="font-medium truncate">{step.label}</span>
                </div>
                <span className="col-span-3 font-mono text-slate-500 dark:text-slate-400">{step.dbz} dBZ</span>
                <span className="col-span-6 font-mono text-right text-slate-700 dark:text-slate-300">
                  {step.rainRate}
                </span>
              </div>
            );
          })}

          <div className="pt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            <span>Reflectivity formula: Z = 200 · R^1.6 (Marshall-Palmer)</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default RadarDbzLegend;
