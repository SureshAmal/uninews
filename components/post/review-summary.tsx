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
    <div className="flex items-center gap-5 mb-8 px-4 py-3 bg-secondary border border-divider rounded-md w-fit">
      <div className="flex items-center gap-2">
        <div className="flex gap-[0.0625rem]">
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
        <span className="font-bold text-[1.125rem] text-primary">
          {reviewCount > 0 ? avgRating.toFixed(1) : "No reviews"}
        </span>
      </div>

      <div className="w-[1px] h-5 bg-divider" />

      <div className="flex items-center gap-1.5 text-secondary text-[0.875rem]">
        <MessageSquare size={16} />
        <span>{reviewCount} {reviewCount === 1 ? "Review" : "Reviews"}</span>
      </div>

      {isLoggedIn && (
        <button 
          onClick={onWriteReview}
          className="btn btn-primary btn-sm ml-2"
        >
          Write a Review
        </button>
      )}
    </div>
  );
}
