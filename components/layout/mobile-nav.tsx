"use client";

import Link from "next/link";
import { Home, Search, PenLine, User, KeyRound, UserPlus } from "lucide-react";

interface NavUser {
  userId: string;
  username: string;
}

export function MobileNav({ user }: { user: NavUser | null }) {
  return (
    <>
      <nav
        className="mobile-bottom-nav"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          background: "var(--bg-glass)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--border-light)",
          padding: "0.5rem 0",
          paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          <NavItem href="/" icon={<Home />} label="Home" />
          <NavItem href="/explore" icon={<Search />} label="Explore" />
          {user ? (
            <>
              <NavItem href="/create" icon={<PenLine />} label="Post" accent />
              <NavItem
                href={`/profile/${user.username}`}
                icon={<User />}
                label="Profile"
              />
            </>
          ) : (
            <>
              <NavItem href="/login" icon={<KeyRound />} label="Login" />
              <NavItem href="/signup" icon={<UserPlus />} label="Sign up" />
            </>
          )}
        </div>
      </nav>
      <style>{`
        .mobile-bottom-nav { display: none; }
        @media (max-width: 768px) {
          .mobile-bottom-nav { display: block; }
          body { padding-bottom: 72px; }
        }
      `}</style>
    </>
  );
}

function NavItem({
  href,
  icon,
  label,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.125rem",
        textDecoration: "none",
        fontSize: "1.25rem",
        padding: "0.25rem 0.75rem",
        borderRadius: "var(--radius-md)",
        transition: "all 0.2s",
        ...(accent
          ? {
              background: "var(--accent)",
              borderRadius: "50%",
              width: 48,
              height: 48,
              justifyContent: "center",
              marginTop: "-1rem",
              boxShadow: "var(--shadow-md)",
            }
          : {}),
      }}
    >
      <span>{icon}</span>
      {!accent && (
        <span
          style={{
            fontSize: "0.625rem",
            fontWeight: 500,
            color: "var(--text-tertiary)",
          }}
        >
          {label}
        </span>
      )}
    </Link>
  );
}
