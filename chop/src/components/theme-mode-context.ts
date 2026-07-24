import { createContext } from "react";
import type { ResolvedTheme, ThemeMode } from "@/lib/theme";

export interface ThemeModeContextValue {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);
