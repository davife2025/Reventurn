"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@reventurn/ui";
import type { ApiResponse, ChatMessage, ChatReplyData } from "@reventurn/types";

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi — I'm the Reventurn assistant. Ask me how the rate comparison works, what's live on X Layer, or what's still on the roadmap."
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed }
    ];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only user/assistant turns, not the local-only greeting, keeps
        // the very first request minimal.
        body: JSON.stringify({ messages: nextMessages })
      });
      const body = (await res.json()) as ApiResponse<ChatReplyData>;

      if (!body.ok) {
        setError(body.error);
        return;
      }
      setMessages([...nextMessages, body.data.message]);
    } catch {
      setError(
        "Couldn't reach apps/api — start it with `pnpm dev` and confirm HF_TOKEN is set."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-96 w-80 flex-col rounded-lg border border-graphite-700 bg-graphite-800 shadow-lg">
          <div className="flex items-center justify-between border-b border-graphite-700 px-4 py-3">
            <span className="font-heading text-sm font-medium text-graphite-50">
              reventurn assistant
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-graphite-400 hover:text-graphite-50"
            >
              &times;
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-6 rounded-md bg-amber-500 px-3 py-2 text-sm text-graphite-950"
                    : "mr-6 rounded-md bg-graphite-700 px-3 py-2 text-sm text-graphite-50"
                }
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="mr-6 rounded-md bg-graphite-700 px-3 py-2 text-sm text-graphite-400">
                Thinking&hellip;
              </div>
            )}
            {error && (
              <div className="mr-6 rounded-md border border-rust-600 bg-graphite-800 px-3 py-2 text-xs text-rust-500">
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-graphite-700 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Ask about Reventurn"
              className="flex-1 rounded-md border border-graphite-600 bg-graphite-900 px-3 py-2 text-sm text-graphite-50 placeholder:text-graphite-500 focus:border-amber-500 focus:outline-none"
            />
            <Button variant="primary" onClick={sendMessage} disabled={loading}>
              Send
            </Button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-graphite-950 shadow-lg hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-graphite-900"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M2 4h16v9H7l-3 3v-3H2V4z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>
    </div>
  );
}
