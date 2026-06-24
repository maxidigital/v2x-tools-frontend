import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AuroraBackground } from './AuroraBackground';
import { useAuth } from '@/stores/useAuthStore';

/**
 * Dedicated login page (route {@code /login}) — the asn1click brand moment. Ported from Lovable's
 * `asn1click.login` design; Google is wired to our OAuth, GitHub is "soon", and the email/password form
 * is the future first-party login (kept for the look; submit toasts "coming soon" until it's built).
 * Wrapped in {@code dark} so card/border/muted tokens read as the dark glassy treatment.
 */
export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) window.location.assign('/');
  }, [isAuthenticated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Email sign-in is coming soon — use Google for now');
  };

  return (
    <div className="dark relative min-h-screen overflow-hidden bg-night text-foreground">
      <AuroraBackground />

      <header className="relative z-10 px-6 py-5">
        <a
          href="/"
          className="bg-gradient-to-r from-brand-1 via-brand-2 to-brand-3 bg-clip-text text-lg font-semibold tracking-tight text-transparent"
        >
          asn1click
        </a>
      </header>

      <main className="relative z-10 mx-auto flex max-w-md flex-col px-6 pb-24 pt-10 md:pt-16">
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-2 animate-pulse" />
            ASN1Click
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
            <span className="bg-gradient-to-r from-brand-1 via-brand-2 to-brand-3 bg-clip-text text-transparent">
              Sign in
            </span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">Access your ASN.1 &amp; V2X workspace.</p>
        </div>

        <div className="relative mt-10 overflow-hidden rounded-2xl border border-border/60 bg-card/30 p-6 backdrop-blur-xl">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-brand-1/30 to-brand-3/30 blur-2xl" />

          <div className="relative flex flex-col gap-3">
            <button
              type="button"
              onClick={() => login('google')}
              className="inline-flex items-center justify-center gap-3 rounded-lg border border-border/60 bg-background/40 px-4 py-2.5 text-sm font-medium transition hover:border-brand-2/40 hover:bg-background/60"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.2C29.3 35 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6.3 5.2C41.9 35.2 44 30 44 24c0-1.3-.1-2.3-.4-3.5z" />
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center gap-3 rounded-lg border border-border/60 bg-background/40 px-4 py-2.5 text-sm font-medium opacity-70 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
              </svg>
              Continue with GitHub
              <span className="ml-auto rounded-full border border-border/60 px-2 py-0.5 text-[10px] tracking-wide">
                soon
              </span>
            </button>

            <div className="my-2 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
              <span className="h-px flex-1 bg-border/60" />
              or
              <span className="h-px flex-1 bg-border/60" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-xs uppercase tracking-widest text-brand-2">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="rounded-lg border border-border/60 bg-background/40 px-3 py-2.5 text-sm outline-none transition focus:border-brand-2/60 focus:ring-2 focus:ring-brand-2/20"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-xs uppercase tracking-widest text-brand-2">Password</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-lg border border-border/60 bg-background/40 px-3 py-2.5 text-sm outline-none transition focus:border-brand-2/60 focus:ring-2 focus:ring-brand-2/20"
                />
              </label>

              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-brand-1 to-brand-3 px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
              >
                Sign in →
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <a href="#" className="transition hover:text-foreground">
                Forgot password?
              </a>
              <a href="#" className="transition hover:text-brand-2">
                Create account
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <a
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
          >
            ← Back to V2X.tools
          </a>
        </div>
      </main>
    </div>
  );
}
