import React from 'react';
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
  const colorMap = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl transition-all hover:border-slate-700">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`rounded-2xl p-2.5 border ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{value}</div>
        {change && (
          <span
            className={`text-xs font-bold ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
    </div>
  );
}
