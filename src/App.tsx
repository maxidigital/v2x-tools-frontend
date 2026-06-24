import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TopBar } from '@/components/layout/TopBar';
import { ToolRail } from '@/components/layout/ToolRail';
import { Footer } from '@/components/layout/Footer';
import { ConverterWorkspace } from '@/features/converter/ConverterWorkspace';
import { LoginPage } from '@/components/auth/LoginPage';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/useAuthStore';

export default function App() {
  const { isDark } = useTheme();

  // Resolve the session once on load: consume the OAuth callback fragment, then hydrate via /me.
  useEffect(() => {
    void useAuthStore.getState().init();
  }, []);

  // Dedicated login page lives at /login (Caddy serves index.html, the SPA renders this). Standalone —
  // no TopBar/workspace, its own brand aesthetic.
  if (typeof window !== 'undefined' && window.location.pathname === '/login') {
    return <LoginPage />;
  }

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
