import type { userProfile, julkaisuWithRelations, friendRequest, matkaAikeet } from '@xplorercomrade/types-server';
import type { UserStats, BuddyRequestWithUser, TravelPlanWithUser } from '../../utilHelpers/types/localTypes';
import { useState, useEffect } from 'react';
import { ProfileHeader, UserList } from '../components/Profile';
import { FeedList } from '../components/Feeds';
import { BuddyRequestCard } from '../components/TravelPlans';
import { TravelPlanList } from '../components/TravelPlans';
import { api } from '../../utilHelpers/FetchingData';
import { useKäyttäjä } from '../content/käyttänKontentti';

const ProfileView = () => {
  const [user, setUser] = useState<userProfile | null>(null);
  const [userPosts, setUserPosts] = useState<julkaisuWithRelations[]>([]);
  const [stats, setStats] = useState<UserStats>({ postsCount: 0, followersCount: 0, followingCount: 0 });
  const [isOwnProfile] = useState(true); // TODO: Determine from route params and auth
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'trips'>('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [userId] = useState(1); // TODO: Get from route params or auth

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const [profile, posts, userStats, followStatus] = await Promise.all([
        api.user.getProfile(userId),
        api.post.getUserPosts(userId),
        api.user.getUserStats(userId),
        api.follow.isFollowing(userId),
      ]);
      setUser(profile);
      setUserPosts(posts);
      setStats(userStats);
      setIsFollowing(Boolean((followStatus as { success?: boolean })?.success));
    } catch (err) {
      console.error('Load user profile error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    console.log('Edit profile');
    // TODO: Navigate to edit profile page
  };

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await api.follow.unfollowUser(userId);
      } else {
        await api.follow.followUser(userId);
      }
      setIsFollowing(!isFollowing);
      // Refresh stats
      const newStats = await api.user.getUserStats(userId);
      setStats(newStats);
    } catch (err) {
      console.error('Follow toggle error:', err);
      alert('Failed to update follow status');
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await api.like.likePost(postId);
      // Update posts
      setUserPosts(userPosts.map(post =>
        post.id === postId
          ? { ...post, tykkäykset: [...post.tykkäykset, { id: Date.now(), julkaisuId: postId, userId: 0 }] }
          : post
      ));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleComment = async (postId: number, comment: string) => {
    try {
      const newComment = await api.comment.addComment(postId, comment);
      setUserPosts(userPosts.map(post =>
        post.id === postId
          ? { ...post, kommentit: [...post.kommentit, newComment as any] }
          : post
      ));
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  if (isLoading || !user) {
    return <div className="profile-view"><p>Loading profile...</p></div>;
  }

  return (
    <div className="profile-view">
      <ProfileHeader
        user={user}
        stats={stats}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onEditProfile={handleEditProfile}
        onFollowToggle={handleFollowToggle}
      />

      <div className="profile-tabs">
        <button
          className={activeTab === 'posts' ? 'active' : ''}
          onClick={() => setActiveTab('posts')}
        >
          Posts ({stats.postsCount})
        </button>
        <button
          className={activeTab === 'trips' ? 'active' : ''}
          onClick={() => setActiveTab('trips')}
        >
          Trips
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'posts' ? (
          userPosts.length === 0 ? (
            <p className="empty-message">No posts yet</p>
          ) : (
            <FeedList
              posts={userPosts}
              onLike={handleLike}
              onComment={handleComment}
            />
          )
        ) : (
          <p className="empty-message">Trips section coming soon</p>
        )}
      </div>
    </div>
  );
};

const FollowingView = () => {
  const [followers, setFollowers] = useState<userProfile[]>([]);
  const [following, setFollowing] = useState<userProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [isLoading, setIsLoading] = useState(true);
  const [userId] = useState(1); // TODO: Get from auth

  useEffect(() => {
    loadConnections();
  }, [userId]);

  const loadConnections = async () => {
    try {
      setIsLoading(true);
      const [followersList, followingList] = await Promise.all([
        api.follow.getFollowers(userId),
        api.follow.getFollowing(userId),
      ]);
      setFollowers(followersList);
      setFollowing(followingList);
    } catch (err) {
      console.error('Load connections error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (userId: number) => {
    console.log('Navigate to user profile:', userId);
    // TODO: Navigate to user profile
  };

  return (
    <div className="following-view">
      <h2>Connections</h2>

      <div className="following-tabs">
        <button
          className={activeTab === 'followers' ? 'active' : ''}
          onClick={() => setActiveTab('followers')}
        >
          Followers ({followers.length})
        </button>
        <button
          className={activeTab === 'following' ? 'active' : ''}
          onClick={() => setActiveTab('following')}
        >
          Following ({following.length})
        </button>
      </div>

      <div className="following-content">
        {isLoading ? (
          <p>Loading connections...</p>
        ) : activeTab === 'followers' ? (
          <UserList
            users={followers}
            title="Followers"
            onUserClick={handleUserClick}
            emptyMessage="No followers yet"
          />
        ) : (
          <UserList
            users={following}
            title="Following"
            onUserClick={handleUserClick}
            emptyMessage="Not following anyone yet"
          />
        )}
      </div>
    </div>
  );
};

const BuddyRequestsView = () => {
  const [requests, setRequests] = useState<BuddyRequestWithUser[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBuddyRequests();
  }, []);

  const loadBuddyRequests = async () => {
    try {
      setIsLoading(true);
      const reqs = await api.buddyRequest.getBuddyRequests();
      setRequests(reqs as unknown as BuddyRequestWithUser[]);
    } catch (err) {
      console.error('Load buddy requests error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (requestId: number) => {
    try {
      await api.buddyRequest.acceptBuddyRequest(requestId);
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r));
    } catch (err) {
      console.error('Accept request error:', err);
      alert('Failed to accept request');
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await api.buddyRequest.rejectBuddyRequest(requestId);
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
    } catch (err) {
      console.error('Reject request error:', err);
      alert('Failed to reject request');
    }
  };

  const filteredRequests = activeFilter === 'all'
    ? requests
    : requests.filter(r => r.status === activeFilter);

  return (
    <div className="buddy-requests-view">
      <h2>Travel Buddy Requests</h2>

      <div className="request-filters">
        <button
          className={activeFilter === 'all' ? 'active' : ''}
          onClick={() => setActiveFilter('all')}
        >
          All ({requests.length})
        </button>
        <button
          className={activeFilter === 'pending' ? 'active' : ''}
          onClick={() => setActiveFilter('pending')}
        >
          Pending ({requests.filter(r => r.status === 'pending').length})
        </button>
        <button
          className={activeFilter === 'accepted' ? 'active' : ''}
          onClick={() => setActiveFilter('accepted')}
        >
          Accepted
        </button>
        <button
          className={activeFilter === 'rejected' ? 'active' : ''}
          onClick={() => setActiveFilter('rejected')}
        >
          Rejected
        </button>
      </div>

      <div className="requests-list">
        {isLoading ? (
          <p>Loading requests...</p>
        ) : filteredRequests.length === 0 ? (
          <p className="empty-message">No {activeFilter === 'all' ? '' : activeFilter} requests</p>
        ) : (
          filteredRequests.map((request) => (
            <BuddyRequestCard
              key={request.id}
              request={request}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))
        )}
      </div>
    </div>
  );
};

const MyTripsView = () => {
  const [myTrips, setMyTrips] = useState<TravelPlanWithUser[]>([]);
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [userId] = useState(1); // TODO: Get from auth

  useEffect(() => {
    loadMyTrips();
  }, [userId]);

  const loadMyTrips = async () => {
    try {
      setIsLoading(true);
      const trips = await api.travelPlan.getTravelPlans();
      // Filter for user's trips (assuming API returns all or we need to filter)
      setMyTrips(trips as unknown as TravelPlanWithUser[]);
    } catch (err) {
      console.error('Load my trips error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestJoin = (planId: number) => {
    console.log('Request to join plan:', planId);
    // TODO: This shouldn't happen on own trips
  };

  const handleViewDetails = (planId: number) => {
    console.log('View trip details:', planId);
    // TODO: Navigate to trip detail view
  };

  const filterTrips = () => {
    const now = new Date();
    switch (activeFilter) {
      case 'upcoming':
        return myTrips.filter(trip => new Date(trip.suunniteltu_alku_pvm) > now);
      case 'past':
        return myTrips.filter(trip => new Date(trip.suunniteltu_loppu_pvm) < now);
      default:
        return myTrips;
    }
  };

  const filteredTrips = filterTrips();

  return (
    <div className="my-trips-view">
      <h2>My Travel Plans</h2>

      <div className="trip-filters">
        <button
          className={activeFilter === 'upcoming' ? 'active' : ''}
          onClick={() => setActiveFilter('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={activeFilter === 'past' ? 'active' : ''}
          onClick={() => setActiveFilter('past')}
        >
          Past
        </button>
        <button
          className={activeFilter === 'all' ? 'active' : ''}
          onClick={() => setActiveFilter('all')}
        >
          All ({myTrips.length})
        </button>
      </div>

      {filteredTrips.length === 0 ? (
        <p className="empty-message">
          No {activeFilter === 'all' ? '' : activeFilter} trips yet. Start planning your next adventure!
        </p>
      ) : (
        <TravelPlanList
          plans={filteredTrips}
          onRequestJoin={handleRequestJoin}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
};

export { FollowingView, ProfileView, BuddyRequestsView, MyTripsView };
