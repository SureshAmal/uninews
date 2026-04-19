import { getRankedPosts } from "@/lib/feed/ranking";
import { searchPosts } from "@/app/actions/posts";
import { ArticleCard } from "@/components/newspaper/article-card";
import Link from "next/link";
import { Search } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "campus", label: "Campus" },
  { value: "academic", label: "Academic" },
  { value: "sports", label: "Sports" },
  { value: "events", label: "Events" },
  { value: "opinion", label: "Opinion" },
  { value: "clubs", label: "Clubs" },
];

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category = "all", q } = await searchParams;

  let posts: Awaited<ReturnType<typeof getRankedPosts>> = [];
  try {
    // Use backend search if query exists, otherwise ranked feed
    if (q && q.trim()) {
      posts = await searchPosts(q.trim(), category);
    } else {
      posts = await getRankedPosts(30, 0, category);
    }
  } catch {
    // DB not connected
  }

  return (
    <div className="container-news animate-fade-in pt-8 pb-16">
      <h1 className="font-heading text-[2rem] font-bold mb-2 mt-4">
        Explore
      </h1>
      <p className="text-[0.875rem] text-tertiary mb-6">
        Discover stories from across campus
      </p>

      {/* Search */}
      <form className="mb-6">
        <input
          name="q"
          type="search"
          className="input max-w-[400px]"
          placeholder="Search posts..."
          defaultValue={q || ""}
        />
        {category !== "all" && (
          <input type="hidden" name="category" value={category} />
        )}
      </form>

      {/* Category Filter */}
      <div className="flex gap-1.5 flex-wrap mb-8">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/explore${cat.value === "all" ? "" : `?category=${cat.value}`}${q ? `${cat.value === "all" ? "?" : "&"}q=${encodeURIComponent(q)}` : ""}`}
            className={`btn btn-sm ${category === cat.value ||
                (cat.value === "all" && category === "all")
                ? "btn-primary"
                : "btn-secondary"
              }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Results */}
      {posts.length === 0 ? (
        <div className="text-center py-16 px-8 text-tertiary">
          <div className="mb-4 flex justify-center"><Search size={48} /></div>
          <h3 className="font-heading text-xl font-semibold mb-2 text-secondary">
            No posts found
          </h3>
          <p className="text-[0.875rem]">
            {q
              ? `No results for "${q}"`
              : "No posts in this category yet. Be the first to share!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 stagger-children">
          {posts.map((post) => (
            <ArticleCard key={post.id} post={post} size="medium" />
          ))}
        </div>
      )}
    </div>
  );
}
