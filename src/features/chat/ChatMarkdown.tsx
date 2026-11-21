import { Fragment, type ReactNode } from 'react';

/** Inline: `code` and **bold**. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`\n]+`|\*\*[^*\n]+\*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    out.push(
      t.startsWith('`') ? (
        <code key={m.index} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          {t.slice(1, -1)}
        </code>
      ) : (
        <strong key={m.index}>{t.slice(2, -2)}</strong>
      )
    );
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * Just enough Markdown for the assistant's answers: ``` fences, headings, bullet lists, inline code and bold.
 * No HTML is ever interpreted (everything is React text).
 */
export function ChatMarkdown({ text }: { text: string }) {
  const parts = text.split(/```[^\n]*\n?/);
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre key={i} className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
            {part.replace(/\n$/, '')}
          </pre>
        ) : (
          <Fragment key={i}>
            {part
              .split(/\n{2,}/)
              .filter((b) => b.trim())
              .map((block, j) => {
                const lines = block.split('\n');
                if (lines.every((l) => /^\s*([-*]|\d+\.)\s+/.test(l)))
                  return (
                    <ul key={j} className="list-disc space-y-0.5 pl-5">
                      {lines.map((l, k) => (
                        <li key={k}>{inline(l.replace(/^\s*([-*]|\d+\.)\s+/, ''))}</li>
                      ))}
                    </ul>
                  );
                const h = /^#{1,4}\s+(.*)$/.exec(block);
                if (h && lines.length === 1)
                  return (
                    <p key={j} className="font-semibold">
                      {inline(h[1])}
                    </p>
                  );
                return (
                  <p key={j} className="whitespace-pre-wrap">
                    {inline(block)}
                  </p>
                );
              })}
          </Fragment>
        )
      )}
    </div>
  );
}
