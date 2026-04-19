"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Star, ArrowLeft } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { href: "/admin/users", icon: <Users size={20} />, label: "Users" },
    { href: "/admin/posts", icon: <FileText size={20} />, label: "Posts" },
    { href: "/admin/reviews", icon: <Star size={20} />, label: "Reviews" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-secondary)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "280px",
          background: "var(--bg-card)",
          borderRight: "1px solid var(--border-light)",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
            Admin Panel
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)", marginTop: "0.25rem" }}>
            UniNews Moderation
          </p>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "all 0.2s",
                  background: active ? "var(--bg-hover)" : "transparent",
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                <div style={{ color: active ? "var(--accent)" : "inherit" }}>{link.icon}</div>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", paddingTop: "2rem" }}>
          <Link href="/" className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start" }}>
            <ArrowLeft size={16} style={{ marginRight: "0.5rem" }} /> Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "2rem 3rem", overflowY: "auto", height: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
