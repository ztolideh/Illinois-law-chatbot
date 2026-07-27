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
    <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/75 p-4 shadow-[0_30px_80px_-60px_rgba(14,165,233,0.75)] backdrop-blur-xl sm:flex-row">
      <input
        className="flex-1 rounded-3xl border border-white/10 bg-slate-900/95 px-5 py-4 text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/20"
        placeholder="Ask about Illinois laws, bills, or legislative updates..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submit();
          }
        }}
      />
      <button
        type="button"
        onClick={submit}
        className="inline-flex min-h-[3.25rem] items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-400 to-sky-500 px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] hover:shadow-cyan-500/30"
      >
        Send
      </button>
    </div>
  );
}
