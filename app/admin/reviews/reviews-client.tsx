"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Trash2, Filter } from "lucide-react";
import { deleteReviewAdmin } from "@/app/actions/admin";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { toast } from "@/components/ui/toast";

export function AdminReviewsClient({ data, search, page }: any) {
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
    if (!confirm("Are you sure you want to delete this review?")) return;
    const res = await deleteReviewAdmin(id);
    if (res?.success) {
      toast.success("Deleted", "Review has been removed.");
    } else {
      toast.error("Error", "Failed to delete review.");
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
            placeholder="Search in reviews..."
          />
        </div>

      </div>

      <div className="jira-table-container">
        <table className="jira-table">
          <thead>
            <tr>
              <th className="w-[20%]">User</th>
              <th className="w-[10%]">Rating</th>
              <th className="w-[40%]">Review</th>
              <th className="w-[20%]">Post</th>
              <th className="text-right w-[10%]">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.reviews.map((review: any) => (
              <tr key={review.id}>
                <td className="font-bold">@{review.reviewerUsername}</td>
                <td>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`text-base ${star <= review.rating ? "text-accent" : "text-border"}`}>
                        ★
                      </span>
                    ))}
                  </div>
                </td>
                <td className="whitespace-normal text-primary">
                  {review.reason ? `"${review.reason}"` : <span className="text-tertiary italic">No text provided</span>}
                </td>
                <td>
                  <Link href={`/post/${review.postId}`} target="_blank" className="text-accent no-underline truncate inline-block max-w-[200px] hover:underline">
                    {review.postTitle}
                  </Link>
                  <div className="text-[0.75rem] text-tertiary">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="text-right">
                  <button 
                    onClick={() => handleDelete(review.id)}
                    className="admin-action-btn-ghost ml-auto text-[var(--error)] bg-red-950/5 hover:bg-red-950/10"
                    title="Delete Review"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.reviews.length === 0 && (
          <div className="admin-empty-state">No reviews found.</div>
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
