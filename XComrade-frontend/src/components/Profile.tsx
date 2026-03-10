import type { userProfile, UserSearchResult } from '@xcomrade/types-server';
//import { useState } from 'react';
import { GrLocationPin } from 'react-icons/gr';
import { DEFAULT_AVATAR_SM as DEFAULT_AVATAR } from '../../utilHelpers/constants';
import type { UserStats, UserCardProps  } from '../../utilHelpers/types/localTypes';

/*
  - UserCard --> User profile summary card
  - ProfileHeader --> Profile page header with avatar, bio, stats
  - FollowButton --> Follow/unfollow functionality (seuranta)
  - UserList --> Display list of users (followers/following/search)
*/


const UserCard = ({ user, stats, onUserClick }: UserCardProps) => {
  return (
    <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer" onClick={() => onUserClick?.(user.id)}>
      <img
        src={user.profile_picture_url || DEFAULT_AVATAR}
        alt={user.käyttäjäTunnus}
        className="h-14 w-14 rounded-full object-cover border-2 border-white/20"
      />
      <div>
        <h4 className="text-sm font-semibold text-white">{user.etunimi} {user.sukunimi}</h4>
        <p className="text-xs text-white/60">@{user.käyttäjäTunnus}</p>
        {user.location && <p className="text-xs text-white/50 flex items-center justify-center gap-1 mt-1"><GrLocationPin className="text-[10px]" /> {user.location}</p>}
        {user.bio && <p className="text-xs text-white/40 mt-1 line-clamp-2">{user.bio}</p>}
        {stats && (
          <div className="flex gap-3 justify-center mt-2 text-xs text-white/50">
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
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      <div className="h-28 bg-gradient-to-r from-indigo-600/30 to-purple-600/30"></div>
      <div className="flex flex-col items-center -mt-12 pb-6 px-6">
        <img
          src={user.profile_picture_url || DEFAULT_AVATAR}
          alt={user.käyttäjäTunnus}
          className="h-24 w-24 rounded-full object-cover border-4 border-stone-800"
        />
        <div className="text-center mt-3">
          <h1 className="text-xl font-bold text-white">{user.etunimi} {user.sukunimi}</h1>
          <p className="text-sm text-white/60">@{user.käyttäjäTunnus}</p>
          {user.location && <p className="text-sm text-white/50 flex items-center justify-center gap-1 mt-1"><GrLocationPin className="text-xs" /> {user.location}</p>}
          {user.bio && <p className="text-sm text-white/40 mt-2 max-w-md">{user.bio}</p>}

          <div className="flex gap-8 justify-center mt-4">
            <div className="text-center">
              <strong className="text-white text-lg">{stats.postsCount}</strong>
              <span className="block text-xs text-white/50">Posts</span>
            </div>
            <div className="text-center">
              <strong className="text-white text-lg">{stats.followersCount}</strong>
              <span className="block text-xs text-white/50">Followers</span>
            </div>
            <div className="text-center">
              <strong className="text-white text-lg">{stats.followingCount}</strong>
              <span className="block text-xs text-white/50">Following</span>
            </div>
          </div>

          <div className="mt-4">
            {isOwnProfile ? (
              <button className="px-5 py-1.5 rounded-full text-sm font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition" onClick={onEditProfile}>Edit Profile</button>
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
    <div>
      {title && <h3 className="text-sm font-semibold text-white/70 mb-3">{title}</h3>}
      {users.length === 0 ? (
        <p className="text-sm text-white/40 text-center py-4">{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
              onClick={() => onUserClick?.(user.id)}
            >
              <img
                src={user.profile_picture_url || DEFAULT_AVATAR}
                alt={user.käyttäjäTunnus}
                className="h-12 w-12 rounded-full object-cover border-2 border-white/20"
              />
              <div>
                <h4 className="text-sm font-semibold text-white">{user.etunimi} {user.sukunimi}</h4>
                <p className="text-xs text-white/60">@{user.käyttäjäTunnus}</p>
                {user.location && <p className="text-xs text-white/50 mt-0.5">📍 {user.location}</p>}
                {hasStats(user) && (
                  <div className="flex flex-wrap gap-2 justify-center mt-1 text-[10px] text-white/40">
                    <span>{user.postsCount} posts</span>
                    <span>{user.followersCount} followers</span>
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
