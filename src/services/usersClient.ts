import type { AuthUser } from '@/stores/useAuthStore';

/**
 * Same-origin client for the identity service (`/api/auth/*`). In prod Caddy proxies these to the
 * v2x-tools-users service; in dev Vite proxies `/api` to VITE_API_TARGET. The browser does the OAuth
 * redirect dance; this module covers the JSON endpoints (me / redeem) and builds the login URL.
 */
const BASE = import.meta.env.VITE_API_BASE ?? '';

/** The URL to send the browser to in order to start the OAuth flow with a provider. */
export function loginUrl(provider: string, returnTo: string): string {
  return `${BASE}/api/auth/${provider}/login?redirect=${encodeURIComponent(returnTo)}`;
}

/** Silent SSO check against the IdP — bounces back #token=… (already signed in elsewhere) or #nosession=1. */
export function ssoUrl(returnTo: string): string {
  return `${BASE}/api/auth/sso?redirect=${encodeURIComponent(returnTo)}`;
}

/** Global logout — clears the IdP session cookie, then bounces back #loggedout=1. */
export function logoutUrl(returnTo: string): string {
  return `${BASE}/api/auth/logout?redirect=${encodeURIComponent(returnTo)}`;
}

async function readError(res: Response, fallback: string): Promise<string> {
  const text = await res.text().catch(() => '');
  try {
    const json = JSON.parse(text);
    if (json?.error) return String(json.error);
  } catch {
    // not JSON
  }
  return text || fallback;
}

/** GET /api/auth/me — the current user's profile. Throws on 401 (expired/invalid token). */
export async function me(token: string): Promise<AuthUser> {
  const res = await fetch(`${BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await readError(res, 'Not authenticated'));
  return (await res.json()) as AuthUser;
}

/** POST /api/auth/redeem — redeem an invite code; returns the updated user and a fresh token. */
export async function redeem(token: string, code: string): Promise<{ user: AuthUser; token: string }> {
  const res = await fetch(`${BASE}/api/auth/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error(await readError(res, 'Could not redeem code'));
  return (await res.json()) as { user: AuthUser; token: string };
}
