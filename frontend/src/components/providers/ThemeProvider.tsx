"use client";

import { useEffect } from "react";
import { useThemeStore, getEffectiveTheme } from "@/store/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const effectiveTheme = getEffectiveTheme(theme);
    const root = document.documentElement;
    
    root.classList.remove("light", "dark");
    root.classList.add(effectiveTheme);
    
    root.setAttribute("data-theme", effectiveTheme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const effectiveTheme = getEffectiveTheme("system");
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(effectiveTheme);
        document.documentElement.setAttribute("data-theme", effectiveTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return <>{children}</>;
}
