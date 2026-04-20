"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PenLine, User, KeyRound, UserPlus, Bookmark, Shield } from "lucide-react";
import { motion } from "motion/react";

interface NavUser {
  userId: string;
  username: string;
  isAdmin?: boolean;
}

export function MobileNav({ user }: { user: NavUser | null }) {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav-root">
      <div className="mobile-nav-inner">
        <NavItem href="/" icon={<Home />} label="Home" active={pathname === "/"} />
        <NavItem href="/explore" icon={<Search />} label="Explore" active={pathname.startsWith("/explore")} />
        {user ? (
          <>
            <NavItem href="/create" icon={<PenLine />} label="Post" accent />
            <NavItem href="/saved" icon={<Bookmark />} label="Saved" active={pathname === "/saved"} />
            <NavItem
              href={`/profile/${user.username}`}
              icon={<User />}
              label="Profile"
              active={pathname.startsWith("/profile")}
            />
            {user.isAdmin && (
              <NavItem href="/admin" icon={<Shield />} label="Admin" active={pathname.startsWith("/admin")} />
            )}
          </>
        ) : (
          <>
            <NavItem href="/login" icon={<KeyRound />} label="Login" active={pathname === "/login"} />
            <NavItem href="/signup" icon={<UserPlus />} label="Sign up" active={pathname === "/signup"} />
          </>
        )}
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon,
  label,
  accent,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
  active?: boolean;
}) {
  const className = `mobile-nav-item ${active ? "mobile-nav-item-active" : ""} ${accent ? "mobile-nav-accent" : ""}`;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If the tab is already active, prevent Next.js from processing a redundant navigation.
    // Instead, just perform a standard mobile app "scroll to top" action.
    if (active) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      <motion.div
        className="active:scale-90 transition-transform"
        initial={{ scale: 1 }}
        animate={{
          scale: active ? 1.15 : 1,
          y: active ? -2 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 20
        }}
      >
        {React.cloneElement(icon as React.ReactElement<any>, {
          style: {
            fill: active ? "currentColor" : "none",
            transition: "fill 0.2s ease-out"
          },
          strokeWidth: active || accent ? 2.5 : 2,
        })}
      </motion.div>
      {!accent && (
        <span className={`mobile-nav-label ${active ? "mobile-nav-label-active" : ""}`}>
          {label}
        </span>
      )}
    </Link>
  );
}
