import type { julkaisuWithRelations, userProfile } from '@xcomrade/types-server';
import { useState, useEffect } from 'react';
import { FeedList } from '../components/Feeds';
import { SearchBar } from '../components/Forms';
import { UserList } from '../components/Profile';
import { api } from '../../utilHelpers/FetchingData';

const HomeView = () => {
  const [posts, setPosts] = useState<julkaisuWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setIsLoading(true);
      const feedData = await api.post.getFeed();
      setPosts(feedData);
    } catch (err) {
      setError('Failed to load feed');
      console.error('Feed error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await api.like.likePost(postId);
      // Update the post in the local state
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, tykkäykset: [...post.tykkäykset, { id: Date.now(), julkaisuId: postId, userId: 0 }] }
          : post
      ));
    } catch (err) {
      console.error('Like error:', err);
      alert('Failed to like post');
    }
  };

  const handleComment = async (postId: number, comment: string) => {
    try {
      const newComment = await api.comment.addComment(postId, comment);
      // Update the post in the local state
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, kommentit: [...post.kommentit, newComment as any] }
          : post
      ));
    } catch (err) {
      console.error('Comment error:', err);
      alert('Failed to add comment');
    }
  };
  //random posts from different users
  const [randomPosts, setRandomPosts] = useState<julkaisuWithRelations[]>([]);

  useEffect(() => {
    loadRandomPosts();
  }, []);

  const loadRandomPosts = async () => {
    try {
      const randomData = await api.randomPost.getRandomPosts();
      setRandomPosts(randomData);
    } catch (err) {
      console.error('Random posts error:', err);
    }
  };
 //Random suggestions for user to see/follow the users/content creators and their content
 const [suggestedUsers, setSuggestedUsers] = useState<userProfile[]>([]);

 useEffect(() => {
   loadSuggestedUsers();
 }, []);

  const loadSuggestedUsers = async () => {
    try {      const suggestedData = await api.randomUser.getRandomUsers();
      setSuggestedUsers(suggestedData);
    }
      catch (err) {
      console.error('Suggested users error:', err);
    }
  };

  // if the user hasn't followed anyone yet
  // and the feed is empty. This will be implemented in the future when the follow system is implemented.
  // For now, we can just show a message that the feed is empty and suggest the user to follow some users
  // to see their posts in the feed.

  return (
    <div className="home-view">
      <h2>Welcome to XplorerComrade!</h2>
      <p>Explore the world with fellow travelers 🌍</p>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadFeed}>Retry</button>
        </div>
      )}

      {isLoading ? (
        <p>Loading feed...</p>
      ) : posts.length === 0 ? (
        <div className="empty-feed">
          <p>No posts yet. Start following users to see their travel experiences!</p>
          <div>
            {/* Todo: Finishing up the random posts and suggested users logic, so that the logic
            is visible in the UI home */}

              {/*Implementing here the logic for a user who hasn't followed anyone yet to view random posts
              from different users and suggest the users/content creators to follow */}

              {randomPosts.length > 0 && (
                <FeedList
                  posts={randomPosts}
                  onLike={handleLike}
                  onComment={handleComment}
                />
              )}
          </div>
          <div>
            {suggestedUsers.length > 0 && (
              <UserList
                users={suggestedUsers}
                title="Suggested Travelers to Follow"
                emptyMessage="No suggestions at the moment. Check back later!"
              />
            )}
          </div>
        </div>

      ) : (
        <FeedList
          posts={posts}
          onLike={handleLike}
          onComment={handleComment}
        />

      )}
    </div>
  );
};

const SearchView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    users: userProfile[];
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
            {popularDestinations.length === 0 ? (
              <p>No trending destinations at the moment.</p>
            ) : (
              <div className="destination-chips">
                {popularDestinations.map((destination, index) => (
                  <span key={index} className="destination-chip">
                    📍 {destination}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="trending-posts">
            <h3>⭐ Trending Travel Experiences</h3>
            {trendingPosts.length === 0 ? (
              <p>No trending posts at the moment.</p>
            ) : (
              <FeedList
                posts={trendingPosts}
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
