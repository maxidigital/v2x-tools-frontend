import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useConverterStore } from '@/stores/useConverterStore';
import type { ResultTab } from '@/types';

function TabButton({ tab, active }: { tab: ResultTab; active: boolean }) {
  const { setActiveTab, closeTab, closeOthers, closeAll, renameTab } = useConverterStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const title = tab.customName ?? `${tab.format} ${tab.timestamp}`;

  const commit = () => {
    const v = draft.trim();
    if (v) renameTab(tab.id, v);
    setEditing(false);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          role="tab"
          aria-selected={active}
          onClick={() => setActiveTab(tab.id)}
          onDoubleClick={() => {
            setDraft(title);
            setEditing(true);
          }}
          className={cn(
            'group flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 px-3 py-1.5 text-xs transition-colors',
            active
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') setEditing(false);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-24 bg-transparent outline-none"
            />
          ) : (
            <span className="font-mono">{title}</span>
          )}
          <button
            aria-label="Close tab"
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
            className="rounded opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onSelect={() => {
            setDraft(title);
            setEditing(true);
          }}
        >
          Rename
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => closeTab(tab.id)}>Close</ContextMenuItem>
        <ContextMenuItem onSelect={() => closeOthers(tab.id)}>Close others</ContextMenuItem>
        <ContextMenuItem onSelect={() => closeAll()}>Close all</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function ResultTabs() {
  const { tabs, activeTabId } = useConverterStore();
  return (
    <div className="flex h-full items-end gap-0.5 overflow-x-auto px-2">
      {tabs.map((t) => (
        <TabButton key={t.id} tab={t} active={t.id === activeTabId} />
      ))}
    </div>
  );
}
