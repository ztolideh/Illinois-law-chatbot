import type { Message } from "../../types/message";
import SourceCard from "./SourceCard";

export default function Message({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`${isUser ? "self-end bg-sky-100 text-sky-950" : "self-start bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"} rounded-3xl p-4 shadow-sm sm:max-w-3xl`}>
      <div className="text-sm leading-6">{message.text}</div>
      {message.sources?.length ? (
        <div className="mt-4 space-y-3">
          {message.sources.map((source) => (
            <SourceCard key={source.id} bill={source} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
