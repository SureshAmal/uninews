// ─── Shared utilities for UniNews ─────────────────────────────

/**
 * Strip HTML tags from string, returning plain text
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Get CSS badge class for a category
 */
export function getCategoryClass(category: string): string {
  const classes: Record<string, string> = {
    campus: "badge-campus",
    academic: "badge-academic",
    sports: "badge-sports",
    events: "badge-events",
    opinion: "badge-opinion",
    clubs: "badge-clubs",
  };
  return classes[category] || "";
}

/**
 * Format a date as relative time (e.g. "2h ago", "3d ago")
 */
export function timeAgo(date: Date | string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Categories available in UniNews
 */
export const CATEGORIES = [
  { value: "campus", label: "Campus" },
  { value: "academic", label: "Academic" },
  { value: "sports", label: "Sports" },
  { value: "events", label: "Events" },
  { value: "opinion", label: "Opinion" },
  { value: "clubs", label: "Clubs" },
] as const;

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value);

export type Category = (typeof CATEGORY_VALUES)[number];
