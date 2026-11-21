import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { joinWaitlist, HubError } from '@/services/hubClient';
import { analytics } from '@/services/analytics';
import { useAuth } from '@/stores/useAuthStore';
import { useUiStore } from '@/stores/useUiStore';

/** Set once the visitor leaves their email: the screen never shows again on this browser. */
const JOINED_KEY = 'v2x-waitlist-joined';
/** Set when the visitor closes it: no repeat within the same tab session, back on the next visit. */
const SEEN_KEY = 'v2x-welcome-seen';

function read(storage: () => Storage, key: string): boolean {
  try {
    return storage().getItem(key) != null;
  } catch {
    return false;
  }
}

function write(storage: () => Storage, key: string): void {
  try {
    storage().setItem(key, '1');
  } catch {
    // private mode / blocked storage: the screen just shows again next time
  }
}

/**
 * Welcome screen in front of the app on entry: a thank-you note plus an email field for the waitlist.
 * Waits for the session check (the silent-SSO bounce would otherwise flash it), and skips signed-in users.
 */
export function WelcomeDialog() {
  const { ready, isAuthenticated, user } = useAuth();
  const [wanted] = useState(
    () => !read(() => localStorage, JOINED_KEY) && !read(() => sessionStorage, SEEN_KEY)
  );
  const open = useUiStore((s) => s.welcomeOpen);
  const setOpen = useUiStore((s) => s.setWelcomeOpen);
  const setWaitlistJoined = useUiStore((s) => s.setWaitlistJoined);
  const joinedBefore = useUiStore((s) => s.waitlistJoined);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Reopened from the bell after signing up earlier: straight to the thank-you state.
  const [joined, setJoined] = useState(joinedBefore);

  // Signed-in users opening it from the bell: start from their account email.
  useEffect(() => {
    if (open && user?.email) setEmail((e) => e || user.email!);
  }, [open, user?.email]);

  useEffect(() => {
    if (wanted && ready && !isAuthenticated) {
      setOpen(true);
      analytics.waitlistShown('entry');
    }
  }, [wanted, ready, isAuthenticated, setOpen]);

  function close() {
    write(() => sessionStorage, SEEN_KEY);
    if (!joined) analytics.waitlistDismissed();
    setOpen(false);
  }

  async function submit() {
    const trimmed = email.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    try {
      await joinWaitlist(trimmed);
      write(() => localStorage, JOINED_KEY);
      setJoined(true);
      setWaitlistJoined();
      analytics.waitlistJoined();
    } catch (e) {
      const message = e instanceof HubError ? e.message.replace(/ \(HTTP \d+\)$/, '') : 'Connection error. Please try again.';
      setError(message);
      analytics.waitlistFailed(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      {/* A stray click outside must not throw the form away: only the buttons, X or Esc close it. */}
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Thanks for your interest in asn1click!</DialogTitle>
          <DialogDescription className="pt-1 leading-relaxed">
            We're working tirelessly to deliver the best possible user experience. We apologize for not
            being able to answer every message. Leave us your email and we'll let you know as soon as the
            site is fully functional.
          </DialogDescription>
        </DialogHeader>

        {joined ? (
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Thank you! We'll be in touch.
            </p>
            <Button onClick={close}>Continue to the tool</Button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <Input
              autoFocus
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              aria-label="Email"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy || !email.trim()}>
              {busy ? 'Sending…' : 'Notify me'}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={close}>
              Continue to the tool
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
