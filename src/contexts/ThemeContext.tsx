import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  accentColor: string;
  reducedMotion: boolean;
  setTheme: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
  setReducedMotion: (reduced: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ACCENT_COLORS = [
  { label: 'DaySpark Coral', value: '#FF7058' },
  { label: 'Mint Fresh', value: '#8EDCC0' },
  { label: 'Sky Blue', value: '#8BCBFA' },
  { label: 'Soft Lavender', value: '#B8A7F9' },
  { label: 'Warm Sunlight', value: '#FFD166' },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { userProfile, updateProfileData } = useAuth();

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('dayspark_theme') as ThemeMode) || 'system';
  });
  const [accentColor, setAccentColorState] = useState<string>(() => {
    return localStorage.getItem('dayspark_accent') || '#FF7058';
  });
  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    return localStorage.getItem('dayspark_reduced_motion') === 'true';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Listen to system dark mode changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // Sync from userProfile if available
  useEffect(() => {
    if (userProfile) {
      if (userProfile.theme) setThemeState(userProfile.theme);
      if (userProfile.accentColor) setAccentColorState(userProfile.accentColor);
      if (typeof userProfile.reducedMotion === 'boolean') {
        setReducedMotionState(userProfile.reducedMotion);
      }
    }
  }, [userProfile]);

  const effectiveTheme = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;

  // Apply dark class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('dayspark_theme', theme);
  }, [theme, effectiveTheme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-brand-accent', accentColor);
    localStorage.setItem('dayspark_accent', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('dayspark_reduced_motion', String(reducedMotion));
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [reducedMotion]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    if (userProfile) {
      updateProfileData({ theme: mode }).catch(console.error);
    }
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    if (userProfile) {
      updateProfileData({ accentColor: color }).catch(console.error);
    }
  };

  const setReducedMotion = (reduced: boolean) => {
    setReducedMotionState(reduced);
    if (userProfile) {
      updateProfileData({ reducedMotion: reduced }).catch(console.error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        effectiveTheme,
        accentColor,
        reducedMotion,
        setTheme,
        setAccentColor,
        setReducedMotion,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
