import { getRankedPosts } from "@/lib/feed/ranking";
import { NewspaperFeed } from "@/components/newspaper/newspaper-feed";
import { BackButton } from "@/components/layout/back-button";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const user = await getCurrentUser();

  const initialPosts = await getRankedPosts(20, 0, "all", decodedTag);
  
  return (
    <main className="min-h-screen bg-primary">
      <div className="container-news pt-8">
        <BackButton />
        
        <header className="py-8 mb-8 border-b border-divider">
          <h1 className="headline-hero text-[clamp(2rem,8vw,4rem)] mb-2 text-primary uppercase">
            #{tag}
          </h1>
          <p className="article-card-meta text-tertiary">
            Browsing articles tagged with #{tag}
          </p>
        </header>

        <NewspaperFeed initialPosts={initialPosts} currentUser={user} tagFilter={decodedTag} />
      </div>
    </main>
  );
}
