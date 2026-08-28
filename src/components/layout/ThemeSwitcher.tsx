'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, Sparkles, Sun, Moon } from 'lucide-react';
import { useVisualTheme, THEME_CONFIGS, VisualTheme } from '@/context/ThemeContext';

export function ThemeSwitcher() {
  const { theme, setTheme, mode, setMode, config } = useVisualTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeConfig = mounted ? config : THEME_CONFIGS.nestjs;
  const isLight = mounted && mode === 'light';
  const themesList = Object.values(THEME_CONFIGS);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shadow-md border ${
          isLight
            ? 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50 shadow-sm'
            : 'border-white/15 bg-white/[0.06] hover:bg-white/[0.1] text-slate-900 dark:text-white'
        }`}
        title="Switch Theme & Palette"
      >
        <span
          className="h-2.5 w-2.5 rounded-full shadow-sm animate-pulse"
          style={{ backgroundColor: activeConfig.primaryColor, boxShadow: `0 0 10px ${activeConfig.primaryColor}` }}
        />
        <Palette className={`h-3.5 w-3.5 ${isLight ? 'text-slate-700' : 'text-slate-600 dark:text-slate-300'}`} />
        <span className="hidden sm:inline font-mono text-[11px] font-bold">{activeConfig.name}</span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundColor: isLight ? '#ffffff' : '#090a0f',
              boxShadow: isLight
                ? '0 25px 70px -10px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08)'
                : '0 25px 70px -10px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.12)',
            }}
            className={`absolute right-0 top-full mt-2 w-80 rounded-2xl p-3.5 z-[200] border ${
              isLight ? 'border-slate-200 text-slate-900' : 'border-white/15 text-slate-900 dark:text-white'
            }`}
          >
            {/* Header with Title */}
            <div className={`flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border-b mb-3 ${
              isLight ? 'border-slate-100 text-slate-500' : 'border-white/10 text-slate-500 dark:text-slate-400'
            }`}>
              <span className={`flex items-center gap-1.5 font-bold ${isLight ? 'text-slate-900' : 'text-slate-900 dark:text-white'}`}>
                <Sparkles className="h-3 w-3 text-amber-500" />
                Visual Palette & Mode
              </span>
              <span className={`text-[9px] font-bold ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>Live 1-Click</span>
            </div>

            {/* Dark / Light Mode Segmented Control */}
            <div
              style={{ backgroundColor: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.04)' }}
              className={`mb-3 p-1 rounded-xl border flex items-center gap-1 ${
                isLight ? 'border-slate-200' : 'border-white/10'
              }`}
            >
              <button
                onClick={() => setMode('dark')}
                style={{
                  backgroundColor: mode === 'dark' ? (isLight ? '#1e293b' : 'rgba(59, 130, 246, 0.35)') : 'transparent',
                  color: mode === 'dark' ? '#ffffff' : (isLight ? '#475569' : '#94a3b8'),
                }}
                className="flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                <Moon className={`h-3.5 w-3.5 ${mode === 'dark' ? 'text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>Dark Mode</span>
              </button>
              <button
                onClick={() => setMode('light')}
                style={{
                  backgroundColor: mode === 'light' ? (isLight ? '#ffffff' : 'rgba(245, 158, 11, 0.35)') : 'transparent',
                  color: mode === 'light' ? '#0f172a' : (isLight ? '#475569' : '#94a3b8'),
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all shadow-sm ${
                  mode === 'light' && isLight ? 'border border-slate-200/90' : ''
                }`}
              >
                <Sun className={`h-3.5 w-3.5 ${mode === 'light' ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>Light Mode</span>
              </button>
            </div>

            {/* Color Palette List */}
            <div className="space-y-1.5">
              {themesList.map((item) => {
                const isActive = theme === item.id;
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 3, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setTheme(item.id);
                      setIsOpen(false);
                    }}
                    style={{
                      backgroundColor: isLight
                        ? isActive
                          ? '#f0fdf4'
                          : '#f8fafc'
                        : isActive
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(255, 255, 255, 0.02)',
                      borderColor: isLight
                        ? isActive
                          ? '#86efac'
                          : '#e2e8f0'
                        : isActive
                        ? 'rgba(255, 255, 255, 0.25)'
                        : 'transparent',
                    }}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition-all border shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Gradient preview swatch */}
                      <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${item.previewGradient} p-[1px] shrink-0 shadow-sm`}>
                        <div
                          style={{ backgroundColor: isLight ? '#ffffff' : '#000000' }}
                          className="h-full w-full rounded-[7px] flex items-center justify-center"
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: item.primaryColor }}
                          />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-slate-900 dark:text-white'}`}>
                          <span>{item.name}</span>
                        </div>
                        <div className={`text-[10px] truncate ${isLight ? 'text-slate-500 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    {isActive && (
                      <Check className={`h-4 w-4 shrink-0 ml-2 ${isLight ? 'text-emerald-600 font-bold' : 'text-slate-900 dark:text-white'}`} />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}