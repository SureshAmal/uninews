"use server";

import { db } from "@/lib/db";
import { users, follows, posts } from "@/lib/db/schema";
import { getCurrentUser, getSession } from "@/lib/auth/session";
import { eq, and, count, desc } from "drizzle-orm";

export async function toggleFollow(targetUserId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login required", following: false };
  if (user.userId === targetUserId)
    return { error: "Cannot follow yourself", following: false };

  const existing = await db
    .select()
    .from(follows)
    .where(
      and(
        eq(follows.followerId, user.userId),
        eq(follows.followingId, targetUserId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, user.userId),
          eq(follows.followingId, targetUserId)
        )
      );
    return { following: false };
  } else {
    await db
      .insert(follows)
      .values({ followerId: user.userId, followingId: targetUserId });
    return { following: true };
  }
}

export async function getUserProfile(username: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user) return null;

  const [followerCount] = await db
    .select({ count: count() })
    .from(follows)
    .where(eq(follows.followingId, user.id));

  const [followingCount] = await db
    .select({ count: count() })
    .from(follows)
    .where(eq(follows.followerId, user.id));

  const [postCount] = await db
    .select({ count: count() })
    .from(posts)
    .where(eq(posts.authorId, user.id));

  const currentUser = await getCurrentUser();
  let isFollowing = false;
  if (currentUser) {
    const [f] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, currentUser.userId),
          eq(follows.followingId, user.id)
        )
      )
      .limit(1);
    isFollowing = !!f;
  }

  const userPosts = await db
    .select()
    .from(posts)
    .where(and(eq(posts.authorId, user.id), eq(posts.isPublished, true), eq(posts.isDeleted, false)))
    .orderBy(desc(posts.createdAt))
    .limit(20);

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    collegeYears: user.collegeYears,
    registrationNo: user.registrationNo,
    createdAt: user.createdAt,
    followerCount: followerCount.count,
    followingCount: followingCount.count,
    postCount: postCount.count,
    isFollowing,
    posts: userPosts,
  };
}

export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login required" };

  const displayName = formData.get("displayName") as string;
  const bio = formData.get("bio") as string;
  const avatarUrl = formData.get("avatarUrl") as string;

  await db
    .update(users)
    .set({
      displayName: displayName || undefined,
      bio: bio || undefined,
      avatarUrl: avatarUrl || undefined,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.userId));

  // Refresh session so navbar/avatar stay in sync
  const session = await getSession();
  if (displayName) session.displayName = displayName;
  if (avatarUrl) session.avatarUrl = avatarUrl;
  await session.save();

  return { success: true };
}

export async function getFollowers(username: string) {
  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!targetUser) return null;

  const followerRecords = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followerId, users.id))
    .where(eq(follows.followingId, targetUser.id));

  const currentUser = await getCurrentUser();

  // Batch-fetch which of these users the current user follows (1 query instead of N)
  let followingSet = new Set<string>();
  if (currentUser && followerRecords.length > 0) {
    const currentFollows = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, currentUser.userId));
    followingSet = new Set(currentFollows.map((f) => f.followingId));
  }

  return followerRecords.map((u) => ({
    ...u,
    isFollowing: followingSet.has(u.id),
  }));
}

export async function getFollowing(username: string) {
  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!targetUser) return null;

  const followingRecords = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followingId, users.id))
    .where(eq(follows.followerId, targetUser.id));

  const currentUser = await getCurrentUser();

  // Batch-fetch which of these users the current user follows (1 query instead of N)
  let followingSet = new Set<string>();
  if (currentUser && followingRecords.length > 0) {
    const currentFollows = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, currentUser.userId));
    followingSet = new Set(currentFollows.map((f) => f.followingId));
  }

  return followingRecords.map((u) => ({
    ...u,
    isFollowing: followingSet.has(u.id),
  }));
}

