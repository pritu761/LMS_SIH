'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type VisualTheme = 'nestjs' | 'emerald' | 'violet' | 'amber' | 'cyan';
export type ThemeMode = 'dark' | 'light';

export interface ThemeConfig {
  id: VisualTheme;
  name: string;
  subtitle: string;
  primaryColor: string;
  accentColor: string;
  glowColor: string;
  previewGradient: string;
  badgeText: string;
}

export const THEME_CONFIGS: Record<VisualTheme, ThemeConfig> = {
  nestjs: {
    id: 'nestjs',
    name: 'NestJS Crimson',
    subtitle: 'Progressive Ruby Red & Carbon Architecture',
    primaryColor: '#E0234E',
    accentColor: '#FF4D6D',
    glowColor: 'rgba(224, 35, 78, 0.42)',
    previewGradient: 'from-[#E0234E] via-[#EA2845] to-[#FF758C]',
    badgeText: 'NESTJS CORE',
  },
  emerald: {
    id: 'emerald',
    name: 'Cyber Emerald',
    subtitle: 'Sovereign Intelligence & National Defense',
    primaryColor: '#10B981',
    accentColor: '#F59E0B',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    previewGradient: 'from-emerald-500 via-teal-500 to-amber-500',
    badgeText: 'INTELLIGENCE OPS',
  },
  violet: {
    id: 'violet',
    name: 'Cosmic Nebula',
    subtitle: 'Ultra-Modern Deep Space Synthwave',
    primaryColor: '#8B5CF6',
    accentColor: '#EC4899',
    glowColor: 'rgba(139, 92, 246, 0.38)',
    previewGradient: 'from-violet-500 via-pink-500 to-cyan-400',
    badgeText: 'COSMIC NEBULA',
  },
  amber: {
    id: 'amber',
    name: 'Titanium & Amber',
    subtitle: 'Industrial Monolith & Laser Precision',
    primaryColor: '#F59E0B',
    accentColor: '#EF4444',
    glowColor: 'rgba(245, 158, 11, 0.38)',
    previewGradient: 'from-amber-400 via-orange-500 to-rose-500',
    badgeText: 'INDUSTRIAL CARBON',
  },
  cyan: {
    id: 'cyan',
    name: 'Bioluminescent Abyss',
    subtitle: 'Quantum Oceanic & Electric Cyan',
    primaryColor: '#06B6D4',
    accentColor: '#14B8A6',
    glowColor: 'rgba(6, 182, 212, 0.38)',
    previewGradient: 'from-cyan-400 via-blue-500 to-teal-400',
    badgeText: 'QUANTUM ABYSS',
  },
};

interface ThemeContextType {
  theme: VisualTheme;
  setTheme: (theme: VisualTheme) => void;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  config: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'nestjs',
  setTheme: () => {},
  mode: 'dark',
  setMode: () => {},
  toggleMode: () => {},
  config: THEME_CONFIGS.nestjs,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<VisualTheme>('nestjs');
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Restore saved theme or default to nestjs
    const savedTheme = localStorage.getItem('capacity_connect_visual_theme') as VisualTheme;
    const initialTheme = savedTheme && THEME_CONFIGS[savedTheme] ? savedTheme : 'nestjs';
    setThemeState(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);

    // Restore saved mode (dark or light)
    const savedMode = localStorage.getItem('capacity_connect_theme_mode') as ThemeMode;
    const initialMode = savedMode === 'light' ? 'light' : 'dark';
    setModeState(initialMode);
    document.documentElement.setAttribute('data-mode', initialMode);
    if (initialMode === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const setTheme = (newTheme: VisualTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('capacity_connect_visual_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('capacity_connect_theme_mode', newMode);
    document.documentElement.setAttribute('data-mode', newMode);
    if (newMode === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  };

  const toggleMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  const config = THEME_CONFIGS[theme] || THEME_CONFIGS.nestjs;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mode, setMode, toggleMode, config }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useVisualTheme() {
  return useContext(ThemeContext);
}
