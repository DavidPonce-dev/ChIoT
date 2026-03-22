"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeStore, type Theme } from "@/store/theme";

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const options: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: "Claro" },
    { value: "dark", icon: Moon, label: "Oscuro" },
    { value: "system", icon: Monitor, label: "Sistema" },
  ];

  return (
    <div className="flex items-center gap-1 bg-[var(--secondary)] rounded-lg p-1">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-2 rounded-md transition-all ${
            theme === value
              ? "bg-[var(--primary)] text-white shadow-md"
              : "text-[var(--muted-foreground)] hover:text-foreground hover:bg-[var(--secondary)]/80"
          }`}
          title={label}
          aria-label={`Tema ${label}`}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
