import { useState } from 'react';
import { toast } from 'sonner';
import { Copy, Download, Maximize2, Minus, Plus, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useConverterStore } from '@/stores/useConverterStore';
import { useFontSize } from '@/hooks/useFontSize';
import { buildHtml, buildCsv, downloadFile } from '@/lib/export';
import { ShareDialog } from './ShareDialog';
import type { ResultTab } from '@/types';

interface OutputToolbarProps {
  activeTab: ResultTab;
  fontSize: ReturnType<typeof useFontSize>;
}

export function OutputToolbar({ activeTab, fontSize }: OutputToolbarProps) {
  const tabs = useConverterStore((s) => s.tabs);
  const [shareTabs, setShareTabs] = useState<ResultTab[] | null>(null);

  const copyOutput = async () => {
    await navigator.clipboard.writeText(activeTab.content);
    toast.success('Output copied');
  };

  const download = (scope: 'current' | 'all', kind: 'html' | 'csv') => {
    const data = scope === 'current' ? [activeTab] : tabs;
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    if (kind === 'html') {
      downloadFile(`v2xtools-${stamp}.html`, buildHtml(data), 'text/html');
    } else {
      downloadFile(`v2xtools-${stamp}.csv`, buildCsv(data), 'text/csv');
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={fontSize.decrease} disabled={!fontSize.canDecrease}>
            <Minus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Smaller</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={fontSize.increase} disabled={!fontSize.canIncrease}>
            <Plus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Larger</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={copyOutput}>
            <Copy className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy output</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShareTabs([activeTab])}>
            Share current tab
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShareTabs(tabs)}>Share all tabs</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => download('current', 'html')}>
            Current · HTML
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => download('current', 'csv')}>
            Current · CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => download('all', 'html')}>All · HTML</DropdownMenuItem>
          <DropdownMenuItem onClick={() => download('all', 'csv')}>All · CSV</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const w = window.open('', '_blank');
              if (w) w.document.write(buildHtml([activeTab]));
            }}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Expand</TooltipContent>
      </Tooltip>

      <ShareDialog
        open={shareTabs !== null}
        onOpenChange={(o) => !o && setShareTabs(null)}
        tabs={shareTabs ?? []}
      />
    </div>
  );
}
