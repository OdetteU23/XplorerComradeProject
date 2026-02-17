/// <reference types="vite/client" />
import type {userProfile, loginInfo,
  registeringInfo, julkaisu, julkaisuWithRelations, matkaAikeet, kommentti, tykkäykset, seuranta, chatMessages,
  notifications, friendRequest, tripParticipants, MessageResponse, ErrorResponse, BooleanResponse,
} from '@xcomrade/types-server';

// API Base URLs - Update these to match your backend servers
// auth-server runs on port 3000
// mediaContent-server runs on port 3001
// upload-server runs on port 3002

const AUTH_API = import.meta.env.VITE_AUTH_API || 'http://localhost:3000/api';
const MEDIA_API = import.meta.env.VITE_MEDIA_API || 'http://localhost:3001/api';
const UPLOAD_API = import.meta.env.VITE_UPLOAD_API || 'http://localhost:3002/api';
const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3002/uploads';

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to set auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==================== AUTHENTICATION ====================

export const authAPI = {
  // Login user
  login: async (credentials: loginInfo): Promise<{ token: string; user: userProfile }> => {
    const response = await fetchAPI<{ token: string; user: userProfile }>(AUTH_API, '/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    // Store token in localStorage
    localStorage.setItem('authToken', response.token);
    return response;
  },

  // Register new user
  register: async (data: registeringInfo): Promise<{ token: string; user: userProfile }> => {
    const response = await fetchAPI<{ token: string; user: userProfile }>(AUTH_API, '/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Store token in localStorage
    localStorage.setItem('authToken', response.token);
    return response;
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem('authToken');
  },

  // Get current user
  getCurrentUser: async (): Promise<userProfile> => {
    return fetchAPI<userProfile>(AUTH_API, '/auth/me');
  },
};

// ==================== USER PROFILE ====================
// NOTE: User profile endpoints are not yet implemented in the backend
// Keep these functions for future implementation

export const userAPI = {
  // Get user profile by ID
  getProfile: async (userId: number): Promise<userProfile> => {
    // TODO: Implement in backend
    console.warn('User profile endpoint not implemented');
    return fetchAPI<userProfile>(MEDIA_API, `/users/${userId}`);
  },

  // Update user profile
  updateProfile: async (userId: number, data: Partial<userProfile>): Promise<userProfile> => {
    // TODO: Implement in backend
    console.warn('Update profile endpoint not implemented');
    return fetchAPI<userProfile>(MEDIA_API, `/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get user stats
  getUserStats: async (userId: number): Promise<{
    postsCount: number;
    followersCount: number;
    followingCount: number;
  }> => {
    // TODO: Implement in backend
    console.warn('User stats endpoint not implemented');
    return fetchAPI(MEDIA_API, `/users/${userId}/stats`);
  },

  // Search users
  searchUsers: async (query: string): Promise<userProfile[]> => {
    // TODO: Implement in backend
    console.warn('Search users endpoint not implemented');
    return fetchAPI<userProfile[]>(MEDIA_API, `/users/search?q=${encodeURIComponent(query)}`);
  },
};

// ==================== POSTS ====================

export const postAPI = {
  // Get all posts (feed)
  getFeed: async (page: number = 1, limit: number = 20): Promise<julkaisuWithRelations[]> => {
    return fetchAPI<julkaisuWithRelations[]>(MEDIA_API, `/posts?page=${page}&limit=${limit}`);
  },

  // Get post by ID
  getPost: async (postId: number): Promise<julkaisuWithRelations> => {
    return fetchAPI<julkaisuWithRelations>(MEDIA_API, `/posts/${postId}`);
  },

  // Get posts by user ID
  getUserPosts: async (userId: number): Promise<julkaisuWithRelations[]> => {
    return fetchAPI<julkaisuWithRelations[]>(MEDIA_API, `/users/${userId}/posts`);
  },

  // Create new post
  createPost: async (data: Partial<julkaisu>): Promise<julkaisuWithRelations> => {
    return fetchAPI<julkaisuWithRelations>(MEDIA_API, '/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update post
  updatePost: async (postId: number, data: Partial<julkaisu>): Promise<julkaisuWithRelations> => {
    return fetchAPI<julkaisuWithRelations>(MEDIA_API, `/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete post
  deletePost: async (postId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(MEDIA_API, `/posts/${postId}`, {
      method: 'DELETE',
    });
  },

  // Search posts
  searchPosts: async (query: string): Promise<julkaisuWithRelations[]> => {
    return fetchAPI<julkaisuWithRelations[]>(MEDIA_API, `/posts/search?q=${encodeURIComponent(query)}`);
  },

  // Get trending posts
  getTrendingPosts: async (): Promise<julkaisuWithRelations[]> => {
    return fetchAPI<julkaisuWithRelations[]>(MEDIA_API, '/posts/trending');
  },
};

// ==================== LIKES ====================

export const likeAPI = {
  // Like a post
  likePost: async (postId: number): Promise<tykkäykset> => {
    return fetchAPI<tykkäykset>(MEDIA_API, `/posts/${postId}/like`, {
      method: 'POST',
    });
  },

  // Unlike a post
  unlikePost: async (postId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(MEDIA_API, `/posts/${postId}/like`, {
      method: 'DELETE',
    });
  },

  // Check if user liked a post
  isPostLiked: async (postId: number): Promise<BooleanResponse> => {
    return fetchAPI<BooleanResponse>(MEDIA_API, `/posts/${postId}/like/status`);
  },
};

// ==================== COMMENTS ====================

export const commentAPI = {
  // Get comments for a post
  getComments: async (postId: number): Promise<kommentti[]> => {
    return fetchAPI<kommentti[]>(MEDIA_API, `/posts/${postId}/comments`);
  },

  // Add comment to post
  addComment: async (postId: number, text: string): Promise<kommentti> => {
    return fetchAPI<kommentti>(MEDIA_API, `/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ teksti_kenttä: text }),
    });
  },

  // Delete comment
  deleteComment: async (commentId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(MEDIA_API, `/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== FOLLOW ====================
// NOTE: Follow endpoints are not yet implemented in the backend
// Keep these functions for future implementation

export const followAPI = {
  // Follow a user
  followUser: async (userId: number): Promise<seuranta> => {
    // TODO: Implement in backend
    console.warn('Follow user endpoint not implemented');
    return fetchAPI<seuranta>(MEDIA_API, `/users/${userId}/follow`, {
      method: 'POST',
    });
  },

  // Unfollow a user
  unfollowUser: async (userId: number): Promise<MessageResponse> => {
    // TODO: Implement in backend
    console.warn('Unfollow user endpoint not implemented');
    return fetchAPI<MessageResponse>(MEDIA_API, `/users/${userId}/follow`, {
      method: 'DELETE',
    });
  },

  // Get followers
  getFollowers: async (userId: number): Promise<userProfile[]> => {
    // TODO: Implement in backend
    console.warn('Get followers endpoint not implemented');
    return fetchAPI<userProfile[]>(MEDIA_API, `/users/${userId}/followers`);
  },

  // Get following
  getFollowing: async (userId: number): Promise<userProfile[]> => {
    // TODO: Implement in backend
    console.warn('Get following endpoint not implemented');
    return fetchAPI<userProfile[]>(MEDIA_API, `/users/${userId}/following`);
  },

  // Check if following
  isFollowing: async (userId: number): Promise<BooleanResponse> => {
    // TODO: Implement in backend
    console.warn('Is following endpoint not implemented');
    return fetchAPI<BooleanResponse>(MEDIA_API, `/users/${userId}/follow/status`);
  },
};

// ==================== TRAVEL PLANS ====================

export const travelPlanAPI = {
  // Get all travel plans
  getTravelPlans: async (): Promise<matkaAikeet[]> => {
    return fetchAPI<matkaAikeet[]>(MEDIA_API, '/travel-plans');
  },

  // Get travel plan by ID
  getTravelPlan: async (planId: number): Promise<matkaAikeet> => {
    return fetchAPI<matkaAikeet>(MEDIA_API, `/travel-plans/${planId}`);
  },

  // Get user's travel plans
  getUserTravelPlans: async (userId: number): Promise<matkaAikeet[]> => {
    return fetchAPI<matkaAikeet[]>(MEDIA_API, `/users/${userId}/travel-plans`);
  },

  // Create travel plan
  createTravelPlan: async (data: Partial<matkaAikeet>): Promise<matkaAikeet> => {
    return fetchAPI<matkaAikeet>(MEDIA_API, '/travel-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update travel plan
  updateTravelPlan: async (planId: number, data: Partial<matkaAikeet>): Promise<matkaAikeet> => {
    return fetchAPI<matkaAikeet>(MEDIA_API, `/travel-plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete travel plan
  deleteTravelPlan: async (planId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(MEDIA_API, `/travel-plans/${planId}`, {
      method: 'DELETE',
    });
  },

  // Search travel plans
  searchTravelPlans: async (query: string): Promise<matkaAikeet[]> => {
    return fetchAPI<matkaAikeet[]>(MEDIA_API, `/travel-plans/search?q=${encodeURIComponent(query)}`);
  },
};

// ==================== BUDDY REQUESTS ====================

export const buddyRequestAPI = {
  // Get all buddy requests
  getBuddyRequests: async (): Promise<friendRequest[]> => {
    return fetchAPI<friendRequest[]>(MEDIA_API, '/buddy-requests');
  },

  // Get buddy requests for a travel plan
  getPlanRequests: async (planId: number): Promise<friendRequest[]> => {
    return fetchAPI<friendRequest[]>(MEDIA_API, `/travel-plans/${planId}/requests`);
  },

  // Send buddy request
  sendBuddyRequest: async (planId: number, message: string): Promise<friendRequest> => {
    return fetchAPI<friendRequest>(MEDIA_API, `/travel-plans/${planId}/requests`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // Accept buddy request
  acceptBuddyRequest: async (requestId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(MEDIA_API, `/buddy-requests/${requestId}/accept`, {
      method: 'PUT',
    });
  },

  // Reject buddy request
  rejectBuddyRequest: async (requestId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(MEDIA_API, `/buddy-requests/${requestId}/reject`, {
      method: 'PUT',
    });
  },
};

// ==================== TRIP PARTICIPANTS ====================

export const participantAPI = {
  // Get trip participants
  getParticipants: async (planId: number): Promise<tripParticipants[]> => {
    return fetchAPI<tripParticipants[]>(MEDIA_API, `/travel-plans/${planId}/participants`);
  },

  // Remove participant
  removeParticipant: async (participantId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(MEDIA_API, `/participants/${participantId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== MESSAGES ====================

export const messageAPI = {
  // Get conversations
  getConversations: async (): Promise<chatMessages[]> => {
    return fetchAPI<chatMessages[]>(MEDIA_API, '/messages/conversations');
  },

  // Get messages with a user
  getMessages: async (userId: number): Promise<chatMessages[]> => {
    return fetchAPI<chatMessages[]>(MEDIA_API, `/messages/${userId}`);
  },

  // Send message
  sendMessage: async (receiverId: number, message: string): Promise<chatMessages> => {
    return fetchAPI<chatMessages>(MEDIA_API, '/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, message }),
    });
  },

  // Mark messages as read (not yet implemented in backend)
  markAsRead: async (senderId: number): Promise<MessageResponse> => {
    // TODO: Implement in backend
    console.warn('Mark messages as read endpoint not implemented');
    return fetchAPI<MessageResponse>(MEDIA_API, `/messages/${senderId}/read`, {
      method: 'PUT',
    });
  },
};

// ==================== NOTIFICATIONS ====================

export const notificationAPI = {
  // Get all notifications
  getNotifications: async (): Promise<notifications[]> => {
    return fetchAPI<notifications[]>(MEDIA_API, '/notifications');
  },

  // Mark notification as read
  markAsRead: async (notificationId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(MEDIA_API, `/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(MEDIA_API, '/notifications/read-all', {
      method: 'PUT',
    });
  },

  // Delete notification
  deleteNotification: async (notificationId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(MEDIA_API, `/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== FILE UPLOAD ====================
// upload-server handles file uploads on port 3002

export const mediaAPI = {
  // Upload file (image or video)
  uploadFile: async (file: File): Promise<{
    message: string;
    data: {
      filename: string;
      media_type: string;
      filesize: number;
      screenshots: string[];
    };
  }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const response = await fetch(`${UPLOAD_API}/upload/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },

  // Upload multiple files
  uploadFiles: async (files: File[]): Promise<any[]> => {
    const uploadPromises = files.map(file => mediaAPI.uploadFile(file));
    return Promise.all(uploadPromises);
  },

  // Delete file
  deleteFile: async (filename: string): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(UPLOAD_API, `/upload/delete/${filename}`, {
      method: 'DELETE',
    });
  },

  // Get file URL
  getFileUrl: (filename: string): string => {
    return `${UPLOADS_URL}/${filename}`;
  },
};

// Export all APIs as a single object for convenience
export const api = {
  auth: authAPI,
  user: userAPI,
  post: postAPI,
  like: likeAPI,
  comment: commentAPI,
  follow: followAPI,
  travelPlan: travelPlanAPI,
  buddyRequest: buddyRequestAPI,
  participant: participantAPI,
  message: messageAPI,
  notification: notificationAPI,
  media: mediaAPI,
};

export default api;
