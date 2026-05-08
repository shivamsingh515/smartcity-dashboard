import { useState, useEffect, useCallback } from 'react';
import { getFromStorage, setToStorage } from '../utils/api';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = getFromStorage('smartcity_theme');
    return saved || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setToStorage('smartcity_theme', theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggle };
}
