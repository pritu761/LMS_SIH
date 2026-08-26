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

  const isDark = mounted ? mode === 'dark' : true;

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleMode}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.1] dark:border-white/15 light:border-slate-300 light:bg-slate-100 text-slate-200 light:text-slate-800 transition-colors backdrop-blur-xl shadow-lg"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme Mode"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <Moon className="h-4 w-4 text-indigo-300" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <Sun className="h-4 w-4 text-amber-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
