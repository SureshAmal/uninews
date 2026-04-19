"use client";

import Link from "next/link";
import { FollowButton } from "@/components/user/follow-button";

interface UserListItem {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isFollowing: boolean;
}

interface UserListProps {
  users: UserListItem[];
  currentUserId?: string;
}

export function UserList({ users, currentUserId }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="review-empty-state">
        No users found.
      </div>
    );
  }

  return (
    <div className="user-list-grid">
      {users.map((user) => (
        <div key={user.id} className="user-list-item">
          <Link href={`/profile/${user.username}`}>
            <div className="user-item-avatar">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                (user.displayName || user.username)[0].toUpperCase()
              )}
            </div>
          </Link>

          <div className="user-item-content">
            <Link
              href={`/profile/${user.username}`}
              className="user-item-link"
            >
              <h3 className="user-item-name">
                {user.displayName || user.username}
              </h3>
              <p className="user-item-handle">
                @{user.username}
              </p>
              {user.bio && (
                <p className="user-item-bio">
                  {user.bio}
                </p>
              )}
            </Link>
          </div>

          {currentUserId !== user.id && (
            <FollowButton targetUserId={user.id} isFollowing={user.isFollowing} />
          )}
        </div>
      ))}
    </div>
  );
}
