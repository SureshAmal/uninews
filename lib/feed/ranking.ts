import { db } from "@/lib/db";
import { posts, likes, saves, reposts, reviews, users } from "@/lib/db/schema";
import { eq, desc, and, sql, count, avg, gt } from "drizzle-orm";

export interface RankedPost {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  mediaUrls: { url: string; type: "image" | "video" }[] | null;
  category: string;
  tags: string[] | null;
  viewCount: number;
  createdAt: Date;
  editedAt: Date | null;
  author: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  likeCount: number;
  saveCount: number;
  repostCount: number;
  score: number;
}

export async function getRankedPosts(
  limit = 20,
  offset = 0,
  category?: string
): Promise<RankedPost[]> {
  // Get published, non-flagged posts
  let conditions = and(
    eq(posts.isPublished, true),
    eq(posts.isFlagged, false)
  );

  if (category && category !== "all") {
    conditions = and(conditions, eq(posts.category, category));
  }

  const allPosts = await db
    .select()
    .from(posts)
    .where(conditions)
    .orderBy(desc(posts.createdAt))
    .limit(limit + 20) // fetch more for scoring
    .offset(offset);

  // Enrich with engagement data + score
  const enriched = await Promise.all(
    allPosts.map(async (post) => {
      const [author] = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(eq(users.id, post.authorId));

      const [likeData] = await db
        .select({ count: count() })
        .from(likes)
        .where(eq(likes.postId, post.id));

      const [saveData] = await db
        .select({ count: count() })
        .from(saves)
        .where(eq(saves.postId, post.id));

      const [repostData] = await db
        .select({ count: count() })
        .from(reposts)
        .where(eq(reposts.postId, post.id));

      const [reviewData] = await db
        .select({ avgRating: avg(reviews.rating), count: count() })
        .from(reviews)
        .where(eq(reviews.postId, post.id));

      // Calculate score
      const likeCount = likeData.count;
      const saveCount = saveData.count;
      const repostCount = repostData.count;
      const badReviewPenalty =
        reviewData.count > 0 &&
        reviewData.avgRating &&
        parseFloat(String(reviewData.avgRating)) <= 2.5
          ? reviewData.count * 10
          : 0;

      // Recency bonus: exponential decay over 48 hours
      const ageHours =
        (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
      const recencyBonus = Math.max(0, 100 * Math.exp(-ageHours / 24));

      const score =
        post.viewCount * 1 +
        likeCount * 3 +
        repostCount * 5 +
        saveCount * 2 -
        badReviewPenalty +
        recencyBonus;

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        coverImageUrl: post.coverImageUrl,
        mediaUrls: post.mediaUrls,
        category: post.category,
        tags: post.tags,
        viewCount: post.viewCount,
        createdAt: post.createdAt,
        editedAt: post.editedAt,
        author,
        likeCount,
        saveCount,
        repostCount,
        score,
      };
    })
  );

  // Sort by score descending
  enriched.sort((a, b) => b.score - a.score);
  return enriched.slice(0, limit);
}

export async function getTrendingPosts(limit = 10): Promise<RankedPost[]> {
  return getRankedPosts(limit, 0);
}
