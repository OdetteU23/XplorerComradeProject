import type { julkaisuWithRelations, userProfile, UserSearchResult } from '@xcomrade/types-server';
import { useState, useEffect } from 'react';
import { FeedList } from '../components/Feeds';
import { SearchBar } from '../components/Forms';
import { UserList } from '../components/Profile';
import { api } from '../../utilHelpers/FetchingData';
import { useSearchLikes } from './commentsLikes';
import { useNavigate } from 'react-router-dom';

const SearchView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    users: UserSearchResult[];
    posts: julkaisuWithRelations[];
  }>({ users: [], posts: [] });
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('posts');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Default random content shown before any search
  const [defaultUsers, setDefaultUsers] = useState<userProfile[]>([]);
  const [defaultPosts, setDefaultPosts] = useState<julkaisuWithRelations[]>([]);
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(true);


  useEffect(() => {
    const loadDefaults = async () => {
      setIsLoadingDefaults(true);
      try {
        const [users, posts] = await Promise.all([
          api.randomUser.getRandomUsers(20),
          api.randomPost.getRandomPosts(20),
        ]);
        setDefaultUsers(users);
        setDefaultPosts(posts);
      } catch (err) {
        console.error('Failed to load default content:', err);
      } finally {
        setIsLoadingDefaults(false);
      }
    };
    loadDefaults();
  }, []);

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

  // Helper to update a post in whichever list it lives in
  const updatePostInState = (postId: number, updater: (p: julkaisuWithRelations) => julkaisuWithRelations) => {
    setDefaultPosts(prev => prev.map(p => p.id === postId ? updater(p) : p));
    setSearchResults(prev => ({
      ...prev,
      posts: prev.posts.map(p => p.id === postId ? updater(p) : p),
    }));
  };

  // Like hook for search results
  const { searchLikeMutation } = useSearchLikes(updatePostInState);

  // Decide which data to display: search results when searching, defaults otherwise
  const hasQuery = searchQuery.trim().length > 0;
  const displayUsers = hasQuery ? searchResults.users : defaultUsers;
  const displayPosts = hasQuery ? searchResults.posts : defaultPosts;

  return (
    <div className="search-view">
      <h1>Discover different contents based on the users, destinations and posts</h1>
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

      <div className="max-w-[1400px] mx-auto px-4 pb-8">
        {isSearching || isLoadingDefaults ? (
          <p>{isSearching ? 'Searching...' : 'Loading...'}</p>
        ) : activeTab === 'users' ? (
          <UserList
            users={displayUsers}
            title={hasQuery ? "Search Results" : "Users"}
            emptyMessage={hasQuery ? "No users found. Try a different search." : "No users to show yet"}
            onUserClick={(userId) => navigate(`/profile/${userId}`)}
          />
        ) : (
          <div>
            {displayPosts.length === 0 ? (
              <p>{hasQuery ? "No posts found. Try a different search." : "No posts to show yet"}</p>
            ) : (
              <FeedList
                posts={displayPosts}
                onLike={(id) => searchLikeMutation.mutate(id)}
                onComment={async (id, comment) => {
                  try {
                    const newComment = await api.comment.addComment(id, comment);
                    updatePostInState(id, p => ({
                      ...p,
                      kommentit: [...(p.kommentit ?? []), newComment as any],
                    }));
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

export { SearchView };
