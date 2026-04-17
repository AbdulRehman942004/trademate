"use client";

import { useRouter, usePathname } from "next/navigation";
import { SquarePen, TrendingUp, Search, LogOut, Route } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/useAuth";
import { groupConversationsByDate } from "@/lib/utils";
import { SidebarItem } from "./SidebarItem";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter();
  const {
    conversations,
    activeConversationId,
    createConversation,
    deleteConversation,
    setActiveConversation,
    renameConversation,
  } = useChatStore();

  const { user } = useAuthStore();
  const logout = useLogout();
  const pathname = usePathname();

  const handleNewChat = () => {
    const id = createConversation();
    router.push(`/chat/${id}`);
  };

  const handleSelect = (id: string) => {
    setActiveConversation(id);
    router.push(`/chat/${id}`);
  };

  const groups = groupConversationsByDate(conversations);

  return (
    <aside
      className={cn(
        "flex flex-col h-full w-64 flex-shrink-0",
        "bg-zinc-50 dark:bg-zinc-900",
        "border-r border-zinc-200 dark:border-zinc-800",
        className
      )}
    >
      {/* Brand */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            TradeMate
          </span>
        </div>

        <button
          onClick={handleNewChat}
          aria-label="New chat"
          title="New chat"
          className={cn(
            "h-7 w-7 rounded-lg inline-flex items-center justify-center",
            "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100",
            "hover:bg-zinc-200 dark:hover:bg-zinc-700",
            "transition-colors"
          )}
        >
          <SquarePen size={15} />
        </button>
      </div>

      {/* Search (visual only — wire up when needed) */}
      <div className="px-3 mb-2">
        <div className="flex items-center gap-2 px-3 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-sm">
          <Search size={13} />
          <span>Search chats…</span>
        </div>
      </div>

      {/* Navigation links */}
      <div className="px-2 mb-2">
        <button
          onClick={() => router.push("/routes")}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 h-8 rounded-lg text-sm transition-colors",
            pathname?.startsWith("/routes")
              ? "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-medium"
              : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-100"
          )}
        >
          <Route size={13} />
          <span>Route Evaluator</span>
        </button>
      </div>

      {/* Conversation list */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center mt-8 px-4">
            No conversations yet.
            <br />
            Start a new chat above.
          </p>
        ) : (
          Object.entries(groups).map(([label, items]) => (
            <div key={label} className="mb-3">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                {label}
              </p>
              <ul className="space-y-0.5">
                {items.map((conv) => (
                  <SidebarItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeConversationId}
                    onSelect={() => handleSelect(conv.id)}
                    onDelete={() => deleteConversation(conv.id)}
                    onRename={(title) => renameConversation(conv.id, title)}
                  />
                ))}
              </ul>
            </div>
          ))
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 px-3 py-3 space-y-2">
        <ThemeToggle className="w-full justify-center" />

        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.username?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
              {user?.username ?? "Guest"}
            </p>
            <p className="text-[10px] text-zinc-400 truncate">{user?.email ?? ""}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
            className="h-6 w-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
