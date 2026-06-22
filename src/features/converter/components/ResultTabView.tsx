import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { CodeView } from '@/components/CodeView';
import { detectFormat } from '@/lib/formatDetect';
import type { ResultTab } from '@/types';

/** A single result: original input (top) over decoded output (bottom), resizable. */
export function ResultTabView({ tab, fontSize }: { tab: ResultTab; fontSize: number }) {
  const inputFormat = detectFormat(tab.originalInput) ?? 'UPER';

  return (
    <PanelGroup direction="vertical" className="h-full">
      <Panel defaultSize={28} minSize={0} collapsible className="flex flex-col">
        <div className="px-3 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
          Input
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <CodeView value={tab.originalInput} format={inputFormat} readOnly fontSize={fontSize} />
        </div>
      </Panel>
      <PanelResizeHandle className="h-px bg-border transition-colors data-[resize-handle-state=hover]:bg-primary" />
      <Panel minSize={20} className="flex flex-col">
        <div className="px-3 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
          Output · {tab.format}
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <CodeView value={tab.content} format={tab.format} readOnly fontSize={fontSize} />
        </div>
      </Panel>
    </PanelGroup>
  );
}
