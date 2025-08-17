
import React, { useEffect, useMemo, useState } from "react";

/**
 * MedicalReminder
 * - Add meds/appointments with a time (HH:MM)
 * - Persisted to localStorage ("life_medications")
 * - Emits toast messages via onToast({title, subtitle})
 */
export default function MedicalReminder({ onToast }) {
  const storageKey = "life_medications";

  const [items, setItems] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({ name: "", time: "" });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {}
  }, [items]);

  function addItem() {
    const name = form.name.trim();
    const time = form.time;
    if (!name || !time) {
      onToast?.({ title: "Missing info", subtitle: "Please enter a name and time." });
      return;
    }
    const entry = { id: Date.now(), name, time };
    setItems((prev) => [...prev, entry]);
    setForm({ name: "", time: "" });
    onToast?.({ title: "Reminder added", subtitle: `${name} at ${time}` });
  }

  function removeItem(id) {
    const itm = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    onToast?.({ title: "Reminder removed", subtitle: itm ? itm.name : "" });
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Medical Reminders</h3>
      </div>

      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Medication or Appointment"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="flex-1 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="time"
          value={form.time}
          onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
          className="w-full md:w-36 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addItem}
          className="rounded-xl px-4 py-2 font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
        >
          Add
        </button>
      </div>

      <ul className="divide-y divide-gray-100 dark:divide-neutral-800">
        {items.length === 0 && (
          <li className="py-2 text-gray-500 dark:text-gray-400">No reminders yet.</li>
        )}
        {items.map((med) => (
          <li key={med.id} className="flex items-center justify-between py-2">
            <div className="text-gray-900 dark:text-gray-100">
              <span className="font-medium">{med.name}</span>{" "}
              <span className="text-gray-500 dark:text-gray-400">— {med.time}</span>
            </div>
            <button
              onClick={() => removeItem(med.id)}
              className="text-red-600 hover:text-red-700 font-semibold"
              aria-label={`Remove reminder for ${med.name}`}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
