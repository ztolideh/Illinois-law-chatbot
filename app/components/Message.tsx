"use client";

import { ChatMessage } from "@/types/message";

interface Props {
  message: ChatMessage;
}

export default function Message({ message }: Props) {

  const isUser = message.role === "user";

  return (

    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >

      <div
        className={`
          max-w-xl
          rounded-xl
          px-5
          py-3
          whitespace-pre-wrap
          ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-white shadow"
          }
        `}
      >

        <div className="font-semibold mb-2">

          {isUser ? "👤 You" : "🤖 Assistant"}

        </div>

        {message.content}

      </div>

    </div>
  );
}