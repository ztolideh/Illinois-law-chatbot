"use client";

import { ChatMessage } from "@/types/message";

interface Props {
  message: ChatMessage;
}

export default function Message({ message }: Props) {

  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xl rounded-[1.75rem] px-6 py-5 whitespace-pre-wrap shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] ${
          isUser
            ? "bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950"
            : "bg-slate-900/95 text-slate-100 border border-white/10"
        }`}
      >
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          <span className="rounded-full bg-slate-800/80 px-2 py-1">
            {isUser ? "You" : "Illinois Law AI"}
          </span>
        </div>
        <p className="leading-7">{message.content}</p>
      </div>
    </div>
  );
}