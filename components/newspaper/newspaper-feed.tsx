"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { getRankedFeed } from "@/app/actions/posts";
import type { RankedPost } from "@/lib/feed/ranking";
import { PretextArticle } from "./pretext-article";
import { prepare, layout } from "@chenglou/pretext";

// Configuration for the broadsheet grid
const ROW_HEIGHT = 5; // 5px row slices for fine-grained packing
const GAP_PX = 40; // 2.5rem
const COL_COUNT = 12;

function stripHtml(html: string) {
  if (typeof window === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

// Helper component for each article to auto-correct its height perfectly.
function FeedArticle({ post }: { post: any }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [actualRowSpan, setActualRowSpan] = useState<number>(post.rowSpan);

  useEffect(() => {
    if (!innerRef.current) return;
    
    // Auto-correct height mismatch between Pretext and DOM
    const obs = new ResizeObserver((entries) => {
      const innerRect = entries[0].target.getBoundingClientRect();
      
      // innerRect measures the raw content. We MUST add the <article> padding (16px), margin (8px),
      // border (1px), and a small safety gap (15px) so they don't overlap vertically!
      const verticalOverhead = 40; 
      const idealHeight = innerRect.height + verticalOverhead; 
      const computedSpan = Math.ceil(idealHeight / ROW_HEIGHT);
      
      // Update only if difference is significant (to prevent 1px jitter loops)
      if (Math.abs(computedSpan - actualRowSpan) > 2) {
        setActualRowSpan(computedSpan);
      }
    });

    obs.observe(innerRef.current);
    return () => obs.disconnect();
  }, [actualRowSpan]);

  return (
    <article 
      className="animate-fade-in"
      style={{ 
        gridColumn: `span ${post.colSpan}`,
        gridRow: `span ${actualRowSpan}`,
        borderBottom: "1px solid var(--border-color)",
        paddingBottom: "1rem",
        marginBottom: "0.5rem",
        alignSelf: "start" // Prevents the article from stretching to fill a gap!
      }}
    >
      <div ref={innerRef} style={{ display: "flex", flexDirection: "column" }}>
        {post.coverImageUrl && (
          <div style={{ marginBottom: "1rem", height: post.imageHeight, overflow: "hidden" }}>
            <Link href={`/post/${post.id}`}>
              <img 
                src={post.coverImageUrl} 
                alt={post.title} 
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  display: "block",
                  filter: "grayscale(20%) contrast(1.05)", 
                  objectFit: "cover"
                }} 
              />
            </Link>
          </div>
        )}
        
        <div style={{ flex: 1 }}>
          <Link href={`/post/${post.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <h2 
              style={{ 
                fontFamily: "var(--font-heading)", 
                fontSize: post.colSpan > 4 ? "2rem" : "1.5rem", 
                fontWeight: 800, 
                lineHeight: 1.1,
                marginBottom: "0.75rem",
                letterSpacing: "-0.02em"
              }}
            >
              {post.title}
            </h2>
          </Link>

          <PretextArticle content={post.content} columnCount={post.textColumns} />
        </div>
      </div>
    </article>
  );
}

export function NewspaperFeed({ initialPosts }: { initialPosts: RankedPost[] }) {
  const [posts, setPosts] = useState<RankedPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= 10);
  const [feedWidth, setFeedWidth] = useState(1280); 
  const observerTarget = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      setFeedWidth(entries[0].contentRect.width);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const morePosts = await getRankedFeed(posts.length);
      if (morePosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((p) => [...p, ...morePosts]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, posts.length]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) loadMore();
      }, { rootMargin: "200px" }
    );

    observer.observe(target);
    return () => observer.unobserve(target);
  }, [loadMore]);

  const [postsWithMetrics, setPostsWithMetrics] = useState<(RankedPost & { colSpan: number, rowSpan: number, textColumns: number, imageHeight: number, gap?: number })[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || feedWidth <= 0) return;

    try {
      const isMobile = feedWidth < 640;
      const isTablet = feedWidth >= 640 && feedWidth < 1024;
      const responsiveGap = isMobile ? 12 : 40; // Narrower gaps on mobile to prevent overflow

      const metrics = posts.map((post, i) => {
        const contentLength = post.content.length;
        const hasImage = !!post.coverImageUrl;
        
        let colSpan = 4;
        if (isMobile) {
          colSpan = 12; // Full width on mobile
        } else if (isTablet) {
          if (i === 0) colSpan = 12; // Lead story full width
          else colSpan = 6; // 2 per row
        } else {
          // Desktop
          if (i === 0 && contentLength > 300) colSpan = 8;
          else if (contentLength > 1000) colSpan = 6;
          else if (contentLength < 200 && !hasImage) colSpan = 3;
        }
        
        const textColumns = isMobile ? 1 : (colSpan > 4 ? 2 : 1);
        
        const totalGapsWidth = responsiveGap * (COL_COUNT - 1);
        const singleColWidth = Math.max(1, (feedWidth - totalGapsWidth) / COL_COUNT);
        const totalArticleWidth = Math.max(100, (singleColWidth * colSpan) + (responsiveGap * (colSpan - 1)));
        const textColWidth = Math.max(100, (totalArticleWidth - (textColumns > 1 ? responsiveGap : 0)) / textColumns);

        const titleFont = `800 24px "Playfair Display"`; 
        const bodyFont = `400 17px "Inter"`;
        const bodyLineHeight = 27.2; 
        const titleLineHeight = 30;
        
        const preparedTitle = prepare(post.title, titleFont, { whiteSpace: "pre-wrap" });
        const titleHeight = layout(preparedTitle, totalArticleWidth, titleLineHeight).height;

        const plainTextBody = stripHtml(post.content);
        const preparedBody = prepare(plainTextBody, bodyFont, { whiteSpace: "pre-wrap" });
        const bodyHeight = layout(preparedBody, textColWidth, bodyLineHeight).height / textColumns;

        const imgRatio = isMobile ? 0.5625 : (colSpan > 8 ? 0.5 : 0.65); // 16:9 on mobile
        const imageHeight = hasImage ? (totalArticleWidth * imgRatio) : 0; 
        const extraHeight = 50; 

        const totalHeightPx = titleHeight + bodyHeight + imageHeight + extraHeight;
        const rowSpan = Math.min(1500, Math.ceil(totalHeightPx / ROW_HEIGHT));

        return {
          ...post,
          colSpan,
          rowSpan,
          textColumns,
          imageHeight: Math.floor(imageHeight),
          gap: responsiveGap
        };
      });

      setPostsWithMetrics(metrics);
    } catch (err) {
      console.error("Layout math failed:", err);
    }
  }, [posts, feedWidth]);

  return (
    <div ref={containerRef} style={{ width: "100%", margin: "0", padding: feedWidth < 640 ? "0 1rem" : "0 2rem" }}>
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: `repeat(${COL_COUNT}, 1fr)`, 
          gridAutoRows: `${ROW_HEIGHT}px`,
          gridAutoFlow: "dense",
          columnGap: `${postsWithMetrics[0]?.gap || 40}px`,
          rowGap: "0px",
          alignItems: "stretch" 
        }}
      >
        {postsWithMetrics.map((post) => (
          <FeedArticle key={post.id} post={post} />
        ))}
      </div>

      <div ref={observerTarget} style={{ gridColumn: "span 12", height: "100px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        {loading && <div style={{ fontFamily: "var(--font-newspaper)", fontSize: "1.2rem", fontStyle: "italic" }}>Printing more pages...</div>}
        {!hasMore && posts.length > 0 && <div style={{ fontFamily: "var(--font-newspaper)", fontSize: "1.2rem", fontStyle: "italic", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "0.5rem 0", width: "100%", textAlign: "center" }}>End of Edition</div>}
      </div>
    </div>
  );
}
