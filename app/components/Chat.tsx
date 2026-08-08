"use client";

import { useState } from "react";
import ChatInput from "./ChatInput";
import Message from "./Message";
import { ChatMessage } from "@/types/message";
import "./componentsStyles.css";

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! 👋 I'm your Illinois Law AI Assistant. Ask me anything about Illinois laws, bills, or legislation. The responses may take at least 30 seconds to parse. Please be patient.",
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
    <div className="chat-shell">
      <div className="chat-glow chat-glow-right" />
      <div className="chat-glow chat-glow-left" />

      <header className="chat-header">
        <div className="chat-badge">⚡ AI Legal Pulse</div>
        <div className="chat-header-content">
          <h2 className="chat-title">Conversations for Illinois law, reimagined</h2>
          <p className="chat-description">
            Get crisp, AI-driven insight on bills, statutes, and legal process
            with chat interface. Start a conversation below...
          </p>
        </div>
      </header>

      <div className="chat-panel">
        <div className="chat-panel-inner">
          <div className="chat-messages">
            {messages.map((message, index) => (
              <Message key={index} message={message} />
            ))}
            {loading && (
              <div className="chat-loading">
                <span className="chat-loading-dot" />
                <span>Analyzing Illinois legislation...</span>
              </div>
            )}
          </div>

          <div className="chat-input-wrap">
            <ChatInput onSend={sendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}
