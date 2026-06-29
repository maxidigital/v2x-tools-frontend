import type { ConvertRequest, GenerateRequest } from '@/types';
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

/** POST /api/convert — body is the raw payload; format flows via headers. */
export async function convert({ payload, from, to, ref }: ConvertRequest): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'text/plain',
    'X-From': from,
    'X-To': to,
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
  return text;
}

/** POST /api/generate — returns the generated payload text. */
export async function generate({ ref, format, size, minimal }: GenerateRequest): Promise<string> {
  const res = await fetch(`${BASE}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Ref': ref,
      ...authHeaders(),
    },
    body: JSON.stringify({ format, size, minimal }),
  });
  const text = await res.text();
  if (!res.ok) throw new HubError(parseError(text, res.status, 'Generation failed'), res.status);
  return text;
}

export interface ShareEmailInput {
  recipientEmail: string;
  htmlContent: string;
  csvContent: string;
  subject: string;
  message: string;
}

/** POST /api/contact — email-share path (legacy contract). */
export async function shareEmail(input: ShareEmailInput): Promise<void> {
  const res = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipientEmail: input.recipientEmail,
      htmlContent: input.htmlContent,
      csvContent: input.csvContent,
      isHTMLShare: 'true',
      name: 'V2X.tools',
      email: 'no-reply@v2x.tools',
      subject: input.subject,
      message: input.message,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new HubError(parseError(text, res.status, 'Could not send email'), res.status);
  let data: { status?: string } = {};
  try {
    data = JSON.parse(text);
  } catch {
    // not JSON
  }
  if (data?.status !== 'success') throw new HubError('Could not send email');
}
