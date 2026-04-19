"use client";

import { useState } from "react";
import { Search, Eye, Filter, EyeOff } from "lucide-react";
import { togglePostStatus } from "@/app/actions/admin";
import { PostPreviewModal } from "./preview-modal";

export function AdminPostsClient({ data, search, page }: any) {
  const [previewPost, setPreviewPost] = useState<any | null>(null);

  const handleToggleStatus = async (postId: string) => {
    await togglePostStatus(postId);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 700, margin: 0 }}>
          Manage Posts
        </h1>
        
        <form style={{ display: "flex", gap: "0.5rem", maxWidth: 300, width: "100%" }}>
          <div className="input-group" style={{ margin: 0, flex: 1 }}>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search title..."
                className="input"
                style={{ paddingLeft: "2.5rem", height: "36px" }}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">Search</button>
        </form>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "var(--bg-tertiary)", textAlign: "left", color: "var(--text-secondary)" }}>
              <th style={{ padding: "1rem" }}>Title</th>
              <th style={{ padding: "1rem" }}>Author</th>
              <th style={{ padding: "1rem" }}>Category</th>
              <th style={{ padding: "1rem" }}>Created</th>
              <th style={{ padding: "1rem" }}>Status</th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.posts.map((post: any) => (
              <tr key={post.id} style={{ borderTop: "1px solid var(--border-light)" }}>
                <td style={{ padding: "1rem", fontWeight: 500, color: "var(--text-primary)", maxWidth: 300 }}>
                  <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {post.title}
                  </div>
                </td>
                <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>@{post.authorUsername}</td>
                <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>
                  <span className="badge-category">{post.category}</span>
                </td>
                <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "1rem" }}>
                  {post.isPublished && !post.isFlagged ? (
                    <span style={{ padding: "0.25rem 0.5rem", background: "rgba(45,138,78,0.1)", color: "var(--success)", borderRadius: "1000px", fontSize: "0.75rem", fontWeight: 600 }}>Published</span>
                  ) : post.isFlagged ? (
                    <span style={{ padding: "0.25rem 0.5rem", background: "rgba(196,30,58,0.1)", color: "var(--error)", borderRadius: "1000px", fontSize: "0.75rem", fontWeight: 600 }}>Flagged/Disabled</span>
                  ) : (
                    <span style={{ padding: "0.25rem 0.5rem", background: "rgba(245,158,11,0.1)", color: "var(--warning)", borderRadius: "1000px", fontSize: "0.75rem", fontWeight: 600 }}>Draft</span>
                  )}
                </td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                    <button 
                      onClick={() => setPreviewPost(post)}
                      className="btn btn-ghost btn-sm btn-icon"
                      title="Preview Post"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(post.id)}
                      className={`btn btn-sm ${post.isFlagged || !post.isPublished ? "btn-secondary" : "btn-ghost"}`}
                      style={{ color: post.isFlagged || !post.isPublished ? "var(--success)" : "var(--error)" }}
                    >
                      {post.isFlagged || !post.isPublished ? (
                        <>Enable</>
                      ) : (
                        <><EyeOff size={14} style={{ marginRight: "0.25rem" }} /> Disable</>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.posts.length === 0 && (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-tertiary)" }}>
            No posts found matching "{search}"
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {data.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2rem" }}>
          {Array.from({ length: data.totalPages }).map((_, i) => (
            <a
              key={i}
              href={`/admin/posts?page=${i + 1}${search ? `&search=${search}` : ""}`}
              className={`btn btn-sm ${page === i + 1 ? "btn-primary" : "btn-ghost"}`}
              style={{ width: 36, padding: 0, justifyContent: "center" }}
            >
              {i + 1}
            </a>
          ))}
        </div>
      )}

      {previewPost && (
        <PostPreviewModal post={previewPost} onClose={() => setPreviewPost(null)} />
      )}
    </>
  );
}
