import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
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

/** Transparent theme so the editor inherits our token-based surfaces. */
export const editorTheme: Extension = EditorView.theme({
  '&': { backgroundColor: 'transparent', height: '100%' },
  '.cm-gutters': { backgroundColor: 'transparent', border: 'none' },
  '.cm-content': { fontFamily: 'var(--font-mono, monospace)' },
  '.cm-scroller': { fontFamily: 'inherit' },
  '&.cm-focused': { outline: 'none' },
});

/** Soft line wrapping for long hex/JSON lines. */
export const wrap: Extension = EditorView.lineWrapping;
