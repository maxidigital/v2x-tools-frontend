import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from '@/hooks/useTheme';

// Local-only toggle (per-device): it does NOT write back to the account. The account theme (the
// authority, from the account app's Settings) is re-applied on the next login — so a local override
// here sticks for the session and resets when you sign in again.
export function ThemeToggle() {
  const { toggle, isDark } = useTheme();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {isDark ? <Sun /> : <Moon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isDark ? 'Light mode' : 'Dark mode'}</TooltipContent>
    </Tooltip>
  );
}
