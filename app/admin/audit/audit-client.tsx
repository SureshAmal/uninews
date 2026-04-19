"use client";

import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/lib/hooks/use-debounce";
import Link from "next/link";

export function AdminAuditClient({ data, search, page }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(search || "");
  const debouncedSearch = useDebounce(searchTerm, 400);

  useEffect(() => {
    if (debouncedSearch !== search) {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      if (debouncedSearch) current.set("search", debouncedSearch);
      else current.delete("search");
      current.delete("page");
      router.push(`?${current.toString()}`);
    }
  }, [debouncedSearch]);

  return (
    <>
      <div className="jira-filter-bar">
        <div className="admin-search-wrapper">
          <Search size={14} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search details..."
          />
        </div>

      </div>

      <div className="jira-table-container">
        <table className="jira-table">
          <thead>
            <tr>
              <th className="w-[18%]">Timestamp</th>
              <th className="w-[12%]">Admin</th>
              <th className="w-[15%]">Action</th>
              <th className="w-[15%]">Target ID</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {data.logs.map((log: any) => (
              <tr key={log.id}>
                <td className="text-tertiary text-[0.75rem]">
                  {new Date(log.createdAt).toISOString().replace("T", " ").substring(0, 19)}
                </td>
                <td className="text-accent font-bold">
                  @{log.adminUsername || "unknown"}
                </td>
                <td className="font-bold text-primary text-[0.75rem]">
                  {log.actionType}
                </td>
                <td className="admin-monospace">
                  {log.targetId}
                </td>
                <td className="whitespace-normal">
                  {log.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.logs.length === 0 && (
          <div className="admin-empty-state">No logs found.</div>
        )}
      </div>

      {data.totalPages > 1 && (
        <div className="admin-pagination">
          {Array.from({ length: data.totalPages }).map((_, i) => {
            const current = new URLSearchParams(Array.from(searchParams.entries()));
            current.set("page", (i + 1).toString());
            return (
              <Link
                key={i}
                href={`?${current.toString()}`}
                className={`btn btn-sm w-9 p-0 flex items-center justify-center ${page === i + 1 ? "btn-primary" : "btn-ghost"}`}
              >
                {i + 1}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
