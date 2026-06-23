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
    throw new HubError(
      res.status === 400 ? 'Bad Request: check your input' : await readError(res, 'Conversion failed'),
      res.status
    );
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
  if (!res.ok) throw new HubError(await readError(res, 'Generation failed'), res.status);
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
  if (!res.ok) throw new HubError(await readError(res, 'Could not send email'), res.status);
  const data = await res.json().catch(() => ({}));
  if (data?.status !== 'success') throw new HubError('Could not send email');
}
