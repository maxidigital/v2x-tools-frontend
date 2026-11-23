import { useEffect, useRef, type KeyboardEvent } from 'react';
import { ArrowUp, Check, FileInput, Loader2, LogIn, PanelRight, Plus, Shuffle, Sparkles, Square, Wrench, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { signIn } from '@/components/layout/TopBar';
import { useAuthStore } from '@/stores/useAuthStore';
import { useConverterStore } from '@/stores/useConverterStore';
import { useUiStore } from '@/stores/useUiStore';
import { ChatMarkdown, splitSuggestions } from './ChatMarkdown';
import { useChatStore, type ChatMessage } from './useChatStore';
import { workspaceSummary } from './workspaceContext';
import { collapseResults } from './collapseResults';

const SUGGESTIONS = [
  'Generate a minimal CAM',
  'Generate a DENM for roadworks and explain its fields',
  'What changed between CPM 1 and CPM 2?',
  'Which message versions does auto-detect use?',
];

function openResult(tabId: string) {
  useChatStore.getState().setOutputHidden(false);
  useConverterStore.getState().setActiveTab(tabId);
}

function ToolChip({ name, done, error, tabId }: { name: string; done: boolean; error?: string; tabId?: string }) {
  const open = () => tabId && openResult(tabId);
  return (
    <button
      type="button"
      onClick={open}
      disabled={!tabId}
      title={error ?? (tabId ? 'Show the result' : undefined)}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px]',
        error ? 'border-destructive/50 text-destructive' : 'border-border text-muted-foreground',
        tabId && 'hover:border-primary hover:text-primary'
      )}
    >
      {done ? error ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" /> : <Loader2 className="h-3 w-3 animate-spin" />}
      <Wrench className="h-3 w-3" />
      {name}
      {tabId && <PanelRight className="h-3 w-3" />}
    </button>
  );
}

/** Put a follow-up into the input box (not sent: the user can edit it first). */
function pickSuggestion(text: string) {
  useChatStore.getState().setDraft(text);
  requestAnimationFrame(() => {
    const el = document.getElementById('chat-input') as HTMLTextAreaElement | null;
    el?.focus();
    el?.setSelectionRange(text.length, text.length);
  });
}

function Message({ m, last, streaming }: { m: ChatMessage; last: boolean; streaming: boolean }) {
  if (m.role === 'user')
    return (
      <div className="flex flex-col items-end gap-1">
        {m.context && <span className="text-[11px] text-muted-foreground">+ workspace: {m.context}</span>}
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-primary/10 px-4 py-2 text-sm">{m.content}</div>
      </div>
    );
  return (
    <div className="space-y-2">
      {!!m.tools?.length && (
        <div className="flex flex-wrap gap-1.5">
          {m.tools.map((t, i) => (
            <ToolChip key={i} {...t} />
          ))}
        </div>
      )}
      {m.content ? (
        <AnswerBody text={m.content} />
      ) : (
        last && streaming && !m.error && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      )}
      {m.error && <p className="text-sm text-destructive">{m.error}</p>}
      {m.needsLogin && (
        <Button size="sm" onClick={signIn}>
          <LogIn /> Sign in to keep chatting
        </Button>
      )}
    </div>
  );
}

function AnswerBody({ text }: { text: string }) {
  const { body, suggestions } = splitSuggestions(text);
  // results already open in the side panel are not shown twice
  const tabs = useConverterStore((s) => s.tabs);
  return (
    <>
      <ChatMarkdown text={collapseResults(body, tabs)} onOpenResult={openResult} />
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {suggestions.map((sg) => (
            <button
              key={sg}
              type="button"
              onClick={() => pickSuggestion(sg)}
              title="Put it in the message box"
              className="rounded-full border border-primary/40 bg-primary/5 px-3 py-1 text-left text-xs text-primary hover:bg-primary/10"
            >
              {sg}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function Composer({ big }: { big?: boolean }) {
  const { draft, setDraft, send, stop, streaming, attachContext, setAttachContext } = useChatStore();
  // re-render when the workspace changes, so the context chip stays current
  const payload = useConverterStore((s) => s.payload);
  const activeTabId = useConverterStore((s) => s.activeTabId);
  const summary = workspaceSummary();
  void payload;
  void activeTabId;
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, [draft === '']);

  const submit = () => {
    if (!draft.trim() || streaming) return;
    void send(draft);
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="w-full space-y-1.5">
      {summary && (
        <div className="flex items-center gap-2 text-xs">
          {attachContext ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/5 px-2 py-0.5 text-primary">
              Workspace: {summary}
              <button type="button" onClick={() => setAttachContext(false)} aria-label="Don't send the workspace">
                <X className="h-3 w-3" />
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="text-muted-foreground underline-offset-2 hover:underline"
              onClick={() => setAttachContext(true)}
            >
              + Attach workspace ({summary})
            </button>
          )}
        </div>
      )}
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2 focus-within:border-primary">
        <textarea
          id="chat-input"
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          rows={big ? 3 : 1}
          placeholder="Paste a payload or ask anything about ASN.1 and V2X…"
          className="max-h-48 min-h-[2.25rem] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        {streaming ? (
          <Button size="icon" variant="secondary" onClick={stop} aria-label="Stop">
            <Square />
          </Button>
        ) : (
          <Button size="icon" onClick={submit} disabled={!draft.trim()} aria-label="Send">
            <ArrowUp />
          </Button>
        )}
      </div>
    </div>
  );
}

function Hero() {
  const send = useChatStore((s) => s.send);
  const user = useAuthStore((s) => s.user);
  const setInputMode = useUiStore((s) => s.setInputMode);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-4">
      <div className="space-y-2 text-center">
        <Sparkles className="mx-auto h-7 w-7 text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight">Your ASN.1 and V2X expert</h1>
        <p className="text-sm text-muted-foreground">
          Decode, encode and generate CAM, DENM, CPM, MAPEM, SPATEM, IVIM… or ask about any field.
        </p>
      </div>
      <div className="w-full max-w-2xl">
        <Composer big />
      </div>
      <div className="flex max-w-2xl flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => void send(s)}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        or use the tools directly:{' '}
        <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => setInputMode('paste')}>
          <FileInput className="h-3 w-3" /> Convert
        </button>{' '}
        ·{' '}
        <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => setInputMode('generate')}>
          <Shuffle className="h-3 w-3" /> Generate
        </button>
      </p>
      {!user && (
        <p className="text-xs text-muted-foreground">
          Try it without an account ·{' '}
          <button className="text-primary hover:underline" onClick={signIn}>
            Sign in
          </button>{' '}
          for more messages per day
        </p>
      )}
      <p className="max-w-xl text-center text-[11px] text-muted-foreground">
        What you send goes to an external AI provider. Don't send confidential or production data: use Convert for that.
      </p>
    </div>
  );
}

export function ChatPanel() {
  const { messages, streaming, remaining, anonymous, reset, outputHidden, setOutputHidden } = useChatStore();
  const user = useAuthStore((s) => s.user);
  const hasTabs = useConverterStore((s) => s.tabs.length > 0);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  if (!messages.length) return <Hero />;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Ask AI
        </span>
        <div className="flex items-center gap-1">
          {hasTabs && (
            <Button variant="ghost" size="sm" onClick={() => setOutputHidden(!outputHidden)}>
              <PanelRight /> {outputHidden ? 'Show results' : 'Hide results'}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={reset} disabled={streaming}>
            <Plus /> New chat
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-5 px-4 py-4">
          {messages.map((m, i) => (
            <Message key={m.id} m={m} last={i === messages.length - 1} streaming={streaming} />
          ))}
          <div ref={end} />
        </div>
      </div>
      <div className="shrink-0 border-t border-border px-4 py-3">
        <div className="mx-auto max-w-3xl space-y-1">
          <Composer />
          <p className="text-center text-[11px] text-muted-foreground">
            Goes to an external AI provider: no confidential data.
            {remaining != null && ` · ${remaining} ${anonymous ? 'free ' : ''}messages left today`}
            {!user && (
              <>
                {' · '}
                <button className="text-primary hover:underline" onClick={signIn}>
                  Sign in for more
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
