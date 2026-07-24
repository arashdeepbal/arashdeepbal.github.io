import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  applyThemeMode,
  persistThemeMode,
  readThemeMode,
  resolveTheme,
  type ResolvedTheme,
  type ThemeMode,
} from "@/lib/theme";
import { ThemeModeContext, type ThemeModeContextValue } from "@/components/theme-mode-context";

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readThemeMode);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(mode));

  useEffect(() => {
    const updateTheme = () => setResolvedTheme(applyThemeMode(mode));
    updateTheme();

    if (mode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateTheme);
      return () => mediaQuery.removeEventListener("change", updateTheme);
    }

    // Older iOS Home Screen web apps only expose the legacy listener API.
    mediaQuery.addListener(updateTheme);
    return () => mediaQuery.removeListener(updateTheme);
  }, [mode]);

  const value = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      resolvedTheme,
      setMode: (nextMode) => {
        persistThemeMode(nextMode);
        setModeState(nextMode);
      },
    }),
    [mode, resolvedTheme],
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}
