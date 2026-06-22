import type { ComponentType } from 'react';
import { BarChart3, FileInput, Settings2, Shuffle, TreePine } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useUiStore, type InputMode } from '@/stores/useUiStore';

interface RailButtonProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
}

function RailButton({ icon: Icon, label, active, disabled, href, onClick }: RailButtonProps) {
  const className = cn(
    'grid h-10 w-10 place-items-center rounded-md transition-colors',
    active
      ? 'bg-primary/15 text-primary'
      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
    disabled && 'pointer-events-none opacity-40'
  );
  const inner = <Icon className="h-5 w-5" />;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {href ? (
          <a className={className} href={href} target="_blank" rel="noreferrer" aria-label={label}>
            {inner}
          </a>
        ) : (
          <button className={className} onClick={onClick} disabled={disabled} aria-label={label}>
            {inner}
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent side="right">
        {label}
        {disabled && ' · coming soon'}
      </TooltipContent>
    </Tooltip>
  );
}

export function ToolRail() {
  const { inputMode, setInputMode } = useUiStore();
  const set = (m: InputMode) => () => setInputMode(m);

  return (
    <aside className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-border py-3">
      <RailButton icon={FileInput} label="Convert" active={inputMode === 'paste'} onClick={set('paste')} />
      <RailButton icon={Shuffle} label="Generate" active={inputMode === 'generate'} onClick={set('generate')} />
      <div className="my-1 h-px w-6 bg-border" />
      <RailButton icon={TreePine} label="ASN.1 Explorer" disabled />
      <RailButton icon={BarChart3} label="Statistics" href="/stats.html" />
      <RailButton icon={Settings2} label="Admin console" href="/dev-console.html" />
    </aside>
  );
}
