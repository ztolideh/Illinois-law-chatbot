"use client";

import { useState } from "react";
import ChatInput from "./ChatInput";
import Message from "./Message";
import { ChatMessage } from "@/types/message";
import styles from "./styles/Chat.module.css";

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
    <div className={styles.chatShell}>
      <div className={`${styles.chatGlow} ${styles.chatGlowRight}`} />
      <div className={`${styles.chatGlow} ${styles.chatGlowLeft}`} />

      <header className={styles.chatHeader}>
        <div className={styles.chatBadge}>⚡ AI Legal Pulse</div>
        <div className={styles.chatHeaderContent}>
          <h2 className={styles.chatTitle}>Conversations for Illinois law, reimagined</h2>
          <p className={styles.chatDescription}>
            Get crisp, AI-driven insight on bills, statutes, and legal process
            with chat interface. Start a conversation below...
          </p>
        </div>
      </header>

      <div className={styles.chatPanel}>
        <div className={styles.chatPanelInner}>
          <div className={styles.chatMessages}>
            {messages.map((message, index) => (
              <Message key={index} message={message} />
            ))}
            {loading && (
              <div className={styles.chatLoading}>
                <span className={styles.chatLoadingDot} />
                <span>Analyzing Illinois legislation...</span>
              </div>
            )}
          </div>

          <div className={styles.chatInputWrap}>
            <ChatInput onSend={sendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}
