import { useState } from 'react';
import { BookText, Code2, LayoutGrid, LogIn, LogOut, Settings, Ticket, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './ThemeToggle';
import { RedeemDialog } from '@/components/auth/RedeemDialog';
import { analytics } from '@/services/analytics';
import { useAuth, type Plan } from '@/stores/useAuthStore';

// Single asn1click login, shared by all products (Lovable design + wired OAuth in v2x-connect-now).
// Bounces back here with #token via ?redirect=<origin>. Swap to asn1click.io/login once that's a
// direct custom domain (override via VITE_LOGIN_URL).
const CENTRAL_LOGIN_URL =
  import.meta.env.VITE_LOGIN_URL ?? 'https://v2xnow.de/asn1click/login';

// The asn1click account app (account/dashboard) — a separate product surface under *.asn1click.com.
// Override with VITE_APP_URL.
const APP_URL = import.meta.env.VITE_APP_URL ?? 'https://app.asn1click.com';

const ACCOUNT_LINKS = [
  { href: `${APP_URL}/account`, label: 'Overview', icon: LayoutGrid },
  { href: `${APP_URL}/account/profile`, label: 'Profile', icon: User },
  { href: `${APP_URL}/account/settings`, label: 'Settings', icon: Settings },
] as const;

const PLAN_BADGE: Record<Plan, { label: string; variant: 'default' | 'primary' | 'success' }> = {
  FREE: { label: 'Free', variant: 'default' },
  BETA: { label: 'Beta', variant: 'success' },
  PRO: { label: 'Pro', variant: 'primary' },
  ORG: { label: 'Org', variant: 'primary' },
};

export function TopBar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [redeemOpen, setRedeemOpen] = useState(false);

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

        {!isAuthenticated ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.location.assign(
                `${CENTRAL_LOGIN_URL}?redirect=${encodeURIComponent(window.location.origin)}`
              )
            }
            aria-label="Sign in"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sign in</span>
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="ml-1 grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-border bg-secondary text-secondary-foreground"
                aria-label="Account menu"
              >
                {user?.pictureUrl ? (
                  <img src={user.pictureUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <div className="px-2 py-1.5">
                <p className="truncate text-sm font-medium">{user?.displayName ?? user?.email}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  {user && (
                    <Badge variant={PLAN_BADGE[user.plan].variant}>{PLAN_BADGE[user.plan].label}</Badge>
                  )}
                  {user?.organization && (
                    <span className="truncate text-xs text-muted-foreground">{user.organization.name}</span>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
                <DropdownMenuItem key={href} asChild>
                  <a href={href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </a>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              {user?.plan === 'FREE' && (
                <DropdownMenuItem onSelect={() => setRedeemOpen(true)}>
                  <Ticket className="mr-2 h-4 w-4" />
                  Redeem invite code
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>

      <RedeemDialog open={redeemOpen} onOpenChange={setRedeemOpen} />
    </header>
  );
}
