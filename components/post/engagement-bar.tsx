"use client";

import { useState, useTransition } from "react";
import { toggleLike, toggleSave, toggleRepost } from "@/app/actions/posts";
import { Heart, Repeat2, Bookmark, Eye } from "lucide-react";
import { motion } from "motion/react";

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
    <div className="engagement-bar-container">
      <motion.button
        onClick={handleLike}
        className={`engagement-btn ${liked ? "active" : ""}`}
        disabled={isPending}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.85 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <motion.span 
          initial={false}
          animate={{ scale: liked ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 0.4, type: "tween", ease: "backOut" }}
        >
          <Heart size={20} fill={liked ? "currentColor" : "none"} />
        </motion.span>
        <span>{likes}</span>
      </motion.button>

      <motion.button
        onClick={handleRepost}
        className={`engagement-btn ${reposted ? "active" : ""}`}
        disabled={isPending}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.85 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <motion.span
          initial={false}
          animate={{ rotate: reposted ? [0, 180, 360] : 0, scale: reposted ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.5, type: "tween", ease: "easeInOut" }}
        >
          <Repeat2 size={20} />
        </motion.span>
        <span>{reps}</span>
      </motion.button>

      <motion.button
        onClick={handleSave}
        className={`engagement-btn ${saved ? "active" : ""}`}
        disabled={isPending}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.85 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <motion.span
          initial={false}
          animate={{ scale: saved ? [1, 1.2, 1] : 1, y: saved ? [0, -3, 0] : 0 }}
          transition={{ duration: 0.4, type: "tween", ease: "backOut" }}
        >
          <Bookmark size={20} fill={saved ? "currentColor" : "none"} />
        </motion.span>
        <span>{saves}</span>
      </motion.button>

      <div className="flex-1" />

      <span className="engagement-bar-meta">
        <Eye size={16} /> {viewCount} views
      </span>
    </div>
  );
}
