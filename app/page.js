"use client";

import AIResponse from "../components/AIResponse";

export default function HomePage() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Welcome to LIFE 🚀</h1>
      <p className="text-lg mb-6">Your AI personal assistant, right here.</p>

      <AIResponse />
    </main>
  );
}

