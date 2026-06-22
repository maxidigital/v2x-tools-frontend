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

export const analytics = {
  conversionSuccess: (from: string, to: string) => track('conversion_success', { from, to }),
  conversionFailed: (from: string, to: string) => track('conversion_failed', { from, to }),
  conversionError: (message: string) => track('conversion_error', { message }),
  apiDocsClick: () => track('api_docs_click'),
};
