import { create } from 'zustand';
import { useAuthStore } from '@/stores/useAuthStore';

// After every EVERY successful actions (conversions today; AI requests later), nudge an ANONYMOUS
// user to sign in — a soft, non-blocking prompt that sells the account. Tunable via env.
const COUNT_KEY = 'v2x-action-count';
const EVERY = Number(import.meta.env.VITE_NUDGE_EVERY ?? 5);

function readCount(): number {
  try {
    const n = Number(localStorage.getItem(COUNT_KEY));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function persistCount(n: number) {
  try {
    localStorage.setItem(COUNT_KEY, String(n));
  } catch {
    // quota / unavailable — non-fatal
  }
}

interface NudgeState {
  count: number;
  open: boolean;
  /** Record one billable action; opens the nudge on every EVERY-th action for anonymous users. */
  recordAction: () => void;
  dismiss: () => void;
}

export const useNudgeStore = create<NudgeState>((set, get) => ({
  count: readCount(),
  open: false,

  recordAction: () => {
    const count = get().count + 1;
    persistCount(count);
    set({ count });
    const anonymous = useAuthStore.getState().user == null;
    if (anonymous && EVERY > 0 && count % EVERY === 0) set({ open: true });
  },

  dismiss: () => set({ open: false }),
}));
