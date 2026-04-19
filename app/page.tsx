import { Masthead } from "@/components/newspaper/masthead";
import { NewspaperFeed } from "@/components/newspaper/newspaper-feed";
import { getRankedPosts } from "@/lib/feed/ranking";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { Unplug } from "lucide-react";
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function HomePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  let posts: Awaited<ReturnType<typeof getRankedPosts>> = [];
  let dbError = false;

  try {
    posts = await getRankedPosts(20);
  } catch {
    dbError = true;
  }

  const user = await getCurrentUser();

  return (
    <div style={{ width: "100%", padding: "1rem 2rem 3rem 2rem" }}>
      {/* Newspaper Masthead */}
      <Masthead />

      {/* Login CTA for non-authenticated users */}
      {!user && (
        <div
          style={{
            margin: "1.5rem 0",
            padding: "1rem 1.5rem",
            background: "var(--accent-soft)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div>
            <strong style={{ color: "var(--text-primary)" }}>
              Have news to share?
            </strong>{" "}
            <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Log in to post stories, follow writers, and engage with your campus community.
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link href="/login" className="btn btn-ghost btn-sm">
              Log in
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm">
              Sign up
            </Link>
          </div>
        </div>
      )}

      {dbError ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            color: "var(--text-tertiary)",
          }}
        >
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
            <Unplug size={48} />
          </div>
          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.5rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
              color: "var(--text-secondary)",
            }}
          >
            Database not connected
          </h3>
          <p style={{ fontSize: "0.9375rem", maxWidth: 400, margin: "0 auto" }}>
            Make sure PostgreSQL is running and run{" "}
            <code
              style={{
                background: "var(--bg-tertiary)",
                padding: "0.125rem 0.375rem",
                borderRadius: 4,
                fontSize: "0.8125rem",
              }}
            >
              npx drizzle-kit push
            </code>{" "}
            to create the tables.
          </p>
        </div>
      ) : (
        <div style={{ marginTop: "2rem" }}>
          <NewspaperFeed initialPosts={posts} />
        </div>
      )}
    </div>
  );
}
