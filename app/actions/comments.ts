"use server";

import { db } from "@/lib/db";
import { comments, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, asc, count } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";

export async function addComment(postId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login required" };

  const content = (formData.get("content") as string)?.trim();
  if (!content || content.length === 0) return { error: "Comment cannot be empty" };
  if (content.length > 2000) return { error: "Comment too long (max 2000 chars)" };

  const parentId = (formData.get("parentId") as string) || null;

  // Sanitize to plain text only for comments
  const sanitized = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} });

  const [comment] = await db
    .insert(comments)
    .values({
      postId,
      authorId: user.userId,
      content: sanitized,
      parentId,
    })
    .returning();

  return { success: true, comment };
}

export async function getComments(postId: string) {
  const rows = await db
    .select({
      id: comments.id,
      content: comments.content,
      parentId: comments.parentId,
      createdAt: comments.createdAt,
      authorId: users.id,
      authorUsername: users.username,
      authorDisplayName: users.displayName,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.postId, postId))
    .orderBy(asc(comments.createdAt));

  // Organize into threaded structure (1 level deep)
  const topLevel = rows.filter((r) => !r.parentId);
  const replies = rows.filter((r) => r.parentId);

  return topLevel.map((comment) => ({
    ...comment,
    author: {
      id: comment.authorId,
      username: comment.authorUsername,
      displayName: comment.authorDisplayName,
      avatarUrl: comment.authorAvatarUrl,
    },
    replies: replies
      .filter((r) => r.parentId === comment.id)
      .map((r) => ({
        ...r,
        author: {
          id: r.authorId,
          username: r.authorUsername,
          displayName: r.authorDisplayName,
          avatarUrl: r.authorAvatarUrl,
        },
        replies: [],
      })),
  }));
}

export async function deleteComment(commentId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login required" };

  const [existing] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!existing || existing.authorId !== user.userId) {
    return { error: "Not authorized" };
  }

  await db.delete(comments).where(eq(comments.id, commentId));
  return { success: true };
}

export async function getCommentCount(postId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(comments)
    .where(eq(comments.postId, postId));
  return result.count;
}
