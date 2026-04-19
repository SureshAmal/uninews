"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function PostPreviewModal({ 
  post, 
  onClose 
}: { 
  post: { title: string; authorUsername: string; content: string; createdAt: Date } | null;
  onClose: () => void;
}) {
  if (!post) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}
      onClick={onClose}
    >
      <div
        className="card animate-slide-up"
        style={{
          width: "100%",
          maxWidth: "700px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem 0" }}>{post.title}</h2>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-tertiary)" }}>
              By @{post.authorUsername} • {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={20} />
          </button>
        </div>
        
        <div 
          className="rich-text-content"
          style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </div>
  );
}
