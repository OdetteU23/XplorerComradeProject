import { useReducer, useCallback } from 'react';
import type { tykkäykset } from '@xcomrade/types-server';
import type { LikeState, LikeAction } from '../../utilHelpers/types/localTypes';

// useReducer based state management for likes within a view.
// Provides dispatch functions --> toggleLike, setPostLikes, resetLikes.

const likeInitialState: LikeState = {
  likesByPost: {},
  likedByUser: new Set(),
  pendingPostId: null,
};

function likeReducer(state: LikeState, action: LikeAction): LikeState {
  switch (action.type) {
    case 'SET_POST_LIKES': {
      const newLikedByUser = new Set(state.likedByUser);
      if (action.likes.some((l) => l.userId === action.currentUserId)) {
        newLikedByUser.add(action.postId);
      } else {
        newLikedByUser.delete(action.postId);
      }
      return {
        ...state,
        likesByPost: { ...state.likesByPost, [action.postId]: action.likes },
        likedByUser: newLikedByUser,
      };
    }

    case 'TOGGLE_LIKE_OPTIMISTIC': {
      const currentLikes = state.likesByPost[action.postId] ?? [];
      const alreadyLiked = state.likedByUser.has(action.postId);
      const newLikedByUser = new Set(state.likedByUser);

      let newLikes: tykkäykset[];
      if (alreadyLiked) {
        // Optimistic unlike
        newLikes = currentLikes.filter((l) => l.userId !== action.userId);
        newLikedByUser.delete(action.postId);
      } else {
        // Optimistic like
        newLikes = [
          ...currentLikes,
          { id: Date.now(), julkaisuId: action.postId, userId: action.userId },
        ];
        newLikedByUser.add(action.postId);
      }

      return {
        ...state,
        likesByPost: { ...state.likesByPost, [action.postId]: newLikes },
        likedByUser: newLikedByUser,
        pendingPostId: action.postId,
      };
    }

    case 'TOGGLE_LIKE_CONFIRMED':
      return { ...state, pendingPostId: null };

    case 'TOGGLE_LIKE_REVERTED': {
      // Revert the optimistic update
      const currentLikes = state.likesByPost[action.postId] ?? [];
      const wasLiked = state.likedByUser.has(action.postId);
      const newLikedByUser = new Set(state.likedByUser);

      let revertedLikes: tykkäykset[];
      if (wasLiked) {
        // Was optimistically liked -→ revert by removing
        revertedLikes = currentLikes.filter((l) => l.userId !== action.userId);
        newLikedByUser.delete(action.postId);
      } else {
        // Was optimistically unliked -→ revert by re-adding
        revertedLikes = [
          ...currentLikes,
          { id: Date.now(), julkaisuId: action.postId, userId: action.userId },
        ];
        newLikedByUser.add(action.postId);
      }

      return {
        ...state,
        likesByPost: { ...state.likesByPost, [action.postId]: revertedLikes },
        likedByUser: newLikedByUser,
        pendingPostId: null,
      };
    }

    case 'SET_PENDING':
      return { ...state, pendingPostId: action.postId };

    case 'RESET':
      return likeInitialState;

    default:
      return state;
  }
}

/**
 * Custom hook that encapsulates useReducer for like state management.
 * Returns the state and memoised dispatch helpers.
 */
export function useLikeReducer() {
  const [state, dispatch] = useReducer(likeReducer, likeInitialState);

  const setPostLikes = useCallback(
    (postId: number, likes: tykkäykset[], currentUserId: number) =>
      dispatch({ type: 'SET_POST_LIKES', postId, likes, currentUserId }),
    []
  );

  const toggleLikeOptimistic = useCallback(
    (postId: number, userId: number) =>
      dispatch({ type: 'TOGGLE_LIKE_OPTIMISTIC', postId, userId }),
    []
  );

  const confirmLike = useCallback(
    (postId: number, like: tykkäykset) =>
      dispatch({ type: 'TOGGLE_LIKE_CONFIRMED', postId, like }),
    []
  );

  const revertLike = useCallback(
    (postId: number, userId: number) =>
      dispatch({ type: 'TOGGLE_LIKE_REVERTED', postId, userId }),
    []
  );

  const resetLikes = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    likeState: state,
    dispatch,
    setPostLikes,
    toggleLikeOptimistic,
    confirmLike,
    revertLike,
    resetLikes,
  };
}

export type { LikeState, LikeAction };
export { likeReducer, likeInitialState };
