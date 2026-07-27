"use client";

import { useState } from "react";
import ChatInput from "./ChatInput";
import Message from "./Message";
import type { Message as MessageType } from "../../types/message";

const initialMessages: MessageType[] = [
  {
    id: "1",
    role: "assistant",
    text: "Hi! Ask me about Illinois bills, legislation, or policy and I'll help you find relevant information.",
  },
];

export default function Chat() {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(text: string) {
    if (!text.trim()) return;

    const userMessage: MessageType = {
      id: String(Date.now()),
      role: "user",
      text,
    };

    setMessages((current) => [...current, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to fetch answer.");
      }

      const assistantMessage: MessageType = {
        id: String(Date.now() + 1),
        role: "assistant",
        text: data.answer ?? "I couldn't generate an answer for that request.",
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="flex min-h-[60vh] flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
          Illinois Law AI
        </p>
        <h2 className="text-2xl font-semibold text-zinc-950 dark:text-white">
          Ask a legal research question.
        </h2>
        <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
          Get concise answers to Illinois legislation questions with citations and references.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-hidden rounded-3xl bg-zinc-50 p-4 shadow-inner dark:bg-zinc-900">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}

        {error ? (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200">
            {error}
          </div>
        ) : null}
      </div>

      <ChatInput onSend={handleSend} disabled={isLoading} />
    </section>
  );
}
