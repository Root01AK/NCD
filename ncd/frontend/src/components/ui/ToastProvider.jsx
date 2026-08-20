import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const TOAST_META = {
  success: { icon: CheckCircle2, color: "#10b981", tint: "#ecfdf5", label: "Success" },
  error: { icon: AlertCircle, color: "#ef4444", tint: "#fef2f2", label: "Error" },
  info: { icon: Info, color: "#3b82f6", tint: "#eff6ff", label: "Notice" },
};

const ToastContext = createContext(null);

export function useToasts() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToasts must be used within ToastProvider");
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  const recentToastsRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((type, title, body) => {
    const key = `${type}:${title}:${body || ''}`;
    const now = Date.now();

    // Clear prior toasts instantly if signing out for a clean single toast
    if (title && title.toLowerCase().includes("signed out")) {
      setToasts([{ id: ++idRef.current, type, title, body }]);
      recentToastsRef.current.clear();
      window.setTimeout(() => dismiss(idRef.current), 1000);
      return;
    }

    // Prevent identical toast duplicates within 1 second
    if (recentToastsRef.current.has(key)) {
      const lastTime = recentToastsRef.current.get(key);
      if (now - lastTime < 1000) {
        return;
      }
    }

    recentToastsRef.current.set(key, now);

    const id = ++idRef.current;
    
    setToasts((prev) => {
      // Keep max 2 toasts visible at a time for clean UI
      const maxToasts = 2;
      const updated = [...prev, { id, type, title, body }];
      if (updated.length > maxToasts) {
        return updated.slice(updated.length - maxToasts);
      }
      return updated;
    });

    window.setTimeout(() => dismiss(id), 1000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <ToastStack toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastStack({ toasts, dismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-2.5 max-w-[360px] w-full px-3 sm:px-0 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const meta = TOAST_META[t.type] || TOAST_META.info;
        const Icon = meta.icon;
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 rounded-xl p-3.5 shadow-xl bg-white border border-slate-200/80 backdrop-blur-xl transition-all duration-200"
            style={{
              boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              animation: "iccToastIn 240ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div
              className="flex items-center justify-center rounded-full shrink-0 mt-0.5"
              style={{ width: 26, height: 26, background: meta.tint }}
            >
              <Icon size={15} style={{ color: meta.color }} />
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-bold text-slate-900 leading-snug">
                {t.title || meta.label}
              </p>
              {t.body && (
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-normal">
                  {t.body}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes iccToastIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
