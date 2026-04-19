"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="container-news animate-fade-in"
      style={{
        paddingTop: "6rem",
        paddingBottom: "6rem",
        textAlign: "center",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(196, 30, 58, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        <AlertTriangle size={36} style={{ color: "var(--error)" }} />
      </div>

      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.5rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
        }}
      >
        Something went wrong
      </h2>

      <p
        style={{
          fontSize: "0.9375rem",
          color: "var(--text-tertiary)",
          marginBottom: "2rem",
          maxWidth: 400,
        }}
      >
        An unexpected error occurred. Please try again.
      </p>

      <button onClick={reset} className="btn btn-primary">
        Try Again
      </button>
    </div>
  );
}
