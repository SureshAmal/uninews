import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostWithEngagement, recordView } from "@/app/actions/posts";
import { getPostReviews } from "@/app/actions/reviews";
import { getComments } from "@/app/actions/comments";
import { getCurrentUser } from "@/lib/auth/session";
import { EngagementBar } from "@/components/post/engagement-bar";
import { ReviewInteraction } from "@/components/post/review-interaction";
import { ReviewSection } from "@/components/post/review-section";
import { CommentSection } from "@/components/post/comment-section";
import { Pencil } from "lucide-react";
import { PostActions } from "@/components/post/post-actions";
import { BackButton } from "@/components/layout/back-button";
import { getCategoryClass } from "@/lib/utils";
import { PretextArticle } from "@/components/newspaper/pretext-article";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostWithEngagement(id);
  if (!post) notFound();

  const user = await getCurrentUser();
  const reviewData = await getPostReviews(id);
  const commentsData = await getComments(id);

  // Record view
  await recordView(id);

  const isAuthor = user?.userId === post.author.id;
  const isAdmin = user?.isAdmin || false;
  const publishDate = post.createdAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container-news" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <BackButton />
      <article
        className="animate-fade-in"
        style={{ maxWidth: 740, margin: "0 auto" }}
      >
        {/* Category + Date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <span className={`badge ${getCategoryClass(post.category)}`}>
            {post.category}
          </span>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
            {publishDate}
          </span>
          {post.editedAt && (
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-tertiary)",
                fontStyle: "italic",
              }}
            >
              (edited)
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          className="headline-hero"
          style={{ marginBottom: "1.25rem" }}
        >
          {post.title}
        </h1>

        {/* Author Info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid var(--border-light)",
          }}
        >
          <Link
            href={`/profile/${post.author.username}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div className="avatar avatar-lg">
              {post.author.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                (post.author.displayName || post.author.username)[0].toUpperCase()
              )}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>
                {post.author.displayName || post.author.username}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
                @{post.author.username}
              </div>
            </div>
          </Link>

          {isAuthor && (
            <PostActions postId={id} isAuthor={isAuthor} isAdmin={isAdmin} />
          )}
        </div>



        {/* Cover Image */}
        {post.coverImageUrl && (
          <div
            style={{
              marginBottom: "2rem",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            <img
              src={post.coverImageUrl}
              alt={post.title}
              style={{
                width: "100%",
                maxHeight: 500,
                objectFit: "cover",
              }}
            />
          </div>
        )}

        {/* Media Gallery */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                post.mediaUrls.length === 1
                  ? "1fr"
                  : "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "0.75rem",
              marginBottom: "2rem",
            }}
          >
            {post.mediaUrls.map((media, i) =>
              media.type === "video" ? (
                <video
                  key={i}
                  src={media.url}
                  controls
                  style={{
                    width: "100%",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-tertiary)",
                  }}
                />
              ) : (
                <img
                  key={i}
                  src={media.url}
                  alt={`Media ${i + 1}`}
                  style={{
                    width: "100%",
                    borderRadius: "var(--radius-md)",
                    objectFit: "cover",
                  }}
                />
              )
            )}
          </div>
        )}

        {/* Content - Single Column reading view (matches editor) */}
        <div style={{ marginTop: "2rem" }}>
          <PretextArticle content={post.content} columnCount={1} />
        </div>

        {post.tags && post.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginTop: "2rem",
            }}
          >
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${tag}`}
                style={{
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.75rem",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 100,
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  transition: "all 0.2s ease"
                }}
                className="tag-pill-hover"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Engagement */}
        <div style={{ marginTop: "2rem" }}>
          <EngagementBar
            postId={id}
            likeCount={post.likeCount}
            saveCount={post.saveCount}
            repostCount={post.repostCount}
            viewCount={post.viewCount}
            userLiked={post.userLiked}
            userSaved={post.userSaved}
            userReposted={post.userReposted}
            isLoggedIn={!!user}
          />
        </div>

        {/* Reviews Aggregate List Footer (Optionally simplified) */}
        {/* <ReviewSection
          postId={id}
          avgRating={reviewData.avgRating}
          reviewCount={reviewData.reviewCount}
          isLoggedIn={!!user}
        /> */}
        {/* Review Summary (New Top Placement) */}
        {/* <ReviewInteraction
          postId={id}
          postTitle={post.title}
          avgRating={reviewData.avgRating}
          reviewCount={reviewData.reviewCount}
          isLoggedIn={!!user}
        /> */}

        {/* Comments */}
        <CommentSection
          postId={id}
          initialComments={commentsData}
          isLoggedIn={!!user}
          currentUserId={user?.userId}
        />

      </article>
    </div>
  );
}
