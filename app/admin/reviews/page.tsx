import { getReviewsAdmin, deleteReviewAdmin } from "@/app/actions/admin";
import { Trash2 } from "lucide-react";
import Link from "next/link";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const data = await getReviewsAdmin(page, 20);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 700, margin: 0 }}>
          Manage Reviews
        </h1>
        <p style={{ color: "var(--text-tertiary)", marginTop: "0.25rem", fontSize: "0.875rem" }}>
          Monitor community reviews to ensure guidelines are followed perfectly.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {data.reviews.map((review: any) => (
          <div key={review.id} className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} style={{ fontSize: "1.25rem", color: star <= review.rating ? "var(--accent)" : "var(--border-color)" }}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: "0.875rem", color: "var(--text-tertiary)" }}>
                    by @{review.reviewerUsername}
                  </span>
                </div>
                
                {review.reason && (
                  <p style={{ margin: "0.5rem 0", color: "var(--text-primary)", fontSize: "0.9375rem", lineHeight: 1.5 }}>
                    "{review.reason}"
                  </p>
                )}
                
                <div style={{ marginTop: "1rem", fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
                  On post: <Link href={`/post/${review.postId}`} target="_blank" style={{ color: "var(--accent)", textDecoration: "none" }}>{review.postTitle}</Link> • {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>

              <form action={
                async () => {
                  "use server";
                  await deleteReviewAdmin(review.id);
                }
              }>
                <button 
                  type="submit" 
                  className="btn btn-ghost btn-icon btn-sm"
                  style={{ color: "var(--error)" }}
                  title="Delete Review"
                >
                  <Trash2 size={16} />
                </button>
              </form>
            </div>
          </div>
        ))}

        {data.reviews.length === 0 && (
          <div className="card" style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-tertiary)" }}>
            No reviews found.
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {data.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2rem" }}>
          {Array.from({ length: data.totalPages }).map((_, i) => (
            <a
              key={i}
              href={`/admin/reviews?page=${i + 1}`}
              className={`btn btn-sm ${page === i + 1 ? "btn-primary" : "btn-ghost"}`}
              style={{ width: 36, padding: 0, justifyContent: "center" }}
            >
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
