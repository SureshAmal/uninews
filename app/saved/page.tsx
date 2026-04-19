import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { saves, posts, users, likes } from "@/lib/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { ArticleCard } from "@/components/newspaper/article-card";
import { BackButton } from "@/components/layout/back-button";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import type { RankedPost } from "@/lib/feed/ranking";

export default async function SavedPostsPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div
        className="container-news animate-fade-in"
        style={{ paddingTop: "2rem", paddingBottom: "4rem", textAlign: "center" }}
      >
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          Saved Posts
        </h1>
        <p style={{ color: "var(--text-tertiary)", marginBottom: "1.5rem" }}>
          Log in to view your saved posts.
        </p>
        <Link href="/login" className="btn btn-primary">
          Log in
        </Link>
      </div>
    );
  }

  // Fetch saved posts with author info
  const likeCountSq = sql<number>`(SELECT count(*) FROM ${likes} WHERE ${likes.postId} = ${posts.id})`;

  const savedPosts = await db
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
    })
    .from(saves)
    .innerJoin(posts, eq(saves.postId, posts.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(saves.userId, user.userId))
    .orderBy(desc(saves.createdAt));

  const displayPosts: RankedPost[] = savedPosts.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    excerpt: p.excerpt,
    coverImageUrl: p.coverImageUrl,
    mediaUrls: p.mediaUrls,
    category: p.category,
    tags: p.tags,
    viewCount: p.viewCount,
    createdAt: p.createdAt,
    editedAt: p.editedAt,
    author: {
      id: p.authorId,
      username: p.authorUsername,
      displayName: p.authorDisplayName,
      avatarUrl: p.authorAvatarUrl,
    },
    likeCount: Number(p.likeCount) || 0,
    saveCount: 0,
    repostCount: 0,
    score: 0,
  }));

  return (
    <div
      className="container-news animate-fade-in"
      style={{ paddingTop: "2rem", paddingBottom: "4rem" }}
    >
      <BackButton />
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
        }}
      >
        <Bookmark
          size={24}
          style={{ display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }}
        />
        Saved Posts
      </h1>
      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--text-tertiary)",
          marginBottom: "2rem",
        }}
      >
        Posts you&apos;ve bookmarked for later
      </p>

      {displayPosts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            color: "var(--text-tertiary)",
          }}
        >
          <div
            style={{
              marginBottom: "1rem",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Bookmark size={48} />
          </div>
          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
              color: "var(--text-secondary)",
            }}
          >
            No saved posts yet
          </h3>
          <p style={{ fontSize: "0.875rem" }}>
            Bookmark posts while reading to find them here later.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
          className="stagger-children"
        >
          {displayPosts.map((post) => (
            <ArticleCard key={post.id} post={post} size="medium" />
          ))}
        </div>
      )}
    </div>
  );
}
