"use client";

import { useState } from "react";

interface Props {
  onSend: (text: string) => void;
}

export default function ChatInput({ onSend }: Props) {
  const [text, setText] = useState("");

  function submit() {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  }

  return (
    <div className="chat-input-shell">
      <input
        className="chat-input"
        placeholder="Ask about Illinois laws, bills, or legislative updates..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submit();
          }
        }}
      />
      <button type="button" onClick={submit} className="chat-send-button">
        Send
      </button>
    </div>
  );
}
