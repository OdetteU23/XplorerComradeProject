import type { userProfile, julkaisuWithRelations } from '@xcomrade/types-server';
import type { UserStats, BuddyRequestWithUser, TravelPlanWithUser } from '../../utilHelpers/types/localTypes';
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ProfileHeader, UserList } from '../components/Profile';
import { PostCard } from '../components/Feeds';
import { BuddyRequestCard } from '../components/TravelPlans';
import { TravelPlanList } from '../components/TravelPlans';
import { api } from '../../utilHelpers/FetchingData';
import { useKäyttäjä } from '../content/käyttänKontentti';
import { useLikeStore } from '../hooks/store';
import { useLikeReducer } from '../hooks/useLikeReducer';
import { useParams, useNavigate } from 'react-router-dom';

const ProfileView = () => {
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const { user: currentUser } = useKäyttäjä();
  const navigate = useNavigate();
  const [user, setUser] = useState<userProfile | null>(null);
  const [userPosts, setUserPosts] = useState<julkaisuWithRelations[]>([]);
  const [userTrips, setUserTrips] = useState<TravelPlanWithUser[]>([]);
  const [stats, setStats] = useState<UserStats>({ postsCount: 0, followersCount: 0, followingCount: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'trips'>('posts');
  const [isLoading, setIsLoading] = useState(true);

  // Determine userId: from URL params or fall back to current user
  const userId = paramUserId ? parseInt(paramUserId, 10) : (currentUser?.id ?? 0);
  const isOwnProfile = !paramUserId || userId === currentUser?.id;

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);

      // Public data — always safe to fetch
      const [profile, posts, userStats, trips] = await Promise.all([
        api.user.getProfile(userId),
        api.post.getUserPosts(userId),
        api.user.getUserStats(userId),
        api.travelPlan.getUserTravelPlans(userId),
      ]);
      setUser(profile);
      setUserPosts(posts);
      setStats(userStats);
      setUserTrips(trips as TravelPlanWithUser[]);

      // Follow status — only fetch when logged in and viewing another user's profile
      if (currentUser && !isOwnProfile) {
        try {
          const followStatus = await api.follow.isFollowing(userId);
          setIsFollowing(Boolean((followStatus as { success?: boolean })?.success));
        } catch {
          // Silently ignore the user with no follow access
          setIsFollowing(false);
        }
      }
    } catch (err) {
      console.error('Load user profile error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate('/settings');
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

  // Like state: useReducer (likeReducer) + Zustand store sync
  const { likeState, toggleLikeOptimistic, confirmLike, revertLike, setPostLikes } = useLikeReducer();
  const likeStore = useLikeStore();

  // Sync post likes into the reducer and Zustand store when posts load
  useEffect(() => {
    userPosts.forEach((p) => {
      setPostLikes(p.id, p.tykkäykset ?? [], currentUser?.id ?? 0);
      likeStore.setLikes(p.id, p.tykkäykset ?? []);
    });
  }, [userPosts]);

  // React Query mutation for like/unlike toggle with optimistic updates
  const profileLikeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: number; isLiked: boolean }) => {
      if (isLiked) {
        return api.like.unlikePost(postId);
      }
      return api.like.likePost(postId);
    },
    onMutate: async ({ postId }) => {
      const uid = currentUser?.id ?? 0;
      toggleLikeOptimistic(postId, uid);
      const alreadyLiked = likeState.likedByUser.has(postId);
      if (alreadyLiked) {
        likeStore.removeLike(postId, uid);
        setUserPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, tykkäykset: p.tykkäykset.filter(l => l.userId !== uid) }
            : p
        ));
      } else {
        const optimisticLike = { id: Date.now(), julkaisuId: postId, userId: uid };
        likeStore.addLike(postId, optimisticLike);
        setUserPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, tykkäykset: [...p.tykkäykset, optimisticLike] }
            : p
        ));
      }
    },
    onSuccess: (_data, { postId }) => {
      confirmLike(postId, { id: Date.now(), julkaisuId: postId, userId: currentUser?.id ?? 0 });
    },
    onError: (_err, { postId }) => {
      const uid = currentUser?.id ?? 0;
      revertLike(postId, uid);
      const wasLiked = likeState.likedByUser.has(postId);
      if (wasLiked) {
        likeStore.removeLike(postId, uid);
        setUserPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, tykkäykset: p.tykkäykset.filter(l => l.userId !== uid) }
            : p
        ));
      } else {
        likeStore.addLike(postId, { id: Date.now(), julkaisuId: postId, userId: uid });
        setUserPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, tykkäykset: [...p.tykkäykset, { id: Date.now(), julkaisuId: postId, userId: uid }] }
            : p
        ));
      }
    },
  });

  const handleLike = (postId: number) => {
    const isLiked = likeState.likedByUser.has(postId);
    profileLikeMutation.mutate({ postId, isLiked });
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

      <div className="flex justify-center gap-3 my-4">
        <button
          className={`px-5 py-2 rounded-full border text-sm transition-all cursor-pointer ${
            activeTab === 'posts'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-transparent text-white/70 border-white/15 hover:bg-white/10'
          }`}
          onClick={() => setActiveTab('posts')}
        >
          Posts ({stats.postsCount})
        </button>
        <button
          className={`px-5 py-2 rounded-full border text-sm transition-all cursor-pointer ${
            activeTab === 'trips'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-transparent text-white/70 border-white/15 hover:bg-white/10'
          }`}
          onClick={() => setActiveTab('trips')}
        >
          Trips ({userTrips.length})
        </button>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4">
        {activeTab === 'posts' ? (
          userPosts.length === 0 ? (
            <p className="empty-message">No posts yet</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-5">
              {userPosts.map((post) => (
                <div key={post.id} className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.85rem)] xl:w-[calc(25%-0.95rem)]">
                  <PostCard
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                  />
                </div>
              ))}
            </div>
          )
        ) : (
          userTrips.length === 0 ? (
            <p className="empty-message">No travel plans yet</p>
          ) : (
            <TravelPlanList
              plans={userTrips}
              currentUserId={currentUser?.id}
            />
          )
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
  const { user: currentUser } = useKäyttäjä();
  const navigate = useNavigate();
  const userId = currentUser?.id ?? 0;

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
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="following-view">
      <h2>Connections</h2>

      <div className="flex justify-center gap-3 my-4">
        <button
          className={`px-5 py-2 rounded-full border text-sm transition-all cursor-pointer ${
            activeTab === 'followers'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-transparent text-white/70 border-white/15 hover:bg-white/10'
          }`}
          onClick={() => setActiveTab('followers')}
        >
          Followers ({followers.length})
        </button>
        <button
          className={`px-5 py-2 rounded-full border text-sm transition-all cursor-pointer ${
            activeTab === 'following'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-transparent text-white/70 border-white/15 hover:bg-white/10'
          }`}
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
  const [, setIsLoading] = useState(true);
  const { user: currentUser } = useKäyttäjä();
  const navigate = useNavigate();
  const userId = currentUser?.id ?? 0;

  useEffect(() => {
    loadMyTrips();
  }, [userId]);

  const loadMyTrips = async () => {
    try {
      setIsLoading(true);
      const trips = await api.travelPlan.getUserTravelPlans(userId);
      setMyTrips(trips as unknown as TravelPlanWithUser[]);
    } catch (err) {
      console.error('Load my trips error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (planId: number) => {
    const plan = myTrips.find(p => p.id === planId);
    navigate(`/travel-plans/${planId}`, { state: { plan } });
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
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
};

export { FollowingView, ProfileView, BuddyRequestsView, MyTripsView };
