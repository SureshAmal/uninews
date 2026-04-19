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
    <div className="container-news pt-8 pb-16">
      <BackButton />
      <article className="animate-fade-in max-w-[740px] mx-auto">
        {/* Category + Date */}
        <div className="flex items-center gap-3 mb-4">
          <span className={`badge ${getCategoryClass(post.category)}`}>
            {post.category}
          </span>
          <span className="text-[0.8125rem] text-tertiary">
            {publishDate}
          </span>
          {post.editedAt && (
            <span className="text-[0.75rem] text-tertiary italic">
              (edited)
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="headline-hero mb-5">
          {post.title}
        </h1>

        {/* Author Info */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-divider">
          <Link
            href={`/profile/${post.author.username}`}
            className="flex items-center gap-3 no-underline text-inherit"
          >
            <div className="avatar avatar-lg">
              {post.author.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (post.author.displayName || post.author.username)[0].toUpperCase()
              )}
            </div>
            <div>
              <div className="font-semibold">
                {post.author.displayName || post.author.username}
              </div>
              <div className="text-[0.8125rem] text-tertiary">
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
          <div className="mb-8 rounded-md overflow-hidden">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Media Gallery */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div
            className={`grid gap-3 mb-8 ${
              post.mediaUrls.length === 1 ? "grid-cols-1" : "grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
            }`}
          >
            {post.mediaUrls.map((media, i) =>
              media.type === "video" ? (
                <video
                  key={i}
                  src={media.url}
                  controls
                  className="w-full rounded-md bg-bg-tertiary"
                />
              ) : (
                <img
                  key={i}
                  src={media.url}
                  alt={`Media ${i + 1}`}
                  className="w-full rounded-md object-cover"
                />
              )
            )}
          </div>
        )}

        {/* Content - Single Column reading view (matches editor) */}
        <div className="mt-8">
          <PretextArticle content={post.content} columnCount={1} />
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${tag}`}
                className="feed-tag-pill tag-pill-hover"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Engagement */}
        <div className="mt-8">
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
