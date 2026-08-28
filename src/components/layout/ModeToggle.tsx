'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useVisualTheme } from '@/context/ThemeContext';

export function ModeToggle() {
  const { mode, toggleMode } = useVisualTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mode === 'dark';

  if (!mounted) {
    return (
      <div className="h-9 w-[68px] rounded-full border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5 animate-pulse" />
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-white/15 dark:bg-white/10 backdrop-blur-xl">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => !isDark || toggleMode()}
        aria-label="Switch to Light Mode"
        aria-pressed={!isDark}
        className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
          !isDark
            ? 'bg-white text-amber-500 shadow-md border border-amber-200'
            : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white'
        }`}
        title="Light mode"
      >
        <Sun className="h-3.5 w-3.5" />
        {!isDark && <motion.div layoutId="mode-glow" className="absolute inset-0 rounded-full bg-amber-400/20 blur-[6px] -z-10" />}
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => isDark || toggleMode()}
        aria-label="Switch to Dark Mode"
        aria-pressed={isDark}
        className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
          isDark
            ? 'bg-[#e0234e] text-white shadow-md border border-[#e0234e]/50'
            : 'text-slate-400 hover:text-slate-700'
        }`}
        title="Dark mode"
      >
        <Moon className="h-3.5 w-3.5" />
        {isDark && <motion.div layoutId="mode-glow" className="absolute inset-0 rounded-full bg-[#e0234e]/30 blur-[6px] -z-10" />}
      </motion.button>
    </div>
  );
}