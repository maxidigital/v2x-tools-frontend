import type { Format } from '@/types';

/**
 * Sniff the wire format of a pasted payload.
 * Ported from the legacy `autoDetectFormat()`:
 *  - JER  → valid JSON object/array
 *  - XER  → starts with `<` ends with `>`
 *  - UPER → hex, or `uper:` prefix, or hex starting with `02` (ETSI ITS header)
 *  - WER  → `wer:` prefix over hex
 * Returns null when nothing matches.
 */
export function detectFormat(raw: string): Format | null {
  const input = raw.trim();
  if (input.length === 0) return null;

  // JSON (JER)
  if (
    (input.startsWith('{') && input.endsWith('}')) ||
    (input.startsWith('[') && input.endsWith(']'))
  ) {
    try {
      JSON.parse(input);
      return 'JER';
    } catch {
      // fall through
    }
  }

  // XML (XER)
  if (input.startsWith('<') && input.endsWith('>')) return 'XER';

  // Hex-based: UPER / WER
  const clean = input.replace(/^(uper:|wer:)/i, '');
  if (/^[0-9A-Fa-f]+$/.test(clean)) {
    if (input.toLowerCase().startsWith('wer:')) return 'WER';
    if (input.toLowerCase().startsWith('uper:') || clean.startsWith('02')) return 'UPER';
  }

  return null;
}

/** Byte length of a hex payload (legacy `updateBytesLen`); null when not hex. */
export function hexByteLength(raw: string): number | null {
  const clean = raw.trim().replace(/^(uper:|wer:)/i, '');
  if (clean.length === 0 || !/^[0-9A-Fa-f]+$/.test(clean)) return null;
  return Math.floor(clean.length / 2);
}
