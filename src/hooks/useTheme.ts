import { useCallback, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
const KEY = 'v2x-theme';

function current(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/** Dark-first theme toggle, persisted to localStorage. The no-flash script in
 *  index.html applies the saved value before paint; this keeps React in sync. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(current);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  return { theme, toggle, isDark: theme === 'dark' };
}
