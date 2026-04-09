"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/stores/chatStore";
import { useChat } from "@/hooks/useChat";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatHeader } from "@/components/layout/ChatHeader";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ConversationPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { conversations, setActiveConversation } = useChatStore();
  const { sendMessage, isStreaming } = useChat();

  const conversation = conversations.find((c) => c.id === id);

  // Sync active conversation ID with URL param
  useEffect(() => {
    setActiveConversation(id);
  }, [id, setActiveConversation]);

  // If conversation doesn't exist (e.g. after deletion), go to /chat
  useEffect(() => {
    if (conversations.length > 0 && !conversation) {
      router.replace("/chat");
    }
  }, [conversation, conversations.length, router]);

  const handleSend = (message: string) => sendMessage(id, message);

  if (!conversation) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
      <ChatHeader />

      {conversation.messages.length === 0 ? (
        <WelcomeScreen onPromptSelect={handleSend} />
      ) : (
        <MessageList messages={conversation.messages} isStreaming={isStreaming} />
      )}

      <ChatInput onSend={handleSend} isStreaming={isStreaming} />
    </div>
  );
}
