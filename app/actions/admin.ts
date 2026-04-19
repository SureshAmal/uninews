"use server";

import { db } from "@/lib/db";
import { users, posts, reviews, comments } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, desc, ilike, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Validates the user is an admin. Throws an error otherwise.
 */
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.isSuspended || !user.isAdmin) {
    throw new Error("Unauthorized: Admin privileges required.");
  }
  return user;
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics
// ─────────────────────────────────────────────────────────────────────────────

export async function getAdminStats() {
  await requireAdmin();

  const [userCount] = await db.select({ count: count() }).from(users);
  const [postCount] = await db.select({ count: count() }).from(posts);
  const [reviewCount] = await db.select({ count: count() }).from(reviews);

  return {
    totalUsers: userCount.count,
    totalPosts: postCount.count,
    totalReviews: reviewCount.count,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// User Management
// ─────────────────────────────────────────────────────────────────────────────

export async function getUsersAdmin(page = 1, limit = 20, search = "") {
  await requireAdmin();
  const offset = (page - 1) * limit;

  let query = db.select().from(users).$dynamic();
  
  if (search) {
    query = query.where(ilike(users.username, `%${search}%`));
  }

  const [totalResult] = await db.select({ count: count() }).from(query.as('q'));
  
  const data = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      isAdmin: users.isAdmin,
      isSuspended: users.isSuspended,
      createdAt: users.createdAt,
      postCount: sql<number>`(SELECT count(*) FROM ${posts} WHERE ${posts.authorId} = ${users.id})`,
    })
    .from(users)
    .where(search ? ilike(users.username, `%${search}%`) : undefined)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    users: data.map(d => ({ ...d, postCount: Number(d.postCount) || 0 })),
    total: totalResult.count,
    page,
    totalPages: Math.ceil(totalResult.count / limit),
  };
}

export async function toggleUserSuspension(userId: string) {
  const admin = await requireAdmin();
  
  if (admin.userId === userId) {
    return { error: "You cannot suspend yourself." };
  }

  const [target] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!target) return { error: "User not found." };

  await db
    .update(users)
    .set({ isSuspended: !target.isSuspended })
    .where(eq(users.id, userId));

  revalidatePath("/admin/users");
  return { success: true, isSuspended: !target.isSuspended };
}

// ─────────────────────────────────────────────────────────────────────────────
// Post Management
// ─────────────────────────────────────────────────────────────────────────────

export async function getPostsAdmin(page = 1, limit = 20, search = "") {
  await requireAdmin();
  const offset = (page - 1) * limit;

  let query = db.select().from(posts).$dynamic();
  if (search) {
    query = query.where(ilike(posts.title, `%${search}%`));
  }

  const [totalResult] = await db.select({ count: count() }).from(query.as('q'));

  const data = await db
    .select({
      id: posts.id,
      title: posts.title,
      category: posts.category,
      isPublished: posts.isPublished,
      isFlagged: posts.isFlagged,
      createdAt: posts.createdAt,
      authorUsername: users.username,
      content: posts.content, // for previewing
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(search ? ilike(posts.title, `%${search}%`) : undefined)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    posts: data,
    total: totalResult.count,
    page,
    totalPages: Math.ceil(totalResult.count / limit),
  };
}

/** Toggles isPublished and isFlagged */
export async function togglePostStatus(postId: string) {
  await requireAdmin();

  const [target] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (!target) return { error: "Post not found." };

  const isNowDisabled = target.isPublished; 
  
  await db
    .update(posts)
    .set({ 
      isPublished: !isNowDisabled,
      isFlagged: isNowDisabled // If we're disabling it, flag it.
    })
    .where(eq(posts.id, postId));

  revalidatePath("/admin/posts");
  return { success: true, isDisabled: isNowDisabled };
}

// ─────────────────────────────────────────────────────────────────────────────
// Reviews Management
// ─────────────────────────────────────────────────────────────────────────────

export async function getReviewsAdmin(page = 1, limit = 20) {
  await requireAdmin();
  const offset = (page - 1) * limit;

  const [totalResult] = await db.select({ count: count() }).from(reviews);

  const data = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      reason: reviews.reason,
      createdAt: reviews.createdAt,
      postTitle: posts.title,
      postId: posts.id,
      reviewerUsername: users.username,
      reviewerId: users.id,
    })
    .from(reviews)
    .innerJoin(posts, eq(reviews.postId, posts.id))
    .innerJoin(users, eq(reviews.reviewerId, users.id))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    reviews: data,
    total: totalResult.count,
    page,
    totalPages: Math.ceil(totalResult.count / limit),
  };
}

export async function deleteReviewAdmin(reviewId: string) {
  await requireAdmin();
  await db.delete(reviews).where(eq(reviews.id, reviewId));
  revalidatePath("/admin/reviews");
  return { success: true };
}
