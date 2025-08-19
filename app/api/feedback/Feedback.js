"use client";
import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Feedback({ answer, prompt }) {
  const [submitted, setSubmitted] = useState(false);
  const [text, setText] = useState("");

  // 🔹 Handles thumbs up / thumbs down
  const handleFeedback = async (type, textFeedback = "") => {
    try {
      await addDoc(collection(db, "feedbacks"), {
        prompt,
        answer,
        feedback: type,
        textFeedback,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true); // hide UI + show thank you
    } catch (err) {
      console.error("Error saving feedback:", err);
    }
  };

  if (submitted) {
    return (
      <div className="mt-2 text-green-600 text-sm">
        ✅ Thanks for your feedback!
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      {/* Thumbs Up / Down */}
      <div className="flex gap-3">
        <button
          onClick={() => handleFeedback("thumbs_up")}
          className="px-3 py-1 rounded-lg border bg-gray-100 hover:bg-gray-200"
        >
          👍
        </button>
        <button
          onClick={() => handleFeedback("thumbs_down")}
          className="px-3 py-1 rounded-lg border bg-gray-100 hover:bg-gray-200"
        >
          👎
        </button>
      </div>

      {/* Text Feedback */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Write feedback..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
        />
        <button
          onClick={() => handleFeedback("text", text)}
          disabled={!text.trim()}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
