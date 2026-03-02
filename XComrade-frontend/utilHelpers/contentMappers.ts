/**
 * Mappers that convert backend `julkaisuWithRelations` into
 * the display types used by SingleContent / SingleView.
 *
 * Backend shape  →  julkaisuWithRelations  (from API)
 * Display shape  →  ContentItemOwner / ThreadContentItem  (for UI)
 */
import type { julkaisuWithRelations } from '@xcomrade/types-server';
import type { ContentItemOwner, ThreadContentItem } from './types/localTypes';

/**
 * Derive a contentType tag from the backend data.
 *
 * Logic:
 *  - If `media_type` starts with "video/" → 'video'
 *  - If `media_type` is "text/thread" or `otsikko` starts with "Thread" → 'Thread'
 *  - Otherwise → 'post'  (image-based post)
 */
function deriveContentType(
  post: julkaisuWithRelations,
): ContentItemOwner['contentType'] {
  const mediaType = post.media_type;

  if (mediaType?.startsWith('video/')) return 'video';
  if (mediaType === 'text/thread') return 'Thread';

  // Thread detection: otsikko tag or no media at all
  const hasImages = post.media_images && post.media_images.length > 0;
  if (post.otsikko?.startsWith('Thread')) return 'Thread';
  if (!hasImages && !mediaType) return 'Thread';

  return 'post';
}

/** Fallback owner when `post.user` is missing from the API response. */
const UNKNOWN_OWNER = {
  käyttäjäTunnus: 'unknown',
  etunimi: '',
  profile_picture_url: undefined as string | undefined,
};

/**
 * Convert a `julkaisuWithRelations` (backend) → `ContentItemOwner` (UI).
 */
export function toContentItem(post: julkaisuWithRelations): ContentItemOwner {
  const user = post.user ?? UNKNOWN_OWNER;

  return {
    // Spread all julkaisu base fields
    ...post,

    // Map `user` → `owner`
    owner: {
      käyttäjäTunnus: user.käyttäjäTunnus ?? 'unknown',
      etunimi: user.etunimi ?? '',
      profile_picture_url: user.profile_picture_url,
    },

    // Map `media_images` → `julkaisuKuvat`
    julkaisuKuvat: post.media_images ?? [],

    // Derive the content type tag
    contentType: deriveContentType(post),

    // Use otsikko from the post if it exists
    otsikko: post.otsikko ?? post.kohde,
  };
}

/**
 * Convert a `julkaisuWithRelations` (backend) → `ThreadContentItem` (UI).
 *
 * Call this when you know the item is a thread (contentType === 'Thread').
 * Replies/children must be populated separately (e.g. from a thread endpoint).
 */
export function toThreadItem(
  post: julkaisuWithRelations,
  replies: ThreadContentItem[] = [],
): ThreadContentItem {
  const base = toContentItem(post);

  const user = post.user ?? UNKNOWN_OWNER;

  return {
    ...base,
    contentType: 'Thread',
    threadId: post.id,
    threadTitle: post.otsikko || post.kohde,
    threadOwner: {
      käyttäjäTunnus: user.käyttäjäTunnus ?? 'unknown',
      etunimi: user.etunimi ?? '',
      profile_picture_url: user.profile_picture_url,
    },
    parentId: null,
    threadCreatedAt: [post.Date_ajakohta],
    children: replies,
    replies,
  };
}

/**
 * Batch-convert an array of feed posts.
 * Threads are automatically detected and converted with toThreadItem.
 */
export function mapFeedToContentItems(
  posts: julkaisuWithRelations[],
): (ContentItemOwner | ThreadContentItem)[] {
  return posts.map((post) => {
    const type = deriveContentType(post);
    return type === 'Thread' ? toThreadItem(post) : toContentItem(post);
  });
}
