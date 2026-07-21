import type { SplitMode } from "@/types";

const STORAGE_PREFIX = "chop:bill-form:split-mode:";
const SPLIT_MODES = new Set<SplitMode>(["equal", "amount", "percentage"]);

export function parseStoredSplitMode(value: string | null): SplitMode {
  return value && SPLIT_MODES.has(value as SplitMode)
    ? (value as SplitMode)
    : "equal";
}

export function readLastSplitMode(tripId: string): SplitMode {
  try {
    return parseStoredSplitMode(
      localStorage.getItem(`${STORAGE_PREFIX}${tripId}`),
    );
  } catch {
    return "equal";
  }
}

export function rememberLastSplitMode(tripId: string, mode: SplitMode) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${tripId}`, mode);
  } catch {
    // The bill form still works when storage is unavailable or full.
  }
}

export function forgetBillFormPreferences(tripId: string) {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${tripId}`);
  } catch {
    // Ignore unavailable storage.
  }
}
