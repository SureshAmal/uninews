"use client";

import { useState } from "react";
import { ReviewSummary } from "./review-summary";
import { ReviewModal } from "./review-modal";

interface ReviewInteractionProps {
  postId: string;
  postTitle: string;
  avgRating: number;
  reviewCount: number;
  isLoggedIn: boolean;
}

export function ReviewInteraction({
  postId,
  postTitle,
  avgRating,
  reviewCount,
  isLoggedIn
}: ReviewInteractionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ReviewSummary
        avgRating={avgRating}
        reviewCount={reviewCount}
        isLoggedIn={isLoggedIn}
        onWriteReview={() => setIsModalOpen(true)}
      />

      {isModalOpen && (
        <ReviewModal
          postId={postId}
          postTitle={postTitle}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            // No need for complex state here, revalidatePath in server action handles UI update
          }}
        />
      )}
    </>
  );
}
