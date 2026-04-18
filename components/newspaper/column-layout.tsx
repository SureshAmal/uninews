"use client";

import { useEffect, useRef, useState } from "react";
import type { RankedPost } from "@/lib/feed/ranking";
import { ArticleCard } from "./article-card";
import { Newspaper } from "lucide-react";

interface ColumnLayoutProps {
  posts: RankedPost[];
}

export function ColumnLayout({ posts }: ColumnLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (posts.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "4rem 2rem",
          color: "var(--text-tertiary)",
        }}
      >
        <div
          style={{
            fontSize: "3rem",
            marginBottom: "1rem",
          }}
        >
          <Newspaper size={48} style={{ margin: "0 auto" }} />
        </div>
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.5rem",
            fontWeight: 600,
            marginBottom: "0.5rem",
            color: "var(--text-secondary)",
          }}
        >
          No news yet
        </h3>
        <p style={{ fontSize: "0.9375rem" }}>
          Be the first to post a story! Log in and share what&apos;s happening on campus.
        </p>
      </div>
    );
  }

  // Split posts: first is hero, rest distributed into columns
  const heroPosts = posts.slice(0, 1);
  const mainPosts = posts.slice(1, 7);
  const sidebarPosts = posts.slice(7);

  return (
    <div
      ref={containerRef}
      className={mounted ? "animate-fade-in" : ""}
      style={{ opacity: mounted ? 1 : 0 }}
    >
      {/* Hero Article */}
      {heroPosts.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <ArticleCard post={heroPosts[0]} size="hero" />
        </div>
      )}

      {/* Main Grid: Articles + Sidebar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 320px",
          gap: "1.5rem",
          alignItems: "start",
        }}
        className="main-grid"
      >
        {/* Left column */}
        <div className="stagger-children">
          {mainPosts
            .filter((_, i) => i % 2 === 0)
            .map((post) => (
              <div key={post.id} style={{ marginBottom: "1.5rem" }}>
                <ArticleCard post={post} size="large" />
              </div>
            ))}
        </div>

        {/* Middle column */}
        <div className="stagger-children">
          {mainPosts
            .filter((_, i) => i % 2 === 1)
            .map((post) => (
              <div key={post.id} style={{ marginBottom: "1.5rem" }}>
                <ArticleCard post={post} size="medium" />
              </div>
            ))}
        </div>

        {/* Sidebar: Trending */}
        <aside
          style={{
            borderLeft: "1px solid var(--divider)",
            paddingLeft: "1.5rem",
          }}
          className="news-sidebar"
        >
          <div className="section-divider" style={{ marginTop: 0 }}>
            Trending
          </div>
          {sidebarPosts.length > 0 ? (
            sidebarPosts.slice(0, 8).map((post, i) => (
              <div key={post.id} style={{ display: "flex", gap: "0.75rem" }}>
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "var(--border-color)",
                    lineHeight: 1,
                    minWidth: 28,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div style={{ flex: 1 }}>
                  <ArticleCard post={post} size="compact" showImage={false} />
                </div>
              </div>
            ))
          ) : (
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-tertiary)",
                padding: "1rem 0",
              }}
            >
              More stories coming soon...
            </p>
          )}
        </aside>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .main-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .news-sidebar {
            grid-column: 1 / -1;
            border-left: none !important;
            padding-left: 0 !important;
            border-top: 1px solid var(--divider);
            padding-top: 1.5rem;
          }
        }
        @media (max-width: 640px) {
          .main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
