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
      <div className="h-8 w-[60px] rounded-full border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5 animate-pulse" />
    );
  }

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-slate-200 bg-slate-100 p-0.5 dark:border-white/15 dark:bg-white/10 backdrop-blur-xl shrink-0">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => !isDark || toggleMode()}
        aria-label="Switch to Light Mode"
        aria-pressed={!isDark}
        className={`relative flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 ${
          !isDark
            ? 'bg-white text-amber-500 shadow-sm border border-amber-200'
            : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white'
        }`}
        title="Light mode"
      >
        <Sun className="h-3 w-3" />
        {!isDark && <motion.div layoutId="mode-glow" className="absolute inset-0 rounded-full bg-amber-400/20 blur-[4px] -z-10" />}
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => isDark || toggleMode()}
        aria-label="Switch to Dark Mode"
        aria-pressed={isDark}
        className={`relative flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 ${
          isDark
            ? 'bg-[#0b1e36] text-[#dfb76c] shadow-sm border border-[#c59b48]/60'
            : 'text-slate-400 hover:text-slate-700'
        }`}
        title="Dark mode"
      >
        <Moon className="h-3 w-3" />
        {isDark && <motion.div layoutId="mode-glow" className="absolute inset-0 rounded-full bg-[#c59b48]/30 blur-[4px] -z-10" />}
      </motion.button>
    </div>
  );
}