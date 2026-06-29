import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/stores/useAuthStore';

export function ThemeToggle() {
  const { isDark, setTheme } = useTheme();
  const { isAuthenticated, savePreferences } = useAuth();

  const handleToggle = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next); // apply instantly (also persists locally for logged-out users)
    // Signed in → theme is an account preference: sync it across devices and the account app.
    // Silent (no toast on a quick toggle); keep the local change if the save fails.
    if (isAuthenticated) void savePreferences({ theme: next }).catch(() => {});
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={handleToggle} aria-label="Toggle theme">
          {isDark ? <Sun /> : <Moon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isDark ? 'Light mode' : 'Dark mode'}</TooltipContent>
    </Tooltip>
  );
}
