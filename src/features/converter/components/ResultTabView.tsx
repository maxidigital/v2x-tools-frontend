import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { CodeView } from '@/components/CodeView';
import { detectFormat } from '@/lib/formatDetect';
import { splitComments } from '@/lib/comments';
import { ResolvedLabel } from './ResolvedLabel';
import type { ResultTab } from '@/types';

/** A single result: original input (top) over decoded output (bottom), resizable. */
export function ResultTabView({ tab, fontSize }: { tab: ResultTab; fontSize: number }) {
  // `#` lines (what it was for, the operation) above the payload; generate has no payload, only them
  const { comments, body } = splitComments(tab.originalInput);
  const inputFormat = detectFormat(body) ?? 'UPER';

  return (
    <PanelGroup direction="vertical" className="h-full">
      <Panel defaultSize={28} minSize={0} collapsible className="flex flex-col">
        <div className="px-3 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
          Input
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          {comments.length > 0 && (
            <div className="space-y-0.5 px-3 pb-1 font-mono text-muted-foreground" style={{ fontSize }}>
              {comments.map((c, i) => (
                <p key={i} className="whitespace-pre-wrap break-words">
                  # {c}
                </p>
              ))}
            </div>
          )}
          {body.trim() && <CodeView value={body} format={inputFormat} readOnly fontSize={fontSize} />}
        </div>
      </Panel>
      <PanelResizeHandle className="h-px bg-border transition-colors data-[resize-handle-state=hover]:bg-primary" />
      <Panel minSize={20} className="flex flex-col">
        <div className="flex flex-wrap items-center gap-x-2 px-3 py-1 text-[11px] text-muted-foreground">
          <span className="uppercase tracking-wide">Output · {tab.format}</span>
          <ResolvedLabel info={tab.info} />
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <CodeView value={tab.content} format={tab.format} readOnly fontSize={fontSize} />
        </div>
      </Panel>
    </PanelGroup>
  );
}
