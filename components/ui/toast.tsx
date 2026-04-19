"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

type ToastType = "success" | "warning" | "error" | "info";

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

// Global store for simple pub-sub pattern
let toastListener: ((toasts: ToastMessage[]) => void) | null = null;
let currentToasts: ToastMessage[] = [];

export const toast = {
  show: (title: string, message?: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    currentToasts = [...currentToasts, { id, title, message, type }];
    if (toastListener) toastListener(currentToasts);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      toast.dismiss(id);
    }, 4000);
  },
  success: (title: string, message?: string) => toast.show(title, message, "success"),
  warning: (title: string, message?: string) => toast.show(title, message, "warning"),
  error: (title: string, message?: string) => toast.show(title, message, "error"),
  info: (title: string, message?: string) => toast.show(title, message, "info"),
  dismiss: (id: string) => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    if (toastListener) toastListener(currentToasts);
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastListener = setToasts;
    return () => {
      toastListener = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-item animate-slide-up"
        >
          {/* Icon */}
          <div className="toast-icon-wrapper">
            {t.type === "success" && <CheckCircle size={20} className="text-success" />}
            {t.type === "warning" && <AlertCircle size={20} className="text-warning" />}
            {t.type === "error" && <AlertCircle size={20} className="text-error" />}
            {t.type === "info" && <Info size={20} className="text-accent" />}
          </div>

          {/* Content */}
          <div className="toast-content">
            <p className="toast-title">
              {t.title}
            </p>
            {t.message && (
              <p className="toast-message">
                {t.message}
              </p>
            )}
          </div>

          {/* Close */}
          <button
            onClick={() => toast.dismiss(t.id)}
            className="toast-close-btn"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
