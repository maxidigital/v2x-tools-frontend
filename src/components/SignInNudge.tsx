import { Check, LogIn } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNudgeStore } from '@/stores/useNudgeStore';

// Same central asn1click login the TopBar uses; bounces back here with #token (?redirect=<origin>).
const CENTRAL_LOGIN_URL = import.meta.env.VITE_LOGIN_URL ?? 'https://v2xnow.de/asn1click/login';

// NOTE: signed-in users are NOT unlimited either — they get a higher daily cap. So the pitch is
// "more per day", never "unlimited".
const PERKS = ['More conversions per day', 'Save messages and aliases', 'API keys to automate'];

/**
 * Soft, non-blocking sign-in nudge. The nudge store opens this every N actions for anonymous users
 * (see useNudgeStore). Dismissing keeps the tool fully usable.
 */
export function SignInNudge() {
  const open = useNudgeStore((s) => s.open);
  const dismiss = useNudgeStore((s) => s.dismiss);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && dismiss()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Get more out of asn1click</DialogTitle>
          <DialogDescription>Create your free account to unlock:</DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-2 text-sm">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-success" />
              {perk}
            </li>
          ))}
        </ul>
        <div className="mt-1 flex flex-col gap-2">
          <Button
            onClick={() =>
              window.location.assign(
                `${CENTRAL_LOGIN_URL}?redirect=${encodeURIComponent(window.location.origin)}`
              )
            }
          >
            <LogIn className="h-4 w-4" />
            Create account / Sign in
          </Button>
          <Button variant="ghost" onClick={dismiss}>
            Not now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
