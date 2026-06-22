import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { useTheme } from '@/hooks/useTheme';
import { languageForFormat, editorTheme, wrap } from '@/lib/cmExtensions';
import type { Format } from '@/types';

interface CodeViewProps {
  value: string;
  onChange?: (value: string) => void;
  format: Format;
  readOnly?: boolean;
  placeholder?: string;
  fontSize?: number;
  className?: string;
}

/** Shared CodeMirror surface used for both the input editor and output viewer. */
export function CodeView({
  value,
  onChange,
  format,
  readOnly = false,
  placeholder,
  fontSize = 13,
  className,
}: CodeViewProps) {
  const { isDark } = useTheme();

  const extensions = useMemo(
    () => [
      ...languageForFormat(format),
      editorTheme,
      wrap,
      EditorView.theme({ '.cm-content': { fontSize: `${fontSize}px` } }),
    ],
    [format, fontSize]
  );

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      theme={isDark ? 'dark' : 'light'}
      extensions={extensions}
      basicSetup={{
        lineNumbers: true,
        foldGutter: format === 'JER' || format === 'XER',
        highlightActiveLine: !readOnly,
        autocompletion: false,
      }}
      className={className}
      height="100%"
      style={{ height: '100%' }}
    />
  );
}
