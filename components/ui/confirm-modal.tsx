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
      className={`modal-overlay ${isOpen ? "animate-fade-in" : "animate-fade-out"}`}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose} />

      {/* Modal Card */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`modal-card ${isOpen ? "animate-scale-up" : "animate-scale-down"}`}
      >
        {/* Header */}
        <div className="modal-header">
          <div className={`modal-icon-box ${isDestructive ? "bg-error-soft text-error" : "bg-accent-soft text-accent"}`}>
            {isDestructive ? <AlertTriangle size={20} /> : <Trash2 size={20} />}
          </div>
          <h3 className="headline-small m-0 text-primary">
            {title}
          </h3>
        </div>

        {/* Body */}
        <div className="modal-body">
          <p className="text-secondary m-0 leading-relaxed text-sm">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn btn-secondary flex-1 py-3 font-semibold"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`btn flex-1 py-3 font-semibold ${isDestructive ? "btn-danger" : "btn-primary"}`}
          >
            {confirmText}
          </button>
        </div>

        {/* Close Button x */}
        <button
          onClick={onClose}
          className="modal-close-x"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
