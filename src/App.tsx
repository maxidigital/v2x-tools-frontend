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
  const { isDark } = useTheme();

  // Resolve the session once on load: consume the OAuth callback fragment (the central asn1click login
  // bounces back here with #token), then hydrate via /me.
  useEffect(() => {
    void useAuthStore.getState().init();
  }, []);

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
