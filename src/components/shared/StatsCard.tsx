'use client';

import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color?: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'purple';
}

export function StatsCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  color = 'indigo',
}: StatsCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const colorMap = {
    indigo: {
      icon: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      glow: 'group-hover:shadow-glow-sm group-hover:border-indigo-500/40',
      gradient: 'from-indigo-500/10 via-transparent to-transparent',
      sparkle: 'text-indigo-400',
    },
    emerald: {
      icon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'group-hover:shadow-glow-emerald group-hover:border-emerald-500/40',
      gradient: 'from-emerald-500/10 via-transparent to-transparent',
      sparkle: 'text-emerald-400',
    },
    amber: {
      icon: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'group-hover:shadow-glow-amber group-hover:border-amber-500/40',
      gradient: 'from-amber-500/10 via-transparent to-transparent',
      sparkle: 'text-amber-400',
    },
    cyan: {
      icon: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      glow: 'group-hover:shadow-glow-cyan group-hover:border-cyan-500/40',
      gradient: 'from-cyan-500/10 via-transparent to-transparent',
      sparkle: 'text-cyan-400',
    },
    purple: {
      icon: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      glow: 'group-hover:shadow-glow-purple group-hover:border-purple-500/40',
      gradient: 'from-purple-500/10 via-transparent to-transparent',
      sparkle: 'text-purple-400',
    },
  };

  const scheme = colorMap[color];

  return (
    <div
      className={`group relative rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl transition-all duration-500 hover:border-slate-700 card-tilt overflow-hidden ${scheme.glow}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${scheme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className={`rounded-2xl p-2.5 border ${scheme.icon} transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {value}
          </div>
          {change && (
            <span
              className={`text-xs font-bold flex items-center gap-1 ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              <span className={`inline-block transition-transform duration-300 ${isHovered ? 'translate-y-[-2px]' : ''}`}>
                {isPositive ? '↑' : '↓'}
              </span>
              {change}
            </span>
          )}
        </div>
      </div>

      {/* Bottom shimmer line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}
