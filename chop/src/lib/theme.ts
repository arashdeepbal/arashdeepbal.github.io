export const THEME_MODES = ["system", "light", "dark"] as const;

export type ThemeMode = (typeof THEME_MODES)[number];
export type ResolvedTheme = Exclude<ThemeMode, "system">;

const STORAGE_KEY = "chop-theme-mode";

function isThemeMode(value: string | null): value is ThemeMode {
  return value !== null && THEME_MODES.includes(value as ThemeMode);
}

export function readThemeMode(): ThemeMode {
  try {
    const storedMode = window.localStorage.getItem(STORAGE_KEY);
    return isThemeMode(storedMode) ? storedMode : "system";
  } catch {
    return "system";
  }
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return mode;
}

export function applyThemeMode(mode: ThemeMode): ResolvedTheme {
  const resolvedTheme = resolveTheme(mode);
  const root = document.documentElement;

  root.classList.toggle("dark", resolvedTheme === "dark");
  root.style.colorScheme = resolvedTheme;
  root.dataset.theme = mode;

  return resolvedTheme;
}

export function persistThemeMode(mode: ThemeMode) {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Theme still works for this session when storage is unavailable.
  }
}
