import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { EditorView } from '@codemirror/view';
import { Prec, type Extension } from '@codemirror/state';
import type { Format } from '@/types';

/** Map a wire format to a CodeMirror language extension (UPER/WER hex → none). */
export function languageForFormat(format: Format): Extension[] {
  switch (format) {
    case 'JER':
      return [json()];
    case 'XER':
      return [xml()];
    default:
      return []; // hex payloads: plain text
  }
}

/**
 * Transparent theme so the editor inherits the panel surface (bg-card) instead
 * of CodeMirror's own dark background. Prec.highest makes it win over the
 * built-in 'dark'/'light' theme passed as a prop.
 */
export const editorTheme: Extension = Prec.highest(
  EditorView.theme({
    '&': { backgroundColor: 'transparent', height: '100%' },
    '.cm-gutters': { backgroundColor: 'transparent', border: 'none' },
    '.cm-activeLine': { backgroundColor: 'hsl(var(--muted) / 0.4)' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent' },
    '.cm-content': { fontFamily: 'var(--font-mono, monospace)' },
    '.cm-scroller': { fontFamily: 'inherit' },
    '&.cm-focused': { outline: 'none' },
  })
);

/** Soft line wrapping for long hex/JSON lines. */
export const wrap: Extension = EditorView.lineWrapping;
