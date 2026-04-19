import { db } from "@/lib/db";
import { posts, likes, saves, reposts, reviews, users } from "@/lib/db/schema";
import { eq, desc, and, sql, count, avg } from "drizzle-orm";

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
  // Build conditions
  let conditions = and(
    eq(posts.isPublished, true),
    eq(posts.isFlagged, false),
    eq(posts.isDeleted, false)
  );

  if (category && category !== "all") {
    conditions = and(conditions, eq(posts.category, category));
  }

  // Single query: join author + subqueries for engagement counts
  const likeCountSq = sql<number>`(SELECT count(*) FROM ${likes} WHERE ${likes.postId} = ${posts.id})`;
  const saveCountSq = sql<number>`(SELECT count(*) FROM ${saves} WHERE ${saves.postId} = ${posts.id})`;
  const repostCountSq = sql<number>`(SELECT count(*) FROM ${reposts} WHERE ${reposts.postId} = ${posts.id})`;
  const reviewCountSq = sql<number>`(SELECT count(*) FROM ${reviews} WHERE ${reviews.postId} = ${posts.id})`;
  const reviewAvgSq = sql<number>`(SELECT avg(${reviews.rating}) FROM ${reviews} WHERE ${reviews.postId} = ${posts.id})`;

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      excerpt: posts.excerpt,
      coverImageUrl: posts.coverImageUrl,
      mediaUrls: posts.mediaUrls,
      category: posts.category,
      tags: posts.tags,
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
      editedAt: posts.editedAt,
      authorId: users.id,
      authorUsername: users.username,
      authorDisplayName: users.displayName,
      authorAvatarUrl: users.avatarUrl,
      likeCount: sql<number>`COALESCE(${likeCountSq}, 0)`,
      saveCount: sql<number>`COALESCE(${saveCountSq}, 0)`,
      repostCount: sql<number>`COALESCE(${repostCountSq}, 0)`,
      reviewCount: sql<number>`COALESCE(${reviewCountSq}, 0)`,
      reviewAvg: reviewAvgSq,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(conditions)
    .orderBy(desc(posts.createdAt))
    .limit(limit + 20)
    .offset(offset);

  // Calculate scores in JS (exponential decay can't easily be done in SQL)
  const enriched: RankedPost[] = rows.map((row) => {
    const likeCount = Number(row.likeCount) || 0;
    const saveCount = Number(row.saveCount) || 0;
    const repostCount = Number(row.repostCount) || 0;
    const reviewCount = Number(row.reviewCount) || 0;
    const reviewAvg = row.reviewAvg ? parseFloat(String(row.reviewAvg)) : 0;

    const badReviewPenalty =
      reviewCount > 0 && reviewAvg <= 2.5 ? reviewCount * 10 : 0;

    // Recency bonus: exponential decay over 48 hours
    const ageHours =
      (Date.now() - row.createdAt.getTime()) / (1000 * 60 * 60);
    const recencyBonus = Math.max(0, 100 * Math.exp(-ageHours / 24));

    const score =
      row.viewCount * 1 +
      likeCount * 3 +
      repostCount * 5 +
      saveCount * 2 -
      badReviewPenalty +
      recencyBonus;

    return {
      id: row.id,
      title: row.title,
      content: row.content,
      excerpt: row.excerpt,
      coverImageUrl: row.coverImageUrl,
      mediaUrls: row.mediaUrls,
      category: row.category,
      tags: row.tags,
      viewCount: row.viewCount,
      createdAt: row.createdAt,
      editedAt: row.editedAt,
      author: {
        id: row.authorId,
        username: row.authorUsername,
        displayName: row.authorDisplayName,
        avatarUrl: row.authorAvatarUrl,
      },
      likeCount,
      saveCount,
      repostCount,
      score,
    };
  });

  // Sort by score descending
  enriched.sort((a, b) => b.score - a.score);
  return enriched.slice(0, limit);
}

export async function getTrendingPosts(limit = 10): Promise<RankedPost[]> {
  return getRankedPosts(limit, 0);
}

