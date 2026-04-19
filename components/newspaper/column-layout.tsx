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
      <div className="newspaper-empty-state">
        <div className="mb-4">
          <Newspaper size={48} className="mx-auto" />
        </div>
        <h3 className="headline-small mb-2 text-secondary">
          No news yet
        </h3>
        <p className="text-secondary text-sm">
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
      className={mounted ? "animate-fade-in opacity-100" : "opacity-0"}
    >
      {/* Hero Article */}
      {heroPosts.length > 0 && (
        <div className="mb-6">
          <ArticleCard post={heroPosts[0]} size="hero" />
        </div>
      )}

      {/* Main Grid: Articles + Sidebar */}
      <div className="newspaper-grid">
        {/* Left column */}
        <div className="stagger-children flex flex-col gap-6">
          {mainPosts
            .filter((_, i) => i % 2 === 0)
            .map((post) => (
              <div key={post.id}>
                <ArticleCard post={post} size="large" />
              </div>
            ))}
        </div>

        {/* Middle column */}
        <div className="stagger-children flex flex-col gap-6">
          {mainPosts
            .filter((_, i) => i % 2 === 1)
            .map((post) => (
              <div key={post.id}>
                <ArticleCard post={post} size="medium" />
              </div>
            ))}
        </div>

        {/* Sidebar: Trending */}
        <aside className="newspaper-sidebar">
          <div className="section-divider mt-0">
            Trending
          </div>
          {sidebarPosts.length > 0 ? (
            sidebarPosts.slice(0, 8).map((post, i) => (
              <div key={post.id} className="flex gap-3 mb-6 last:mb-0">
                <span className="newspaper-trending-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <ArticleCard post={post} size="compact" showImage={false} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-[0.8125rem] text-tertiary py-4">
              More stories coming soon...
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
