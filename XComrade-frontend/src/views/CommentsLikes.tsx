import type { julkaisuWithRelations } from '@xcomrade/types-server';
import type { HomeAction } from '../../utilHelpers/types/localTypes';
import { useLikeStore } from '../hooks/store';
import { useKäyttäjä } from '../content/käyttänKontentti';
import { useLikeReducer } from '../hooks/useLikeReducer';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../utilHelpers/FetchingData';
import { useEffect } from 'react';

/*
  Hook for HomeView: manages like/unlike + comment logic for feed posts.
  Accepts posts array and HomeView's dispatch so it can update state.
*/
 const useHomeLikesAndComments = (
  posts: julkaisuWithRelations[],
  dispatch: React.Dispatch<HomeAction>,) => {
  //  Like state: useReducer, likeReducer and Zustand store sync
  const { likeState, toggleLikeOptimistic, confirmLike, revertLike, setPostLikes } = useLikeReducer();
  const likeStore = useLikeStore();
  const { user: currentUser } = useKäyttäjä();

  // Sync initial post likes into both the reducer and Zustand store
  useEffect(() => {
    posts.forEach((p) => {
      setPostLikes(p.id, p.tykkäykset ?? [], currentUser?.id ?? 0);
      likeStore.setLikes(p.id, p.tykkäykset ?? []);
    });
  }, [posts]);

  // React Query mutation for like/unlike
  const likeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: number; isLiked: boolean }) => {
      if (isLiked) {
        return api.like.unlikePost(postId);
      }
      return api.like.likePost(postId);
    },
    onMutate: async ({ postId }) => {
      // Optimistic update via likeReducer dispatch
      const userId = currentUser?.id ?? 0;
      toggleLikeOptimistic(postId, userId);
      // Also update Zustand store for cross-component reactivity
      const alreadyLiked = likeState.likedByUser.has(postId);
      if (alreadyLiked) {
        likeStore.removeLike(postId, userId);
      } else {
        likeStore.addLike(postId, { id: Date.now(), julkaisuId: postId, userId });
      }
    },
    onSuccess: (_data, { postId }) => {
      confirmLike(postId, { id: Date.now(), julkaisuId: postId, userId: currentUser?.id ?? 0 });
    },
    onError: (_err, { postId }) => {
      const userId = currentUser?.id ?? 0;
      revertLike(postId, userId);
      // Revert Zustand as well
      const wasLiked = likeState.likedByUser.has(postId);
      if (wasLiked) {
        likeStore.removeLike(postId, userId);
      } else {
        likeStore.addLike(postId, { id: Date.now(), julkaisuId: postId, userId });
      }
    },
  });

  const handleLike = (postId: number) => {
    const isLiked = likeState.likedByUser.has(postId);
    likeMutation.mutate({ postId, isLiked });
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

  return { handleLike, handleComment };
}

/*
  Hook for SearchView: manages like toggle for search-result posts.
  Accepts an updater so the caller decides how local state is patched.
*/
const useSearchLikes = (
  updatePostInState: (postId: number, updater: (p: julkaisuWithRelations) => julkaisuWithRelations) => void,
) => {
  const likeStore = useLikeStore();
  const { user: currentUser } = useKäyttäjä();

  // useMutation for like toggle in search results
  const searchLikeMutation = useMutation({
    mutationFn: async (postId: number) => api.like.likePost(postId),
    onSuccess: (_data, postId) => {
      const userId = currentUser?.id ?? 0;
      updatePostInState(postId, p => ({
        ...p,
        tykkäykset: [...(p.tykkäykset ?? []), { id: Date.now(), julkaisuId: postId, userId }],
      }));
      likeStore.addLike(postId, { id: Date.now(), julkaisuId: postId, userId });
    },
    onError: (err) => console.error('Like error:', err),
  });

  return { searchLikeMutation };
}

export { useHomeLikesAndComments, useSearchLikes };
