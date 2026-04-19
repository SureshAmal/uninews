"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Trash2, Filter } from "lucide-react";
import { adminDeleteComment } from "@/app/actions/admin";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { toast } from "@/components/ui/toast";

export function AdminCommentsClient({ data, search, page }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(search || "");
  const debouncedSearch = useDebounce(searchTerm, 400);

  useEffect(() => {
    if (debouncedSearch !== search) {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      if (debouncedSearch) current.set("search", debouncedSearch);
      else current.delete("search");
      current.delete("page");
      router.push(`?${current.toString()}`);
    }
  }, [debouncedSearch]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    const res = await adminDeleteComment(id);
    if (res?.success) {
      toast.success("Deleted", "Comment has been removed.");
    } else {
      toast.error("Error", "Failed to delete comment.");
    }
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
            placeholder="Search in comments..."
          />
        </div>

      </div>

      <div className="jira-table-container">
        <table className="jira-table">
          <thead>
            <tr>
              <th className="w-[15%]">Author</th>
              <th className="w-[45%]">Comment</th>
              <th className="w-[20%]">Post Title</th>
              <th className="w-[10%]">Date</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.comments.map((c: any) => (
              <tr key={c.id}>
                <td className="font-bold">@{c.authorUsername}</td>
                <td className="whitespace-normal text-primary">{c.content}</td>
                <td>
                  <div className="truncate max-w-[200px] text-secondary">
                    {c.postTitle}
                  </div>
                </td>
                <td className="text-tertiary text-[0.75rem]">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
                <td className="text-right">
                  <button 
                    onClick={() => handleDelete(c.id)}
                    className="admin-action-btn-ghost ml-auto text-[var(--error)] bg-red-950/5 hover:bg-red-950/10"
                    title="Delete Comment"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.comments.length === 0 && (
          <div className="admin-empty-state">No comments found.</div>
        )}
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
    </>
  );
}
