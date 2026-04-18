import Link from "next/link";
import type { RankedPost } from "@/lib/feed/ranking";
import { Eye, Heart, Repeat2 } from "lucide-react";

type CardSize = "hero" | "large" | "medium" | "compact";

interface ArticleCardProps {
  post: RankedPost;
  size?: CardSize;
  showImage?: boolean;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getCategoryClass(category: string): string {
  const map: Record<string, string> = {
    campus: "badge-campus",
    academic: "badge-academic",
    sports: "badge-sports",
    events: "badge-events",
    opinion: "badge-opinion",
    clubs: "badge-clubs",
  };
  return map[category] || "";
}

export function ArticleCard({
  post,
  size = "medium",
  showImage = true,
}: ArticleCardProps) {
  const hasImage = showImage && post.coverImageUrl;

  if (size === "hero") {
    return (
      <Link
        href={`/post/${post.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <article
          className="card"
          style={{
            display: "grid",
            gridTemplateColumns: hasImage ? "1fr 1fr" : "1fr",
            gap: 0,
            overflow: "hidden",
          }}
        >
          {hasImage && (
            <div
              style={{
                aspectRatio: "16/10",
                background: `url(${post.coverImageUrl}) center/cover`,
                minHeight: 300,
              }}
            />
          )}
          <div
            style={{
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span className={`badge ${getCategoryClass(post.category)}`}>{post.category}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                {timeAgo(post.createdAt)}
              </span>
            </div>
            <h2 className="headline-hero" style={{ marginBottom: "0.75rem" }}>
              {post.title}
            </h2>
            <p
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                marginBottom: "1rem",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {post.excerpt || post.content.substring(0, 200)}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontSize: "0.8125rem",
                color: "var(--text-tertiary)",
              }}
            >
              <div className="avatar avatar-sm">
                {post.author.avatarUrl ? (
                  <img src={post.author.avatarUrl} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  (post.author.displayName || post.author.username)[0].toUpperCase()
                )}
              </div>
              <span style={{ fontWeight: 500 }}>
                {post.author.displayName || post.author.username}
              </span>
              <span>•</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Eye size={14} /> {post.viewCount}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Heart size={14} /> {post.likeCount}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (size === "large") {
    return (
      <Link
        href={`/post/${post.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <article className="card column-break-avoid">
          {hasImage && (
            <div
              style={{
                aspectRatio: "16/9",
                background: `url(${post.coverImageUrl}) center/cover`,
              }}
            />
          )}
          <div style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span className={`badge ${getCategoryClass(post.category)}`}>{post.category}</span>
              <span style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)" }}>
                {timeAgo(post.createdAt)}
              </span>
            </div>
            <h3 className="headline-large" style={{ marginBottom: "0.5rem" }}>
              {post.title}
            </h3>
            <p
              style={{
                fontSize: "0.9375rem",
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                marginBottom: "0.75rem",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {post.excerpt || post.content.substring(0, 150)}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.75rem",
                color: "var(--text-tertiary)",
              }}
            >
              <span style={{ fontWeight: 500 }}>
                {post.author.displayName || post.author.username}
              </span>
              <span>•</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Eye size={14} /> {post.viewCount}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Heart size={14} /> {post.likeCount}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Repeat2 size={14} /> {post.repostCount}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (size === "compact") {
    return (
      <Link
        href={`/post/${post.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <article
          style={{
            display: "flex",
            gap: "0.75rem",
            padding: "0.75rem 0",
            borderBottom: "1px solid var(--border-light)",
            transition: "background 0.2s",
          }}
        >
          {hasImage && (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "var(--radius-sm)",
                background: `url(${post.coverImageUrl}) center/cover`,
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                fontFamily: "var(--font-heading)",
                lineHeight: 1.3,
                marginBottom: "0.25rem",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {post.title}
            </h4>
            <div
              style={{
                fontSize: "0.6875rem",
                color: "var(--text-tertiary)",
                display: "flex",
                gap: "0.5rem",
              }}
            >
              <span>{timeAgo(post.createdAt)}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Eye size={12} /> {post.viewCount}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Default: medium
  return (
    <Link
      href={`/post/${post.id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <article className="card column-break-avoid">
        {hasImage && (
          <div
            style={{
              aspectRatio: "16/9",
              background: `url(${post.coverImageUrl}) center/cover`,
            }}
          />
        )}
        <div style={{ padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
            <span className={`badge ${getCategoryClass(post.category)}`}>{post.category}</span>
          </div>
          <h3 className="headline-medium" style={{ marginBottom: "0.375rem" }}>
            {post.title}
          </h3>
          <p
            style={{
              fontSize: "0.875rem",
              lineHeight: 1.5,
              color: "var(--text-secondary)",
              marginBottom: "0.5rem",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.excerpt || post.content.substring(0, 120)}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.75rem",
              color: "var(--text-tertiary)",
            }}
          >
            <span style={{ fontWeight: 500 }}>
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
