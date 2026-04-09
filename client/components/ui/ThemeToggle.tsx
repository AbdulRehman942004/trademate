"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeStore, type Theme } from "@/stores/themeStore";
import { cn } from "@/lib/cn";

const OPTIONS: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: "light", icon: <Sun size={13} />, label: "Light" },
  { value: "system", icon: <Monitor size={13} />, label: "System" },
  { value: "dark", icon: <Moon size={13} />, label: "Dark" },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useThemeStore();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg p-0.5",
        "bg-zinc-100 dark:bg-zinc-800",
        "border border-zinc-200 dark:border-zinc-700",
        className
      )}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          title={opt.label}
          aria-label={`${opt.label} theme`}
          className={cn(
            "flex items-center justify-center h-6 w-6 rounded-md transition-colors",
            theme === opt.value
              ? "bg-white dark:bg-zinc-600 text-zinc-900 dark:text-zinc-100 shadow-sm"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          )}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
