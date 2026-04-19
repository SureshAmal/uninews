"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { addComment } from "@/app/actions/comments";
import { MessageCircle, Reply, Trash2, Send } from "lucide-react";

interface CommentAuthor {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

interface CommentData {
  id: string;
  content: string;
  parentId: string | null;
  createdAt: Date;
  author: CommentAuthor;
  replies: CommentData[];
}

interface CommentSectionProps {
  postId: string;
  initialComments: CommentData[];
  isLoggedIn: boolean;
  currentUserId?: string;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CommentItem({
  comment,
  postId,
  isLoggedIn,
  currentUserId,
  onCommentAdded,
  isReply = false,
}: {
  comment: CommentData;
  postId: string;
  isLoggedIn: boolean;
  currentUserId?: string;
  onCommentAdded: () => void;
  isReply?: boolean;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleReply = () => {
    if (!replyContent.trim()) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("content", replyContent);
      fd.set("parentId", comment.id);
      const result = await addComment(postId, fd);
      if (result?.success) {
        setReplyContent("");
        setShowReplyForm(false);
        onCommentAdded();
      }
    });
  };

  return (
    <div
      style={{
        paddingLeft: isReply ? "2.5rem" : 0,
        borderLeft: isReply ? "2px solid var(--border-light)" : "none",
        marginLeft: isReply ? "1rem" : 0,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          padding: "0.875rem 0",
          borderBottom: isReply ? "none" : "1px solid var(--border-light)",
        }}
      >
        {/* Avatar */}
        <Link href={`/profile/${comment.author.username}`}>
          <div
            className="avatar avatar-md"
            style={{ flexShrink: 0 }}
          >
            {comment.author.avatarUrl ? (
              <img
                src={comment.author.avatarUrl}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              (comment.author.displayName || comment.author.username)[0].toUpperCase()
            )}
          </div>
        </Link>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <Link
              href={`/profile/${comment.author.username}`}
              style={{ fontWeight: 600, fontSize: "0.875rem", textDecoration: "none", color: "var(--text-primary)" }}
            >
              {comment.author.displayName || comment.author.username}
            </Link>
            <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
            {comment.content}
          </p>

          {/* Actions */}
          {isLoggedIn && !isReply && (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.375rem" }}>
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  color: "var(--text-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.25rem 0",
                }}
              >
                <Reply size={14} /> Reply
              </button>
            </div>
          )}

          {/* Reply form */}
          {showReplyForm && (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <input
                type="text"
                className="input"
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                style={{ fontSize: "0.875rem" }}
              />
              <button
                onClick={handleReply}
                disabled={isPending || !replyContent.trim()}
                className="btn btn-primary btn-sm"
              >
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          postId={postId}
          isLoggedIn={isLoggedIn}
          currentUserId={currentUserId}
          onCommentAdded={onCommentAdded}
          isReply
        />
      ))}
    </div>
  );
}

export function CommentSection({
  postId,
  initialComments,
  isLoggedIn,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!content.trim()) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("content", content);
      const result = await addComment(postId, fd);
      if (result?.success) {
        setContent("");
        // Refresh comments
        const { getComments } = await import("@/app/actions/comments");
        const updated = await getComments(postId);
        setComments(updated);
      }
    });
  };

  const refreshComments = async () => {
    const { getComments } = await import("@/app/actions/comments");
    const updated = await getComments(postId);
    setComments(updated);
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <div className="section-divider">
        <MessageCircle size={16} style={{ marginRight: "0.25rem" }} />
        Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
      </div>

      {/* Comment form */}
      {isLoggedIn ? (
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <input
            type="text"
            className="input"
            placeholder="Add a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            disabled={isPending || !content.trim()}
            className="btn btn-primary"
          >
            {isPending ? "..." : <Send size={18} />}
          </button>
        </div>
      ) : (
        <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)", marginBottom: "1rem" }}>
          Log in to join the conversation.
        </p>
      )}

      {/* Comment list */}
      {comments.length === 0 ? (
        <div className="review-empty-state">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={postId}
            isLoggedIn={isLoggedIn}
            currentUserId={currentUserId}
            onCommentAdded={refreshComments}
          />
        ))
      )}
    </div>
  );
}
