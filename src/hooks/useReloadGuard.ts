import { useEffect } from 'react';

/** Warn before unloading when there is unsaved output (legacy F5/Ctrl+R guard). */
export function useReloadGuard(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [active]);
}
