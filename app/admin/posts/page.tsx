import { getPostsAdmin } from "@/app/actions/admin";
import { AdminPostsClient } from "./posts-client";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";

  // Fetch paginated posts
  const data = await getPostsAdmin(page, 20, search);

  return (
    <div className="animate-fade-in">
      <AdminPostsClient data={data as any} search={search} page={page} />
    </div>
  );
}
