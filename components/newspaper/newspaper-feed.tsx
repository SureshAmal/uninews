"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { deletePost, getRankedFeed } from "@/app/actions/posts";
import type { RankedPost } from "@/lib/feed/ranking";
import { PretextArticle, computePretextLayout } from "./pretext-article";
import { prepare, layout } from "@chenglou/pretext";
import { stripHtml } from "@/lib/utils";
import { Trash2, Edit2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

// Configuration for the broadsheet grid
const ROW_HEIGHT = 5; // 5px row slices for fine-grained packing
const GAP_PX = 40; // 2.5rem
const COL_COUNT = 12;

// Helper component for each article to auto-correct its height perfectly.
function FeedArticle({ post, currentUser }: { post: any, currentUser: any }) {
  const innerRef = useRef<HTMLDivElement>(null);
  // Just use post.rowSpan exactly to avoid jitter and ensure tight dense packing
  const actualRowSpan = post.rowSpan;
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const confirmDelete = async () => {
    setIsDeleting(true);
    await deletePost(post.id);
    setIsDeleting(false);
  };

  const isAuthor = currentUser && currentUser.userId === post.author?.id;
  const isAdmin = currentUser?.isAdmin;

  return (
    <article 
      className="feed-article animate-fade-in"
      style={{ 
        gridColumn: `span ${post.colSpan}`,
        gridRow: `span ${actualRowSpan}`,
        opacity: isDeleting ? 0.5 : 1,
        pointerEvents: isDeleting ? "none" : "auto"
      }}
    >
      {/* Premium Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={isAdmin ? "Wipe Edition?" : "Archive Edition?"}
        message={isAdmin 
            ? "As an admin, you are permanently deleting this data from the database. This cannot be undone." 
            : "Are you sure you want to archive this edition? It will be hidden from the feed and your profile."}
        confirmText={isAdmin ? "Hard Delete" : "Archive Edition"}
      />

      <div ref={innerRef} className="flex flex-col">
        {post.coverImageUrl && (
          <div className="feed-image-container" style={{ height: post.imageHeight }}>
            <Link href={`/post/${post.id}`}>
              <img 
                src={post.coverImageUrl} 
                alt={post.title} 
                className="feed-image"
              />
            </Link>
          </div>
        )}
        
        <div className="flex-1">
          <Link href={`/post/${post.id}`} className="no-underline text-inherit">
            <h2 
              className="feed-headline"
              style={{ fontSize: post.colSpan > 4 ? "2rem" : "1.5rem" }}
            >
              {post.title}
            </h2>
          </Link>

          <PretextArticle content={post.content} columnCount={post.textColumns} />

          {post.tags && post.tags.length > 0 && (
            <div className="feed-tags-container">
              {post.tags.slice(0, 3).map((tag: string) => (
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
        </div>
      </div>
    </article>
  );
}

export function NewspaperFeed({ initialPosts, currentUser, tagFilter }: { initialPosts: RankedPost[], currentUser: any, tagFilter?: string }) {
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
      const morePosts = await getRankedFeed(posts.length, tagFilter);
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
      const responsiveGap = isMobile ? 12 : 40; 

      // Greedy row balancing algorithm
      const metrics: (RankedPost & { colSpan: number, rowSpan: number, textColumns: number, imageHeight: number, gap?: number })[] = [];
      let currentRow: number[] = [];
      let currentSum = 0;

      const processRow = (indices: number[], isLastRow: boolean) => {
        let remaining = 12 - currentSum;
        
        // Distribution: Add remaining columns to the most "important" (longest) post or last post
        if (remaining > 0 && !isMobile) {
            const lastIdx = indices[indices.length - 1];
            // Just give it to the last one for a clean right edge
            // Or if it's the only one, it takes all 12
            const target = metrics.find((_, i) => indices.includes(i) && metrics[i].id === posts[lastIdx].id);
            // Wait, metrics isn't fully populated yet. Let's do this in a post-process or within the loop.
        }
      };

      // Refined loop: Calculate spans AND balance rows
      const postsToProcess = [...posts];
      let i = 0;
      while (i < postsToProcess.length) {
        const post = postsToProcess[i];
        const contentLength = post.content.length;
        const hasImage = !!post.coverImageUrl;
        
        let colSpan = 4;
        if (isMobile) colSpan = 12;
        else if (isTablet) colSpan = (i === 0) ? 12 : 6;
        else {
            if (i === 0 && contentLength > 300) colSpan = 8;
            else if (contentLength > 1000) colSpan = 6;
            else if (contentLength < 300 && !hasImage) colSpan = 3;
            else colSpan = 4;
        }

        // Row completion logic
        if (!isMobile && currentSum + colSpan > 12) {
            // This post starts a new row. Balance the PREVIOUS row.
            const remainder = 12 - currentSum;
            if (remainder > 0 && currentRow.length > 0) {
                const lastProcessedIdx = metrics.length - 1;
                metrics[lastProcessedIdx].colSpan += remainder;
            }
            currentSum = 0;
            currentRow = [];
        }

        const textColumns = isMobile ? 1 : (colSpan > 4 ? 2 : 1);
        const totalGapsWidth = responsiveGap * (COL_COUNT - 1);
        const singleColWidth = Math.max(1, (feedWidth - totalGapsWidth) / COL_COUNT);
        
        // Use a "deferred" height calculation that we'll update in FeedArticle's ResizeObserver
        // but provide a good static estimate here for Pretext.
        const estHeight = 400; 

        metrics.push({
          ...post,
          colSpan,
          rowSpan: Math.ceil(estHeight / ROW_HEIGHT),
          textColumns,
          imageHeight: 0, // Calculated in component based on final colSpan
          gap: responsiveGap
        });

        currentSum += colSpan;
        currentRow.push(i);
        
        // If it's 12, row is perfect.
        if (currentSum >= 12) {
            currentSum = 0;
            currentRow = [];
        }
        
        i++;
      }

      // Final row cleanup
      if (currentSum > 0 && currentSum < 12 && !isMobile) {
          metrics[metrics.length - 1].colSpan += (12 - currentSum);
      }

      // Second pass: Finalize heights and column counts now that colSpans are balanced
      const finalizedMetrics = metrics.map((m) => {
        const hasImage = !!m.coverImageUrl;
        // High-fidelity newspaper column math: roughly 3 grid columns per 1 text column
        const textColumns = isMobile ? 1 : 
                           m.colSpan >= 12 ? 4 : 
                           m.colSpan >= 8 ? 3 : 
                           m.colSpan >= 6 ? 2 : 1;
        
        const totalGapsWidth = responsiveGap * (COL_COUNT - 1);
        const singleColWidth = Math.max(1, (feedWidth - totalGapsWidth) / COL_COUNT);
        const totalArticleWidth = Math.max(100, (singleColWidth * m.colSpan) + (responsiveGap * (m.colSpan - 1)));
        const textColWidth = Math.max(100, (totalArticleWidth - (textColumns > 1 ? (m.gap || 40) : 0)) / textColumns);

        const titleFont = `800 24px "Playfair Display"`; 
        const bodyFont = `400 17px "Inter"`;
        const bodyLineHeight = 27.2; 
        const titleLineHeight = 30;
        
        const preparedTitle = prepare(m.title, titleFont, { whiteSpace: "pre-wrap" });
        const titleHeight = layout(preparedTitle, totalArticleWidth, titleLineHeight).height;

        const imgRatio = isMobile ? 0.5625 : (m.colSpan >= 12 ? 0.35 : m.colSpan > 8 ? 0.45 : 0.65);
        let imageHeight = hasImage ? (totalArticleWidth * imgRatio) : 0; 
        
        // Cap image height to prevent dominance on ultra-wide screens
        if (!isMobile && imageHeight > 500) imageHeight = 500;
        
        // Use PRETEXT natively exact calculation !!!
        const exactLayout = computePretextLayout(m.content, totalArticleWidth, textColumns);
        const bodyHeight = exactLayout ? exactLayout.maxHeight : 0;
        
        const extraHeight = 120; // Overheads: paddings, margins, gaps

        const totalHeightPx = titleHeight + bodyHeight + imageHeight + extraHeight;
        const rowSpan = Math.min(1500, Math.ceil(totalHeightPx / ROW_HEIGHT));

        return {
          ...m,
          textColumns,
          imageHeight: Math.floor(imageHeight),
          rowSpan
        };
      });

      setPostsWithMetrics(finalizedMetrics);
    } catch (err) {
      console.error("Layout math failed:", err);
    }
  }, [posts, feedWidth]);

  return (
    <div ref={containerRef} className={`w-full m-0 ${feedWidth < 640 ? "px-4" : "px-8"}`}>
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
          <FeedArticle key={post.id} post={post} currentUser={currentUser} />
        ))}
      </div>

      <div ref={observerTarget} className="span-12 h-[100px] flex justify-center items-center">
        {loading && <div className="font-newspaper text-[1.2rem] italic">Printing more pages...</div>}
        {!hasMore && posts.length > 0 && (
          <div className="font-newspaper text-[1.2rem] italic border-y border-divider py-2 w-full text-center">
            End of Edition
          </div>
        )}
      </div>
    </div>
  );
}
