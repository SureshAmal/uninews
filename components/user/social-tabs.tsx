"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface SocialTabsProps {
  username: string;
  followerCount: number;
  followingCount: number;
}

export function SocialTabs({ username, followerCount, followingCount }: SocialTabsProps) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "followers";

  const tabs = [
    { key: "followers", label: "Followers", count: followerCount },
    { key: "following", label: "Following", count: followingCount },
  ];

  return (
    <div className="social-tabs-nav">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;
        return (
          <Link
            key={tab.key}
            href={`/profile/${username}/social?tab=${tab.key}`}
            className={`social-tab-link ${isActive ? "active" : ""}`}
          >
            {tab.label}
            <span className="social-tab-count">
              {tab.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
