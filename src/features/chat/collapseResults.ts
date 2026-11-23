import type { ResultTab } from '@/types';

/** Link target the Markdown renderer turns into a "result #N" chip. */
export const RESULT_HREF = '#result-';

const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();

/** Small blocks (a field, a short snippet) are always shown: only whole results are worth collapsing. */
const MIN_CHARS = 40;

/**
 * Replaces code blocks that repeat a result already open in the side panel with a link to that tab,
 * so a payload or JSON the model pasted back is not shown twice. Whitespace and case are ignored
 * (the model re-indents JSON, hex may change case). A fragment of a result (to explain a field) does
 * not match and is kept. While streaming, an unclosed block that is so far a prefix of a result is
 * collapsed too, so it never flashes.
 */
export function collapseResults(text: string, tabs: Pick<ResultTab, 'id' | 'number' | 'format' | 'content'>[]): string {
  if (!tabs.length || !text.includes('```')) return text;
  const results = tabs.map((t) => ({ t, n: norm(t.content) })).filter((r) => r.n.length >= MIN_CHARS);
  if (!results.length) return text;

  const find = (code: string, closed: boolean) => {
    const c = norm(code);
    if (c.length < MIN_CHARS) return undefined;
    return results.find((r) => (closed ? r.n === c : r.n.startsWith(c)))?.t;
  };
  const link = (t: (typeof tabs)[number]) => `[result #${t.number} · ${t.format}](${RESULT_HREF}${t.id})`;

  const lines = text.split('\n');
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const open = /^\s*(`{3,})/.exec(lines[i]);
    if (!open) {
      out.push(lines[i]);
      continue;
    }
    const fence = open[1];
    let j = i + 1;
    while (j < lines.length && !new RegExp(`^\\s*${fence}\\s*$`).test(lines[j])) j++;
    const closed = j < lines.length;
    const tab = find(lines.slice(i + 1, j).join('\n'), closed);
    if (tab) out.push(link(tab));
    else out.push(...lines.slice(i, closed ? j + 1 : j));
    i = j;
  }
  return out.join('\n');
}
