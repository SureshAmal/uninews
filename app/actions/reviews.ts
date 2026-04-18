"use server";

import { db } from "@/lib/db";
import { reviews, posts } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, and, avg, count } from "drizzle-orm";
import * as z from "zod";

const ReviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  reason: z.string().optional(),
});

export async function submitReview(postId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login required" };

  const raw = {
    rating: formData.get("rating"),
    reason: (formData.get("reason") as string) || undefined,
  };

  const parsed = ReviewSchema.safeParse(raw);
  if (!parsed.success) return { error: "Invalid rating" };

  // Upsert review
  const existing = await db
    .select()
    .from(reviews)
    .where(
      and(eq(reviews.reviewerId, user.userId), eq(reviews.postId, postId))
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(reviews)
      .set({ rating: parsed.data.rating, reason: parsed.data.reason || null })
      .where(eq(reviews.id, existing[0].id));
  } else {
    await db.insert(reviews).values({
      reviewerId: user.userId,
      postId,
      rating: parsed.data.rating,
      reason: parsed.data.reason || null,
    });
  }

  // Check if post should be flagged (avg rating ≤ 2.0, review count ≥ 5)
  const [stats] = await db
    .select({
      avgRating: avg(reviews.rating),
      reviewCount: count(),
    })
    .from(reviews)
    .where(eq(reviews.postId, postId));

  if (
    stats.reviewCount >= 5 &&
    stats.avgRating &&
    parseFloat(String(stats.avgRating)) <= 2.0
  ) {
    await db
      .update(posts)
      .set({ isFlagged: true, isPublished: false })
      .where(eq(posts.id, postId));
  }

  return { success: true };
}

export async function getPostReviews(postId: string) {
  const postReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.postId, postId));

  const [stats] = await db
    .select({
      avgRating: avg(reviews.rating),
      reviewCount: count(),
    })
    .from(reviews)
    .where(eq(reviews.postId, postId));

  return {
    reviews: postReviews,
    avgRating: stats.avgRating ? parseFloat(String(stats.avgRating)) : 0,
    reviewCount: stats.reviewCount,
  };
}
