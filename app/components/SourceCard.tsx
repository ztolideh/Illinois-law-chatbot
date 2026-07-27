import type { Bill } from "../../types/bill";

export default function SourceCard({ bill }: { bill: Bill }) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
      <div className="flex flex-col gap-2">
        <div className="text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Source</div>
        <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">{bill.title}</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{bill.summary ?? "No summary available."}</p>
        {bill.url ? (
          <a
            href={bill.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
          >
            View bill details
          </a>
        ) : null}
      </div>
    </article>
  );
}
