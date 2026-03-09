import express from 'express';
import {
  getFeed, getPost, getUserPosts, createPost, updatePost, deletePost, searchPosts, searchTravelPlans, getTrendingPosts,
  getComments, addComment, deleteComment,
  likePost, unlikePost, checkLikeStatus,
  getTravelPlans, getTravelPlan, getUserTravelPlans, createTravelPlan, updateTravelPlan, deleteTravelPlan,
  getBuddyRequests, getPlanBuddyRequests, sendBuddyRequest, acceptBuddyRequest, rejectBuddyRequest,
  getTripParticipants, removeTripParticipant,
  getConversations, getMessages, sendMessage, markMessagesAsRead,
  getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification,
} from '../controllers/mediaContentController';
import { authenticateToken } from '../../middleware/mediaContent';

const router = express.Router();

router.get('/posts', getFeed);
router.get('/posts/search', searchPosts);
router.get('/posts/trending', getTrendingPosts);
router.get('/posts/:id', getPost);
router.get('/users/:userId/posts', getUserPosts);
router.post('/posts', authenticateToken, createPost);
router.put('/posts/:id', authenticateToken, updatePost);
router.delete('/posts/:id', authenticateToken, deletePost);

router.get('/posts/:postId/comments', getComments);
router.post('/posts/:postId/comments', authenticateToken, addComment);
router.delete('/comments/:id', authenticateToken, deleteComment);

router.post('/posts/:postId/like', authenticateToken, likePost);
router.delete('/posts/:postId/like', authenticateToken, unlikePost);
router.get('/posts/:postId/like/status', authenticateToken, checkLikeStatus);

router.get('/travel-plans', getTravelPlans);
router.get('/travel-plans/search', searchTravelPlans);
router.get('/travel-plans/:id', getTravelPlan);
router.get('/users/:userId/travel-plans', getUserTravelPlans);
router.post('/travel-plans', authenticateToken, createTravelPlan);
router.put('/travel-plans/:id', authenticateToken, updateTravelPlan);
router.delete('/travel-plans/:id', authenticateToken, deleteTravelPlan);

router.get('/buddy-requests', authenticateToken, getBuddyRequests);
router.get('/travel-plans/:planId/requests', getPlanBuddyRequests);
router.post('/travel-plans/:planId/requests', authenticateToken, sendBuddyRequest);
router.put('/buddy-requests/:id/accept', authenticateToken, acceptBuddyRequest);
router.put('/buddy-requests/:id/reject', authenticateToken, rejectBuddyRequest);

router.get('/travel-plans/:planId/participants', getTripParticipants);
router.delete('/participants/:id', authenticateToken, removeTripParticipant);

router.get('/messages/conversations', authenticateToken, getConversations);
router.get('/messages/:userId', authenticateToken, getMessages);
router.post('/messages', authenticateToken, sendMessage);
router.put('/messages/:senderId/read', authenticateToken, markMessagesAsRead);

router.get('/notifications', authenticateToken, getNotifications);
router.put('/notifications/:id/read', authenticateToken, markNotificationAsRead);
router.put('/notifications/read-all', authenticateToken, markAllNotificationsAsRead);
router.delete('/notifications/:id', authenticateToken, deleteNotification);

export default router;
