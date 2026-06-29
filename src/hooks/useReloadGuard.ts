import { useEffect } from 'react';

// Set right before an app-initiated navigation (login / logout / account links) so the unsaved-work
// warning is skipped for that one navigation. Accidental F5 / tab-close / URL-typing still warn.
let navigationAllowed = false;

/** Skip the next "Leave site?" warning — for navigations WE trigger on purpose. */
export function allowNavigation() {
  navigationAllowed = true;
}

/** Warn before unloading when there is unsaved output (legacy F5/Ctrl+R guard). */
export function useReloadGuard(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (navigationAllowed) return; // intentional navigation — don't nag
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [active]);
}
