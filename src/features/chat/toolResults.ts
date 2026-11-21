import { FORMATS, type Format, type ResolvedInfo, type ResultTab } from '@/types';

/** A finished MCP tool call, as the chat backend streams it ({"type":"tool_result",...}). */
export interface ToolResult {
  name: string;
  args: Record<string, unknown> | null;
  output: string | null;
  error: string | null;
}

type NewTab = Omit<ResultTab, 'id' | 'number' | 'timestamp'>;

function fmt(v: unknown, dflt: Format): Format {
  const f = typeof v === 'string' ? (v.trim().toUpperCase() as Format) : dflt;
  return FORMATS.includes(f) ? f : dflt;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

/**
 * Indents compact JSON (the MCP returns it on one line to save tokens). Works on the text, without JSON.parse,
 * so big ASN.1 INTEGERs keep every digit. Anything that isn't a JSON object/array is returned unchanged.
 */
export function prettyJson(text: string): string {
  const t = text.trim();
  if (!(t.startsWith('{') || t.startsWith('[')) || t.includes('\n  ')) return text;
  let out = '';
  let depth = 0;
  let inStr = false;
  const nl = () => '\n' + '  '.repeat(depth);
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (inStr) {
      out += c;
      if (c === '\\') out += t[++i] ?? '';
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      out += c;
    } else if (c === '{' || c === '[') {
      const close = c === '{' ? '}' : ']';
      let j = i + 1;
      while (/\s/.test(t[j] ?? '')) j++;
      if (t[j] === close) {
        out += c + close; // empty {} / []
        i = j;
      } else {
        depth++;
        out += c + nl();
      }
    } else if (c === '}' || c === ']') {
      depth--;
      out += nl() + c;
    } else if (c === ',') {
      out += ',' + nl();
    } else if (c === ':') {
      out += ': ';
    } else if (!/\s/.test(c)) {
      out += c;
    }
  }
  return out;
}

/** JER bodies come back indented; other formats unchanged. */
function shape(format: Format, body: string): string {
  return format === 'JER' ? prettyJson(body) : body;
}

/** The MCP's decode prefixes "Decoded as CAM v2 (_cam_v2:CAM), auto-detected …" + blank line when it auto-detected. */
const NOTE = /^Decoded as (.+?)(?: \(([^)]+)\))?, auto-detected[^\n]*\n\n/;

function splitNote(output: string): { body: string; info?: ResolvedInfo } {
  const m = NOTE.exec(output);
  if (!m) return { body: output };
  const info: ResolvedInfo = m[2]
    ? { resolvedMessage: m[1], resolvedRef: m[2], autoDetected: true }
    : { resolvedRef: m[1], autoDetected: true };
  return { body: output.slice(m[0].length), info };
}

/** The result tab a codec tool call opens in the right panel, or null for tools that don't produce a payload. */
export function tabFromToolResult(r: ToolResult): NewTab | null {
  const tab = rawTab(r);
  return tab ? { ...tab, content: shape(tab.format, tab.content) } : null;
}

function rawTab(r: ToolResult): NewTab | null {
  if (!r.output) return null;
  const a = r.args ?? {};
  const ref = str(a.ref).trim();
  const refInfo: ResolvedInfo | undefined = ref ? { resolvedRef: ref, autoDetected: false } : undefined;
  switch (r.name) {
    case 'decode': {
      const { body, info } = splitNote(r.output);
      return { format: fmt(a.to, 'JER'), content: body, originalInput: str(a.payload), info: info ?? refInfo };
    }
    case 'convert': {
      const { body, info } = splitNote(r.output);
      return { format: fmt(a.to, 'JER'), content: body, originalInput: str(a.payload), info: info ?? refInfo };
    }
    case 'encode':
      return { format: fmt(a.to, 'UPER'), content: r.output, originalInput: str(a.payload), info: refInfo };
    case 'generate':
      return {
        format: fmt(a.format, 'JER'),
        content: r.output,
        originalInput: `generate ${ref}${a.minimal === true ? ' (minimal)' : ''}`,
        info: refInfo,
      };
    default:
      return null;
  }
}
