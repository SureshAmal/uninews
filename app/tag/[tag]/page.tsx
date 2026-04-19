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
    <main className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="container-news" style={{ paddingTop: "2rem" }}>
        <BackButton />
        
        <header style={{ 
          marginTop: "2rem", 
          marginBottom: "3rem", 
          borderBottom: "4px solid var(--text-primary)",
          paddingBottom: "1rem"
        }}>
          <h1 className="headline-hero" style={{ fontSize: "clamp(2rem, 8vw, 4rem)", marginBottom: "0.5rem", color: "var(--text-primary)" }}>
            Edition: #{decodedTag}
          </h1>
          <p style={{ 
            fontFamily: "var(--font-serif)", 
            fontStyle: "italic", 
            color: "var(--text-secondary)",
            fontSize: "1.2rem"
          }}>
            Discovery through taxonomic curiosity.
          </p>
        </header>

        <NewspaperFeed initialPosts={initialPosts} currentUser={user} tagFilter={decodedTag} />
      </div>
    </main>
  );
}
