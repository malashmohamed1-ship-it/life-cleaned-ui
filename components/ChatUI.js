"use client";
import { useEffect, useRef, useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/** Tiny typing indicator */
function TypingDots() {
  return (
    <div className="flex gap-1 items-center text-gray-500 mt-2">
      <span className="animate-pulse">•</span>
      <span className="animate-pulse [animation-delay:120ms]">•</span>
      <span className="animate-pulse [animation-delay:240ms]">•</span>
    </div>
  );
}

/** Chat bubble */
function Bubble({ role, children }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-2`}>
      <div
        className={[
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm border leading-relaxed",
          isUser
            ? "bg-black text-white border-black/10 dark:bg-white dark:text-black dark:border-white/10"
            : "bg-white text-slate-900 border-slate-200 dark:bg-slate-900 dark:text-slate-50 dark:border-slate-800",
        ].join(" ")}
      >
        <div className="whitespace-pre-wrap">{children}</div>
      </div>
    </div>
  );
}

/** Per-message feedback */
function FeedbackInline({ prompt, answer, onSubmitted }) {
  const [feedbackText, setFeedbackText] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (type, text = "") => {
    try {
      setBusy(true);
      await addDoc(collection(db, "feedback"), {
        prompt,
        answer,
        type, // "up" | "down" | "text"
        text: type === "text" ? text : "",
        createdAt: serverTimestamp(),
      });
      onSubmitted?.();
    } catch (e) {
      console.error("Feedback error:", e);
      onSubmitted?.(); // still hide to avoid blocking UX
    } finally {
      setBusy(false);
      setFeedbackText("");
    }
  };

  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <button
          onClick={() => send("👍")}
          disabled={busy}
          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          👍
        </button>
        <button
          onClick={() => send("👎")}
          disabled={busy}
          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
        >
          👎
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Write feedback (optional)…"
          className="flex-1 p-2 border rounded-lg bg-transparent"
        />
        <button
          onClick={() => feedbackText.trim() && send("text", feedbackText)}
          disabled={busy || !feedbackText.trim()}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default function ChatUI() {
  const [messages, setMessages] = useState([]); // [{id, role: 'user'|'assistant', content, feedbackDone?, pairedPrompt?}]
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);

  // scroll to bottom when messages/thinking changes
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // helper id
  const makeId = () =>
    typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  const handleSend = async (e) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;

    const userMsg = { id: makeId(), role: "user", content: prompt };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      const answer = data?.answer || "Sorry, no response.";

      const aiMsg = {
        id: makeId(),
        role: "assistant",
        content: answer,
        feedbackDone: false,
        pairedPrompt: prompt,
      };
      setMessages((m) => [...m, aiMsg]);
    } catch (err) {
      console.error("AI error:", err);
      setMessages((m) => [
        ...m,
        {
          id: makeId(),
          role: "assistant",
          content: "⚠️ LIFE ran into an error.",
          feedbackDone: false,
          pairedPrompt: prompt,
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const markFeedbackSubmitted = (id) => {
    setMessages((m) =>
      m.map((msg) => (msg.id === id ? { ...msg, feedbackDone: true } : msg))
    );
  };

  return (
    <div className="flex flex-col h-[70vh] md:h-[72vh]">
      {/* scrollable thread */}
      <div className="flex-1 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="text-gray-500 text-sm py-4">
            Ask LIFE anything to get started ✨
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
            <Bubble role={msg.role}>{msg.content}</Bubble>

            {msg.role === "assistant" && (
              <div className="ml-0 mr-auto max-w-[80%]">
                {!msg.feedbackDone ? (
                  <FeedbackInline
                    prompt={msg.pairedPrompt}
                    answer={msg.content}
                    onSubmitted={() => markFeedbackSubmitted(msg.id)}
                  />
                ) : (
                  <p className="text-green-600 text-sm mt-2">
                    ✅ Thank you for your feedback!
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {thinking && (
          <div className="mt-2">
            <Bubble role="assistant">
              <span className="text-gray-500">LIFE is thinking</span>
              <TypingDots />
            </Bubble>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* sticky input */}
      <form onSubmit={handleSend} className="sticky bottom-0 mt-3">
        <div className="flex gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message LIFE…"
            className="flex-1 px-3 py-2 rounded-xl outline-none bg-transparent"
          />
          <button
            type="submit"
            disabled={thinking}
            className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 disabled:opacity-50"
          >
            {thinking ? "Thinking…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
