"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onCancel();
      };
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      bg: "bg-red-500/10",
      border: "border-red-500/50",
      icon: "text-red-500",
      button: "bg-red-500 hover:bg-red-600",
    },
    warning: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/50",
      icon: "text-yellow-500",
      button: "bg-yellow-500 hover:bg-yellow-600",
    },
    info: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/50",
      icon: "text-blue-500",
      button: "bg-[var(--primary)] hover:bg-[var(--primary)]/90",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        ref={dialogRef}
        className={`relative ${styles.bg} border ${styles.border} rounded-xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 fade-in`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {variant === "danger" ? (
              <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
            ) : (
              <div className={`w-6 h-6 ${styles.icon}`}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 id="dialog-title" className="text-lg font-semibold mb-2">
              {title}
            </h3>
            <p className="text-[var(--muted-foreground)] text-sm">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 rounded-lg font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 ${styles.button} text-white rounded-lg font-medium transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
