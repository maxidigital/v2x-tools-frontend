import { create } from 'zustand';

export type InputMode = 'paste' | 'generate';

interface UiState {
  inputMode: InputMode;
  setInputMode: (m: InputMode) => void;
  /** Welcome / waitlist dialog: opened on entry, or again from the footer link. */
  welcomeOpen: boolean;
  setWelcomeOpen: (open: boolean) => void;
  /** The visitor left their email on this browser: the footer link goes away. */
  waitlistJoined: boolean;
  setWaitlistJoined: () => void;
}

function joinedBefore(): boolean {
  try {
    return localStorage.getItem('v2x-waitlist-joined') != null;
  } catch {
    return false;
  }
}

export const useUiStore = create<UiState>((set) => ({
  inputMode: 'paste',
  setInputMode: (inputMode) => set({ inputMode }),
  welcomeOpen: false,
  setWelcomeOpen: (welcomeOpen) => set({ welcomeOpen }),
  waitlistJoined: joinedBefore(),
  setWaitlistJoined: () => set({ waitlistJoined: true }),
}));
