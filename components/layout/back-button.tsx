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
      className="btn-back"
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
