"use client";

import { useState } from "react";

export default function FeedbackForm({ lastAnswer }) {
  const [submitted, setSubmitted] = useState(false);

  const handleThumb = async () => {
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: "👍", answer: lastAnswer }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Error sending feedback:", err);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {submitted ? (
        <span className="text-green-600 font-medium">Thanks for your feedback!</span>
      ) : (
        <button
          onClick={handleThumb}
          className="text-xl hover:scale-110 transition-transform"
        >
          👍
        </button>
      )}
    </div>
  );
}
