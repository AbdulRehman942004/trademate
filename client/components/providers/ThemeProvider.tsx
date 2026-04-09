"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";

/**
 * Applies the resolved theme class (.dark) to <html> and keeps it in sync
 * whenever the theme or system preference changes.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme } = useThemeStore();

  useEffect(() => {
    const apply = () => {
      const resolved = resolvedTheme();
      document.documentElement.classList.toggle("dark", resolved === "dark");
    };

    apply();

    // Re-apply if user changes system preference while on "system" mode
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme, resolvedTheme]);

  return <>{children}</>;
}
