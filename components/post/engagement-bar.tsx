"use client";

import { useState, useTransition } from "react";
import { toggleLike, toggleSave, toggleRepost } from "@/app/actions/posts";
import { Heart, Repeat2, Bookmark, Eye } from "lucide-react";

interface EngagementBarProps {
  postId: string;
  likeCount: number;
  saveCount: number;
  repostCount: number;
  viewCount: number;
  userLiked: boolean;
  userSaved: boolean;
  userReposted: boolean;
  isLoggedIn: boolean;
}

export function EngagementBar({
  postId,
  likeCount: initialLikes,
  saveCount: initialSaves,
  repostCount: initialReposts,
  viewCount,
  userLiked: initialLiked,
  userSaved: initialSaved,
  userReposted: initialReposted,
  isLoggedIn,
}: EngagementBarProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [reposted, setReposted] = useState(initialReposted);
  const [likes, setLikes] = useState(initialLikes);
  const [saves, setSaves] = useState(initialSaves);
  const [reps, setReps] = useState(initialReposts);
  const [isPending, startTransition] = useTransition();

  const handleLike = () => {
    if (!isLoggedIn) return alert("Please log in to like posts");
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes((l) => (wasLiked ? l - 1 : l + 1));
    startTransition(async () => {
      await toggleLike(postId);
    });
  };

  const handleSave = () => {
    if (!isLoggedIn) return alert("Please log in to save posts");
    const wasSaved = saved;
    setSaved(!wasSaved);
    setSaves((s) => (wasSaved ? s - 1 : s + 1));
    startTransition(async () => {
      await toggleSave(postId);
    });
  };

  const handleRepost = () => {
    if (!isLoggedIn) return alert("Please log in to repost");
    const wasReposted = reposted;
    setReposted(!wasReposted);
    setReps((r) => (wasReposted ? r - 1 : r + 1));
    startTransition(async () => {
      await toggleRepost(postId);
    });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.5rem 0",
        borderTop: "1px solid var(--border-light)",
        borderBottom: "1px solid var(--border-light)",
      }}
    >
      <button
        onClick={handleLike}
        className={`engagement-btn ${liked ? "active" : ""}`}
        disabled={isPending}
      >
        <span className={liked ? "animate-heart" : ""} key={String(liked)}>
          <Heart size={20} fill={liked ? "currentColor" : "none"} />
        </span>
        <span>{likes}</span>
      </button>

      <button
        onClick={handleRepost}
        className={`engagement-btn ${reposted ? "active" : ""}`}
        disabled={isPending}
      >
        <span><Repeat2 size={20} /></span>
        <span>{reps}</span>
      </button>

      <button
        onClick={handleSave}
        className={`engagement-btn ${saved ? "active" : ""}`}
        disabled={isPending}
      >
        <span><Bookmark size={20} fill={saved ? "currentColor" : "none"} /></span>
        <span>{saves}</span>
      </button>

      <div style={{ flex: 1 }} />

      <span
        style={{
          fontSize: "0.75rem",
          color: "var(--text-tertiary)",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
        }}
      >
        <Eye size={16} /> {viewCount} views
      </span>
    </div>
  );
}
