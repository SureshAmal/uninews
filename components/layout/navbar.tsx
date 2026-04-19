"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/app/actions/auth";
import { PenLine, User, Settings, LogOut, Bookmark, Shield } from "lucide-react";

interface NavUser {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isAdmin?: boolean;
}

export function Navbar({ user }: { user: NavUser | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: scrolled ? "var(--bg-glass)" : "var(--bg-secondary)",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: "1px solid var(--border-light)",
          transition: "all 0.3s ease",
          boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        }}
      >
        <div
          className="container-news"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 56,
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              textDecoration: "none",
              letterSpacing: "0.02em",
            }}
          >
            Uni<span style={{ color: "var(--accent)" }}>News</span>
          </Link>

          {/* Desktop nav links */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
            className="nav-desktop"
          >
            {["campus", "academic", "sports", "events", "opinion", "clubs"].map(
              (cat) => (
                <Link
                  key={cat}
                  href={`/explore?category=${cat}`}
                  style={{
                    padding: "0.375rem 0.75rem",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    borderRadius: "var(--radius-sm)",
                    textTransform: "capitalize",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--accent-soft)";
                    e.currentTarget.style.color = "var(--accent-text)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  {cat}
                </Link>
              )
            )}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ThemeToggle />

            {user ? (
              <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Link href="/create" className="btn btn-primary btn-sm">
                  <PenLine size={16} /> Post
                </Link>
                <div style={{ position: "relative" }} ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="avatar avatar-md"
                    style={{
                      cursor: "pointer",
                      border: "2px solid var(--border-color)",
                    }}
                    title={user.displayName || user.username}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      (user.displayName || user.username)[0].toUpperCase()
                    )}
                  </button>

                  {menuOpen && (
                    <div
                      className="animate-slide-down"
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 8px)",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        boxShadow: "var(--shadow-lg)",
                        minWidth: 200,
                        padding: "0.5rem",
                        zIndex: 50,
                      }}
                    >
                      <div
                        style={{
                          padding: "0.75rem",
                          borderBottom: "1px solid var(--border-light)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            color: "var(--text-primary)",
                          }}
                        >
                          {user.displayName || user.username}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-tertiary)",
                          }}
                        >
                          @{user.username}
                        </div>
                      </div>
                      <Link
                        href={`/profile/${user.username}`}
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: "block",
                          padding: "0.5rem 0.75rem",
                          fontSize: "0.875rem",
                          color: "var(--text-secondary)",
                          textDecoration: "none",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        <User size={16} style={{ display: "inline", marginRight: "0.25rem" }} /> Profile
                      </Link>
                      <Link
                        href="/profile/edit"
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: "block",
                          padding: "0.5rem 0.75rem",
                          fontSize: "0.875rem",
                          color: "var(--text-secondary)",
                          textDecoration: "none",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        <Settings size={16} style={{ display: "inline", marginRight: "0.25rem" }} /> Settings
                      </Link>
                      <Link
                        href="/saved"
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: "block",
                          padding: "0.5rem 0.75rem",
                          fontSize: "0.875rem",
                          color: "var(--text-secondary)",
                          textDecoration: "none",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        <Bookmark size={16} style={{ display: "inline", marginRight: "0.25rem" }} /> Saved
                      </Link>
                      {user.isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          style={{
                            display: "block",
                            padding: "0.5rem 0.75rem",
                            fontSize: "0.875rem",
                            color: "var(--accent)",
                            textDecoration: "none",
                            borderRadius: "var(--radius-sm)",
                          }}
                        >
                          <Shield size={16} style={{ display: "inline", marginRight: "0.25rem" }} /> Admin Panel
                        </Link>
                      )}
                      <form action={logout}>
                        <button
                          type="submit"
                          style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            padding: "0.5rem 0.75rem",
                            fontSize: "0.875rem",
                            color: "var(--error)",
                            background: "none",
                            border: "none",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                          }}
                        >
                          <LogOut size={16} style={{ display: "inline", marginRight: "0.25rem" }} /> Logout
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Link href="/login" className="btn btn-ghost btn-sm">
                  Log in
                </Link>
                <Link href="/signup" className="btn btn-primary btn-sm">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-only { display: inline-flex !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-only { display: none !important; }
        }
      `}</style>
    </>
  );
}
