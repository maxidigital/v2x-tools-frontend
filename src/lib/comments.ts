import type { Compat, Format } from '@/types';

/**
 * Comments in an input: whole lines starting with `#`. Never part of a payload (hex, JSON and XML lines can't start
 * with `#`), so they are stripped before format detection and before sending. A result tab's Input starts with
 * them: what it was for (the AI's comment, if any) and the operation that produced it, e.g.
 *   # Minimal CAM without the low-frequency container
 *   # generate ref=_cam_v2 format=JER content=MINIMAL
 */
const COMMENT = /^[ \t]*#/;

export function splitComments(text: string): { comments: string[]; body: string } {
  const comments: string[] = [];
  const body: string[] = [];
  for (const line of text.split('\n')) {
    if (COMMENT.test(line)) comments.push(line.replace(/^[ \t]*#[ \t]?/, ''));
    else body.push(line);
  }
  return { comments, body: body.join('\n').replace(/^\n+/, '') };
}

export function stripComments(text: string): string {
  return text.includes('#') ? splitComments(text).body : text;
}

export type Op = 'decode' | 'encode' | 'convert' | 'generate' | 'validate';

export interface Origin {
  op: Op;
  ref?: string;
  from?: Format;
  to?: Format;
  /** generate: MINIMAL | RANDOM | FULL */
  content?: string;
  /** generate: the path=value lines it was given (shown so the message can be rebuilt or changed) */
  set?: string[];
  compat?: Compat;
}

const BINARY: Format[] = ['UPER', 'WER'];

/** The operation of a conversion, named like the MCP tools: binary → text is decode, text → binary encode. */
export function convertOp(from: Format, to: Format): Op {
  const b = (f: Format) => BINARY.includes(f);
  return b(from) && !b(to) ? 'decode' : !b(from) && b(to) ? 'encode' : 'convert';
}

/** One line in the MCP tools' terms: `decode ref=_cam_v2 from=UPER to=JER`. */
export function originLine(o: Origin): string {
  const parts: string[] = [o.op];
  if (o.ref) parts.push(`ref=${o.ref}`);
  if (o.op === 'generate') {
    if (o.to) parts.push(`format=${o.to}`);
    parts.push(`content=${o.content ?? 'MINIMAL'}`);   // the MCP's default
  } else {
    if (o.from) parts.push(`from=${o.from}`);
    if (o.to) parts.push(`to=${o.to}`);
  }
  if (o.compat && o.compat !== 'standard') parts.push(`compat=${o.compat}`);
  return parts.join(' ');
}

/** A tab's Input: the comment lines (what for, then the operation), then the input payload if there is one. */
export function withOrigin(origin: Origin, input: string, comment?: string): string {
  const lines = [comment?.trim(), originLine(origin), ...(origin.set ?? []).map((l) => `set ${l}`)]
    .filter(Boolean)
    .map((l) => `# ${l!.replace(/\s*\n\s*/g, ' ')}`);
  const body = input.trim();
  return body ? `${lines.join('\n')}\n${body}` : lines.join('\n');
}
