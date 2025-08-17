
import React, { useEffect, useState } from "react";

/**
 * DarkModeToggle
 * - Toggles `dark` class on <html>
 * - Persists preference to localStorage ("life_theme")
 */
export default function DarkModeToggle() {
  const key = "life_theme";
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(key);
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldDark = stored ? stored === "dark" : prefers;
    setDark(shouldDark);
    document.documentElement.classList.toggle("dark", shouldDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(key, next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
    }
  }

  return (
    <button
      onClick={toggle}
      className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/70 backdrop-blur px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-neutral-800 transition shadow-sm"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {dark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
