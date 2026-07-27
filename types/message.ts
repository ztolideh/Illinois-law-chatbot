import type { Bill } from "./bill";

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  sources?: Bill[];
  createdAt?: string;
}
