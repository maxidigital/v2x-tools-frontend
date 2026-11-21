import { useConverterStore } from '@/stores/useConverterStore';
import { detectFormat, hexByteLength } from '@/lib/formatDetect';

/** Cap on what one context block carries to the model (the chat backend refuses messages over 40k chars). */
const MAX_PART = 15_000;

function clip(s: string): string {
  return s.length > MAX_PART ? `${s.slice(0, MAX_PART)}\n… (truncated, ${s.length} characters in total)` : s;
}

function active() {
  const { tabs, activeTabId } = useConverterStore.getState();
  return tabs.find((t) => t.id === activeTabId) ?? null;
}

/** "Input · UPER · 45 bytes + result #3 · JER", or null when the workspace is empty. */
export function workspaceSummary(): string | null {
  const { payload, inputFormat } = useConverterStore.getState();
  const parts: string[] = [];
  const p = payload.trim();
  if (p) {
    const fmt = detectFormat(p) ?? inputFormat;
    const bytes = fmt === 'UPER' || fmt === 'WER' ? hexByteLength(p) : null;
    parts.push(`Input · ${fmt}${bytes ? ` · ${bytes} bytes` : ''}`);
  }
  const tab = active();
  if (tab) parts.push(`result #${tab.number} · ${tab.format}`);
  return parts.length ? parts.join(' + ') : null;
}

/** The [Workspace] block prepended to the user's message (see the chat backend's instructions). */
export function workspaceBlock(): string | null {
  const { payload, inputFormat, ref, compat } = useConverterStore.getState();
  const lines: string[] = [];
  const p = payload.trim();
  if (p) {
    const fmt = detectFormat(p) ?? inputFormat;
    lines.push(`Input payload (${fmt}${ref.trim() ? `, ref ${ref.trim()}` : ''}${compat !== 'standard' ? `, compat ${compat}` : ''}):`);
    lines.push('```', clip(p), '```');
  }
  const tab = active();
  if (tab) {
    const via = tab.info?.resolvedMessage ?? tab.info?.resolvedRef;
    lines.push(`Active result tab #${tab.number} (${tab.format}${via ? `, decoded as ${via}` : ''}):`);
    if (tab.originalInput.trim() && tab.originalInput.trim() !== p)
      lines.push('Its input:', '```', clip(tab.originalInput.trim()), '```');
    lines.push('```', clip(tab.content), '```');
  }
  return lines.length ? `[Workspace]\n${lines.join('\n')}\n[/Workspace]` : null;
}
