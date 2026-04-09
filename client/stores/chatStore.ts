"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Conversation, Message } from "@/types";
import { generateId, deriveTitleFromMessage } from "@/lib/utils";

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isStreaming: boolean;
  selectedModelId: string;

  // Actions
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Omit<Message, "id" | "createdAt">) => string;
  updateLastAssistantMessage: (conversationId: string, content: string) => void;
  setStreaming: (value: boolean) => void;
  setSelectedModel: (modelId: string) => void;
  getActiveConversation: () => Conversation | undefined;
  renameConversation: (id: string, title: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isStreaming: false,
      selectedModelId: "trademate-pro",

      createConversation: () => {
        const id = generateId();
        const now = new Date();
        const conversation: Conversation = {
          id,
          title: "New conversation",
          messages: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          activeConversationId: id,
        }));
        return id;
      },

      deleteConversation: (id) => {
        set((state) => {
          const remaining = state.conversations.filter((c) => c.id !== id);
          const nextActive =
            state.activeConversationId === id
              ? (remaining[0]?.id ?? null)
              : state.activeConversationId;
          return { conversations: remaining, activeConversationId: nextActive };
        });
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },

      addMessage: (conversationId, message) => {
        const id = generateId();
        const newMessage: Message = {
          ...message,
          id,
          createdAt: new Date(),
        };

        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.id !== conversationId) return conv;

            const isFirstUserMessage =
              message.role === "user" &&
              conv.messages.filter((m) => m.role === "user").length === 0;

            return {
              ...conv,
              title: isFirstUserMessage
                ? deriveTitleFromMessage(message.content)
                : conv.title,
              messages: [...conv.messages, newMessage],
              updatedAt: new Date(),
            };
          }),
        }));

        return id;
      },

      updateLastAssistantMessage: (conversationId, content) => {
        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.id !== conversationId) return conv;
            const messages = [...conv.messages];
            const lastIdx = messages.length - 1;
            if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
              messages[lastIdx] = { ...messages[lastIdx], content };
            }
            return { ...conv, messages, updatedAt: new Date() };
          }),
        }));
      },

      setStreaming: (value) => set({ isStreaming: value }),

      setSelectedModel: (modelId) => set({ selectedModelId: modelId }),

      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return conversations.find((c) => c.id === activeConversationId);
      },

      renameConversation: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title } : c
          ),
        }));
      },
    }),
    {
      name: "trademate-chat",
      // Revive Date objects from JSON
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.conversations = state.conversations.map((conv) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((m) => ({
            ...m,
            createdAt: new Date(m.createdAt),
          })),
        }));
      },
    }
  )
);
