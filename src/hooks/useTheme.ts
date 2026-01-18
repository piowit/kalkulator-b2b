import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'podatki-b2b-theme';

function getSystemTheme(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // ignore
  }
  return null;
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Priorytet: localStorage > system preference
    return getStoredTheme() ?? getSystemTheme();
  });

  // Aplikuj motyw przy starcie i zmianie
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Nasłuchuj zmian preferencji systemowych
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Zmień tylko jeśli użytkownik nie wybrał ręcznie
      if (!getStoredTheme()) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
}
