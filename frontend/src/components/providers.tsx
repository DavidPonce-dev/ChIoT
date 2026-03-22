"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { useAuthStore } from "@/store/auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { useThemeStore, getEffectiveTheme } from "@/store/theme";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore();
  const [initialized, setInitialized] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setInitialized(true);
    checkAuth();
  }, [pathname, checkAuth]);

  return <>{children}</>;
}

function WebSocketProvider({ children }: { children: React.ReactNode }) {
  useWebSocket();
  return <>{children}</>;
}

function ThemeInitializer() {
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

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeInitializer />
        <AuthInitializer>
          <WebSocketProvider>{children}</WebSocketProvider>
          <Toaster />
        </AuthInitializer>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
