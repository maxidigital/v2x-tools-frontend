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
