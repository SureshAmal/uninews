import { NextRequest } from "next/server";
import { getRankedPosts } from "@/lib/feed/ranking";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");
  const category = searchParams.get("category") || undefined;

  try {
    const posts = await getRankedPosts(limit, offset, category);
    return Response.json({ posts, hasMore: posts.length === limit });
  } catch (error) {
    return Response.json({ posts: [], hasMore: false, error: "Database error" });
  }
}
