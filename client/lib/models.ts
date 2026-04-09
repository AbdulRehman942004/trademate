import type { Model } from "@/types";

export const AVAILABLE_MODELS: Model[] = [
  {
    id: "trademate-pro",
    name: "TradeMate Pro",
    description: "Most capable model for complex analysis",
  },
  {
    id: "trademate-fast",
    name: "TradeMate Fast",
    description: "Faster responses for everyday tasks",
  },
  {
    id: "trademate-research",
    name: "TradeMate Research",
    description: "Optimized for in-depth market research",
  },
];

export const DEFAULT_MODEL_ID = AVAILABLE_MODELS[0].id;
