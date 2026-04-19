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
    <div
      style={{
        position: "fixed",
        bottom: "4rem", /* Above mobile nav */
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        alignItems: "center",
        pointerEvents: "none",
        width: "90%",
        maxWidth: "400px",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="m3-toast animate-slide-up"
          style={{
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.875rem 1rem",
            background: "var(--bg-card)",
            borderRadius: "0.75rem",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            border: "1px solid var(--border-light)",
            width: "100%",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Icon */}
          <div style={{ flexShrink: 0, display: "flex" }}>
            {t.type === "success" && <CheckCircle size={20} style={{ color: "var(--success)" }} />}
            {t.type === "warning" && <AlertCircle size={20} style={{ color: "var(--warning)" }} />}
            {t.type === "error" && <AlertCircle size={20} style={{ color: "var(--error)" }} />}
            {t.type === "info" && <Info size={20} style={{ color: "var(--accent)" }} />}
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: 0,
                fontFamily: "var(--font-heading)",
              }}
            >
              {t.title}
            </p>
            {t.message && (
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-secondary)",
                  margin: "0.125rem 0 0 0",
                  lineHeight: 1.4,
                }}
              >
                {t.message}
              </p>
            )}
          </div>

          {/* Close */}
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-tertiary)",
              padding: "0.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
