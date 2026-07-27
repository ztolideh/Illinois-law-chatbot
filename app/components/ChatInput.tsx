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

    <div className="border-t bg-white p-4 flex gap-2">

      <input
        className="flex-1 border rounded-lg p-3 outline-none"
        placeholder="Ask about Illinois laws..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submit();
          }
        }}
      />

      <button
        onClick={submit}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6"
      >
        Send
      </button>

    </div>
  );
}