/* Thin wrappers over gtag + Umami, mirroring the legacy events. No-ops if absent. */

type GtagFn = (command: string, action: string, params?: Record<string, unknown>) => void;
type UmamiFn = { track: (event: string, data?: Record<string, unknown>) => void };

declare global {
  interface Window {
    gtag?: GtagFn;
    umami?: UmamiFn;
  }
}

function track(event: string, params?: Record<string, unknown>): void {
  try {
    window.gtag?.('event', event, params);
    window.umami?.track(event, params);
  } catch {
    // analytics must never break the app
  }
}

/** What we know about a conversion, without the payload itself (never sent to analytics). */
export interface ConversionMeta {
  from: string;
  to: string;
  /** true when no message was named and the hub auto-detected it from the ITS header. */
  auto: boolean;
  /** payload size in bytes (hex input) — null for XML/JSON. */
  bytes: number | null;
  compat?: string;
  /** the saved message the hub used, e.g. "_cam_v2" (only on success). */
  message?: string;
}

export const analytics = {
  conversionSuccess: (m: ConversionMeta) => track('conversion_success', { ...m }),
  conversionFailed: (m: ConversionMeta) => track('conversion_failed', { ...m }),
  conversionError: (message: string) => track('conversion_error', { message }),
  generateSuccess: (ref: string, format: string) => track('generate_success', { ref, format }),
  generateFailed: (ref: string, message: string) => track('generate_failed', { ref, message }),
  outputCopy: (format: string) => track('output_copy', { format }),
  outputDownload: (kind: string, scope: string) => track('output_download', { kind, scope }),
  loginClick: () => track('login_click'),
  loginSuccess: () => track('login_success'),
  loginFailed: (message: string) => track('login_failed', { message }),
  apiDocsClick: () => track('api_docs_click'),
};
