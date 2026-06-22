import { useEffect } from 'react';
import { toast } from 'sonner';
import { Copy, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeView } from '@/components/CodeView';
import { useConverterStore } from '@/stores/useConverterStore';
import { detectFormat } from '@/lib/formatDetect';
import { FormatSelect } from './FormatSelect';
import { DetectBadge } from './DetectBadge';
import { ConvertBar } from './ConvertBar';

export function InputPanel() {
  const { payload, inputFormat, setPayload, setInputFormat } = useConverterStore();

  // Reflect auto-detected format into the input selector (legacy behavior).
  useEffect(() => {
    const detected = detectFormat(payload);
    if (detected && detected !== inputFormat) setInputFormat(detected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  const copy = async () => {
    if (!payload) return;
    await navigator.clipboard.writeText(payload);
    toast.success('Input copied');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Input
          </span>
          <FormatSelect value={inputFormat} onChange={setInputFormat} />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setPayload('')} disabled={!payload}>
            <Eraser className="h-4 w-4" /> Clear
          </Button>
          <Button variant="ghost" size="sm" onClick={copy} disabled={!payload}>
            <Copy className="h-4 w-4" /> Copy
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <CodeView
          value={payload}
          onChange={setPayload}
          format={inputFormat}
          placeholder="Paste a V2X payload — UPER/WER hex, or JSON / XML…"
        />
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
        <DetectBadge payload={payload} />
        <ConvertBar />
      </div>
    </div>
  );
}
