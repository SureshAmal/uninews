import { getReviewsAdmin } from "@/app/actions/admin";
import { AdminReviewsClient } from "./reviews-client";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";

  const data = await getReviewsAdmin(page, 50, search);

  return (
    <div className="animate-fade-in">
      <AdminReviewsClient data={data as any} search={search} page={page} />
    </div>
  );
}
