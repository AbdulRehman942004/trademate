import { TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <TrendingUp size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            TradeMate
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Page content */}
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-zinc-400 dark:text-zinc-600">
        © {new Date().getFullYear()} TradeMate. All rights reserved.
      </footer>
    </div>
  );
}
