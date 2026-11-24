import type { Compat, ConvertRequest, GenerateRequest, MessageVersionRow, ResolvedInfo } from '@/types';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Same-origin client for the hub (`/api/*`). In prod Caddy proxies these to the
 * v2x-tools-hub service; in dev Vite proxies to VITE_API_TARGET (see vite.config.ts).
 */
const BASE = import.meta.env.VITE_API_BASE ?? '';

/**
 * Identity headers. The hub derives the userId + plan from this Bearer token (the JWT minted by
 * v2x-tools-users) and ignores any client-set X-User-Id. No token → the hub treats us as anonymous
 * (userId 0 / public scope), so we send nothing.
 */
function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class HubError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = 'HubError';
  }
}

/**
 * Build a human-readable error from an ALREADY-READ response body (never re-reads the Response — a body
 * can only be read once; re-reading returns empty and silently loses the server's real message, which is
 * how a precise hub error like {"error":"no saved message: cam_v2"} used to surface as a generic toast).
 * Prefers the hub's `{error}` field, then a short plain-text body, else the fallback + HTTP status.
 */
function parseError(text: string, status: number, fallback: string): string {
  const trimmed = text.trim();
  if (trimmed) {
    try {
      const json = JSON.parse(trimmed);
      if (json?.error) return `${String(json.error)} (HTTP ${status})`;
    } catch {
      // not JSON — fall through to the raw body
    }
    if (trimmed.length <= 300) return `${trimmed} (HTTP ${status})`;
  }
  return `${fallback} (HTTP ${status})`;
}

function looksLikeDecodeError(text: string): boolean {
  return /^Error:|Message could not be decoded/i.test(text.trim());
}

function compatHeader(compat?: Compat): Record<string, string> {
  return compat && compat !== 'standard' ? { 'X-Compat': compat } : {};
}

/** The definition the hub used, from its response headers. */
function resolvedInfo(res: Response): ResolvedInfo {
  const c = res.headers.get('X-Compat');
  return {
    resolvedRef: res.headers.get('X-Resolved-Ref') ?? undefined,
    resolvedMessage: res.headers.get('X-Resolved-Message') ?? undefined,
    autoDetected: res.headers.get('X-Auto-Detected') === 'true',
    compat: c === 'asn1c' || c === 'standard' ? c : undefined,
  };
}

export interface ConvertResult {
  text: string;
  info: ResolvedInfo;
}

/** POST /api/convert — body is the raw payload; format flows via headers. */
export async function convert({ payload, from, to, ref, compat }: ConvertRequest): Promise<ConvertResult> {
  const headers: Record<string, string> = {
    'Content-Type': 'text/plain',
    'X-From': from,
    'X-To': to,
    ...compatHeader(compat),
    ...authHeaders(),
  };
  if (ref) headers['X-Ref'] = ref;

  const res = await fetch(`${BASE}/api/convert`, { method: 'POST', headers, body: payload });
  const text = await res.text();

  if (!res.ok) {
    const fallback = res.status === 400 ? 'Bad request — check your input' : 'Conversion failed';
    throw new HubError(parseError(text, res.status, fallback), res.status);
  }
  if (looksLikeDecodeError(text)) throw new HubError(text.trim());
  return { text, info: resolvedInfo(res) };
}

/** GET /api/messages/versions — per header identity: the versions, the public default and the user's own. */
export async function messageVersions(): Promise<MessageVersionRow[]> {
  const res = await fetch(`${BASE}/api/messages/versions`, { headers: authHeaders() });
  const text = await res.text();
  if (!res.ok) throw new HubError(parseError(text, res.status, 'Could not load the versions'), res.status);
  const data = JSON.parse(text);
  return (Array.isArray(data) ? data : (data?.identities ?? [])) as MessageVersionRow[];
}

/** POST /api/messages/default — a logged-in user picks the version auto-detect uses for one identity. */
export async function setMessageDefault(identity: string, name: string): Promise<void> {
  const res = await fetch(`${BASE}/api/messages/default`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ identity, name }),
  });
  if (!res.ok) throw new HubError(parseError(await res.text(), res.status, 'Could not set the default'), res.status);
}

/** DELETE /api/messages/default — back to the public default for one identity. */
export async function clearMessageDefault(identity: string): Promise<void> {
  const res = await fetch(`${BASE}/api/messages/default?identity=${encodeURIComponent(identity)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new HubError(parseError(await res.text(), res.status, 'Could not reset the default'), res.status);
}

/** POST /api/generate — returns the generated payload text. */
export async function generate({ ref, format, content, compat }: GenerateRequest): Promise<string> {
  const res = await fetch(`${BASE}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Ref': ref,
      ...compatHeader(compat),
      ...authHeaders(),
    },
    body: JSON.stringify({ format, content }),
  });
  const text = await res.text();
  if (!res.ok) throw new HubError(parseError(text, res.status, 'Generation failed'), res.status);
  return text;
}


/** POST /api/waitlist — welcome screen: "tell me when the site is fully working". */
export async function joinWaitlist(email: string): Promise<void> {
  const res = await fetch(`${BASE}/api/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new HubError(parseError(await res.text(), res.status, 'Could not save your email'), res.status);
}
