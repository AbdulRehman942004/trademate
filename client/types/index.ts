import type { RouteEvaluationResponse } from "@/types/routes";

export type Role = "user" | "assistant" | "system";

export interface MessageWidget {
  type: "route_evaluation";
  data: RouteEvaluationResponse;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: Date;
  widgets?: MessageWidget[];
  // DB primary key, set once the backend has persisted the message. Rating
  // submission requires this — the star UI stays disabled until it arrives.
  dbId?: number;
  // 1–5 star rating the user has submitted for an assistant message.
  rating?: number | null;
}

export interface Conversation {
  id: string;
  title: string;
  titleLoading?: boolean;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Model {
  id: string;
  name: string;
  description: string;
}

export type SendMessagePayload = {
  conversationId: string;
  content: string;
};
