"use client";

import { useState } from "react";
import ChatInput from "./ChatInput";
import Message from "./Message";
import { ChatMessage } from "@/types/message";

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! 👋 I'm your Illinois Law AI Assistant. Ask me anything about Illinois laws, bills, or legislation.",
    },
  ]);

  const [loading, setLoading] = useState(false);

  async function sendMessage(text: string) {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      // We will build this API in Part 3
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong while contacting the server.",
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl flex-col gap-6 rounded-[2rem] border border-white/10 bg-slate-900/75 p-4 shadow-[0_45px_140px_-80px_rgba(14,165,233,0.9)] backdrop-blur-xl sm:p-6">
      <div className="pointer-events-none absolute -right-16 top-6 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-6 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <header className="relative rounded-[1.75rem] border border-white/10 bg-slate-950/85 p-8 shadow-2xl shadow-slate-950/10 backdrop-blur-xl">
        <div className="inline-flex items-center gap-3 rounded-full bg-cyan-400/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200 shadow-sm shadow-cyan-400/10">
          ⚡ AI Legal Pulse
        </div>
        <div className="mt-6 max-w-3xl">
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Conversations for Illinois law, reimagined
          </h2>
          <p className="mt-4 text-slate-300 leading-8 sm:text-lg">
            Get crisp, AI-driven insight on bills, statutes, and legal process
            with chat interface.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/80 shadow-2xl backdrop-blur-xl">
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {messages.map((message, index) => (
              <Message key={index} message={message} />
            ))}
            {loading && (
              <div className="flex items-center gap-3 rounded-3xl border border-slate-700/80 bg-slate-900/80 px-5 py-4 text-slate-300 shadow-lg shadow-slate-950/20">
                <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-cyan-400" />
                <span>Analyzing Illinois legislation...</span>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 px-6 py-6">
            <ChatInput onSend={sendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}
