"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Star, ArrowLeft, MessageSquare, Megaphone, ShieldAlert, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { href: "/admin/users", icon: <Users size={20} />, label: "Users" },
    { href: "/admin/posts", icon: <FileText size={20} />, label: "Posts" },
    { href: "/admin/comments", icon: <MessageSquare size={20} />, label: "Comments" },
    { href: "/admin/reviews", icon: <Star size={20} />, label: "Reviews" },
    { href: "/admin/announcements", icon: <Megaphone size={20} />, label: "Announcements" },
    { href: "/admin/audit", icon: <ShieldAlert size={20} />, label: "Audit Logs" },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2 className="admin-sidebar-title">Admin Panel</h2>
        </div>

        <nav className="admin-sidebar-nav">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`admin-nav-link ${active ? "admin-nav-link-active" : ""}`}
              >
                <div className="admin-nav-icon">{link.icon}</div>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" className="btn btn-ghost btn-sm w-full flex justify-center">
            <ArrowLeft size={16} className="mr-1" /> Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
