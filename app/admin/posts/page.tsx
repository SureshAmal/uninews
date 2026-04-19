import { getPostsAdmin, getAuthorsSummary, getUniqueTagsSummary } from "@/app/actions/admin";
import { AdminPostsClient } from "./posts-client";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    page?: string; 
    search?: string; 
    category?: string; 
    status?: string;
    sortBy?: string;
    sortOrder?: string;
    authorId?: string;
    tag?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";
  const category = params.category || "all";
  const status = params.status || "all";
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";
  const authorId = params.authorId || "all";
  const tag = params.tag || "all";

  // Fetch paginated posts with sorting + filtering, and metadata registries
  const [data, authors, tags] = await Promise.all([
    getPostsAdmin(page, 50, search, category, status, sortBy, sortOrder, authorId, tag),
    getAuthorsSummary(),
    getUniqueTagsSummary()
  ]);

  return (
    <div className="animate-fade-in">
      <AdminPostsClient 
        data={data as any} 
        authors={authors}
        tags={tags}
        search={search} 
        category={category} 
        status={status} 
        authorId={authorId}
        tag={tag}
        page={page} 
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    </div>
  );
}
