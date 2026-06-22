import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const MIN = 10;
const MAX = 24;
const DEFAULT = 13;

/** Output font-size control (A- / A+), persisted. Mirrors the legacy 6–24px range. */
export function useFontSize() {
  const [size, setSize] = useLocalStorage('v2x-output-font-size', DEFAULT);

  const decrease = useCallback(() => setSize((s) => Math.max(MIN, s - 1)), [setSize]);
  const increase = useCallback(() => setSize((s) => Math.min(MAX, s + 1)), [setSize]);

  return { size, decrease, increase, canDecrease: size > MIN, canIncrease: size < MAX };
}
