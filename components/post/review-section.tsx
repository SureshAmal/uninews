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
    <div style={{ marginTop: "2rem" }}>
      <div className="section-divider">Reviews</div>

      {/* Average rating display */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            fontFamily: "var(--font-heading)",
            color: "var(--text-primary)",
          }}
        >
          {avgRating.toFixed(1)}
        </div>
        <div>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= Math.round(avgRating) ? "filled" : ""}`}
                style={{ cursor: "default" }}
              >
                <Star size={16} fill={star <= Math.round(avgRating) ? "currentColor" : "none"} />
              </span>
            ))}
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-tertiary)",
            }}
          >
            {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>

      {/* Submit review */}
      {isLoggedIn && !submitted ? (
        <form action={handleSubmit}>
          <div style={{ marginBottom: "0.75rem" }}>
            <span
              style={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--text-secondary)",
                display: "block",
                marginBottom: "0.375rem",
              }}
            >
              Rate this post:
            </span>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= (hoverRating || selectedRating) ? "filled" : ""}`}
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star size={24} fill={star <= (hoverRating || selectedRating) ? "currentColor" : "none"} />
                </span>
              ))}
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: "0.75rem" }}>
            <textarea
              name="reason"
              className="input"
              placeholder="Optional: share your thoughts..."
              style={{ minHeight: 80 }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-secondary btn-sm"
            disabled={isPending || selectedRating === 0}
          >
            {isPending ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : submitted ? (
          <p
          style={{
            fontSize: "0.875rem",
            color: "var(--success)",
            padding: "0.75rem",
            background: "rgba(45,138,78,0.08)",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <CheckCircle size={16} /> Review submitted! Thank you for your feedback.
        </p>
      ) : (
        <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
          Log in to leave a review.
        </p>
      )}
    </div>
  );
}
