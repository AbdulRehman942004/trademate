"use client";

import { Share2, MoreHorizontal, Menu } from "lucide-react";
import { ModelSelector } from "@/components/ui/ModelSelector";
import { IconButton } from "@/components/ui/IconButton";
import { useUIStore } from "@/stores/uiStore";

export function ChatHeader() {
  const { toggleMobileSidebar } = useUIStore();

  return (
    <header className="flex items-center justify-between px-4 h-14 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {/* Hamburger: visible on mobile only */}
        <button
          onClick={toggleMobileSidebar}
          aria-label="Open sidebar"
          className="lg:hidden h-8 w-8 rounded-lg inline-flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Menu size={18} />
        </button>
        <ModelSelector />
      </div>

      <div className="flex items-center gap-1">
        <IconButton label="Share conversation">
          <Share2 size={16} />
        </IconButton>
        <IconButton label="More options">
          <MoreHorizontal size={16} />
        </IconButton>
      </div>
    </header>
  );
}
