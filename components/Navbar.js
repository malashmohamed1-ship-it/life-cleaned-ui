"use client";

import { useEffect, useState } from "react";
import WaitlistModal from "./WaitlistModal";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // read saved theme
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const enable = stored ? stored === "dark" : prefersDark;
    setDark(enable);
    document.documentElement.classList.toggle("dark", enable);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header className="w-full mb-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-xl tracking-tight">LIFE</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {dark ? "🌙" : "☀️"}
          </button>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 dark:bg-white dark:text-black"
          >
            Join Waitlist
          </button>
        </div>
      </div>

      <WaitlistModal open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
