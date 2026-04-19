"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/app/actions/reviews";
import { Star, CheckCircle } from "lucide-react";

interface ReviewSectionProps {
  postId: string;
  avgRating: number;
  reviewCount: number;
  isLoggedIn: boolean;
}

export function ReviewSection({
  postId,
  avgRating,
  reviewCount,
  isLoggedIn,
}: ReviewSectionProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    if (!isLoggedIn) return alert("Please log in to review");
    formData.set("rating", String(selectedRating));
    startTransition(async () => {
      const result = await submitReview(postId, formData);
      if (result?.success) setSubmitted(true);
    });
  };

  return (
    <div className="mt-8">
      <div className="section-divider">Reviews</div>

      <div className="review-highlight-grid">
        <div className="review-avg-score">
          {avgRating.toFixed(1)}
        </div>
        
        <div className="review-meta-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= Math.round(avgRating) ? "filled" : ""} cursor-default`}
            >
              <Star 
                size={18} 
                fill={star <= Math.round(avgRating) ? "var(--accent)" : "none"} 
                strokeWidth={1.5}
              />
            </span>
          ))}
        </div>

        <div className="review-meta-count">
          {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
        </div>
      </div>

    </div>
  );
}
