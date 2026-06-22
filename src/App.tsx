import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TopBar } from '@/components/layout/TopBar';
import { ToolRail } from '@/components/layout/ToolRail';
import { Footer } from '@/components/layout/Footer';
import { ConverterWorkspace } from '@/features/converter/ConverterWorkspace';
import { useTheme } from '@/hooks/useTheme';

export default function App() {
  const { isDark } = useTheme();

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
