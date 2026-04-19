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
    <div className="container-news pt-8 pb-16">
      <BackButton />
      
      <div className="animate-fade-in max-w-[740px] mx-auto mt-8">
        <h1 className="font-heading text-[2rem] font-bold mb-2">
          Edit Post
        </h1>
        <p className="text-[0.875rem] text-tertiary mb-8">
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
