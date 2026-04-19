import { getAuditLogs } from "@/app/actions/admin";
import { AdminAuditClient } from "./audit-client";

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";

  const data = await getAuditLogs(page, 50, search);

  return (
    <div className="animate-fade-in">
      <AdminAuditClient data={data as any} search={search} page={page} />
    </div>
  );
}
