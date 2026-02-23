import type { userProfile, seuranta, UserSearchResult } from '@xcomrade/types-server';
import { useState } from 'react';

/*
  - UserCard --> User profile summary card
  - ProfileHeader --> Profile page header with avatar, bio, stats
  - FollowButton --> Follow/unfollow functionality (seuranta)
  - UserList --> Display list of users (followers/following/search)
*/

interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

interface UserCardProps {
  user: userProfile;
  stats?: UserStats;
  onUserClick?: (userId: number) => void;
}

const UserCard = ({ user, stats, onUserClick }: UserCardProps) => {
  return (
    <div className="user-card" onClick={() => onUserClick?.(user.id)}>
      <img
        src={user.profile_picture_url || '/default-avatar.png'}
        alt={user.käyttäjäTunnus}
        className="user-card-avatar"
      />
      <div className="user-card-info">
        <h4>{user.etunimi} {user.sukunimi}</h4>
        <p className="username">@{user.käyttäjäTunnus}</p>
        {user.location && <p className="location">📍 {user.location}</p>}
        {user.bio && <p className="bio">{user.bio}</p>}
        {stats && (
          <div className="user-stats">
            <span>{stats.postsCount} posts</span>
            <span>{stats.followersCount} followers</span>
            <span>{stats.followingCount} following</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface ProfileHeaderProps {
  user: userProfile;
  stats: UserStats;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onEditProfile?: () => void;
  onFollowToggle?: () => void;
}

const ProfileHeader = ({
  user,
  stats,
  isOwnProfile,
  isFollowing,
  onEditProfile,
  onFollowToggle
}: ProfileHeaderProps) => {
  return (
    <div className="profile-header">
      <div className="profile-cover"></div>
      <div className="profile-info">
        <img
          src={user.profile_picture_url || '/default-avatar.png'}
          alt={user.käyttäjäTunnus}
          className="profile-avatar"
        />
        <div className="profile-details">
          <h1>{user.etunimi} {user.sukunimi}</h1>
          <p className="username">@{user.käyttäjäTunnus}</p>
          {user.location && <p className="location">📍 {user.location}</p>}
          {user.bio && <p className="bio">{user.bio}</p>}

          <div className="profile-stats">
            <div className="stat">
              <strong>{stats.postsCount}</strong>
              <span>Posts</span>
            </div>
            <div className="stat">
              <strong>{stats.followersCount}</strong>
              <span>Followers</span>
            </div>
            <div className="stat">
              <strong>{stats.followingCount}</strong>
              <span>Following</span>
            </div>
          </div>

          <div className="profile-actions">
            {isOwnProfile ? (
              <button onClick={onEditProfile}>Edit Profile</button>
            ) : (
              <FollowButton
                isFollowing={isFollowing || false}
                onToggle={onFollowToggle || (() => {})}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface FollowButtonProps {
  isFollowing: boolean;
  onToggle: () => void;
}

const FollowButton = ({ isFollowing, onToggle }: FollowButtonProps) => {
  return (
    <button
      className={`follow-button ${isFollowing ? 'following' : ''}`}
      onClick={onToggle}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};

interface UserListProps {
  users: (userProfile | UserSearchResult)[];
  title?: string;
  onUserClick?: (userId: number) => void;
  emptyMessage?: string;
}

// Type guard to check if a user object has stats (UserSearchResult)
const hasStats = (user: userProfile | UserSearchResult): user is UserSearchResult => {
  return 'postsCount' in user && 'followersCount' in user;
};

const UserList = ({
  users,
  title = 'Users',
  onUserClick,
  emptyMessage = 'No users found'
}: UserListProps) => {
  return (
    <div className="user-list">
      {title && <h3>{title}</h3>}
      {users.length === 0 ? (
        <p className="empty-message">{emptyMessage}</p>
      ) : (
        <div className="users-container">
          {users.map((user) => (
            <div key={user.id} className="user-list-item">
              <img
                src={user.profile_picture_url || '/default-avatar.png'}
                alt={user.käyttäjäTunnus}
                className="user-list-avatar"
              />
              <div className="user-list-info" onClick={() => onUserClick?.(user.id)}>
                <h4>{user.etunimi} {user.sukunimi}</h4>
                <p className="username">@{user.käyttäjäTunnus}</p>
                {user.location && <p className="location">📍 {user.location}</p>}
                {hasStats(user) && (
                  <div className="user-list-stats">
                    <span>{user.postsCount} posts</span>
                    <span>{user.followersCount} followers</span>
                    <span>{user.followingCount} following</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { UserCard, ProfileHeader, FollowButton, UserList };
//export default { UserCard, ProfileHeader, FollowButton, UserList };
