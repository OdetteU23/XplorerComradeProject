import { create } from 'zustand';
import type { tykkäykset } from '@xcomrade/types-server';

// Manages optimistic like state across the app, any view that renders posts

type LikeStore = {
  /* Map of postId -→ array of likes */
  likesByPost: Record<number, tykkäykset[]>;

  /* Set the full likes array for a post (e.g. when loading from API) */
  setLikes: (postId: number, likes: tykkäykset[]) => void;

  /* Optimistically add a like */
  addLike: (postId: number, like: tykkäykset) => void;

  /* Remove a like (optimistic unlike) */
  removeLike: (postId: number, userId: number) => void;

  /* Get likes for a specific post */
  getLikes: (postId: number) => tykkäykset[];
};

export const useLikeStore = create<LikeStore>((set, get) => ({
  likesByPost: {},

  setLikes: (postId, likes) =>
    set((state) => ({
      likesByPost: { ...state.likesByPost, [postId]: likes },
    })),

  addLike: (postId, like) =>
    set((state) => ({
      likesByPost: {
        ...state.likesByPost,
        [postId]: [...(state.likesByPost[postId] ?? []), like],
      },
    })),

  removeLike: (postId, userId) =>
    set((state) => ({
      likesByPost: {
        ...state.likesByPost,
        [postId]: (state.likesByPost[postId] ?? []).filter(
          (l) => l.userId !== userId
        ),
      },
    })),

  getLikes: (postId) => get().likesByPost[postId] ?? [],
}));
