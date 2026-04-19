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
    <nav className={`nav-blur-container ${scrolled ? "shadow-sm bg-glass" : "bg-secondary"}`}>
      <div className="container-news h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="nav-logo">
          Uni<span className="nav-logo-accent">News</span>
        </Link>

        {/* Desktop nav links */}
        <div className="nav-desktop flex items-center gap-1">
          {["campus", "academic", "sports", "events", "opinion", "clubs"].map(
            (cat) => (
              <Link
                key={cat}
                href={`/explore?category=${cat}`}
                className="nav-link"
              >
                {cat}
              </Link>
            )
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <div className="nav-desktop flex items-center gap-2">
              <Link href="/create" className="btn btn-primary btn-sm">
                <PenLine size={16} /> Post
              </Link>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="avatar avatar-md cursor-pointer border-2 border-[var(--border-color)]"
                  title={user.displayName || user.username}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    (user.displayName || user.username)[0].toUpperCase()
                  )}
                </button>

                {menuOpen && (
                  <div className="nav-dropdown animate-slide-down">
                    <div className="nav-user-info">
                      <div className="nav-user-name">
                        {user.displayName || user.username}
                      </div>
                      <div className="nav-user-handle">
                        @{user.username}
                      </div>
                    </div>
                    <Link
                      href={`/profile/${user.username}`}
                      onClick={() => setMenuOpen(false)}
                      className="nav-dropdown-link"
                    >
                      <User size={16} className="inline mr-1" /> Profile
                    </Link>
                    <Link
                      href="/profile/edit"
                      onClick={() => setMenuOpen(false)}
                      className="nav-dropdown-link"
                    >
                      <Settings size={16} className="inline mr-1" /> Settings
                    </Link>
                    <Link
                      href="/saved"
                      onClick={() => setMenuOpen(false)}
                      className="nav-dropdown-link"
                    >
                      <Bookmark size={16} className="inline mr-1" /> Saved
                    </Link>
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="nav-dropdown-link !text-[var(--accent)]"
                      >
                        <Shield size={16} className="inline mr-1" /> Admin Panel
                      </Link>
                    )}
                    <form action={logout}>
                      <button
                        type="submit"
                        className="nav-dropdown-link nav-dropdown-link-danger w-full text-left bg-transparent border-none cursor-pointer"
                      >
                        <LogOut size={16} className="inline mr-1" /> Logout
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="nav-desktop flex items-center gap-2">
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
  );
}
