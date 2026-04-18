"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
}

export function BackButton({ label = "Back" }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="btn btn-ghost"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 0",
        marginBottom: "1.5rem",
        fontSize: "0.875rem",
        color: "var(--text-tertiary)",
        transition: "color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
    >
      <ArrowLeft size={16} />
      <span>{label}</span>
      
      <style>{`
        @media print {
          button { display: none; }
        }
      `}</style>
    </button>
  );
}
