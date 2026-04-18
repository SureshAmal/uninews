"use server";

import { db } from "@/lib/db";
import {
  posts,
  likes,
  saves,
  reposts,
  postViews,
  users,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { getRankedPosts } from "@/lib/feed/ranking";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import * as z from "zod";

const PostSchema = z.object({
  title: z.string().min(1, "Title required").max(200),
  content: z.string().min(1, "Content required"),
  excerpt: z.string().max(400).optional(),
  category: z.string().default("campus"),
  tags: z.string().optional(), // comma-separated
  coverImageUrl: z.string().optional(),
});

export type PostState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

export async function createPost(
  _prevState: PostState,
  formData: FormData
): Promise<PostState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Login required" };

  const raw = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    excerpt: (formData.get("excerpt") as string) || undefined,
    category: (formData.get("category") as string) || "campus",
    tags: (formData.get("tags") as string) || undefined,
    coverImageUrl: (formData.get("coverImageUrl") as string) || undefined,
  };

  const parsed = PostSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const tagsArray = parsed.data.tags
    ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : null;

  // Parse media URLs from formData
  const mediaUrlsRaw = formData.get("mediaUrls") as string;
  const mediaUrls = mediaUrlsRaw ? JSON.parse(mediaUrlsRaw) : null;

  const [post] = await db
    .insert(posts)
    .values({
      authorId: user.userId,
      title: parsed.data.title,
      content: parsed.data.content,
      excerpt:
        parsed.data.excerpt ||
        parsed.data.content.substring(0, 300) + "...",
      category: parsed.data.category,
      tags: tagsArray,
      coverImageUrl: parsed.data.coverImageUrl || null,
      mediaUrls,
    })
    .returning();

  redirect(`/post/${post.id}`);
}

export async function updatePost(
  postId: string,
  _prevState: PostState,
  formData: FormData
): Promise<PostState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Login required" };

  // Verify ownership
  const [existing] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!existing || existing.authorId !== user.userId) {
    return { error: "Not authorized to edit this post" };
  }

  const raw = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    excerpt: (formData.get("excerpt") as string) || undefined,
    category: (formData.get("category") as string) || "campus",
    tags: (formData.get("tags") as string) || undefined,
    coverImageUrl: (formData.get("coverImageUrl") as string) || undefined,
  };

  const parsed = PostSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const tagsArray = parsed.data.tags
    ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : null;

  const mediaUrlsRaw = formData.get("mediaUrls") as string;
  const mediaUrls = mediaUrlsRaw ? JSON.parse(mediaUrlsRaw) : existing.mediaUrls;

  await db
    .update(posts)
    .set({
      title: parsed.data.title,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt || parsed.data.content.substring(0, 300),
      category: parsed.data.category,
      tags: tagsArray,
      coverImageUrl: parsed.data.coverImageUrl || existing.coverImageUrl,
      mediaUrls,
      editedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId));

  redirect(`/post/${postId}`);
}

export async function deletePost(postId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login required" };

  const [existing] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!existing || existing.authorId !== user.userId) {
    return { error: "Not authorized" };
  }

  await db.delete(posts).where(eq(posts.id, postId));
  redirect("/");
}

export async function toggleLike(postId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login required", liked: false };

  const existing = await db
    .select()
    .from(likes)
    .where(and(eq(likes.userId, user.userId), eq(likes.postId, postId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, user.userId), eq(likes.postId, postId)));
    return { liked: false };
  } else {
    await db.insert(likes).values({ userId: user.userId, postId });
    return { liked: true };
  }
}

export async function toggleSave(postId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login required", saved: false };

  const existing = await db
    .select()
    .from(saves)
    .where(and(eq(saves.userId, user.userId), eq(saves.postId, postId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(saves)
      .where(and(eq(saves.userId, user.userId), eq(saves.postId, postId)));
    return { saved: false };
  } else {
    await db.insert(saves).values({ userId: user.userId, postId });
    return { saved: true };
  }
}

export async function toggleRepost(postId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login required", reposted: false };

  const existing = await db
    .select()
    .from(reposts)
    .where(and(eq(reposts.userId, user.userId), eq(reposts.postId, postId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(reposts)
      .where(
        and(eq(reposts.userId, user.userId), eq(reposts.postId, postId))
      );
    return { reposted: false };
  } else {
    await db.insert(reposts).values({ userId: user.userId, postId });
    return { reposted: true };
  }
}

export async function recordView(postId: string) {
  const user = await getCurrentUser();
  await db.insert(postViews).values({
    postId,
    viewerId: user?.userId || null,
  });
  await db
    .update(posts)
    .set({ viewCount: sql`${posts.viewCount} + 1` })
    .where(eq(posts.id, postId));
}

export async function getPostWithEngagement(postId: string) {
  const user = await getCurrentUser();

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) return null;

  const [author] = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, post.authorId));

  const [likeCount] = await db
    .select({ count: count() })
    .from(likes)
    .where(eq(likes.postId, postId));

  const [saveCount] = await db
    .select({ count: count() })
    .from(saves)
    .where(eq(saves.postId, postId));

  const [repostCount] = await db
    .select({ count: count() })
    .from(reposts)
    .where(eq(reposts.postId, postId));

  let userLiked = false;
  let userSaved = false;
  let userReposted = false;

  if (user) {
    const [liked] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, user.userId), eq(likes.postId, postId)))
      .limit(1);
    userLiked = !!liked;

    const [saved] = await db
      .select()
      .from(saves)
      .where(and(eq(saves.userId, user.userId), eq(saves.postId, postId)))
      .limit(1);
    userSaved = !!saved;

    const [reposted] = await db
      .select()
      .from(reposts)
      .where(
        and(eq(reposts.userId, user.userId), eq(reposts.postId, postId))
      )
      .limit(1);
    userReposted = !!reposted;
  }

  return {
    ...post,
    author,
    likeCount: likeCount.count,
    saveCount: saveCount.count,
    repostCount: repostCount.count,
    userLiked,
    userSaved,
    userReposted,
  };
}

export async function getRankedFeed(offset: number) {
  return await getRankedPosts(10, offset);
}
