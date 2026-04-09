"use client";

import { Share2, MoreHorizontal } from "lucide-react";
import { ModelSelector } from "@/components/ui/ModelSelector";
import { IconButton } from "@/components/ui/IconButton";

export function ChatHeader() {
  return (
    <header className="flex items-center justify-between px-4 h-14 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
      <ModelSelector />

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
