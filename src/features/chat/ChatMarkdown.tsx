import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * The follow-ups the model offers at the end of an answer, as a block the backend's instructions ask for:
 *   :::suggestions
 *   - Decode it again to verify
 *   :::
 * Taken out of the text (also while it is still streaming, so it never flashes) and shown as clickable chips.
 */
const SUGGESTIONS = /\n*:::suggestions[ \t]*\n([\s\S]*?)(?:\n:::[ \t]*(?:\n|$)|$)/;

export function splitSuggestions(text: string): { body: string; suggestions: string[] } {
  const m = SUGGESTIONS.exec(text);
  if (!m) {
    // a block that has only begun streaming (":::sugg…")
    const partial = /\n+:{1,3}(s[a-z]*)?$/.exec(text);
    return { body: partial && ':::suggestions'.startsWith(partial[0].trim()) ? text.slice(0, partial.index) : text, suggestions: [] };
  }
  const suggestions = m[1]
    .split('\n')
    .map((l) => l.replace(/^\s*([-*]|\d+\.)\s+/, '').trim())
    .filter(Boolean);
  return { body: text.slice(0, m.index) + text.slice(m.index + m[0].length), suggestions };
}

const components: Components = {
  p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
  h1: ({ children }) => <p className="text-base font-semibold">{children}</p>,
  h2: ({ children }) => <p className="text-base font-semibold">{children}</p>,
  h3: ({ children }) => <p className="font-semibold">{children}</p>,
  h4: ({ children }) => <p className="font-semibold">{children}</p>,
  ul: ({ children }) => <ul className="list-disc space-y-0.5 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal space-y-0.5 pl-5">{children}</ol>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer noopener" className="text-primary underline underline-offset-2">
      {children}
    </a>
  ),
  blockquote: ({ children }) => <blockquote className="border-l-2 border-border pl-3 text-muted-foreground">{children}</blockquote>,
  pre: ({ children }) => <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">{children}</pre>,
  code: ({ children, className }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">{children}</code>
    ),
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-border bg-muted px-2 py-1 text-left font-medium">{children}</th>,
  td: ({ children }) => <td className="border border-border px-2 py-1 align-top">{children}</td>,
  hr: () => <hr className="border-border" />,
};

/** The assistant's Markdown (GFM: tables, lists, code). Raw HTML in the text is never interpreted. */
export function ChatMarkdown({ text }: { text: string }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed [&_pre_code]:bg-transparent [&_pre_code]:p-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
