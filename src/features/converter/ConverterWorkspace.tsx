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
      className="min-h-0 flex-1"
    >
      <Panel defaultSize={50} minSize={28} className="flex flex-col border-r border-border">
        {inputMode === 'generate' ? (
          <Suspense fallback={<PanelFallback />}>
            <GeneratePanel />
          </Suspense>
        ) : (
          <InputPanel />
        )}
      </Panel>
      <PanelResizeHandle
        className={`${isWide ? 'w-px' : 'h-px'} bg-border transition-colors data-[resize-handle-state=drag]:bg-primary data-[resize-handle-state=hover]:bg-primary`}
      />
      <Panel defaultSize={50} minSize={28} className="flex flex-col">
        <OutputPanel />
      </Panel>
    </PanelGroup>
  );
}
