import { getPostsAdmin } from "@/app/actions/admin";
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
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";
  const category = params.category || "all";
  const status = params.status || "all";
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";

  // Fetch paginated posts with sorting
  const data = await getPostsAdmin(page, 50, search, category, status, sortBy, sortOrder);

  return (
    <div className="animate-fade-in">
      <AdminPostsClient 
        data={data as any} 
        search={search} 
        category={category} 
        status={status} 
        page={page} 
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    </div>
  );
}
