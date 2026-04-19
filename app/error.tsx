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
    <div className="container-news animate-fade-in py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-20 h-20 rounded-full bg-error-soft flex items-center justify-center mb-6">
        <AlertTriangle size={36} className="text-error" />
      </div>

      <h2 className="font-heading text-2xl font-bold mb-3">
        Something went wrong
      </h2>

      <p className="text-[0.9375rem] text-tertiary mb-8 max-w-[400px]">
        An unexpected error occurred. Please try again.
      </p>

      <button onClick={reset} className="btn btn-primary">
        Try Again
      </button>
    </div>
  );
}
