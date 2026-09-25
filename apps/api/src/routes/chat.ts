import { Router } from "express";
import type { ApiResponse, ChatMessage, ChatReplyData } from "@reventurn/types";
import { getChatReply } from "../lib/huggingface";

export const chatRouter = Router();

const MAX_HISTORY_MESSAGES = 10; // bounds token usage/cost per request
const MAX_MESSAGE_LENGTH = 2000;

function isValidMessage(m: unknown): m is ChatMessage {
  if (typeof m !== "object" || m === null) return false;
  const candidate = m as Record<string, unknown>;
  return (
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string" &&
    candidate.content.trim().length > 0 &&
    candidate.content.length <= MAX_MESSAGE_LENGTH
  );
}

chatRouter.post("/", async (req, res) => {
  const body = req.body as { messages?: unknown };

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    const errorBody: ApiResponse<ChatReplyData> = {
      ok: false,
      error: "Request body must include a non-empty 'messages' array."
    };
    res.status(400).json(errorBody);
    return;
  }

  if (!body.messages.every(isValidMessage)) {
    const errorBody: ApiResponse<ChatReplyData> = {
      ok: false,
      error:
        "Each message must have role 'user' or 'assistant' and non-empty content under 2000 characters."
    };
    res.status(400).json(errorBody);
    return;
  }

  // Only the most recent messages are sent upstream — keeps a long chat
  // from silently growing cost on every turn.
  const history = (body.messages as ChatMessage[]).slice(-MAX_HISTORY_MESSAGES);

  try {
    const reply = await getChatReply(history);
    const responseBody: ApiResponse<ChatReplyData> = {
      ok: true,
      data: { message: reply }
    };
    res.status(200).json(responseBody);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error contacting the chat model";
    const errorBody: ApiResponse<ChatReplyData> = { ok: false, error: message };
    res.status(502).json(errorBody);
  }
});
