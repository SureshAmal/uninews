"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/app/actions/reviews";
import { Star, X, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface ReviewModalProps {
  postId: string;
  postTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReviewModal({ postId, postTitle, onClose, onSuccess }: ReviewModalProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("rating", String(selectedRating));

    startTransition(async () => {
      const result = await submitReview(postId, formData);
      if (result?.success) {
        setSubmitted(true);
        if (onSuccess) onSuccess();
        setTimeout(onClose, 2000);
      } else {
        toast.error("Error", result.error || "Failed to submit review");
      }
    });
  };

  return (
    <div className="overlay" style={{ zIndex: 1000 }} onClick={onClose}>
      <div 
        className="modal" 
        style={{ maxWidth: 450, padding: 0, overflow: "hidden" }} 
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-primary)" }}>Rate this Post</h3>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "var(--text-tertiary)" }}>{postTitle}</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <CheckCircle size={48} color="var(--success)" style={{ marginBottom: "1rem" }} />
              <h4 style={{ margin: 0 }}>Thank you!</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Your review has been published.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= (hoverRating || selectedRating) ? "filled" : ""}`}
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{ fontSize: "2.5rem" }}
                    >
                      <Star 
                        size={32} 
                        fill={star <= (hoverRating || selectedRating) ? "#f59e0b" : "none"} 
                        stroke={star <= (hoverRating || selectedRating) ? "#f59e0b" : "var(--border-color)"}
                      />
                    </span>
                  ))}
                </div>
                <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  {selectedRating === 0 ? "Select a rating" : `${selectedRating} out of 5 stars`}
                </p>
              </div>

              <div className="input-group" style={{ marginBottom: "1.5rem" }}>
                <label className="input-label">Your thoughts (optional)</label>
                <textarea
                  name="reason"
                  className="input"
                  placeholder="What did you think of this article?"
                  style={{ minHeight: 120 }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="button" onClick={onClose} className="btn btn-secondary w-full">Cancel</button>
                <button 
                  type="submit" 
                  className="btn btn-primary w-full" 
                  disabled={isPending || selectedRating === 0}
                >
                  {isPending ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
