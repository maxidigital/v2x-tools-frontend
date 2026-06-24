import { useEffect } from 'react';
import { Code2, Github } from 'lucide-react';
import { AuroraBackground } from './AuroraBackground';
import { useAuth } from '@/stores/useAuthStore';

/** Google's "G" mark (inline so we don't pull a brand-icon dependency). */
function GoogleMark() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/**
 * Dedicated login page (route {@code /login}) — the asn1click brand moment: aurora night background and
 * a glassy card with the provider chooser. Standalone from the app's neutral converter UI. Adding GitHub
 * or our own email login later is just another button here.
 */
export function LoginPage() {
  const { login, isAuthenticated } = useAuth();

  // A logged-in user has no business on /login.
  useEffect(() => {
    if (isAuthenticated) window.location.assign('/');
  }, [isAuthenticated]);

  return (
    <div className="relative min-h-screen text-white" style={{ background: 'var(--night)' }}>
      <AuroraBackground />

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <a href="/" className="flex items-center gap-2.5">
          <span
            className="grid h-7 w-7 place-items-center rounded-md text-white"
            style={{ background: 'linear-gradient(135deg, var(--brand-1), var(--brand-2))' }}
          >
            <Code2 className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            asn1<span className="text-white/60">click</span>
          </span>
        </a>
        <a href="/" className="text-sm text-white/55 transition hover:text-white">
          ← Back
        </a>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-72px)] items-center justify-center px-6 pb-16">
        <div
          className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
          style={{ boxShadow: '0 10px 40px -10px color-mix(in oklab, var(--brand-2) 50%, transparent)' }}
        >
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1.5 text-sm text-white/55">
            Continue to <span className="font-medium text-white/80">V2X.tools</span>
          </p>

          <div className="mt-7 flex flex-col gap-3">
            <button
              onClick={() => login('google')}
              className="flex h-11 items-center justify-center gap-3 rounded-lg bg-white px-4 text-sm font-medium text-gray-900 transition hover:bg-white/90"
            >
              <GoogleMark />
              Continue with Google
            </button>

            <button
              disabled
              className="flex h-11 cursor-not-allowed items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/45"
            >
              <Github className="h-[18px] w-[18px]" />
              Continue with GitHub
              <span className="ml-auto rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/40">
                soon
              </span>
            </button>
          </div>

          <div className="mt-7 h-px w-full bg-white/10" />
          <p className="mt-4 text-center text-xs leading-relaxed text-white/40">
            V2X.tools is part of the asn1click platform. You can keep using the public tools without an
            account — sign in to save private messages and unlock beta features.
          </p>
        </div>
      </main>
    </div>
  );
}
