import type { julkaisuWithRelations, userProfile, UserSearchResult } from '@xcomrade/types-server';
import { useState, useEffect, useReducer } from 'react';
import { FeedList } from '../components/Feeds';
import { SearchBar } from '../components/Forms';
import { UserList } from '../components/Profile';
import PublicViewPrompt from '../components/publicViewPromp';
import { useKäyttäjä } from '../content/käyttänKontentti';
import { api } from '../../utilHelpers/FetchingData';

// ---- useReducer for HomeView ----
interface HomeState {
  posts: julkaisuWithRelations[];
  randomPosts: julkaisuWithRelations[];
  suggestedUsers: userProfile[];
  isLoading: boolean;
  error: string | null;
}

type HomeAction =
  | { type: 'FEED_LOADING' }
  | { type: 'FEED_SUCCESS'; payload: julkaisuWithRelations[] }
  | { type: 'FEED_ERROR'; payload: string }
  | { type: 'SET_RANDOM_POSTS'; payload: julkaisuWithRelations[] }
  | { type: 'SET_SUGGESTED_USERS'; payload: userProfile[] }
  | { type: 'UPDATE_POST'; payload: julkaisuWithRelations };

const homeInitialState: HomeState = {
  posts: [],
  randomPosts: [],
  suggestedUsers: [],
  isLoading: true,
  error: null,
};

function homeReducer(state: HomeState, action: HomeAction): HomeState {
  switch (action.type) {
    case 'FEED_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'FEED_SUCCESS':
      return { ...state, isLoading: false, posts: action.payload };
    case 'FEED_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'SET_RANDOM_POSTS':
      return { ...state, randomPosts: action.payload };
    case 'SET_SUGGESTED_USERS':
      return { ...state, suggestedUsers: action.payload };
    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map(p => p.id === action.payload.id ? action.payload : p),
      };
    default:
      return state;
  }
}

const GUEST_CONTENT_LIMIT = 5;

const HomeView = () => {
  const [state, dispatch] = useReducer(homeReducer, homeInitialState);
  const { posts, randomPosts, suggestedUsers, isLoading, error } = state;
  const { isAuthenticated } = useKäyttäjä();

  // Apply content limit for unauthenticated users
  const visiblePosts = isAuthenticated ? posts : posts.slice(0, GUEST_CONTENT_LIMIT);
  const visibleRandomPosts = isAuthenticated ? randomPosts : randomPosts.slice(0, GUEST_CONTENT_LIMIT);
  const visibleSuggestedUsers = isAuthenticated ? suggestedUsers : suggestedUsers.slice(0, GUEST_CONTENT_LIMIT);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      dispatch({ type: 'FEED_LOADING' });
      const feedData = await api.post.getFeed();
      dispatch({ type: 'FEED_SUCCESS', payload: feedData });
    } catch (err) {
      dispatch({ type: 'FEED_ERROR', payload: 'Failed to load feed' });
      console.error('Feed error:', err);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await api.like.likePost(postId);
      // Update the post in the local state
      const post = posts.find(p => p.id === postId);
      if (post) {
        dispatch({
          type: 'UPDATE_POST',
          payload: { ...post, tykkäykset: [...post.tykkäykset, { id: Date.now(), julkaisuId: postId, userId: 0 }] },
        });
      }
    } catch (err) {
      console.error('Like error:', err);
      alert('Failed to like post');
    }
  };

  const handleComment = async (postId: number, comment: string) => {
    try {
      const newComment = await api.comment.addComment(postId, comment);
      // Update the post in the local state
      const post = posts.find(p => p.id === postId);
      if (post) {
        dispatch({
          type: 'UPDATE_POST',
          payload: { ...post, kommentit: [...post.kommentit, newComment as any] },
        });
      }
    } catch (err) {
      console.error('Comment error:', err);
      alert('Failed to add comment');
    }
  };

  // Random posts from different users
  useEffect(() => {
    loadRandomPosts();
  }, []);

  const loadRandomPosts = async () => {
    try {
      const randomData = await api.randomPost.getRandomPosts();
      dispatch({ type: 'SET_RANDOM_POSTS', payload: randomData });
    } catch (err) {
      console.error('Random posts error:', err);
    }
  };

  // Random suggestions for user to see/follow the users/content creators and their content
  useEffect(() => {
    loadSuggestedUsers();
  }, []);

  const loadSuggestedUsers = async () => {
    try {
      const suggestedData = await api.randomUser.getRandomUsers();
      dispatch({ type: 'SET_SUGGESTED_USERS', payload: suggestedData });
    } catch (err) {
      console.error('Suggested users error:', err);
    }
  };

  // if the user hasn't followed anyone yet
  // and the feed is empty. This will be implemented in the future when the follow system is implemented.
  // For now, we can just show a message that the feed is empty and suggest the user to follow some users
  // to see their posts in the feed.

  if (isLoading) {
    return (
      <div className="home-layout">
        <p>Loading feed...</p>
      </div>
    );
  }

  return (
    <div className="home-layout">

      {error && <div className="error-alert"><p>⚠️ {error}</p></div>}

      {/* LEFT: Main feed from followed users */}
      <div className="main-feed">
        {visiblePosts.length === 0 ? (
          <p>You are not following anyone yet. Discover users on the right!</p>
        ) : (
          <FeedList
            posts={visiblePosts}
            onLike={handleLike}
            onComment={handleComment}
          />
        )}
        {!isAuthenticated && posts.length > GUEST_CONTENT_LIMIT && (
          <PublicViewPrompt message="Sign in to see more travel posts from people you follow!" />
        )}
      </div>

      {/* RIGHT: Discovery sidebar */}
      <div className="discover-sidebar">

        {/* Suggested users to follow */}
        <section>
          <h3>People you might like</h3>
          <UserList
            users={visibleSuggestedUsers}
            title="Suggested Users"
            emptyMessage="No suggestions available."
          />
        </section>

        {/* Random posts from unfollowed users */}
        <section>
          <h3>Explore posts</h3>
          <FeedList
            posts={visibleRandomPosts}
            onLike={handleLike}
            onComment={handleComment}
          />
          {!isAuthenticated && randomPosts.length > GUEST_CONTENT_LIMIT && (
            <PublicViewPrompt message="Sign in to discover more travel experiences!" />
          )}
        </section>

      </div>
    </div>
  );
};

const SearchView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    users: UserSearchResult[];
    posts: julkaisuWithRelations[];
  }>({ users: [], posts: [] });
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults({ users: [], posts: [] });
      return;
    }

    setIsSearching(true);
    try {
      const [users, posts] = await Promise.all([
        api.user.searchUsers(query),
        api.post.searchPosts(query),
      ]);
      setSearchResults({ users, posts });
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="search-view">
      <h2>Discover</h2>
      <SearchBar
        onSearch={handleSearch}
        placeholder="Search users and destinations..."
      />

      <div className="search-tabs">
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={activeTab === 'posts' ? 'active' : ''}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
      </div>

      <div className="search-results">
        {isSearching ? (
          <p>Searching...</p>
        ) : activeTab === 'users' ? (
          <UserList
            users={searchResults.users}
            title="Users"
            emptyMessage={searchQuery ? "No users found. Try a different search." : "Start searching for users"}
          />
        ) : (
          <div className="posts-results">
            {searchResults.posts.length === 0 ? (
              <p>{searchQuery ? "No posts found. Try a different search." : "Start searching for posts"}</p>
            ) : (
              <FeedList
                posts={searchResults.posts}
                onLike={async (id) => {
                  try {
                    await api.like.likePost(id);
                  } catch (err) {
                    console.error('Like error:', err);
                  }
                }}
                onComment={async (id, comment) => {
                  try {
                    await api.comment.addComment(id, comment);
                  } catch (err) {
                    console.error('Comment error:', err);
                  }
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ExploreView = () => {
  const [trendingPosts, setTrendingPosts] = useState<julkaisuWithRelations[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useKäyttäjä();

  // Apply content limit for unauthenticated users
  const visibleTrendingPosts = isAuthenticated ? trendingPosts : trendingPosts.slice(0, GUEST_CONTENT_LIMIT);
  const visibleDestinations = isAuthenticated ? popularDestinations : popularDestinations.slice(0, GUEST_CONTENT_LIMIT);

  useEffect(() => {
    loadTrendingContent();
  }, []);

  const loadTrendingContent = async () => {
    try {
      setIsLoading(true);
      const trending = await api.post.getTrendingPosts();
      setTrendingPosts(trending);
      // Extract popular destinations from trending posts
      const destinations = trending
        .map(post => post.kohde)
        .filter((value, index, self) => self.indexOf(value) === index)
        .slice(0, 10);
      setPopularDestinations(destinations);
    } catch (err) {
      console.error('Trending content error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="explore-view">
      <h2>Explore</h2>

      {isLoading ? (
        <p>Loading trending content...</p>
      ) : (
        <>
          <section className="popular-destinations">
            <h3>🔥 Popular Destinations</h3>
            {visibleDestinations.length === 0 ? (
              <p>No trending destinations at the moment.</p>
            ) : (
              <div className="destination-chips">
                {visibleDestinations.map((destination, index) => (
                  <span key={index} className="destination-chip">
                    📍 {destination}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="trending-posts">
            <h3>⭐ Trending Travel Experiences</h3>
            {visibleTrendingPosts.length === 0 ? (
              <p>No trending posts at the moment.</p>
            ) : (
              <FeedList
                posts={visibleTrendingPosts}
                onLike={async (id) => {
                  try {
                    await api.like.likePost(id);
                    loadTrendingContent();
                  } catch (err) {
                    console.error('Like error:', err);
                  }
                }}
                onComment={async (id, comment) => {
                  try {
                    await api.comment.addComment(id, comment);
                    loadTrendingContent();
                  } catch (err) {
                    console.error('Comment error:', err);
                  }
                }}
              />
            )}
            {!isAuthenticated && trendingPosts.length > GUEST_CONTENT_LIMIT && (
              <PublicViewPrompt message="Sign in to explore all trending travel content!" />
            )}
          </section>
        </>
      )}
    </div>
  );
};

const SettingsView = () => {
  const [userProfile, setUserProfile] = useState<userProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      setIsLoading(true);
      const user = await api.auth.getCurrentUser();
      setUserProfile(user);
    } catch (err) {
      console.error('Load user error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (updates: Partial<userProfile>) => {
    if (!userProfile) return;

    try {
      const updated = await api.user.updateProfile(userProfile.id, updates);
      setUserProfile(updated);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="settings-view">
      <h2>Account Settings</h2>

      <section className="profile-settings">
        <h3>Profile Information</h3>
        {isLoading ? (
          <p>Loading...</p>
        ) : userProfile ? (
          <div className="settings-form">
            <div className="form-group">
              <label>Username</label>
              <p>@{userProfile.käyttäjäTunnus}</p>
            </div>
            <div className="form-group">
              <label>Name</label>
              <p>{userProfile.etunimi} {userProfile.sukunimi}</p>
            </div>
            <div className="form-group">
              <label>Email</label>
              <p>{userProfile.sahkoposti}</p>
            </div>
            <div className="form-group">
              <label>Location</label>
              <p>{userProfile.location || 'Not specified'}</p>
            </div>
            <div className="form-group">
              <label>Bio</label>
              <p>{userProfile.bio || 'No bio yet'}</p>
            </div>
            <button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        ) : (
          <p>Failed to load profile</p>
        )}
      </section>

      <section className="account-settings">
        <h3>Privacy & Security</h3>
        <button>Change Password</button>
        <button>Privacy Settings</button>
      </section>

      <section className="notification-settings">
        <h3>Notifications</h3>
        <label>
          <input type="checkbox" defaultChecked />
          Email notifications
        </label>
        <label>
          <input type="checkbox" defaultChecked />
          Push notifications
        </label>
      </section>
    </div>
  );
};

export { HomeView, SearchView, ExploreView, SettingsView };
