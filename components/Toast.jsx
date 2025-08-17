
import React, { useEffect } from "react";

/**
 * Toast
 * Simple toast that auto-dismisses after `duration` ms.
 * Usage: {toast && <Toast {...toast} onClose={()=>setToast(null)} />}
 */
export default function Toast({ title, subtitle, duration = 2200, onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg px-4 py-3">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</div>
        {subtitle && <div className="text-xs text-gray-600 dark:text-gray-400">{subtitle}</div>}
      </div>
    </div>
  );
}
