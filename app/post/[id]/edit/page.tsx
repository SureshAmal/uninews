import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { EditPostForm } from "./edit-form";
import { BackButton } from "@/components/layout/back-button";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!post) notFound();
  if (post.authorId !== user.userId) redirect("/");

  return (
    <div className="container-news" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <BackButton />
      
      <div 
        className="animate-fade-in" 
        style={{ maxWidth: 740, margin: "2rem auto 0 auto" }}
      >
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          Edit Post
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-tertiary)",
            marginBottom: "2rem",
          }}
        >
          Update your story
        </p>

        <EditPostForm
          post={{
            id: post.id,
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            category: post.category,
            tags: post.tags,
            coverImageUrl: post.coverImageUrl,
            mediaUrls: post.mediaUrls,
          }}
        />
      </div>
    </div>
  );
}
