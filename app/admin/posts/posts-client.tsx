"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Filter, EyeOff, Trash2, MoreVertical, Star, ChevronUp, ChevronDown } from "lucide-react";
import { adminToggleFeatured, setPostStatusAdmin, togglePostStatus, adminDeletePost } from "@/app/actions/admin";
import { PostPreviewModal } from "./preview-modal";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { useDebounce } from "@/lib/hooks/use-debounce";
import Link from "next/link";

export function AdminPostsClient({ data, authors, tags, search, category, status, authorId, tag, page, sortBy, sortOrder }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [previewPost, setPreviewPost] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState(search || "");
  const debouncedSearch = useDebounce(searchTerm, 400);

  useEffect(() => {
    if (debouncedSearch !== search) {
      updateFilters("search", debouncedSearch);
    }
  }, [debouncedSearch]);

  const updateFilters = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (value && value !== "all") current.set(key, value);
    else current.delete(key);
    current.delete("page");
    router.push(`?${current.toString()}`);
  };

  const handleSort = (key: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (sortBy === key) {
      current.set("sortOrder", sortOrder === "asc" ? "desc" : "asc");
    } else {
      current.set("sortBy", key);
      current.set("sortOrder", "asc"); // Default to asc when changing column
    }
    router.push(`?${current.toString()}`);
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return null;
    return sortOrder === "asc" ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />;
  };

  const toggleSelectAll = () => {
    if (selectedPosts.size === data.posts.length && data.posts.length > 0) setSelectedPosts(new Set());
    else setSelectedPosts(new Set(data.posts.map((p: any) => p.id)));
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedPosts);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedPosts(newSet);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you SURE? This will permanently delete ${selectedPosts.size} posts!`)) return;
    const ids = Array.from(selectedPosts);
    for (const id of ids) {
      await adminDeletePost(id);
    }
    toast.success("Bulk Delete", "Posts successfully deleted.");
    setSelectedPosts(new Set());
  };

  const handleToggleStatus = async (postId: string) => {
    const res = await togglePostStatus(postId);
    if (res?.error) toast.error("Error", res.error);
    else toast.success("Updated", "Post visibility updated.");
  };

  const handleToggleFeatured = async (postId: string) => {
    const res = await adminToggleFeatured(postId);
    if (res?.error) toast.error("Error", res.error);
    else toast.success("Updated", "Post featured status updated.");
  };

  const handleDelete = async (postId: string) => {
    if (!confirm(`Are you SURE?`)) return;
    const res = await adminDeletePost(postId);
    if (res?.error) toast.error("Error", res.error);
    else toast.success("Deleted", "Post has been permanently deleted.");
  };

  return (
    <>
      <div className="jira-filter-bar">
        <div className="admin-search-wrapper">
          <Search size={14} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title..."
          />
        </div>

        <select className="jira-filter-btn" value={category} onChange={(e) => updateFilters("category", e.target.value)}>
          <option value="all">Category: All</option>
          <option value="campus">Campus</option>
          <option value="events">Events</option>
          <option value="academic">Academic</option>
          <option value="sports">Sports</option>
          <option value="clubs">Clubs</option>
          <option value="opinion">Opinion</option>
        </select>

        <select className="jira-filter-btn" value={status} onChange={(e) => updateFilters("status", e.target.value)}>
          <option value="all">Status: All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="flagged">Flagged</option>
        </select>

        <select 
            className="jira-filter-btn max-w-[200px]" 
            value={authorId} 
            onChange={(e) => updateFilters("authorId", e.target.value)}
        >
          <option value="all">Author: All</option>
          {authors.map((u: any) => (
            <option key={u.id} value={u.id}>
              @{u.username} ({u.displayName || u.username})
            </option>
          ))}
        </select>

        <select 
            className="jira-filter-btn max-w-[150px]" 
            value={tag} 
            onChange={(e) => updateFilters("tag", e.target.value)}
        >
          <option value="all">Tag: All</option>
          {tags.map((t: string) => (
            <option key={t} value={t}>
              #{t}
            </option>
          ))}
        </select>

      </div>

      {selectedPosts.size > 0 && (
        <div className="admin-bulk-bar">
          <span className="admin-bulk-text">{selectedPosts.size} posts selected</span>
          <div className="flex gap-2">
            <button onClick={handleBulkDelete} className="btn btn-sm btn-ghost bg-red-900/10 text-[var(--error)]">
              <Trash2 size={12} className="mr-1" /> Bulk Delete
            </button>
          </div>
        </div>
      )}

      <div className="jira-table-container">
        <table className="jira-table">
          <thead>
            <tr>
              <th className="pl-4 w-10">
                <input type="checkbox" checked={selectedPosts.size === data.posts.length && data.posts.length > 0} onChange={toggleSelectAll} className="cursor-pointer" />
              </th>
              <th className="cursor-pointer hover:text-primary" onClick={() => handleSort("title")}>
                <div className="flex items-center">Title <SortIcon col="title" /></div>
              </th>
              <th className="cursor-pointer hover:text-primary" onClick={() => handleSort("author")}>
                <div className="flex items-center">Author <SortIcon col="author" /></div>
              </th>
              <th className="cursor-pointer hover:text-primary" onClick={() => handleSort("category")}>
                <div className="flex items-center">Category <SortIcon col="category" /></div>
              </th>
              <th className="cursor-pointer hover:text-primary" onClick={() => handleSort("createdAt")}>
                <div className="flex items-center">Created <SortIcon col="createdAt" /></div>
              </th>
              <th className="cursor-pointer hover:text-primary" onClick={() => handleSort("status")}>
                <div className="flex items-center">Status <SortIcon col="status" /></div>
              </th>
              <th className="text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.posts.map((post: any) => (
              <tr key={post.id} className={selectedPosts.has(post.id) ? "jira-table-row-selected" : ""}>
                <td className="pl-4">
                  <input type="checkbox" checked={selectedPosts.has(post.id)} onChange={() => toggleSelect(post.id)} className="cursor-pointer" />
                </td>
                <td className="font-semibold text-primary max-w-[300px]">
                  <div className="truncate flex items-center gap-2">
                    {post.isFeatured && <Star size={12} className="text-warning fill-warning" />}
                    {post.title}
                  </div>
                </td>
                <td className="text-secondary">@{post.authorUsername}</td>
                <td className="text-secondary">
                  <span className={`badge badge-${post.category}`}>{post.category}</span>
                </td>
                <td className="text-secondary text-[0.8rem]">
                  {new Date(post.createdAt).toLocaleDateString()}
                  <div className="text-[0.7rem] text-tertiary">
                    {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td>
                  <InlinePostStatus post={post} />
                </td>
                <td className="text-right pr-4">
                  <div className="admin-actions-group">
                    <button onClick={() => setPreviewPost(post)} className="admin-action-btn-ghost" title="Preview">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => handleToggleStatus(post.id)} className="admin-action-btn-ghost" title="Disable/Enable">
                      <EyeOff size={14} />
                    </button>
                    <div className="admin-menu-container">
                      <button className="admin-action-btn-ghost"><MoreVertical size={14} /></button>
                      <div className="admin-hover-menu">
                        <button onClick={() => handleToggleFeatured(post.id)} className="admin-menu-item">
                          <Star size={16} className="text-warning" /> {post.isFeatured ? "Un-feature" : "Feature"}
                        </button>
                        <button onClick={() => handleDelete(post.id)} className="admin-menu-item admin-menu-item-danger">
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.posts.length === 0 && <div className="admin-empty-state">No posts found.</div>}
      </div>

      {data.totalPages > 1 && (
        <div className="admin-pagination">
          {Array.from({ length: data.totalPages }).map((_, i) => {
            const current = new URLSearchParams(Array.from(searchParams.entries()));
            current.set("page", (i + 1).toString());
            return (
              <Link
                key={i}
                href={`?${current.toString()}`}
                className={`btn btn-sm w-9 p-0 flex items-center justify-center ${page === i + 1 ? "btn-primary" : "btn-ghost"}`}
              >
                {i + 1}
              </Link>
            );
          })}
        </div>
      )}

      {previewPost && <PostPreviewModal post={previewPost} onClose={() => setPreviewPost(null)} />}
    </>
  );
}

import { Anchor } from "lucide-react";

function InlinePostStatus({ post }: { post: any }) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const curr = post.isFlagged ? "flagged" : post.isPublished ? "published" : "draft";

  const handleStatusUpdate = async (val: "published" | "draft" | "flagged") => {
    if (val === curr) {
      setIsOpen(false);
      return;
    }
    
    if (!confirm("Confirm status change?")) {
      setIsOpen(false);
      return;
    }
    
    setLoading(true);
    setIsOpen(false);
    const res = await setPostStatusAdmin(post.id, val);
    if (!res.success) {
      // toast error handled in action or here
    }
    setLoading(false);
  };

  const statusClass = curr === "flagged" ? "status-flagged" : curr === "published" ? "status-published" : "status-draft";
  
  if (loading) return <span className="text-[0.7rem] text-tertiary">Saving...</span>;

  return (
    <div className="admin-status-dropdown">
      <div 
        className={`admin-status-display ${statusClass}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-1.5">
          <Anchor size={12} className="opacity-50" />
          <span>{curr.toUpperCase()}</span>
        </div>
        <span className="text-[10px] ml-2">▼</span>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="admin-status-menu">
            <button className="admin-status-menu-item" onClick={() => handleStatusUpdate("published")}>PUBLISHED</button>
            <button className="admin-status-menu-item" onClick={() => handleStatusUpdate("draft")}>DRAFT</button>
            <button className="admin-status-menu-item" onClick={() => handleStatusUpdate("flagged")}>FLAGGED</button>
          </div>
        </>
      )}
    </div>
  );
}
