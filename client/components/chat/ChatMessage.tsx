"use client";

import { useState } from "react";
import { Copy, Check, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import type { Message } from "@/types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/cn";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === "assistant";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === "user") {
    return (
      <div className="flex justify-end px-4 py-1 group">
        <div
          className={cn(
            "max-w-[75%] px-4 py-3 rounded-2xl rounded-tr-sm",
            "bg-zinc-200 dark:bg-zinc-700",
            "text-zinc-900 dark:text-zinc-100 text-sm leading-7"
          )}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 group">
      {/* Avatar + name */}
      <div className="flex items-center gap-2 mb-2">
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[10px] font-bold">TM</span>
        </div>
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          TradeMate
        </span>
      </div>

      {/* Content */}
      <div className="pl-8">
        {message.content ? (
          <MarkdownRenderer content={message.content} />
        ) : (
          <StreamingCursor />
        )}

        {/* Streaming cursor appended while streaming */}
        {isStreaming && message.content && <StreamingCursor inline />}

        {/* Action bar — visible on hover when not streaming */}
        {!isStreaming && message.content && (
          <div className="flex items-center gap-0.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <IconButton label="Copy" size="sm" onClick={handleCopy}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </IconButton>
            <IconButton label="Thumbs up" size="sm">
              <ThumbsUp size={13} />
            </IconButton>
            <IconButton label="Thumbs down" size="sm">
              <ThumbsDown size={13} />
            </IconButton>
            <IconButton label="Regenerate" size="sm">
              <RotateCcw size={13} />
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );
}

function StreamingCursor({ inline }: { inline?: boolean }) {
  if (inline) {
    return (
      <span className="inline-block w-0.5 h-4 bg-zinc-600 dark:bg-zinc-300 animate-pulse ml-0.5 align-middle" />
    );
  }
  return (
    <div className="flex items-center gap-1 mt-1">
      <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce [animation-delay:0ms]" />
      <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce [animation-delay:150ms]" />
      <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}
