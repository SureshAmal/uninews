"use server";

import { db } from "@/lib/db";
import { users, posts, reviews, comments, announcements, auditLogs } from "@/lib/db/schema";
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

export async function logAdminAction(adminId: string, actionType: string, targetId: string, description: string) {
  await db.insert(auditLogs).values({
    adminId,
    actionType,
    targetId,
    description,
  });
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

export async function getUsersAdmin(
  page = 1, 
  limit = 20, 
  search = "", 
  role = "all", 
  status = "all",
  sortBy = "createdAt",
  sortOrder = "desc"
) {
  await requireAdmin();
  const offset = (page - 1) * limit;

  let query = db.select().from(users).$dynamic();
  
  if (search) {
    query = query.where(ilike(users.username, `%${search}%`));
  }
  if (role === "admin") {
    query = query.where(eq(users.isAdmin, true));
  }
  if (status === "suspended") {
    query = query.where(eq(users.isSuspended, true));
  } else if (status === "active") {
    query = query.where(eq(users.isSuspended, false));
  }

  const [totalResult] = await db.select({ count: count() }).from(query.as('q'));
  
  let fetchQuery = db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      isAdmin: users.isAdmin,
      isSuspended: users.isSuspended,
      createdAt: users.createdAt,
      collegeYears: users.collegeYears,
      registrationNo: users.registrationNo,
      enrollmentNo: users.enrollmentNo,
      postCount: sql<number>`(SELECT count(*) FROM ${posts} WHERE ${posts.authorId} = ${users.id})`,
    })
    .from(users)
    .$dynamic();

  // Apply filters identically
  if (search) fetchQuery = fetchQuery.where(ilike(users.username, `%${search}%`));
  if (role === "admin") fetchQuery = fetchQuery.where(eq(users.isAdmin, true));
  if (status === "suspended") fetchQuery = fetchQuery.where(eq(users.isSuspended, true));
  else if (status === "active") fetchQuery = fetchQuery.where(eq(users.isSuspended, false));

  // Sorting logic
  const columnMap: Record<string, any> = {
    username: users.username,
    createdAt: users.createdAt,
    postCount: sql`post_count_count`, // We'll refer to the subquery alias if needed or just use the sql block
    status: users.isSuspended,
  };

  let orderBy;
  if (sortBy === "postCount") {
     orderBy = sortOrder === "asc" ? sql`post_count_count ASC` : sql`post_count_count DESC`;
  } else {
     const sortCol = columnMap[sortBy] || users.createdAt;
     orderBy = sortOrder === "asc" ? sql`${sortCol} ASC` : sql`${sortCol} DESC`;
  }

  // To sort by postCount, we need to wrap the selection or use a more complex orderBy
  const data = await fetchQuery
    .orderBy(orderBy)
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
  
  await logAdminAction(admin.userId, target.isSuspended ? "RESTORE_USER" : "SUSPEND_USER", userId, `${admin.username} toggled suspension for user ${target.username}`);
  
  return { success: true, isSuspended: !target.isSuspended, error: undefined };
}

export async function adminDeleteUser(userId: string) {
  const admin = await requireAdmin();
  if (admin.userId === userId) return { error: "Cannot delete yourself." };
  
  const [target] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!target) return { error: "User not found." };

  await db.delete(users).where(eq(users.id, userId));
  await logAdminAction(admin.userId, "DELETE_USER", userId, `Hard deleted user @${target.username}`);
  revalidatePath("/admin/users");
  return { success: true, error: undefined };
}

export async function adminSetRole(userId: string, targetIsAdmin: boolean) {
  const admin = await requireAdmin();
  if (admin.userId === userId) return { error: "Cannot change your own role." };

  const [target] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!target) return { error: "User not found." };

  await db.update(users).set({ isAdmin: targetIsAdmin }).where(eq(users.id, userId));
  await logAdminAction(admin.userId, targetIsAdmin ? "GRANT_ADMIN" : "REVOKE_ADMIN", userId, `Changed role for user @${target.username}`);
  revalidatePath("/admin/users");
  return { success: true, error: undefined };
}

export async function adminUpdateUser(userId: string, data: any) {
  const admin = await requireAdmin();
  await db.update(users).set({
    displayName: data.displayName,
    bio: data.bio,
    collegeYears: data.collegeYears,
    avatarUrl: data.avatarUrl,
    registrationNo: data.registrationNo,
    enrollmentNo: data.enrollmentNo,
  }).where(eq(users.id, userId));
  
  await logAdminAction(admin.userId, "UPDATE_USER", userId, `Updated details for user`);
  revalidatePath("/admin/users");
  return { success: true, error: undefined };
}

import { hashPassword } from "@/lib/auth/password";
export async function adminResetPassword(userId: string, newPass: string) {
  const admin = await requireAdmin();
  const [target] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!target) return { error: "User not found." };
  
  const passwordHash = await hashPassword(newPass);
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  await logAdminAction(admin.userId, "RESET_PASSWORD", userId, `Reset password for user @${target.username}`);
  return { success: true, error: undefined };
}

// ─────────────────────────────────────────────────────────────────────────────
// Post Management
// ─────────────────────────────────────────────────────────────────────────────

export async function getPostsAdmin(
  page = 1, 
  limit = 20, 
  search = "", 
  category = "all", 
  status = "all",
  sortBy = "createdAt",
  sortOrder = "desc",
  authorId?: string,
  tag?: string
) {
  await requireAdmin();
  const offset = (page - 1) * limit;

  let query = db.select().from(posts).$dynamic();
  if (search) {
    query = query.where(ilike(posts.title, `%${search}%`));
  }
  if (category && category !== "all") {
    query = query.where(eq(posts.category, category));
  }
  if (authorId && authorId !== "all") {
    query = query.where(eq(posts.authorId, authorId));
  }
  if (tag && tag !== "all") {
    query = query.where(sql`${tag} = ANY(${posts.tags})`);
  }
  if (status === "published") {
    query = query.where(sql`${posts.isPublished} = true AND ${posts.isFlagged} = false`);
  } else if (status === "flagged") {
    query = query.where(eq(posts.isFlagged, true));
  } else if (status === "draft") {
    query = query.where(sql`${posts.isPublished} = false AND ${posts.isFlagged} = false`);
  }

  const [totalResult] = await db.select({ count: count() }).from(query.as('q'));

  let fetchQuery = db
    .select({
      id: posts.id,
      title: posts.title,
      category: posts.category,
      isPublished: posts.isPublished,
      isFlagged: posts.isFlagged,
      isFeatured: posts.isFeatured,
      createdAt: posts.createdAt,
      authorUsername: users.username,
      content: posts.content, // for previewing
      coverImageUrl: posts.coverImageUrl,
      mediaUrls: posts.mediaUrls,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .$dynamic();

  if (search) {
    fetchQuery = fetchQuery.where(ilike(posts.title, `%${search}%`));
  }
  if (category && category !== "all") {
    fetchQuery = fetchQuery.where(eq(posts.category, category));
  }
  if (authorId && authorId !== "all") {
    fetchQuery = fetchQuery.where(eq(posts.authorId, authorId));
  }
  if (tag && tag !== "all") {
    fetchQuery = fetchQuery.where(sql`${tag} = ANY(${posts.tags})`);
  }
  if (status === "published") {
    fetchQuery = fetchQuery.where(sql`${posts.isPublished} = true AND ${posts.isFlagged} = false`);
  } else if (status === "flagged") {
    fetchQuery = fetchQuery.where(eq(posts.isFlagged, true));
  } else if (status === "draft") {
    fetchQuery = fetchQuery.where(sql`${posts.isPublished} = false AND ${posts.isFlagged} = false`);
  }

  // Sorting logic
  const columnMap: Record<string, any> = {
    title: posts.title,
    author: users.username,
    category: posts.category,
    createdAt: posts.createdAt,
    status: posts.isPublished,
  };

  const sortCol = columnMap[sortBy] || posts.createdAt;
  const orderBy = sortOrder === "asc" ? sql`${sortCol} ASC` : sql`${sortCol} DESC`;

  const data = await fetchQuery
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  return {
    posts: data,
    total: totalResult.count,
    page,
    totalPages: Math.ceil(totalResult.count / limit),
  };
}

export async function getAuthorsSummary() {
  await requireAdmin();
  return await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
    })
    .from(users)
    .innerJoin(posts, eq(posts.authorId, users.id))
    .groupBy(users.id, users.username, users.displayName)
    .orderBy(users.username);
}

export async function getUniqueTagsSummary() {
  await requireAdmin();
  const res = await db.execute(sql`SELECT DISTINCT unnest(${posts.tags}) as tag FROM ${posts} WHERE ${posts.tags} IS NOT NULL`);
  const items = Array.isArray(res) ? res : ((res as any).rows || []);
  return items.map((r: any) => r.tag as string).filter(Boolean).sort();
}

export async function setPostStatusAdmin(postId: string, status: "published" | "draft" | "flagged") {
  const admin = await requireAdmin();
  const [target] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (!target) return { error: "Post not found." };

  const isPublished = status === "published";
  const isFlagged = status === "flagged";

  await db
    .update(posts)
    .set({ isPublished, isFlagged })
    .where(eq(posts.id, postId));

  revalidatePath("/admin/posts");
  await logAdminAction(admin.userId, "SET_POST_STATUS", postId, `Set post status to ${status}`);
  return { success: true, error: undefined };
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
  await logAdminAction((await requireAdmin()).userId, "TOGGLE_POST_STATUS", postId, `Toggled post disable status to ${isNowDisabled}`);
  return { success: true, isDisabled: isNowDisabled, error: undefined };
}

export async function adminToggleFeatured(postId: string) {
  const admin = await requireAdmin();
  const [target] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (!target) return { error: "Post not found." };
  
  await db.update(posts).set({ isFeatured: !target.isFeatured }).where(eq(posts.id, postId));
  await logAdminAction(admin.userId, "TOGGLE_FEATURED", postId, `Toggled featured to ${!target.isFeatured}`);
  revalidatePath("/admin/posts");
  return { success: true, error: undefined };
}

export async function adminDeletePost(postId: string) {
  const admin = await requireAdmin();
  await db.delete(posts).where(eq(posts.id, postId));
  await logAdminAction(admin.userId, "DELETE_POST", postId, `Hard deleted post`);
  revalidatePath("/admin/posts");
  return { success: true, error: undefined };
}

export async function adminUpdatePost(postId: string, data: any) {
  const admin = await requireAdmin();
  await db.update(posts).set({
    title: data.title,
    content: data.content,
    category: data.category,
  }).where(eq(posts.id, postId));
  await logAdminAction(admin.userId, "UPDATE_POST", postId, `Edited post content/title`);
  revalidatePath("/admin/posts");
  return { success: true, error: undefined };
}

// ─────────────────────────────────────────────────────────────────────────────
// Reviews Management
// ─────────────────────────────────────────────────────────────────────────────

export async function getReviewsAdmin(page = 1, limit = 20, search = "") {
  await requireAdmin();
  const offset = (page - 1) * limit;

  let query = db.select().from(reviews).$dynamic();
  if (search) {
    query = query.where(ilike(reviews.reason, `%${search}%`));
  }

  const [totalResult] = await db.select({ count: count() }).from(query.as('q'));

  let fetchQuery = db
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
    .$dynamic();

  if (search) {
    fetchQuery = fetchQuery.where(ilike(reviews.reason, `%${search}%`));
  }

  const data = await fetchQuery
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
  const admin = await requireAdmin();
  await db.delete(reviews).where(eq(reviews.id, reviewId));
  await logAdminAction(admin.userId, "DELETE_REVIEW", reviewId, "Hard deleted a review");
  revalidatePath("/admin/reviews");
  return { success: true, error: undefined };
}

// ─────────────────────────────────────────────────────────────────────────────
// Comments Management
// ─────────────────────────────────────────────────────────────────────────────

export async function getCommentsAdmin(page = 1, limit = 20, search = "") {
  await requireAdmin();
  const offset = (page - 1) * limit;

  let query = db.select().from(comments).$dynamic();
  if (search) {
    query = query.where(ilike(comments.content, `%${search}%`));
  }

  const [totalResult] = await db.select({ count: count() }).from(query.as('q'));

  let fetchQuery = db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      postTitle: posts.title,
      authorUsername: users.username,
    })
    .from(comments)
    .innerJoin(posts, eq(comments.postId, posts.id))
    .innerJoin(users, eq(comments.authorId, users.id))
    .$dynamic();

  if (search) {
    fetchQuery = fetchQuery.where(ilike(comments.content, `%${search}%`));
  }

  const data = await fetchQuery
    .orderBy(desc(comments.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    comments: data,
    total: totalResult.count,
    page,
    totalPages: Math.ceil(totalResult.count / limit),
  };
}

export async function adminDeleteComment(commentId: string) {
  const admin = await requireAdmin();
  await db.delete(comments).where(eq(comments.id, commentId));
  await logAdminAction(admin.userId, "DELETE_COMMENT", commentId, "Hard deleted a comment");
  revalidatePath("/admin/comments");
  return { success: true, error: undefined };
}

// ─────────────────────────────────────────────────────────────────────────────
// Announcements
// ─────────────────────────────────────────────────────────────────────────────

export async function createAnnouncement(message: string) {
  const admin = await requireAdmin();
  // Deactivate old ones
  await db.update(announcements).set({ isActive: false });
  // Insert new
  await db.insert(announcements).values({ message, isActive: true });
  await logAdminAction(admin.userId, "CREATE_ANNOUNCEMENT", "global", `Created announcement: ${message.substring(0, 50)}`);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deactivateAnnouncement() {
  const admin = await requireAdmin();
  await db.update(announcements).set({ isActive: false });
  await logAdminAction(admin.userId, "DEACTIVATE_ANNOUNCEMENT", "global", "Deactivated global announcements");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function getActiveAnnouncement() {
  const [announcement] = await db.select().from(announcements).where(eq(announcements.isActive, true)).orderBy(desc(announcements.createdAt)).limit(1);
  return announcement || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit Logs
// ─────────────────────────────────────────────────────────────────────────────

export async function getAuditLogs(page = 1, limit = 50, search = "") {
  await requireAdmin();
  const offset = (page - 1) * limit;

  let query = db.select().from(auditLogs).$dynamic();
  if (search) {
    query = query.where(ilike(auditLogs.description, `%${search}%`));
  }

  const [totalResult] = await db.select({ count: count() }).from(query.as('q'));

  let fetchQuery = db
    .select({
      id: auditLogs.id,
      actionType: auditLogs.actionType,
      targetId: auditLogs.targetId,
      description: auditLogs.description,
      createdAt: auditLogs.createdAt,
      adminUsername: users.username,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.adminId, users.id))
    .$dynamic();

  if (search) {
    fetchQuery = fetchQuery.where(ilike(auditLogs.description, `%${search}%`));
  }

  const data = await fetchQuery
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    logs: data,
    total: totalResult.count,
    page,
    totalPages: Math.ceil(totalResult.count / limit),
  };
}
