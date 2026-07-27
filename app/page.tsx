import Chat from "./components/Chat";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-8 sm:px-6">
        <header className="mb-6">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
            Illinois Law AI
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Illinois legislation assistant</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Ask questions about Illinois bills, statutes, and the legislative process. The assistant will
            provide concise answers and relevant source references.
          </p>
        </header>

        <Chat />
      </div>
    </main>
  );
}
