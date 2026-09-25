/**
 * Domain types for the Reventurn AI chat widget, added in Session 7.
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatReplyData {
  message: ChatMessage;
}
