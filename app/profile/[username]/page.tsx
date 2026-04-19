import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserProfile } from "@/app/actions/users";
import { getCurrentUser } from "@/lib/auth/session";
import { FollowButton } from "./follow-button";
import { ArticleCard } from "@/components/newspaper/article-card";
import { BackButton } from "@/components/layout/back-button";
import type { RankedPost } from "@/lib/feed/ranking";
import { Settings, PenLine } from "lucide-react";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getUserProfile(username);
  if (!profile) notFound();

  const currentUser = await getCurrentUser();
  const isOwnProfile = currentUser?.userId === profile.id;

  // Map posts to RankedPost-like shape for ArticleCard
  const displayPosts: RankedPost[] = profile.posts.map((p) => ({
    ...p,
    author: {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    },
    likeCount: 0,
    saveCount: 0,
    repostCount: 0,
    score: 0,
  }));

  return (
    <div
      className="container-news animate-fade-in"
      style={{ paddingTop: "2rem", paddingBottom: "4rem" }}
    >
      <BackButton />
      {/* Profile Header */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          alignItems: "flex-start",
          marginBottom: "2.5rem",
          flexWrap: "wrap",
        }}
      >
        {/* Avatar */}
        <div
          className="avatar avatar-xl"
          style={{
            fontSize: "2.5rem",
            width: 100,
            height: 100,
            border: "3px solid var(--border-color)",
          }}
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            (profile.displayName || profile.username)[0].toUpperCase()
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.75rem",
                fontWeight: 700,
              }}
            >
              {profile.displayName || profile.username}
            </h1>
            {isOwnProfile ? (
              <Link
                href="/profile/edit"
                className="btn btn-secondary btn-sm"
              >
                <Settings size={16} style={{ display: "inline", marginRight: "0.25rem" }} /> Edit Profile
              </Link>
            ) : currentUser ? (
              <FollowButton
                targetUserId={profile.id}
                isFollowing={profile.isFollowing}
              />
            ) : null}
          </div>

          <p
            style={{
              fontSize: "0.9375rem",
              color: "var(--text-tertiary)",
              marginBottom: "0.75rem",
            }}
          >
            @{profile.username}
            {profile.collegeYears && (
              <span> · Year {profile.collegeYears}</span>
            )}
          </p>

          {profile.bio && (
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--text-secondary)",
                marginBottom: "1rem",
                maxWidth: 500,
              }}
            >
              {profile.bio}
            </p>
          )}

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              fontSize: "0.875rem",
            }}
          >
            <div>
              <strong style={{ color: "var(--text-primary)" }}>
                {profile.postCount}
              </strong>{" "}
              <span style={{ color: "var(--text-tertiary)" }}>posts</span>
            </div>
            <Link
              href={`/profile/${profile.username}/social?tab=followers`}
              className="hover-underline"
              style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
            >
              <strong style={{ color: "var(--text-primary)" }}>
                {profile.followerCount}
              </strong>{" "}
              <span style={{ color: "var(--text-tertiary)" }}>followers</span>
            </Link>
            <Link
              href={`/profile/${profile.username}/social?tab=following`}
              className="hover-underline"
              style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
            >
              <strong style={{ color: "var(--text-primary)" }}>
                {profile.followingCount}
              </strong>{" "}
              <span style={{ color: "var(--text-tertiary)" }}>following</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="section-divider">Posts</div>

      {displayPosts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "var(--text-tertiary)",
          }}
        >
          <p>No posts yet.</p>
          {isOwnProfile && (
            <Link
              href="/create"
              className="btn btn-primary"
              style={{ marginTop: "1rem" }}
            >
              <PenLine size={16} style={{ display: "inline", marginRight: "0.25rem" }} /> Write your first post
            </Link>
          )}
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
          {displayPosts.map((post) => (
            <ArticleCard key={post.id} post={post} size="medium" />
          ))}
        </div>
      )}
    </div>
  );
}
