"use client";
import ChatUI from "../components/ChatUI";

export default function HomePage() {
  return (
    <main className="mt-4">
      {/* brand header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
          L
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight">LIFE</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your personal AI — clean, fast, and helpful.
          </p>
        </div>
      </div>

      {/* chat card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 shadow-sm backdrop-blur p-3 md:p-4">
        <ChatUI />
      </div>
    </main>
  );
}
