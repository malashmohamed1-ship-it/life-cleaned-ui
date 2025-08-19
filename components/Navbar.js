"use client";

import { useState } from "react";
import WaitlistModal from "./WaitlistModal";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full mb-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-xl">LIFE</h1>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Join Waitlist
        </button>
      </div>

      <WaitlistModal open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
