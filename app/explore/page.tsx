import { getRankedPosts } from "@/lib/feed/ranking";
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
    posts = await getRankedPosts(30, 0, category);
  } catch {
    // DB not connected
  }

  // Filter by search query if provided
  const filtered = q
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q.toLowerCase()) ||
          p.content.toLowerCase().includes(q.toLowerCase())
      )
    : posts;

  return (
    <div
      className="container-news animate-fade-in"
      style={{ paddingTop: "2rem", paddingBottom: "4rem" }}
    >
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
        }}
      >
        Explore
      </h1>
      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--text-tertiary)",
          marginBottom: "1.5rem",
        }}
      >
        Discover stories from across campus
      </p>

      {/* Search */}
      <form
        style={{ marginBottom: "1.5rem" }}
      >
        <input
          name="q"
          type="search"
          className="input"
          placeholder="Search posts..."
          defaultValue={q || ""}
          style={{ maxWidth: 400 }}
        />
        {category !== "all" && (
          <input type="hidden" name="category" value={category} />
        )}
      </form>

      {/* Category Filter */}
      <div
        style={{
          display: "flex",
          gap: "0.375rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/explore${cat.value === "all" ? "" : `?category=${cat.value}`}`}
            className={`btn btn-sm ${
              category === cat.value ||
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
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            color: "var(--text-tertiary)",
          }}
        >
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}><Search size={48} /></div>
          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
              color: "var(--text-secondary)",
            }}
          >
            No posts found
          </h3>
          <p style={{ fontSize: "0.875rem" }}>
            {q
              ? `No results for "${q}"`
              : "No posts in this category yet. Be the first to share!"}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
          className="stagger-children"
        >
          {filtered.map((post) => (
            <ArticleCard key={post.id} post={post} size="medium" />
          ))}
        </div>
      )}
    </div>
  );
}
