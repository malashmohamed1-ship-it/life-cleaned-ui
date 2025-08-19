"use client";
import { useState } from "react";
import { db } from "../lib/firebase"; // path from components -> lib
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function WaitlistModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setSubmitting(true);
      await addDoc(collection(db, "waitlist"), {
        email,
        timestamp: serverTimestamp(),
      });
      setStatus("✅ You’re on the waitlist!");
      setEmail("");
    } catch (err) {
      console.error("Waitlist error:", err);
      setStatus("❌ Error, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-96">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Join the LIFE Waitlist</h2>
          <button onClick={onClose} className="text-sm text-gray-500">Close</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-2 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-black text-white p-2 rounded-lg hover:bg-gray-800 disabled:opacity-60"
          >
            {submitting ? "Adding..." : "Join Waitlist"}
          </button>
        </form>

        {status && <p className="mt-3 text-sm text-gray-700">{status}</p>}
      </div>
    </div>
  );
}
