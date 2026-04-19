"use client";

import React, { useEffect, useState, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isDestructive = true,
}: ConfirmModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Accessibility: Focus the modal when it opens
      setTimeout(() => modalRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle Tab trapping and Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleAnimationEnd = () => {
    if (!isOpen) setShouldRender(false);
  };

  if (!shouldRender) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        animation: `${isOpen ? "fade-in" : "fade-out"} 0.2s ease-out forwards`,
      }}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        tabIndex={-1}
        style={{
          position: "relative",
          outline: "none",
          width: "100%",
          maxWidth: "400px",
          background: "var(--bg-primary)",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border-color)",
          animation: `${isOpen ? "scale-up" : "scale-down"} 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
        }}
      >
        {/* Header */}
        <div style={{ padding: "1.5rem 1.5rem 0.5rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            borderRadius: "50%", 
            background: isDestructive ? "var(--error-soft)" : "var(--accent-soft)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            color: isDestructive ? "var(--error)" : "var(--accent-text)"
          }}>
            {isDestructive ? <AlertTriangle size={20} /> : <Trash2 size={20} />}
          </div>
          <h3 style={{ 
            fontSize: "1.25rem", 
            fontWeight: 700, 
            fontFamily: "var(--font-heading)", 
            margin: 0,
            color: "var(--text-primary)"
          }}>
            {title}
          </h3>
        </div>

        {/* Body */}
        <div style={{ padding: "1rem 1.5rem" }}>
          <p style={{ 
            fontSize: "0.9375rem", 
            lineHeight: 1.6, 
            color: "var(--text-secondary)", 
            margin: 0 
          }}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div style={{ 
          padding: "1.25rem 1.5rem", 
          background: "var(--bg-secondary)", 
          display: "flex", 
          gap: "0.75rem",
          borderTop: "1px solid var(--border-color)"
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ flex: 1, padding: "0.75rem", fontWeight: 600 }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`btn ${isDestructive ? "btn-danger" : "btn-primary"}`}
            style={{ 
              flex: 1, 
              padding: "0.75rem", 
              fontWeight: 600,
              backgroundColor: isDestructive ? "var(--error)" : "var(--accent-primary)",
              color: "#fff"
            }}
          >
            {confirmText}
          </button>
        </div>

        {/* Close Button x */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-tertiary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px",
            borderRadius: "50%",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-tertiary)")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <X size={18} />
        </button>
      </div>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes scale-down { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.95); } }
      `}</style>
    </div>
  );
}
