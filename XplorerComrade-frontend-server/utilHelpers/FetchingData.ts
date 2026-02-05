import type {userProfile, loginInfo,
  registeringInfo, julkaisu, julkaisuWithRelations, matkaAikeet, kommentti, tykkäykset, seuranta, chatMessages,
  notifications, friendRequest, tripParticipants, media_images, MessageResponse,ErrorResponse, BooleanResponse,
} from '@xplorercomrade/types-server';

// API Base URL - Update this to match your backend server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
    const response = await fetchAPI<{ token: string; user: userProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    // Store token in localStorage
    localStorage.setItem('authToken', response.token);
    return response;
  },

  // Register new user
  register: async (data: registeringInfo): Promise<{ token: string; user: userProfile }> => {
    const response = await fetchAPI<{ token: string; user: userProfile }>('/auth/register', {
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
    return fetchAPI<userProfile>('/auth/me');
  },
};

// ==================== USER PROFILE ====================

export const userAPI = {
  // Get user profile by ID
  getProfile: async (userId: number): Promise<userProfile> => {
    return fetchAPI<userProfile>(`/users/${userId}`);
  },

  // Update user profile
  updateProfile: async (userId: number, data: Partial<userProfile>): Promise<userProfile> => {
    return fetchAPI<userProfile>(`/users/${userId}`, {
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
    return fetchAPI(`/users/${userId}/stats`);
  },

  // Search users
  searchUsers: async (query: string): Promise<userProfile[]> => {
    return fetchAPI<userProfile[]>(`/users/search?q=${encodeURIComponent(query)}`);
  },
};

// ==================== POSTS ====================

export const postAPI = {
  // Get all posts (feed)
  getFeed: async (page: number = 1, limit: number = 20): Promise<julkaisuWithRelations[]> => {
    return fetchAPI<julkaisuWithRelations[]>(`/posts?page=${page}&limit=${limit}`);
  },

  // Get post by ID
  getPost: async (postId: number): Promise<julkaisuWithRelations> => {
    return fetchAPI<julkaisuWithRelations>(`/posts/${postId}`);
  },

  // Get posts by user ID
  getUserPosts: async (userId: number): Promise<julkaisuWithRelations[]> => {
    return fetchAPI<julkaisuWithRelations[]>(`/users/${userId}/posts`);
  },

  // Create new post
  createPost: async (data: Partial<julkaisu>): Promise<julkaisuWithRelations> => {
    return fetchAPI<julkaisuWithRelations>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update post
  updatePost: async (postId: number, data: Partial<julkaisu>): Promise<julkaisuWithRelations> => {
    return fetchAPI<julkaisuWithRelations>(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete post
  deletePost: async (postId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(`/posts/${postId}`, {
      method: 'DELETE',
    });
  },

  // Search posts
  searchPosts: async (query: string): Promise<julkaisuWithRelations[]> => {
    return fetchAPI<julkaisuWithRelations[]>(`/posts/search?q=${encodeURIComponent(query)}`);
  },

  // Get trending posts
  getTrendingPosts: async (): Promise<julkaisuWithRelations[]> => {
    return fetchAPI<julkaisuWithRelations[]>('/posts/trending');
  },
};

// ==================== LIKES ====================

export const likeAPI = {
  // Like a post
  likePost: async (postId: number): Promise<tykkäykset> => {
    return fetchAPI<tykkäykset>(`/posts/${postId}/like`, {
      method: 'POST',
    });
  },

  // Unlike a post
  unlikePost: async (postId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(`/posts/${postId}/like`, {
      method: 'DELETE',
    });
  },

  // Check if user liked a post
  isPostLiked: async (postId: number): Promise<BooleanResponse> => {
    return fetchAPI<BooleanResponse>(`/posts/${postId}/like/status`);
  },
};

// ==================== COMMENTS ====================

export const commentAPI = {
  // Get comments for a post
  getComments: async (postId: number): Promise<kommentti[]> => {
    return fetchAPI<kommentti[]>(`/posts/${postId}/comments`);
  },

  // Add comment to post
  addComment: async (postId: number, text: string): Promise<kommentti> => {
    return fetchAPI<kommentti>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ teksti_kenttä: text }),
    });
  },

  // Delete comment
  deleteComment: async (commentId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== FOLLOW ====================

export const followAPI = {
  // Follow a user
  followUser: async (userId: number): Promise<seuranta> => {
    return fetchAPI<seuranta>(`/users/${userId}/follow`, {
      method: 'POST',
    });
  },

  // Unfollow a user
  unfollowUser: async (userId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(`/users/${userId}/follow`, {
      method: 'DELETE',
    });
  },

  // Get followers
  getFollowers: async (userId: number): Promise<userProfile[]> => {
    return fetchAPI<userProfile[]>(`/users/${userId}/followers`);
  },

  // Get following
  getFollowing: async (userId: number): Promise<userProfile[]> => {
    return fetchAPI<userProfile[]>(`/users/${userId}/following`);
  },

  // Check if following
  isFollowing: async (userId: number): Promise<BooleanResponse> => {
    return fetchAPI<BooleanResponse>(`/users/${userId}/follow/status`);
  },
};

// ==================== TRAVEL PLANS ====================

export const travelPlanAPI = {
  // Get all travel plans
  getTravelPlans: async (): Promise<matkaAikeet[]> => {
    return fetchAPI<matkaAikeet[]>('/travel-plans');
  },

  // Get travel plan by ID
  getTravelPlan: async (planId: number): Promise<matkaAikeet> => {
    return fetchAPI<matkaAikeet>(`/travel-plans/${planId}`);
  },

  // Get user's travel plans
  getUserTravelPlans: async (userId: number): Promise<matkaAikeet[]> => {
    return fetchAPI<matkaAikeet[]>(`/users/${userId}/travel-plans`);
  },

  // Create travel plan
  createTravelPlan: async (data: Partial<matkaAikeet>): Promise<matkaAikeet> => {
    return fetchAPI<matkaAikeet>('/travel-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update travel plan
  updateTravelPlan: async (planId: number, data: Partial<matkaAikeet>): Promise<matkaAikeet> => {
    return fetchAPI<matkaAikeet>(`/travel-plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete travel plan
  deleteTravelPlan: async (planId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(`/travel-plans/${planId}`, {
      method: 'DELETE',
    });
  },

  // Search travel plans
  searchTravelPlans: async (query: string): Promise<matkaAikeet[]> => {
    return fetchAPI<matkaAikeet[]>(`/travel-plans/search?q=${encodeURIComponent(query)}`);
  },
};

// ==================== BUDDY REQUESTS ====================

export const buddyRequestAPI = {
  // Get all buddy requests
  getBuddyRequests: async (): Promise<friendRequest[]> => {
    return fetchAPI<friendRequest[]>('/buddy-requests');
  },

  // Get buddy requests for a travel plan
  getPlanRequests: async (planId: number): Promise<friendRequest[]> => {
    return fetchAPI<friendRequest[]>(`/travel-plans/${planId}/requests`);
  },

  // Send buddy request
  sendBuddyRequest: async (planId: number, message: string): Promise<friendRequest> => {
    return fetchAPI<friendRequest>(`/travel-plans/${planId}/requests`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // Accept buddy request
  acceptBuddyRequest: async (requestId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(`/buddy-requests/${requestId}/accept`, {
      method: 'PUT',
    });
  },

  // Reject buddy request
  rejectBuddyRequest: async (requestId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(`/buddy-requests/${requestId}/reject`, {
      method: 'PUT',
    });
  },
};

// ==================== TRIP PARTICIPANTS ====================

export const participantAPI = {
  // Get trip participants
  getParticipants: async (planId: number): Promise<tripParticipants[]> => {
    return fetchAPI<tripParticipants[]>(`/travel-plans/${planId}/participants`);
  },

  // Remove participant
  removeParticipant: async (participantId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(`/participants/${participantId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== MESSAGES ====================

export const messageAPI = {
  // Get conversations
  getConversations: async (): Promise<chatMessages[]> => {
    return fetchAPI<chatMessages[]>('/messages/conversations');
  },

  // Get messages with a user
  getMessages: async (userId: number): Promise<chatMessages[]> => {
    return fetchAPI<chatMessages[]>(`/messages/${userId}`);
  },

  // Send message
  sendMessage: async (receiverId: number, message: string): Promise<chatMessages> => {
    return fetchAPI<chatMessages>('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, message }),
    });
  },

  // Mark messages as read
  markAsRead: async (senderId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(`/messages/${senderId}/read`, {
      method: 'PUT',
    });
  },
};

// ==================== NOTIFICATIONS ====================

export const notificationAPI = {
  // Get all notifications
  getNotifications: async (): Promise<notifications[]> => {
    return fetchAPI<notifications[]>('/notifications');
  },

  // Mark notification as read
  markAsRead: async (notificationId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>('/notifications/read-all', {
      method: 'PUT',
    });
  },

  // Delete notification
  deleteNotification: async (notificationId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== MEDIA ====================

export const mediaAPI = {
  // Upload images
  uploadImages: async (files: File[]): Promise<media_images[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/media/upload`, {
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

  // Get images for a post
  getPostImages: async (postId: number): Promise<media_images[]> => {
    return fetchAPI<media_images[]>(`/posts/${postId}/images`);
  },

  // Delete image
  deleteImage: async (imageId: number): Promise<MessageResponse> => {
    return fetchAPI<MessageResponse>(`/media/${imageId}`, {
      method: 'DELETE',
    });
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
