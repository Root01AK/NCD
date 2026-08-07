import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { T } from "../../lib/theme";

const TOAST_META = {
  success: { icon: CheckCircle2, color: T.success, tint: T.successTint, label: "Saved" },
  error: { icon: AlertCircle, color: T.error, tint: T.errorTint, label: "Something went wrong" },
  info: { icon: Info, color: T.charcoal700, tint: T.goldTint, label: "Note" },
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

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((type, title, body) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, type, title, body }]);
    window.setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <ToastStack toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastStack({ toasts, dismiss }) {
  return (
    <div
      className="fixed top-5 right-5 z-50 flex flex-col gap-2"
      style={{ width: 340 }}
      aria-live="polite"
    >
      {toasts.map((t) => {
        const meta = TOAST_META[t.type];
        const Icon = meta.icon;
        return (
          <div
            key={t.id}
            className="flex items-start gap-3 rounded-lg p-3.5 shadow-lg"
            style={{
              background: T.paperRaised,
              border: `1px solid ${T.line}`,
              boxShadow: "0 8px 24px rgba(36,35,34,0.14)",
              animation: "iccToastIn 220ms ease-out",
            }}
          >
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 28, height: 28, background: meta.tint }}
            >
              <Icon size={16} color={meta.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium leading-snug"
                style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.ink }}
              >
                {t.title || meta.label}
              </p>
              {t.body && (
                <p
                  className="text-xs mt-0.5 leading-snug"
                  style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.charcoal500 }}
                >
                  {t.body}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded p-0.5"
              style={{ color: T.charcoal500 }}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes iccToastIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
