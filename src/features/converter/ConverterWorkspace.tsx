import { Suspense, lazy } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Loader2 } from 'lucide-react';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { useUiStore } from '@/stores/useUiStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Generate is off the critical path → load on demand.
const GeneratePanel = lazy(() =>
  import('@/features/generate/GeneratePanel').then((m) => ({ default: m.GeneratePanel }))
);

function PanelFallback() {
  return (
    <div className="grid h-full place-items-center text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}

export function ConverterWorkspace() {
  const inputMode = useUiStore((s) => s.inputMode);
  const isWide = useMediaQuery('(min-width: 768px)');
  const direction = isWide ? 'horizontal' : 'vertical';

  return (
    <PanelGroup
      key={direction}
      direction={direction}
      autoSaveId={`v2x-workspace-${direction}`}
      className="min-h-0 flex-1 bg-background"
    >
      <Panel defaultSize={50} minSize={28} className="flex flex-col bg-card">
        {inputMode === 'generate' ? (
          <Suspense fallback={<PanelFallback />}>
            <GeneratePanel />
          </Suspense>
        ) : (
          <InputPanel />
        )}
      </Panel>
      <PanelResizeHandle className={`group relative bg-background ${isWide ? 'w-2' : 'h-2'}`}>
        <div
          className={`absolute bg-border transition-colors group-hover:bg-primary group-data-[resize-handle-state=drag]:bg-primary ${
            isWide
              ? 'inset-y-0 left-1/2 w-px -translate-x-1/2'
              : 'inset-x-0 top-1/2 h-px -translate-y-1/2'
          }`}
        />
      </PanelResizeHandle>
      <Panel defaultSize={50} minSize={28} className="flex flex-col bg-card">
        <OutputPanel />
      </Panel>
    </PanelGroup>
  );
}
