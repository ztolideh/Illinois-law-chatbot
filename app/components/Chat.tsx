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
          content:
            "Sorry, something went wrong while contacting the server.",
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col">

      <header className="p-6 border-b bg-white shadow-sm">
        <h1 className="text-3xl font-bold">
          🇮🇱 Illinois Law AI Assistant
        </h1>

        <p className="text-gray-500 mt-2">
          Ask questions about Illinois laws and legislation.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {messages.map((message, index) => (
          <Message
            key={index}
            message={message}
          />
        ))}

        {loading && (
          <div className="text-gray-500 animate-pulse">
            🤖 Searching Illinois legislation...
          </div>
        )}

      </div>

      <ChatInput onSend={sendMessage} />

    </div>
  );
}