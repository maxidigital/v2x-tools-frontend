import { create } from 'zustand';

export type InputMode = 'paste' | 'generate';

interface UiState {
  inputMode: InputMode;
  setInputMode: (m: InputMode) => void;
}

export const useUiStore = create<UiState>((set) => ({
  inputMode: 'paste',
  setInputMode: (inputMode) => set({ inputMode }),
}));
