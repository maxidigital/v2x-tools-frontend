import { create } from 'zustand';
import type { Format, ResultTab } from '@/types';

interface ConverterState {
  // input
  payload: string;
  inputFormat: Format;
  outputFormat: Format;
  /** Optional message/type ref (empty = hub auto-detect). */
  ref: string;

  // output
  tabs: ResultTab[];
  activeTabId: string | null;
  tabCounter: number;

  setPayload: (v: string) => void;
  setInputFormat: (f: Format) => void;
  setOutputFormat: (f: Format) => void;
  setRef: (r: string) => void;

  addTab: (tab: Omit<ResultTab, 'id' | 'number' | 'timestamp'>) => void;
  closeTab: (id: string) => void;
  closeOthers: (id: string) => void;
  closeAll: () => void;
  renameTab: (id: string, name: string) => void;
  setActiveTab: (id: string) => void;
}

const now = () => new Date().toLocaleTimeString([], { hour12: false });

export const useConverterStore = create<ConverterState>((set) => ({
  payload: '',
  inputFormat: 'UPER',
  outputFormat: 'JER',
  ref: '',

  tabs: [],
  activeTabId: null,
  tabCounter: 0,

  setPayload: (payload) => set({ payload }),
  setInputFormat: (inputFormat) => set({ inputFormat }),
  setOutputFormat: (outputFormat) => set({ outputFormat }),
  setRef: (ref) => set({ ref }),

  addTab: (tab) =>
    set((s) => {
      const number = s.tabCounter + 1;
      const newTab: ResultTab = {
        ...tab,
        id: crypto.randomUUID(),
        number,
        timestamp: now(),
      };
      // newest on the left (matches legacy behavior)
      return { tabs: [newTab, ...s.tabs], activeTabId: newTab.id, tabCounter: number };
    }),

  closeTab: (id) =>
    set((s) => {
      const idx = s.tabs.findIndex((t) => t.id === id);
      const tabs = s.tabs.filter((t) => t.id !== id);
      let activeTabId = s.activeTabId;
      if (s.activeTabId === id) {
        activeTabId = tabs.length ? tabs[Math.min(idx, tabs.length - 1)].id : null;
      }
      return { tabs, activeTabId };
    }),

  closeOthers: (id) =>
    set((s) => ({ tabs: s.tabs.filter((t) => t.id === id), activeTabId: id })),

  closeAll: () => set({ tabs: [], activeTabId: null }),

  renameTab: (id, name) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, customName: name } : t)),
    })),

  setActiveTab: (activeTabId) => set({ activeTabId }),
}));

// ── Preserve work across a login round-trip ──────────────────────────────────────
// The converter state is in-memory only. Before an intentional navigation to login we stash a one-shot
// snapshot in sessionStorage (survives the same-tab navigation to the login page and back; auto-clears
// when the tab closes); on the next module load we restore it once and drop it. NOT permanent persistence,
// and NOT a Radix dialog/overlay — just a storage write + a guarded restore, so it can't block the UI.
const SNAPSHOT_KEY = 'v2x-converter-snapshot';

/** Stash the current converter state (incl. open tabs) so it survives a login navigation. */
export function snapshotConverter() {
  try {
    sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(useConverterStore.getState()));
  } catch {
    // quota / unavailable — non-fatal (we just fall back to losing the work)
  }
}

(function restoreConverterSnapshot() {
  try {
    const raw = sessionStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return;
    sessionStorage.removeItem(SNAPSHOT_KEY);
    // JSON dropped the methods; setState merges the data fields (incl. tabs) back over the live store.
    useConverterStore.setState(JSON.parse(raw) as Partial<ConverterState>);
  } catch {
    // ignore a corrupt snapshot
  }
})();
