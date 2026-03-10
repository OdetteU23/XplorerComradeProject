import { useEffect, useReducer } from 'react';
import { FeedList } from '../components/Feeds';
import { UserList } from '../components/Profile';
import PublicViewPrompt from '../components/publicViewPromp';
import { useKäyttäjä } from '../content/käyttänKontentti';
import { api } from '../../utilHelpers/FetchingData';
import {HomeAction, HomeState} from '../../utilHelpers/types/localTypes';
import { GiWorld } from 'react-icons/gi';
import { IoIosWarning } from 'react-icons/io';
import { useHomeLikesAndComments } from './CommentsLikes';
import { Link, useNavigate } from 'react-router-dom';

const homeInitialState: HomeState = {
  posts: [],
  randomPosts: [],
  suggestedUsers: [],
  isLoading: true,
  error: null,
};

/*
  useReducer for HomeView - manages feed posts, random/explore posts,
  and suggested users, along with loading/error states.
*/
const homeReducer = (state: HomeState, action: HomeAction): HomeState => {
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
  const navigate = useNavigate();

  // Like & comment handlers from commentsLikes hook
  const { handleLike, handleComment } = useHomeLikesAndComments(posts, dispatch);

  // Deduplicate: remove posts already shown in the main feed from the random/explore section
  const feedPostIds = new Set(posts.map(p => p.id));
  const uniqueRandomPosts = randomPosts.filter(p => !feedPostIds.has(p.id));

  // Apply content limit for unauthenticated users
  const visiblePosts = isAuthenticated ? posts : posts.slice(0, GUEST_CONTENT_LIMIT);
  const visibleRandomPosts = isAuthenticated ? uniqueRandomPosts : uniqueRandomPosts.slice(0, GUEST_CONTENT_LIMIT);
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-gray-400">
        <div className="w-9 h-9 border-3 border-white/10 border-t-indigo-600 rounded-full animate-spin" />
        <p>Loading your feed...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero text over background */}
      <div className="max-w-7xl mx-auto w-full px-8 pt-16 pb-8 text-white text-center">
        <div className="flex justify-center mb-3">
          <GiWorld className="text-5xl drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)]" />
        </div>
        <h1 className="text-5xl font-extrabold mb-2 tracking-tight drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)]">
          Explore the World with us
        </h1>
        <p className="text-lg max-w-lg mx-auto text-white/90 mb-6 drop-shadow-[0_1px_10px_rgba(0,0,0,0.4)]">
          Discover breathtaking destinations, share your journeys, and connect with fellow travelers.
        </p>
        {!isAuthenticated && (
          <div className="flex justify-center gap-3">
            <Link to="/register" className="px-6 py-2.5 rounded-full text-sm font-semibold bg-indigo-600 text-white no-underline hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              Get Started
            </Link>
            <Link to="/login" className="px-6 py-2.5 rounded-full text-sm font-semibold text-white no-underline bg-white/15 backdrop-blur-sm border border-white/25 hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              Sign In
            </Link>
          </div>
        )}
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-600/15 border border-red-600/30 rounded-lg p-4 text-center mb-4">
            <p><IoIosWarning /> {error}</p>
          </div>
        </div>
      )}

      {/* Main feed - full width card grid */}
      <div className="max-w-[1400px] mx-auto px-4 pb-8">

        {/* The Feed */}
        <section className="mb-10">
          {!isAuthenticated && (
            <div className="text-center py-12 px-8 bg-white/[0.04] border border-dashed border-white/15 rounded-2xl">
              <h4 className="text-lg font-semibold text-white mb-2">Register/Login to discover different interesting traveling related contents!</h4>
            </div>
          )}
          {visiblePosts.length === 0 ? (
            isAuthenticated ? (
              <>
                <h2 className="text-xl font-bold text-white mb-5">The Feed</h2>
                <div className="text-center py-12 px-8 bg-white/[0.04] border border-dashed border-white/15 rounded-2xl">
                  <div className="flex justify-center mb-3">
                    <GiWorld className="text-5xl text-white/70" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">You are not following anyone yet. Discover travelers below and start following!</h3>
                </div>
              </>
            )
             : null
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
        </section>
                {/* Suggested users row */}
        {suggestedUsers.length > 0 && (
          <section className="mb-8 bg-white/5 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-sm">
            <h3 className="text-base font-bold text-white/90 mb-4">Travelers you might like</h3>
            <UserList
              users={visibleSuggestedUsers}
              title=""
              emptyMessage="No suggestions available."
              onUserClick={(userId) => navigate(`/profile/${userId}`)}
            />
          </section>
        )}

        {/* Explore posts */}
        {visibleRandomPosts.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-white mb-5">Explore</h2>
            <FeedList
              posts={visibleRandomPosts}
              onLike={handleLike}
              onComment={handleComment}
            />
            {!isAuthenticated && uniqueRandomPosts.length > GUEST_CONTENT_LIMIT && (
              <PublicViewPrompt message="Sign in to discover more travel experiences!" />
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export { HomeView };
