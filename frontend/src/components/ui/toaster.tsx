"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, RefreshCw, X, Info } from "lucide-react";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toast: (type: Toast["type"], message: string, action?: Toast["action"]) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const noopToast: ToastContextType = {
  toast: () => {},
  dismiss: () => {},
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) return noopToast;
  return context;
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((type: Toast["type"], message: string, action?: Toast["action"]) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message, action }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right ${
              t.type === "success"
                ? "bg-green-500/90 text-white"
                : t.type === "info"
                ? "bg-blue-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}
            role="alert"
          >
            {t.type === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : t.type === "info" ? (
              <Info className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="flex-1 text-sm">{t.message}</span>
            {t.action && (
              <button
                onClick={t.action.onClick}
                className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded font-medium text-sm transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                {t.action.label}
              </button>
            )}
            <button
              onClick={() => dismiss(t.id)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
