import Link from "next/link";
import type { RankedPost } from "@/lib/feed/ranking";
import { Eye, Heart, Repeat2 } from "lucide-react";
import { timeAgo, getCategoryClass, stripHtml } from "@/lib/utils";

type CardSize = "hero" | "large" | "medium" | "compact";

interface ArticleCardProps {
  post: RankedPost;
  size?: CardSize;
  showImage?: boolean;
}

export function ArticleCard({
  post,
  size = "medium",
  showImage = true,
}: ArticleCardProps) {
  const hasImage = showImage && post.coverImageUrl;

  if (size === "hero") {
    return (
      <Link href={`/post/${post.id}`} className="article-card-link">
        <article className={`card article-card-hero ${hasImage ? "has-image" : ""}`}>
          {hasImage && (
            <div
              className="article-card-image-hero"
              style={{ backgroundImage: `url(${post.coverImageUrl})` }}
            />
          )}
          <div className="article-card-body-hero">
            <div className="flex items-center gap-3 mb-3">
              <span className={`badge ${getCategoryClass(post.category)}`}>{post.category}</span>
              <span className="text-[0.75rem] text-[var(--text-tertiary)]">
                {timeAgo(post.createdAt)}
              </span>
            </div>
            <h2 className="headline-hero mb-3">
              {post.title}
            </h2>
            <p className="article-card-excerpt !text-[1.0625rem]">
              {stripHtml(post.excerpt || "") || stripHtml(post.content).substring(0, 200)}
            </p>
            <div className="article-card-meta !text-[0.8125rem]">
              <div className="avatar avatar-sm">
                {post.author.avatarUrl ? (
                  <img src={post.author.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  (post.author.displayName || post.author.username)[0].toUpperCase()
                )}
              </div>
              <span className="font-medium">
                {post.author.displayName || post.author.username}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1"><Eye size={14} /> {post.viewCount}</span>
              <span className="flex items-center gap-1"><Heart size={14} /> {post.likeCount}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (size === "large") {
    return (
      <Link href={`/post/${post.id}`} className="article-card-link">
        <article className="card column-break-avoid">
          {hasImage && (
            <div
              className="article-card-image-standard"
              style={{ backgroundImage: `url(${post.coverImageUrl})` }}
            />
          )}
          <div className="article-card-body-standard">
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge ${getCategoryClass(post.category)}`}>{post.category}</span>
              <span className="text-[0.6875rem] text-[var(--text-tertiary)]">
                {timeAgo(post.createdAt)}
              </span>
            </div>
            <h3 className="headline-large mb-2">
              {post.title}
            </h3>
            <p className="article-card-excerpt">
              {stripHtml(post.excerpt || "") || stripHtml(post.content).substring(0, 150)}
            </p>
            <div className="article-card-meta">
              <span className="font-medium">
                {post.author.displayName || post.author.username}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1"><Eye size={14} /> {post.viewCount}</span>
              <span className="flex items-center gap-1"><Heart size={14} /> {post.likeCount}</span>
              <span className="flex items-center gap-1"><Repeat2 size={14} /> {post.repostCount}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (size === "compact") {
    return (
      <Link href={`/post/${post.id}`} className="article-card-link">
        <article className="article-card-compact">
          {hasImage && (
            <div
              className="article-card-image-compact"
              style={{ backgroundImage: `url(${post.coverImageUrl})` }}
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="article-card-title-compact">
              {post.title}
            </h4>
            <div className="text-[0.6875rem] text-[var(--text-tertiary)] flex gap-2">
              <span>{timeAgo(post.createdAt)}</span>
              <span className="flex items-center gap-1"><Eye size={12} /> {post.viewCount}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Default: medium
  return (
    <Link href={`/post/${post.id}`} className="article-card-link">
      <article className="card column-break-avoid">
        {hasImage && (
          <div
            className="article-card-image-standard"
            style={{ backgroundImage: `url(${post.coverImageUrl})` } as React.CSSProperties}
          />
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`badge ${getCategoryClass(post.category)}`}>{post.category}</span>
          </div>
          <h3 className="headline-medium mb-1.5">
            {post.title}
          </h3>
          <p className="article-card-excerpt !mb-2 !-webkit-line-clamp-2 text-[0.875rem] leading-[1.5]">
            {stripHtml(post.excerpt || "") || stripHtml(post.content).substring(0, 120)}
          </p>
          <div className="article-card-meta">
            <span className="font-medium">
              {post.author.displayName || post.author.username}
            </span>
            <span>•</span>
            <span>{timeAgo(post.createdAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

