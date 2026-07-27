import Chat from "./components/Chat";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_22%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-10 rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.9)] backdrop-blur-xl sm:p-10">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-slate-900/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300 shadow-lg shadow-cyan-500/10">
                ⚖️ Illinois Law · 2027 AI Interface
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                Your modern Illinois law AI, built for fast answers, legislative insight, and a premium visual experience.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                Explore Illinois statutes, analyze bills, and get instant guidance in a polished conversational interface with futuristic UI details.
              </p>
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <span className="rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-200 shadow-sm">
                  AI bill summarization
                </span>
                <span className="rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-200 shadow-sm">
                  Illinois legal context
                </span>
                <span className="rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-200 shadow-sm">
                  Modern glassmorphism UI
                </span>
              </div>
            </div>
          </div>
          <Chat />
        </div>
      </div>
    </main>
  );
}
