"use client";

import { useState, useTransition } from "react";
import { toggleFollow } from "@/app/actions/users";

export function FollowButton({
  targetUserId,
  isFollowing: initial,
}: {
  targetUserId: string;
  isFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initial);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    setFollowing(!following);
    startTransition(async () => {
      await toggleFollow(targetUserId);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`btn btn-sm ${following ? "btn-secondary" : "btn-primary"}`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
