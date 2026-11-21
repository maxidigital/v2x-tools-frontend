import { create } from 'zustand';
import { useAuthStore } from '@/stores/useAuthStore';
import { useConverterStore } from '@/stores/useConverterStore';
import { useUiStore } from '@/stores/useUiStore';
import { workspaceBlock, workspaceSummary } from './workspaceContext';
import { tabFromToolResult, type ToolResult } from './toolResults';

/** A tool the model called during an answer; tabId = the result tab it opened (if any). */
export interface ToolCall {
  name: string;
  done: boolean;
  error?: string;
  tabId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  /** What the user sees. */
  content: string;
  /** What was sent to the model (content + [Workspace] block), user messages only. */
  sent?: string;
  /** Short label of the workspace context that went with it ("Input · UPER · 45 bytes"). */
  context?: string;
  tools?: ToolCall[];
  error?: string;
  /** The anonymous free messages ran out: show a sign-in button. */
  needsLogin?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  streaming: boolean;
  /** Messages left today (null = unlimited / unknown). */
  remaining: number | null;
  /** The last answer was served as an anonymous visitor (free trial messages). */
  anonymous: boolean;
  /** Send what's open in the workspace along with the next message. */
  attachContext: boolean;
  /** Text waiting in the input box (set by "Ask AI" entry points). */
  draft: string;
  /** The user hid the results panel in Ask mode. */
  outputHidden: boolean;

  setDraft: (d: string) => void;
  setAttachContext: (v: boolean) => void;
  setOutputHidden: (v: boolean) => void;
  send: (text: string) => Promise<void>;
  stop: () => void;
  reset: () => void;
}

let controller: AbortController | null = null;
const uid = () => crypto.randomUUID();

export const useChatStore = create<ChatState>((set, get) => {
  /** Apply a change to the assistant message being streamed (the last one). */
  const patchLast = (fn: (m: ChatMessage) => ChatMessage) =>
    set((s) => {
      const msgs = s.messages.slice();
      msgs[msgs.length - 1] = fn(msgs[msgs.length - 1]);
      return { messages: msgs };
    });

  return {
    messages: [],
    streaming: false,
    remaining: null,
    anonymous: false,
    attachContext: true,
    draft: '',
    outputHidden: false,

    setDraft: (draft) => set({ draft }),
    setAttachContext: (attachContext) => set({ attachContext }),
    setOutputHidden: (outputHidden) => set({ outputHidden }),

    reset: () => {
      controller?.abort();
      set({ messages: [], streaming: false, draft: '' });
    },

    stop: () => controller?.abort(),

    send: async (text) => {
      const content = text.trim();
      if (!content || get().streaming) return;
      const token = useAuthStore.getState().token;

      const block = get().attachContext ? workspaceBlock() : null;
      const user: ChatMessage = {
        id: uid(),
        role: 'user',
        content,
        sent: block ? `${block}\n\n${content}` : content,
        context: block ? (workspaceSummary() ?? undefined) : undefined,
      };
      const assistant: ChatMessage = { id: uid(), role: 'assistant', content: '', tools: [] };
      const history = [...get().messages, user];
      set({ messages: [...history, assistant], streaming: true, draft: '', outputHidden: false });

      controller = new AbortController();
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({
            client: 'webtools',
            messages: history
              .filter((m) => m.role === 'user' || m.content)
              .map((m) => ({ role: m.role, content: m.role === 'user' ? (m.sent ?? m.content) : m.content })),
          }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          let msg = `The chat did not answer (HTTP ${res.status})`;
          let needsLogin = false;
          try {
            const j = await res.json();
            if (j?.error) msg = j.error;
            needsLogin = j?.code === 'login_required';
          } catch {
            // keep the generic message
          }
          if (needsLogin) set({ remaining: 0, anonymous: true });
          patchLast((m) => ({ ...m, error: msg, needsLogin }));
          return;
        }

        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buf = '';
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += value;
          let nl: number;
          while ((nl = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line) continue;
            let ev: { type: string; [k: string]: unknown };
            try {
              ev = JSON.parse(line);
            } catch {
              continue;
            }
            handleEvent(ev);
          }
        }
      } catch (e) {
        if (!(e instanceof DOMException && e.name === 'AbortError'))
          patchLast((m) => ({ ...m, error: 'The connection was interrupted.' }));
      } finally {
        controller = null;
        patchLast((m) => ({ ...m, tools: m.tools?.map((t) => ({ ...t, done: true })) }));
        set({ streaming: false });
      }

      function handleEvent(ev: { type: string; [k: string]: unknown }) {
        switch (ev.type) {
          case 'text':
            patchLast((m) => ({ ...m, content: m.content + String(ev.delta ?? '') }));
            break;
          case 'tool':
            patchLast((m) => ({ ...m, tools: [...(m.tools ?? []), { name: String(ev.name), done: false }] }));
            break;
          case 'tool_result': {
            const r = ev as unknown as ToolResult;
            const tab = r.error ? null : tabFromToolResult(r);
            let tabId: string | undefined;
            if (tab) {
              useConverterStore.getState().addTab(tab);
              tabId = useConverterStore.getState().activeTabId ?? undefined;
            }
            patchLast((m) => {
              const tools = (m.tools ?? []).slice();
              const i = tools.findIndex((t) => t.name === r.name && !t.done);
              const call: ToolCall = { name: r.name, done: true, error: r.error ?? undefined, tabId };
              if (i >= 0) tools[i] = call;
              else tools.push(call);
              return { ...m, tools };
            });
            break;
          }
          case 'error':
            patchLast((m) => ({ ...m, error: String(ev.message ?? 'Error') }));
            break;
          case 'done':
            set({ remaining: typeof ev.remaining === 'number' ? ev.remaining : null, anonymous: ev.anonymous === true });
            break;
        }
      }
    },
  };
});

/**
 * Entry point from the rest of the tool ("Ask AI" on an error or a result): switch to Ask with the workspace
 * attached and either send right away or leave the question in the box.
 */
export function askAi(question: string, { send = false }: { send?: boolean } = {}) {
  useUiStore.getState().setInputMode('ask');
  const chat = useChatStore.getState();
  chat.setAttachContext(true);
  if (send) void chat.send(question);
  else chat.setDraft(question);
}
