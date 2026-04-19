import { getUsersAdmin, toggleUserSuspension } from "@/app/actions/admin";
import { Search, ShieldAlert, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";

  const data = await getUsersAdmin(page, 20, search);

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 700, margin: 0 }}>
          Manage Users
        </h1>
        
        {/* Simple search form */}
        <form style={{ display: "flex", gap: "0.5rem", maxWidth: 300, width: "100%" }}>
          <div className="input-group" style={{ margin: 0, flex: 1 }}>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search username..."
                className="input"
                style={{ paddingLeft: "2.5rem", height: "36px" }}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">Search</button>
        </form>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "var(--bg-tertiary)", textAlign: "left", color: "var(--text-secondary)" }}>
              <th style={{ padding: "1rem" }}>User</th>
              <th style={{ padding: "1rem" }}>Posts</th>
              <th style={{ padding: "1rem" }}>Joined</th>
              <th style={{ padding: "1rem" }}>Status</th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user) => (
              <tr key={user.id} style={{ borderTop: "1px solid var(--border-light)" }}>
                <td style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-tertiary)", overflow: "hidden", position: "relative" }}>
                      {user.avatarUrl ? (
                        <Image src={user.avatarUrl} alt="" fill style={{ objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--text-tertiary)" }}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.displayName || user.username}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{user.postCount}</td>
                <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "1rem" }}>
                  {user.isSuspended ? (
                    <span style={{ padding: "0.25rem 0.5rem", background: "rgba(196,30,58,0.1)", color: "var(--error)", borderRadius: "1000px", fontSize: "0.75rem", fontWeight: 600 }}>Suspended</span>
                  ) : user.isAdmin ? (
                    <span style={{ padding: "0.25rem 0.5rem", background: "rgba(37,99,235,0.1)", color: "var(--accent)", borderRadius: "1000px", fontSize: "0.75rem", fontWeight: 600 }}>Admin</span>
                  ) : (
                    <span style={{ padding: "0.25rem 0.5rem", background: "rgba(45,138,78,0.1)", color: "var(--success)", borderRadius: "1000px", fontSize: "0.75rem", fontWeight: 600 }}>Active</span>
                  )}
                </td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  {!user.isAdmin && (
                    <form action={
                      async () => {
                        "use server";
                        await toggleUserSuspension(user.id);
                      }
                    }>
                      <button 
                        type="submit" 
                        className={`btn btn-sm ${user.isSuspended ? "btn-secondary" : "btn-ghost"}`}
                        style={{ color: user.isSuspended ? "var(--success)" : "var(--error)" }}
                      >
                        {user.isSuspended ? (
                          <><ShieldCheck size={14} style={{ marginRight: "0.25rem" }} /> Restore</>
                        ) : (
                          <><ShieldAlert size={14} style={{ marginRight: "0.25rem" }} /> Suspend</>
                        )}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.users.length === 0 && (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-tertiary)" }}>
            No users found matching "{search}"
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {data.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2rem" }}>
          {Array.from({ length: data.totalPages }).map((_, i) => (
            <a
              key={i}
              href={`/admin/users?page=${i + 1}${search ? `&search=${search}` : ""}`}
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
