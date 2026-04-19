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
        className="modal max-w-[450px] p-0 overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header-bordered">
          <div>
            <h3 className="m-0 text-[1.25rem] text-primary">Rate this Post</h3>
            <p className="mt-1 mb-0 text-[0.875rem] text-tertiary">{postTitle}</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-success mx-auto mb-4" />
              <h4 className="m-0">Thank you!</h4>
              <p className="text-secondary text-[0.875rem]">Your review has been published.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6 text-center">
                <div className="rating-star-group">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`rating-star-item ${star <= (hoverRating || selectedRating) ? "filled" : ""}`}
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star 
                        size={32} 
                        fill={star <= (hoverRating || selectedRating) ? "#f59e0b" : "none"} 
                        stroke={star <= (hoverRating || selectedRating) ? "#f59e0b" : "var(--border-color)"}
                      />
                    </span>
                  ))}
                </div>
                <p className="rating-label">
                  {selectedRating === 0 ? "Select a rating" : `${selectedRating} out of 5 stars`}
                </p>
              </div>

              <div className="input-group mb-6">
                <label className="input-label">Your thoughts (optional)</label>
                <textarea
                  name="reason"
                  className="input min-h-[120px]"
                  placeholder="What did you think of this article?"
                />
              </div>

              <div className="flex gap-3">
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
