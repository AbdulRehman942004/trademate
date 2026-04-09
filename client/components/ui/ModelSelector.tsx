"use client";

import { ChevronDown } from "lucide-react";
import { AVAILABLE_MODELS } from "@/lib/models";
import { useChatStore } from "@/stores/chatStore";
import { cn } from "@/lib/cn";

export function ModelSelector() {
  const { selectedModelId, setSelectedModel } = useChatStore();
  const current = AVAILABLE_MODELS.find((m) => m.id === selectedModelId);

  return (
    <div className="relative inline-block">
      <select
        value={selectedModelId}
        onChange={(e) => setSelectedModel(e.target.value)}
        className={cn(
          "appearance-none cursor-pointer pl-3 pr-7 py-1.5 text-sm font-medium rounded-lg",
          "bg-transparent border border-zinc-200 dark:border-zinc-700",
          "text-zinc-800 dark:text-zinc-200",
          "hover:bg-zinc-50 dark:hover:bg-zinc-800",
          "focus:outline-none focus:ring-2 focus:ring-zinc-400",
          "transition-colors"
        )}
      >
        {AVAILABLE_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500"
      />
    </div>
  );
}
