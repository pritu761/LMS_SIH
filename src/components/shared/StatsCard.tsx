'use client';

import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { hoverLift, ease } from '@/lib/animations';

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
      icon: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      glow: 'group-hover:border-blue-500/40',
      gradient: 'from-blue-500/15 via-transparent to-transparent',
      shadow: 'rgba(37, 99, 235, 0.25)',
    },
    emerald: {
      icon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'group-hover:border-emerald-500/40',
      gradient: 'from-emerald-500/15 via-transparent to-transparent',
      shadow: 'rgba(16, 185, 129, 0.25)',
    },
    amber: {
      icon: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'group-hover:border-amber-500/40',
      gradient: 'from-amber-500/15 via-transparent to-transparent',
      shadow: 'rgba(245, 158, 11, 0.25)',
    },
    cyan: {
      icon: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      glow: 'group-hover:border-cyan-500/40',
      gradient: 'from-cyan-500/15 via-transparent to-transparent',
      shadow: 'rgba(6, 182, 212, 0.25)',
    },
    purple: {
      icon: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      glow: 'group-hover:border-purple-500/40',
      gradient: 'from-purple-500/15 via-transparent to-transparent',
      shadow: 'rgba(168, 85, 247, 0.25)',
    },
  };

  const scheme = colorMap[color];

  return (
    <motion.div
      whileHover={{
        y: -5,
        boxShadow: `0 20px 40px -15px ${scheme.shadow}`,
        transition: { duration: 0.25, ease: ease.smooth },
      }}
      whileTap={{ scale: 0.98 }}
      className={`group relative rounded-3xl border border-white/10 bg-[#09090e] p-5 sm:p-6 backdrop-blur-xl transition-colors duration-300 hover:border-white/20 overflow-hidden ${scheme.glow}`}
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
          <motion.div
            whileHover={{ rotate: 12, scale: 1.15 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className={`rounded-2xl p-2.5 border ${scheme.icon} transition-all duration-300 group-hover:shadow-lg`}
          >
            <Icon className="h-5 w-5" />
          </motion.div>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-2xl sm:text-3xl font-black text-white tracking-tight"
          >
            {value}
          </motion.div>
          {change && (
            <motion.span
              animate={isHovered ? { y: -2 } : { y: 0 }}
              className={`text-xs font-bold flex items-center gap-1 ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              <span>{isPositive ? '↑' : '↓'}</span>
              {change}
            </motion.span>
          )}
        </div>
      </div>

      {/* Bottom shimmer line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}

