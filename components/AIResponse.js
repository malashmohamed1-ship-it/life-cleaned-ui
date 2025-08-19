"use client";
import { useState } from "react";
import { db } from "../lib/firebase"; // <- lib/firebase.js exists per your setup
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AIResponse() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [answer, setAnswer] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");

  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;

    setLoading(true);
    setFeedbackSubmitted(false);     // reset the feedback UI for the new answer
    setLastPrompt(prompt);           // remember the question for feedback

    try {
      const res = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      const ai = data.answer || "Sorry, no response.";
      setAnswer(ai);
    } catch (err) {
      console.error("Error fetching AI response:", err);
      setAnswer("⚠️ Something went wrong.");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const submitFeedback = async (type, text = "") => {
    if (!answer) return;
    try {
      await addDoc(collection(db, "feedback"), {
        prompt: lastPrompt,
        answer,
        type,                                   // "up" | "down" | "text"
        text: type === "text" ? text : "",
        createdAt: serverTimestamp(),
      });
      setFeedbackSubmitted(true);               // hide UI and show thank-you
      setFeedbackText("");
    } catch (err) {
      console.error("Error saving feedback:", err);
    }
  };

  return (
    <div className="mb-6">
      {/* Ask LIFE */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask LIFE anything..."
          className="flex-1 p-3 border rounded-xl shadow-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Thinking..." : "🧠"}
        </button>
      </form>

      {/* Show LIFE's answer + feedback cycle */}
      {answer && (
        <div className="mt-4 p-4 bg-white rounded-xl shadow">
          <p className="whitespace-pre-wrap">{answer}</p>

          {!feedbackSubmitted ? (
            <div className="mt-3 flex flex-col gap-2">
              {/* Quick thumbs */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => submitFeedback("👍")}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  👍
                </button>
                <button
                  onClick={() => submitFeedback("👎")}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  👎
                </button>
              </div>

              {/* Optional text feedback */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Write feedback (optional)..."
                  className="flex-1 p-2 border rounded-lg"
                />
                <button
                  onClick={() => feedbackText.trim() && submitFeedback("text", feedbackText)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  disabled={!feedbackText.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-green-600">✅ Thank you for your feedback!</p>
          )}
        </div>
      )}
    </div>
  );
}
