import { getUsersAdmin } from "@/app/actions/admin";
import { AdminUsersClient } from "./users-client";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    page?: string; 
    search?: string; 
    role?: string; 
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";
  const role = params.role || "all";
  const status = params.status || "all";
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";

  const data = await getUsersAdmin(page, 50, search, role, status, sortBy, sortOrder);

  return (
    <div className="animate-fade-in">
      <AdminUsersClient 
        data={data as any} 
        search={search} 
        role={role} 
        status={status} 
        page={page} 
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    </div>
  );
}
