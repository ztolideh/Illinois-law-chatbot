"use client";

import { useState } from "react";

interface ChatInputProps {
  onSend: (value: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ask about Illinois bills, statutes, or legislative process..."
        className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-transparent px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-zinc-700 dark:text-zinc-100 dark:focus:border-sky-400 dark:focus:ring-sky-900"
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex h-12 items-center justify-center rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {disabled ? "Thinking..." : "Send"}
      </button>
    </form>
  );
}
