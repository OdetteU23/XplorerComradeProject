import type {julkaisu, media_images,
  loginInfo,
  userProfile, julkaisuWithRelations,
  tykkäykset, kommentti,
  friendRequest,
  matkaAikeet,
  tripParticipants,
  notifications,
  chatMessages,
  UserSearchResult,
  //RecipientUser
  //julkaisuWithRelations,
} from '@xcomrade/types-server';

// Authentication types
export type authens = {
  käyttäjäTunnus: string;
  salasana: string;
};

// View navigation types
export type ViewType =
  | 'home'
  | 'search'
  | 'messages'
  | 'notifications'
  | 'profile'
  | 'following'
  | 'buddy-requests'
  | 'my-trips'
  | 'travel-plans'
  | 'upload'
  | 'settings'
  | 'login'
  | 'register';

// User context types
export interface UserContextType {
  user: userProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: loginInfo) => Promise<void>;
  register: (data: { käyttäjäTunnus: string;
    salasana: string; etunimi: string; sukunimi: string;
    sahkoposti: string }) => Promise<unknown>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<userProfile>) => void;
}

// Common component types
export interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

export interface Conversation {
  user: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'etunimi' | 'sukunimi' | 'profile_picture_url'>;
  lastMessage: chatMessages;
  unreadCount: number;
}

export interface TravelPlanWithUser extends matkaAikeet {
  user?: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'etunimi' | 'sukunimi' | 'profile_picture_url'>;
  participantsCount?: number;
}

export interface BuddyRequestWithUser extends friendRequest {
  requester: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'etunimi' | 'sukunimi' | 'profile_picture_url'>;
}
export interface ContentItem {
    content_id: number;
    user_id: number;
    filename: string;
    thumbnail: string;
    filesize: number;
    contentType: string;
    otsikko: string;
    kuvaus: string | null;
    Date_ajakohta: string | Date;
    screenshots: string[] | null;
}
export interface ContentItemOwner extends julkaisu {
  owner: Pick<userProfile, 'käyttäjäTunnus' | 'etunimi' | 'profile_picture_url'>;
  contentType: 'post' | 'travel-plan' | 'Thread' | string;
  julkaisuKuvat: media_images[];
  otsikko?: string;
}
//Thread content types
export interface ThreadContentItem extends ContentItemOwner {
  threadId: number;
  threadTitle: string;
  threadOwner: Pick<userProfile, 'käyttäjäTunnus' | 'etunimi' | 'profile_picture_url'>;
  parentId: number | null;
  threadCreatedAt: (string | Date)[];
  children: ThreadContentItem[];
  replies: ThreadContentItem[];
}

export interface ParticipantWithUser extends tripParticipants {
  user: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'etunimi' | 'sukunimi' | 'profile_picture_url'>;
}

// Recipient user type for chat
export type RecipientUser = Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'etunimi' | 'sukunimi' | 'profile_picture_url'>;

// Filter types
export interface FilterOptions {
  destination?: string;
  dateRange?: { start: Date; end: Date };
  activities?: string[];
}
export interface ChatWindowProps {
  messages: chatMessages[];
  currentUserId: number;
  //notifications: notifications[];
  recipientUser: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'etunimi' | 'sukunimi' | 'profile_picture_url'>;
  onSendMessage: (message: string) => void;
  /** Optional: whether the recipient is currently typing */
  isRecipientTyping?: boolean;
  /** Optional: callback when current user starts/stops typing (for WebSocket broadcast) */
  onTyping?: (isTyping: boolean) => void;
  /** Optional: whether a message is currently being sent */
  isSending?: boolean;
}
export interface NewConversationProps {
  /** Called when the user picks someone to chat with */
  onSelectUser: (userId: number) => void;
  /** Called when the user wants to close the compose panel */
  onCancel: () => void;
  /** Async search function provided by the parent (uses api.user.searchUsers) */
  onSearch: (query: string) => Promise<UserSearchResult[]>;
  /** The logged-in user's id so we can filter them out of results */
  currentUserId: number;
}
export interface Conversation {
  user: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'etunimi' | 'sukunimi' | 'profile_picture_url'>;
  lastMessage: chatMessages;
  unreadCount: number;
}
export interface ChatListProps {
  conversations: Conversation[];
  onSelectChat: (userId: number) => void;
  selectedUserId?: number | null;
}
export interface MessageBubbleProps {
  message: chatMessages;
  isOwnMessage: boolean;
}
export interface NotificationToastProps {
  notification: notifications;
  onDismiss: () => void;
  /** Auto-dismiss timeout in ms (default 5 000) */
  duration?: number;
}
export interface NotificationItemProps {
  notification: notifications;
  onClick: (notification: notifications) => void;
  /** Called when user accepts a buddy request (relatedId => friendRequest id) */
  onAcceptBuddy?: (requestId: number, notificationId: number) => void;
  /** Called when user rejects a buddy request */
  onRejectBuddy?: (requestId: number, notificationId: number) => void;
}
export interface NotificationToastContainerProps {
  toasts: notifications[];
  onDismiss: (id: number) => void;
}

export interface MessagesState {
  conversations: Conversation[];
  selectedUserId: number | null;
  messages: chatMessages[];
  recipientUser: RecipientUser | null;
  isLoading: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  isRecipientTyping: boolean;
  error: string | null;
}

export type MessagesAction =
  | { type: 'CONVERSATIONS_LOADING' }
  | { type: 'CONVERSATIONS_LOADED'; payload: Conversation[] }
  | { type: 'CONVERSATIONS_ERROR'; payload: string }
  | { type: 'SELECT_CHAT'; payload: number }
  | { type: 'MESSAGES_LOADING' }
  | { type: 'MESSAGES_LOADED'; payload: chatMessages[] }
  | { type: 'MESSAGES_ERROR'; payload: string }
  | { type: 'SET_RECIPIENT'; payload: RecipientUser }
  | { type: 'APPEND_MESSAGE'; payload: chatMessages }
  | { type: 'SET_SENDING'; payload: boolean }
  | { type: 'SET_RECIPIENT_TYPING'; payload: boolean };
export interface LikeState {
  /* Likes keyed by postId */
  likesByPost: Record<number, tykkäykset[]>;
  /* Which posts the current user has liked */
  likedByUser: Set<number>;
  /* Post currently being toggled (for optimistic UI) */
  pendingPostId: number | null;
}
export type LikeAction =
  | { type: 'SET_POST_LIKES'; postId: number; likes: tykkäykset[] ; currentUserId: number }
  | { type: 'TOGGLE_LIKE_OPTIMISTIC'; postId: number; userId: number }
  | { type: 'TOGGLE_LIKE_CONFIRMED'; postId: number; like: tykkäykset }
  | { type: 'TOGGLE_LIKE_REVERTED'; postId: number; userId: number }
  | { type: 'SET_PENDING'; postId: number | null }
  | { type: 'RESET' };
export interface HomeState {
  posts: julkaisuWithRelations[];
  randomPosts: julkaisuWithRelations[];
  suggestedUsers: userProfile[];
  isLoading: boolean;
  error: string | null;
}

export type HomeAction =
  | { type: 'FEED_LOADING' }
  | { type: 'FEED_SUCCESS'; payload: julkaisuWithRelations[] }
  | { type: 'FEED_ERROR'; payload: string }
  | { type: 'SET_RANDOM_POSTS'; payload: julkaisuWithRelations[] }
  | { type: 'SET_SUGGESTED_USERS'; payload: userProfile[] }
  | { type: 'UPDATE_POST'; payload: julkaisuWithRelations };
export interface CommentSectionProps {
  comments: (kommentti & { user?: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'profile_picture_url'>; käyttäjäTunnus?: string; profile_picture_url?: string })[];
}
export interface LikeButtonProps {
  postId: number;
  likes: tykkäykset[];
  currentUserId: number;
  onLike: (postId: number) => void;
}
export interface FeedListProps {
  posts: julkaisuWithRelations[];
  onLike: (postId: number) => void;
  onComment: (postId: number, comment: string) => void;
}
export interface PostCardProps {
  post: julkaisuWithRelations;
  onLike: (postId: number) => void;
  onComment: (postId: number, comment: string) => void;
}
export interface PostFormProps {
  onSubmit: (post: Partial<julkaisu>) => void;
  initialData?: Partial<julkaisu>;
}
export interface UserCardProps {
  user: userProfile;
  stats?: UserStats;
  onUserClick?: (userId: number) => void;
}
export interface TravelPlanListProps {
  plans: TravelPlanWithUser[];
  currentUserId?: number;
  onRequestJoin?: (planId: number) => void;
  onViewDetails?: (planId: number) => void;
}
export interface TravelPlanCardProps {
  plan: TravelPlanWithUser;
  currentUserId?: number;
  onRequestJoin?: (planId: number) => void;
  onViewDetails?: (planId: number) => void;
}
export interface BuddyRequestCardProps {
  request: BuddyRequestWithUser;
  onAccept?: (requestId: number) => void;
  onReject?: (requestId: number) => void;
}
export interface UseAPIOptions {
  immediate?: boolean; // Execute immediately on mount
}

export interface UseAPIReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}
