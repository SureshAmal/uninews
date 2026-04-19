import { getCommentsAdmin } from "@/app/actions/admin";
import { AdminCommentsClient } from "./comments-client";

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";

  const data = await getCommentsAdmin(page, 50, search);

  return (
    <div className="animate-fade-in">
      <AdminCommentsClient data={data as any} search={search} page={page} />
    </div>
  );
}
