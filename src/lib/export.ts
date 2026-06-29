import type { ResultTab } from '@/types';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Collapse insignificant whitespace for CSV cells (legacy `normalizeContent`). */
function normalizeContent(text: string): string {
  return text.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
}

function tabTitle(tab: ResultTab): string {
  return tab.customName ?? `${tab.format} ${tab.timestamp}`;
}

/** Build a standalone, theme-light HTML report for one or more result tabs. */
export function buildHtml(tabs: ResultTab[]): string {
  const sections = tabs
    .map(
      (t) => `
    <section>
      <h2>${escapeHtml(tabTitle(t))}</h2>
      <h3>Input</h3>
      <pre>${escapeHtml(t.originalInput)}</pre>
      <h3>Output (${escapeHtml(t.format)})</h3>
      <pre>${escapeHtml(t.content)}</pre>
    </section>`
    )
    .join('\n');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<title>asn1click export</title>
<style>
  body{font-family:Inter,system-ui,sans-serif;margin:2rem;color:#0f1117;background:#fff}
  h1{font-size:1.25rem} h2{font-size:1rem;margin-top:1.5rem}
  h3{font-size:.8rem;color:#475569;margin:.75rem 0 .25rem}
  pre{font-family:"JetBrains Mono",monospace;font-size:.8rem;white-space:pre-wrap;
      word-break:break-word;background:#f1f5f9;padding:.75rem;border-radius:.5rem}
</style></head>
<body><h1>asn1click — conversion export</h1>${sections}</body></html>`;
}

/** Build a CSV report (one row per tab). */
export function buildCsv(tabs: ResultTab[]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = ['name', 'format', 'timestamp', 'input', 'output'];
  const rows = tabs.map((t) =>
    [
      esc(tabTitle(t)),
      esc(t.format),
      esc(t.timestamp),
      esc(normalizeContent(t.originalInput)),
      esc(normalizeContent(t.content)),
    ].join(',')
  );
  return [header.join(','), ...rows].join('\n');
}

/** Trigger a client-side file download. */
export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
