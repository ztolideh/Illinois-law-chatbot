"use client";

import { ChatMessage } from "@/types/message";

interface Props {
  message: ChatMessage;
}

export default function Message({ message }: Props) {

  const isUser = message.role === "user";

  return (
    <div className={`message-row ${isUser ? "message-row-user" : "message-row-assistant"}`}>
      <div className={`message-bubble ${isUser ? "message-bubble-user" : "message-bubble-assistant"}`}>
        <div className="message-meta">
          <span className="message-badge">{isUser ? "You" : "Illinois Law AI"}</span>
        </div>
        <p className="message-text">{message.content}</p>
      </div>
    </div>
  );
}