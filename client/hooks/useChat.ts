"use client";

import { useCallback } from "react";
import { useChatStore } from "@/stores/chatStore";

/**
 * Encapsulates sending a message and handling the (mock) streaming response.
 * Swap `simulateStream` for a real fetch/SSE call when the backend is ready.
 */
export function useChat() {
  const {
    addMessage,
    updateLastAssistantMessage,
    setStreaming,
    isStreaming,
    selectedModelId,
  } = useChatStore();

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      if (!content.trim() || isStreaming) return;

      addMessage(conversationId, { role: "user", content });

      // Placeholder assistant message that will be streamed into
      addMessage(conversationId, { role: "assistant", content: "" });
      setStreaming(true);

      try {
        await simulateStream(conversationId, content, selectedModelId, (chunk) => {
          updateLastAssistantMessage(conversationId, chunk);
        });
      } finally {
        setStreaming(false);
      }
    },
    [addMessage, updateLastAssistantMessage, setStreaming, isStreaming, selectedModelId]
  );

  return { sendMessage, isStreaming };
}

// ---------------------------------------------------------------------------
// Mock streaming — replace with real SSE / fetch stream when backend is ready
// ---------------------------------------------------------------------------

async function simulateStream(
  _conversationId: string,
  userMessage: string,
  _modelId: string,
  onChunk: (fullText: string) => void
): Promise<void> {
  const response = getMockResponse(userMessage);
  let accumulated = "";

  for (const char of response) {
    accumulated += char;
    onChunk(accumulated);
    await sleep(12);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function getMockResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("stock") || lower.includes("market")) {
    return `Based on the current market conditions, here's an analysis:\n\n**Market Overview**\n- The S&P 500 has shown resilience despite macro headwinds\n- Tech sector remains volatile but presents opportunities\n- Emerging markets are showing signs of recovery\n\n**Key Considerations**\n1. Monitor Fed rate decisions closely\n2. Diversification across sectors remains important\n3. Risk management should be your top priority\n\n> Always conduct your own due diligence before making investment decisions.`;
  }

  if (lower.includes("crypto") || lower.includes("bitcoin")) {
    return `Here's a crypto market perspective:\n\n**Current Landscape**\nThe crypto market is experiencing a period of consolidation. Bitcoin continues to act as a store of value narrative.\n\n\`\`\`\nBTC Dominance: ~52%\nAltcoin Season Index: Neutral\nFear & Greed: 61 (Greed)\n\`\`\`\n\nAlways invest only what you can afford to lose.`;
  }

  return `I'm **TradeMate**, your AI-powered financial assistant. I can help you with:\n\n- Market analysis and insights\n- Portfolio strategy discussions\n- Risk assessment\n- Research on stocks, ETFs, and crypto\n\nWhat would you like to explore today?`;
}
