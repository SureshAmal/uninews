"use client";

import { Star, MessageSquare } from "lucide-react";

interface ReviewSummaryProps {
  avgRating: number;
  reviewCount: number;
  onWriteReview?: () => void;
  isLoggedIn: boolean;
}

export function ReviewSummary({ avgRating, reviewCount, onWriteReview, isLoggedIn }: ReviewSummaryProps) {
  return (
    <div 
      style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "1.25rem",
        marginBottom: "2rem",
        padding: "0.75rem 1rem",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--radius-md)",
        width: "fit-content"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.125rem" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              size={16} 
              fill={star <= Math.round(avgRating) ? "#f59e0b" : "none"} 
              stroke={star <= Math.round(avgRating) ? "#f59e0b" : "var(--text-tertiary)"}
              strokeWidth={1.5}
            />
          ))}
        </div>
        <span style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--text-primary)" }}>
          {reviewCount > 0 ? avgRating.toFixed(1) : "No reviews"}
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: "var(--divider)" }} />

      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
        <MessageSquare size={16} />
        <span>{reviewCount} {reviewCount === 1 ? "Review" : "Reviews"}</span>
      </div>

      {isLoggedIn && (
        <button 
          onClick={onWriteReview}
          className="btn btn-primary btn-sm"
          style={{ marginLeft: "0.5rem" }}
        >
          Write a Review
        </button>
      )}
    </div>
  );
}
