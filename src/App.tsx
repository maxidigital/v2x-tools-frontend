import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TopBar } from '@/components/layout/TopBar';
import { ToolRail } from '@/components/layout/ToolRail';
import { Footer } from '@/components/layout/Footer';
import { ConverterWorkspace } from '@/features/converter/ConverterWorkspace';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/useAuthStore';

export default function App() {
  const { isDark, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);

  // Resolve the session once on load: consume the OAuth callback fragment (the central asn1click login
  // bounces back here with #token), then hydrate via /me.
  useEffect(() => {
    void useAuthStore.getState().init();
  }, []);

  // Theme is an account preference: once the user resolves, adopt their saved theme so it stays in sync
  // across devices and with the account app. The no-flash script applied the local (localStorage) choice
  // first; this only corrects it to the account value when signed in.
  useEffect(() => {
    const pref = user?.preferences?.theme;
    if (pref === 'dark' || pref === 'light') setTheme(pref);
  }, [user, setTheme]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full flex-col">
        <TopBar />
        <div className="flex min-h-0 flex-1">
          <ToolRail />
          <ConverterWorkspace />
        </div>
        <Footer />
      </div>
      <Toaster theme={isDark ? 'dark' : 'light'} position="bottom-right" richColors />
    </TooltipProvider>
  );
}
