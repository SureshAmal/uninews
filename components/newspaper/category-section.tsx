import type { RankedPost } from "@/lib/feed/ranking";
import { ArticleCard } from "./article-card";

interface CategorySectionProps {
  title: string;
  posts: RankedPost[];
}

export function CategorySection({ title, posts }: CategorySectionProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="section-divider">{title}</div>
      <div
        className="newspaper-columns"
        style={{ columnCount: Math.min(posts.length, 3) } as React.CSSProperties}
      >
        {posts.map((post) => (
          <div key={post.id} className="column-break-avoid mb-6">
            <ArticleCard post={post} size="medium" />
          </div>
        ))}
      </div>
    </section>
  );
}
