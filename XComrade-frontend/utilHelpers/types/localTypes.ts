import type {julkaisu, media_images,
  loginInfo,
  userProfile,
  friendRequest,
  matkaAikeet,
  tripParticipants,
  notifications,
  chatMessages
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

// Filter types
export interface FilterOptions {
  destination?: string;
  dateRange?: { start: Date; end: Date };
  activities?: string[];
}
