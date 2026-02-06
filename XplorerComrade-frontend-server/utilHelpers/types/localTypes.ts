import type { ReactNode } from 'react';
import type { loginInfo, userProfile, friendRequest,  matkaAikeet, tripParticipants, 
  chatMessages } from '@xplorercomrade/types-server';

// Authentication types
export type authens = {
  käyttäjäTunnus: string;
  salasana: string;
};

// View navigation types
export type ViewType =
  | 'home'
  | 'search'
  | 'explore'
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

export interface ParticipantWithUser extends tripParticipants {
  user: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'etunimi' | 'sukunimi' | 'profile_picture_url'>;
}

// Filter types
export interface FilterOptions {
  destination?: string;
  dateRange?: { start: Date; end: Date };
  activities?: string[];
}
interface PääKäyttäjäProviderProps {
  children: ReactNode;
}
export type {PääKäyttäjäProviderProps}
