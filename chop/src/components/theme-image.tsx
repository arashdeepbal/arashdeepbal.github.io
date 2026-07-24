import type { ComponentProps } from "react";
import { useThemeMode } from "@/hooks/use-theme-mode";

interface ThemeImageProps extends ComponentProps<"img"> {
  darkSrc: string;
}

/** Uses a dedicated dark illustration rather than filtering light artwork at runtime. */
export function ThemeImage({ src, darkSrc, ...props }: ThemeImageProps) {
  const { resolvedTheme } = useThemeMode();
  return <img src={resolvedTheme === "dark" ? darkSrc : src} {...props} />;
}
