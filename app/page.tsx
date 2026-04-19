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
    <div className="w-full px-[clamp(1rem,5vw,3rem)] pt-4 pb-16">
      {/* Newspaper Masthead */}
      <Masthead />

      {/* Login CTA for non-authenticated users */}
      {!user && (
        <div className="my-6 px-6 py-4 bg-accent-soft rounded-md flex items-center justify-between flex-wrap gap-3">
          <div>
            <strong className="text-primary">
              Have news to share?
            </strong>{" "}
            <span className="text-secondary text-[0.875rem]">
              Log in to post stories, follow writers, and engage with your campus community.
            </span>
          </div>
          <div className="flex gap-2">
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
        <div className="text-center py-16 px-8 color-tertiary">
          <div className="mb-4 flex justify-center">
            <Unplug size={48} />
          </div>
          <h3 className="font-heading text-2xl font-semibold mb-2 text-secondary">
            Database not connected
          </h3>
          <p className="text-[0.9375rem] max-w-[400px] mx-auto">
            Make sure PostgreSQL is running and run{" "}
            <code className="bg-bg-tertiary px-1.5 py-0.5 rounded text-[0.8125rem]">
              npx drizzle-kit push
            </code>{" "}
            to create the tables.
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <NewspaperFeed initialPosts={posts} currentUser={user} />
        </div>
      )}
    </div>
  );
}
