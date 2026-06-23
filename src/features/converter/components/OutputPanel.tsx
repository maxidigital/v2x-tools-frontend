import { ArrowLeft } from 'lucide-react';
import { useConverterStore } from '@/stores/useConverterStore';
import { useFontSize } from '@/hooks/useFontSize';
import { useReloadGuard } from '@/hooks/useReloadGuard';
import { ResultTabs } from './ResultTabs';
import { ResultTabView } from './ResultTabView';
import { OutputToolbar } from './OutputToolbar';

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
      <ArrowLeft className="h-5 w-5" />
      <p className="text-sm">Paste a payload and hit Convert</p>
      <p className="text-xs">Each conversion opens a result tab here.</p>
    </div>
  );
}

export function OutputPanel() {
  const { tabs, activeTabId } = useConverterStore();
  const fontSize = useFontSize();
  useReloadGuard(tabs.length > 0);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null;

  if (!activeTab) return <EmptyState />;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-border pr-2">
        <div className="min-w-0 flex-1">
          <ResultTabs />
        </div>
        <OutputToolbar activeTab={activeTab} fontSize={fontSize} />
      </div>
      <div className="min-h-0 flex-1">
        <ResultTabView tab={activeTab} fontSize={fontSize.size} />
      </div>
    </div>
  );
}
