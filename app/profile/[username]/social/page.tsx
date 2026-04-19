import { notFound } from "next/navigation";
import { getFollowers, getFollowing, getUserProfile } from "@/app/actions/users";
import { getCurrentUser } from "@/lib/auth/session";
import { UserList } from "@/components/user/user-list";
import { SocialTabs } from "@/components/user/social-tabs";
import { BackButton } from "@/components/layout/back-button";

export default async function SocialPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { username } = await params;
  const { tab = "followers" } = await searchParams;

  // We need basic profile data for counts and names
  const profile = await getUserProfile(username);
  if (!profile) notFound();

  const currentUser = await getCurrentUser();
  
  // Fetch specific list based on tab
  const list = tab === "following" 
    ? await getFollowing(username) 
    : await getFollowers(username);

  return (
    <div className="container-news social-page-wrapper">
      <BackButton label={`Back to @${username}`} />
      
      <h1 className="social-page-title">
        {profile.displayName || profile.username}
      </h1>

      <SocialTabs 
        username={username} 
        followerCount={profile.followerCount} 
        followingCount={profile.followingCount} 
      />

      <div className="animate-fade-in" key={tab} style={{ marginTop: "2rem" }}>
        <UserList users={list || []} currentUserId={currentUser?.userId} />
      </div>
    </div>
  );
}
