import { BookText, Code2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from './ThemeToggle';
import { analytics } from '@/services/analytics';

export function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
      <div className="flex items-center gap-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/15 text-primary">
          <Code2 className="h-4 w-4" />
        </span>
        <span className="text-base font-semibold tracking-tight">V2X.tools</span>
        <Badge variant="primary" className="ml-1">
          BETA
        </Badge>
      </div>

      <nav className="flex items-center gap-1">
        <Button variant="ghost" size="sm" asChild onClick={() => analytics.apiDocsClick()}>
          <a href="/doc/" target="_blank" rel="noreferrer">
            <BookText className="h-4 w-4" />
            <span className="hidden sm:inline">Docs</span>
          </a>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <a href="/doc/#convert" target="_blank" rel="noreferrer">
            <Code2 className="h-4 w-4" />
            <span className="hidden sm:inline">API</span>
          </a>
        </Button>
        <ThemeToggle />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toast('Login coming soon')}
              aria-label="Log in"
            >
              <LogIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Log in</TooltipContent>
        </Tooltip>
      </nav>
    </header>
  );
}
