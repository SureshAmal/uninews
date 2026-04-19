import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserProfile } from "@/app/actions/users";
import { getCurrentUser } from "@/lib/auth/session";
import { FollowButton } from "@/components/user/follow-button";
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
    <div className="container-news animate-fade-in pt-8 pb-16">
      <BackButton />
      {/* Profile Header */}
      <div className="flex gap-8 items-start mb-10 flex-wrap">
        {/* Avatar */}
        <div className="avatar avatar-xl text-4xl w-[100px] h-[100px] border-[3px] border-divider">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            (profile.displayName || profile.username)[0].toUpperCase()
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-4 mb-2 flex-wrap">
            <h1 className="font-heading text-[1.75rem] font-bold">
              {profile.displayName || profile.username}
            </h1>
            {isOwnProfile ? (
              <Link
                href="/profile/edit"
                className="btn btn-secondary btn-sm"
              >
                <Settings size={16} className="inline mr-1" /> Edit Profile
              </Link>
            ) : currentUser ? (
              <FollowButton
                targetUserId={profile.id}
                isFollowing={profile.isFollowing}
              />
            ) : null}
          </div>

          <p className="text-[0.9375rem] text-tertiary mb-3">
            @{profile.username}
            {profile.collegeYears && (
              <span> · Year {profile.collegeYears}</span>
            )}
          </p>

          {profile.bio && (
            <p className="text-[0.9375rem] text-secondary mb-4 max-w-[500px]">
              {profile.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex gap-6 text-[0.875rem]">
            <div>
              <strong className="text-primary">
                {profile.postCount}
              </strong>{" "}
              <span className="text-tertiary">posts</span>
            </div>
            <Link
              href={`/profile/${profile.username}/social?tab=followers`}
              className="hover-underline !no-underline !text-inherit cursor-pointer"
            >
              <strong className="text-primary">
                {profile.followerCount}
              </strong>{" "}
              <span className="text-tertiary">followers</span>
            </Link>
            <Link
              href={`/profile/${profile.username}/social?tab=following`}
              className="hover-underline !no-underline !text-inherit cursor-pointer"
            >
              <strong className="text-primary">
                {profile.followingCount}
              </strong>{" "}
              <span className="text-tertiary">following</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="section-divider">Posts</div>

      {displayPosts.length === 0 ? (
        <div className="text-center p-12 text-tertiary">
          <p>No posts yet.</p>
          {isOwnProfile && (
            <Link
              href="/create"
              className="btn btn-primary mt-4"
            >
              <PenLine size={16} className="inline mr-1" /> Write your first post
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 stagger-children">
          {displayPosts.map((post) => (
            <ArticleCard key={post.id} post={post} size="medium" />
          ))}
        </div>
      )}
    </div>
  );
}
