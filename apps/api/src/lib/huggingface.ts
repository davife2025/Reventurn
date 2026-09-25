import type { ChatMessage } from "@reventurn/types";
import { REVENTURN_SYSTEM_PROMPT } from "./chat-system-prompt";

/**
 * Client for Hugging Face's Inference Providers router, calling Kimi K2.
 *
 * Verified in Session 7 research directly from Hugging Face's own docs and
 * the model's own page (huggingface.co/moonshotai/Kimi-K2-Instruct-0905),
 * not assumed from memory:
 * - Endpoint: POST https://router.huggingface.co/v1/chat/completions —
 *   OpenAI-compatible chat completions, one router in front of many
 *   providers.
 * - Auth: `Authorization: Bearer $HF_TOKEN`, a fine-grained token with the
 *   "Make calls to Inference Providers" permission.
 * - Model: moonshotai/Kimi-K2-Instruct-0905 — confirmed real, confirmed
 *   served by Novita as an Inference Provider on the model's own page.
 *   Left unpinned to a specific provider (no `:novita` suffix) so routing
 *   can fall back if provider availability changes — override via
 *   HF_CHAT_MODEL_ID if you want to pin one explicitly (e.g.
 *   "moonshotai/Kimi-K2-Instruct-0905:novita", or ":fastest"/":cheapest"
 *   as a routing policy suffix).
 * - temperature 0.6 is Moonshot's own documented recommendation for this
 *   model, not a value we picked.
 *
 * Cost note: unlike FRED, this is a metered, paid API (small free tier,
 * then provider rates apply). max_tokens is capped here to bound cost per
 * request; see SESSION_REPORT.md for further discussion.
 *
 * NOT verified: an actual live call — router.huggingface.co isn't
 * reachable from this sandbox, same caveat as every other external
 * integration in this build.
 */

const HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";
const DEFAULT_MODEL_ID = "moonshotai/Kimi-K2-Instruct-0905";
const FETCH_TIMEOUT_MS = 20000; // LLM responses are slower than a data-API call
const MAX_TOKENS = 500;
const TEMPERATURE = 0.6; // Moonshot's documented recommendation for this model

interface HfChatCompletionResponse {
  choices?: Array<{
    message?: { role: string; content: string };
  }>;
}

export async function getChatReply(
  history: ChatMessage[]
): Promise<ChatMessage> {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error(
      "Missing HF_TOKEN — check apps/api/.env against .env.example. Get a fine-grained token (with 'Make calls to Inference Providers' permission) at https://huggingface.co/settings/tokens"
    );
  }

  const modelId = process.env.HF_CHAT_MODEL_ID || DEFAULT_MODEL_ID;

  const messages = [
    { role: "system", content: REVENTURN_SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.content }))
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(HF_ROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
        stream: false
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      throw new Error(
        `Hugging Face Inference error (${res.status}): ${bodyText || res.statusText}`
      );
    }

    const data = (await res.json()) as HfChatCompletionResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(
        "Hugging Face response had no message content — unexpected response shape."
      );
    }

    return { role: "assistant", content };
  } finally {
    clearTimeout(timeout);
  }
}
