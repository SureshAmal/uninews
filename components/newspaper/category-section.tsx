import type { RankedPost } from "@/lib/feed/ranking";
import { ArticleCard } from "./article-card";

interface CategorySectionProps {
  title: string;
  posts: RankedPost[];
}

export function CategorySection({ title, posts }: CategorySectionProps) {
  if (posts.length === 0) return null;

  return (
    <section style={{ marginTop: "2rem" }}>
      <div className="section-divider">{title}</div>
      <div
        className="newspaper-columns"
        style={{ columnCount: Math.min(posts.length, 3) }}
      >
        {posts.map((post) => (
          <div key={post.id} className="column-break-avoid" style={{ marginBottom: "1.5rem" }}>
            <ArticleCard post={post} size="medium" />
          </div>
        ))}
      </div>
    </section>
  );
}
