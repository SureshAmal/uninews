import { getAuditLogs } from "@/app/actions/admin";
import { AdminAuditClient } from "./audit-client";
import { ShieldAlert } from "lucide-react";

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
    <div className="admin-page-container animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-error-soft flex items-center justify-center text-error">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h1 className="headline-large m-0">Audit Logs</h1>
          <p className="text-secondary m-0">Review critical administrative actions and security events</p>
        </div>
      </div>
      <AdminAuditClient data={data as any} search={search} page={page} />
    </div>
  );
}
