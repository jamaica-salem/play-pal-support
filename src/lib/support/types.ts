import type { Game, Order } from "../games";

export type MessageRole = "customer" | "ai" | "agent" | "system";

export type ChatMessageData = {
  id: string;
  role: MessageRole;
  text: string;
  ts: number;
  quickReplies?: string[] | undefined;
  gameCard?: Game | undefined;
  orderCard?: Order | undefined;
};

export type ConversationStatus = "ai" | "waiting" | "agent" | "resolved";

export type Priority = "low" | "normal" | "high";

export type CSATFeedback = {
  rating: number;
  tags: string[];
  comment?: string;
};

export type Conversation = {
  id: string;
  customer: string;
  email: string;
  status: ConversationStatus;
  priority: Priority;
  topic: string;
  messages: ChatMessageData[];
  createdAt: number;
  escalatedAt?: number | undefined;
  summary?: string | undefined;
  isLive?: boolean | undefined;
  feedback?: CSATFeedback | undefined;
};

export const statusLabel: Record<ConversationStatus, string> = {
  ai: "AI Handling",
  waiting: "Waiting for Agent",
  agent: "Active Chat",
  resolved: "Resolved",
};

export const QUICK_REPLIES = [
  "Track My Order",
  "Check Game Availability",
  "Refund Policy",
  "Shipping Information",
  "Talk to Human Agent",
];
