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

//  Posts 

/**
 * @api {get} /api/posts Get post feed
 * @apiName GetFeed
 * @apiGroup Posts
 *
 * @apiSuccess {Object[]} posts List of posts with user data and like/comment counts.
 */
router.get('/posts', getFeed);

/**
 * @api {get} /api/posts/search Search posts
 * @apiName SearchPosts
 * @apiGroup Posts
 *
 * @apiQuery {String} q Search query string (matches post text and destination).
 *
 * @apiSuccess {Object[]} posts List of matching post objects.
 */
router.get('/posts/search', searchPosts);

/**
 * @api {get} /api/posts/trending Get trending posts
 * @apiName GetTrendingPosts
 * @apiGroup Posts
 *
 * @apiSuccess {Object[]} posts List of trending posts sorted by like count.
 */
router.get('/posts/trending', getTrendingPosts);

/**
 * @api {get} /api/posts/:id Get a single post
 * @apiName GetPost
 * @apiGroup Posts
 *
 * @apiParam {Number} id Post ID.
 *
 * @apiSuccess {Object} post Post object with user data, like count and comment count.
 * @apiError (404) {String} message Post not found.
 */
router.get('/posts/:id', getPost);

/**
 * @api {get} /api/users/:userId/posts Get posts by a user
 * @apiName GetUserPosts
 * @apiGroup Posts
 *
 * @apiParam {Number} userId User ID.
 *
 * @apiSuccess {Object[]} posts List of post objects belonging to the user.
 */
router.get('/users/:userId/posts', getUserPosts);

/**
 * @api {post} /api/posts Create a post
 * @apiName CreatePost
 * @apiGroup Posts
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiBody {String} teksti_kenttä Post text content.
 * @apiBody {String} [kohde] Destination / location tag.
 * @apiBody {String} [media_url] URL of attached media.
 * @apiBody {String} [media_type] MIME type of attached media (e.g. "image/jpeg").
 *
 * @apiSuccess (201) {Object} post Newly created post object.
 */
router.post('/posts', authenticateToken, createPost);

/**
 * @api {put} /api/posts/:id Update a post
 * @apiName UpdatePost
 * @apiGroup Posts
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} id Post ID.
 * @apiBody {String} [teksti_kenttä] Updated post text.
 * @apiBody {String} [kohde] Updated destination.
 * @apiBody {String} [media_url] Updated media URL.
 *
 * @apiSuccess {Object} post Updated post object.
 * @apiError (404) {String} message Post not found.
 */
router.put('/posts/:id', authenticateToken, updatePost);

/**
 * @api {delete} /api/posts/:id Delete a post
 * @apiName DeletePost
 * @apiGroup Posts
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} id Post ID.
 *
 * @apiSuccess {String} message Post deleted successfully.
 * @apiError (404) {String} message Post not found.
 */
router.delete('/posts/:id', authenticateToken, deletePost);

//  Comments 

/**
 * @api {get} /api/posts/:postId/comments Get comments for a post
 * @apiName GetComments
 * @apiGroup Comments
 *
 * @apiParam {Number} postId Post ID.
 *
 * @apiSuccess {Object[]} comments List of comment objects with user data.
 */
router.get('/posts/:postId/comments', getComments);

/**
 * @api {post} /api/posts/:postId/comments Add a comment to a post
 * @apiName AddComment
 * @apiGroup Comments
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} postId Post ID.
 * @apiBody {String} teksti_kenttä Comment text content.
 *
 * @apiSuccess (201) {Object} comment Newly created comment object with user data.
 */
router.post('/posts/:postId/comments', authenticateToken, addComment);

/**
 * @api {delete} /api/comments/:id Delete a comment
 * @apiName DeleteComment
 * @apiGroup Comments
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} id Comment ID.
 *
 * @apiSuccess {String} message Comment deleted successfully.
 */
router.delete('/comments/:id', authenticateToken, deleteComment);

//  Likes 

/**
 * @api {post} /api/posts/:postId/like Like a post
 * @apiName LikePost
 * @apiGroup Likes
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} postId Post ID.
 *
 * @apiSuccess (201) {Object} like Created like object with id, julkaisuId and userId.
 * @apiError (409) {String} message Post already liked.
 */
router.post('/posts/:postId/like', authenticateToken, likePost);

/**
 * @api {delete} /api/posts/:postId/like Unlike a post
 * @apiName UnlikePost
 * @apiGroup Likes
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} postId Post ID.
 *
 * @apiSuccess {String} message Post unliked successfully.
 */
router.delete('/posts/:postId/like', authenticateToken, unlikePost);

/**
 * @api {get} /api/posts/:postId/like/status Check if current user liked a post
 * @apiName CheckLikeStatus
 * @apiGroup Likes
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} postId Post ID.
 *
 * @apiSuccess {Boolean} liked true if the current user has liked the post.
 */
router.get('/posts/:postId/like/status', authenticateToken, checkLikeStatus);

//  Travel Plans 

/**
 * @api {get} /api/travel-plans Get all travel plans
 * @apiName GetTravelPlans
 * @apiGroup TravelPlans
 *
 * @apiSuccess {Object[]} plans List of travel plan objects.
 */
router.get('/travel-plans', getTravelPlans);

/**
 * @api {get} /api/travel-plans/search Search travel plans
 * @apiName SearchTravelPlans
 * @apiGroup TravelPlans
 *
 * @apiQuery {String} q Search query string (matches destination).
 *
 * @apiSuccess {Object[]} plans List of matching travel plan objects.
 */
router.get('/travel-plans/search', searchTravelPlans);

/**
 * @api {get} /api/travel-plans/:id Get a travel plan
 * @apiName GetTravelPlan
 * @apiGroup TravelPlans
 *
 * @apiParam {Number} id Travel plan ID.
 *
 * @apiSuccess {Object} plan Travel plan object.
 * @apiError (404) {String} message Travel plan not found.
 */
router.get('/travel-plans/:id', getTravelPlan);

/**
 * @api {get} /api/users/:userId/travel-plans Get travel plans by a user
 * @apiName GetUserTravelPlans
 * @apiGroup TravelPlans
 *
 * @apiParam {Number} userId User ID.
 *
 * @apiSuccess {Object[]} plans List of travel plans belonging to the user.
 */
router.get('/users/:userId/travel-plans', getUserTravelPlans);

/**
 * @api {post} /api/travel-plans Create a travel plan
 * @apiName CreateTravelPlan
 * @apiGroup TravelPlans
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiBody {String} kohde Destination.
 * @apiBody {String} suunniteltu_alku_pvm Planned start date (ISO 8601).
 * @apiBody {String} suunniteltu_loppu_pvm Planned end date (ISO 8601).
 * @apiBody {String[]} [aktiviteetit] List of planned activities.
 * @apiBody {Object} [budjetti] Budget breakdown object.
 * @apiBody {String} [kuvaus] Description.
 *
 * @apiSuccess (201) {Object} plan Newly created travel plan object.
 */
router.post('/travel-plans', authenticateToken, createTravelPlan);

/**
 * @api {put} /api/travel-plans/:id Update a travel plan
 * @apiName UpdateTravelPlan
 * @apiGroup TravelPlans
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} id Travel plan ID.
 * @apiBody {String} [kohde] Updated destination.
 * @apiBody {String} [suunniteltu_alku_pvm] Updated start date (ISO 8601).
 * @apiBody {String} [suunniteltu_loppu_pvm] Updated end date (ISO 8601).
 * @apiBody {String[]} [aktiviteetit] Updated activities list.
 * @apiBody {Object} [budjetti] Updated budget object.
 * @apiBody {String} [kuvaus] Updated description.
 *
 * @apiSuccess {Object} plan Updated travel plan object.
 */
router.put('/travel-plans/:id', authenticateToken, updateTravelPlan);

/**
 * @api {delete} /api/travel-plans/:id Delete a travel plan
 * @apiName DeleteTravelPlan
 * @apiGroup TravelPlans
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} id Travel plan ID.
 *
 * @apiSuccess {String} message Travel plan deleted successfully.
 */
router.delete('/travel-plans/:id', authenticateToken, deleteTravelPlan);

//  Buddy Requests 

/**
 * @api {get} /api/buddy-requests Get buddy requests for the current user
 * @apiName GetBuddyRequests
 * @apiGroup BuddyRequests
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiSuccess {Object[]} requests List of buddy request objects sent to the current user.
 */
router.get('/buddy-requests', authenticateToken, getBuddyRequests);

/**
 * @api {get} /api/travel-plans/:planId/requests Get buddy requests for a travel plan
 * @apiName GetPlanBuddyRequests
 * @apiGroup BuddyRequests
 *
 * @apiParam {Number} planId Travel plan ID.
 *
 * @apiSuccess {Object[]} requests List of buddy request objects for the plan.
 */
router.get('/travel-plans/:planId/requests', getPlanBuddyRequests);

/**
 * @api {post} /api/travel-plans/:planId/requests Send a buddy request
 * @apiName SendBuddyRequest
 * @apiGroup BuddyRequests
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} planId Travel plan ID.
 * @apiBody {String} [message] Optional message to the plan owner.
 *
 * @apiSuccess (201) {Object} result Object with buddy request id and success message.
 * @apiError (404) {String} message Travel plan not found.
 */
router.post('/travel-plans/:planId/requests', authenticateToken, sendBuddyRequest);

/**
 * @api {put} /api/buddy-requests/:id/accept Accept a buddy request
 * @apiName AcceptBuddyRequest
 * @apiGroup BuddyRequests
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} id Buddy request ID.
 *
 * @apiSuccess {String} message Buddy request accepted.
 */
router.put('/buddy-requests/:id/accept', authenticateToken, acceptBuddyRequest);

/**
 * @api {put} /api/buddy-requests/:id/reject Reject a buddy request
 * @apiName RejectBuddyRequest
 * @apiGroup BuddyRequests
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} id Buddy request ID.
 *
 * @apiSuccess {String} message Buddy request rejected.
 */
router.put('/buddy-requests/:id/reject', authenticateToken, rejectBuddyRequest);

//  Trip Participants 

/**
 * @api {get} /api/travel-plans/:planId/participants Get participants of a travel plan
 * @apiName GetTripParticipants
 * @apiGroup TripParticipants
 *
 * @apiParam {Number} planId Travel plan ID.
 *
 * @apiSuccess {Object[]} participants List of trip participant objects.
 */
router.get('/travel-plans/:planId/participants', getTripParticipants);

/**
 * @api {delete} /api/participants/:id Remove a trip participant
 * @apiName RemoveTripParticipant
 * @apiGroup TripParticipants
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} id Participant record ID.
 *
 * @apiSuccess {String} message Participant removed successfully.
 */
router.delete('/participants/:id', authenticateToken, removeTripParticipant);

//  Messages 

/**
 * @api {get} /api/messages/conversations Get all conversations
 * @apiName GetConversations
 * @apiGroup Messages
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiSuccess {Object[]} conversations List of conversation summary objects (latest message per user).
 */
router.get('/messages/conversations', authenticateToken, getConversations);

/**
 * @api {get} /api/messages/:userId Get message thread with a user
 * @apiName GetMessages
 * @apiGroup Messages
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} userId The other user's ID.
 *
 * @apiSuccess {Object[]} messages List of chat message objects in chronological order.
 */
router.get('/messages/:userId', authenticateToken, getMessages);

/**
 * @api {post} /api/messages Send a message
 * @apiName SendMessage
 * @apiGroup Messages
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiBody {Number} receiverId Recipient user ID.
 * @apiBody {String} message Message text content.
 *
 * @apiSuccess (201) {Object} result Object with new message id and success message.
 * @apiError (400) {String} message Message text is required.
 */
router.post('/messages', authenticateToken, sendMessage);

/**
 * @api {put} /api/messages/:senderId/read Mark messages from a sender as read
 * @apiName MarkMessagesAsRead
 * @apiGroup Messages
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} senderId The sender's user ID.
 *
 * @apiSuccess {String} message Messages marked as read.
 */
router.put('/messages/:senderId/read', authenticateToken, markMessagesAsRead);

//  Notifications 

/**
 * @api {get} /api/notifications Get notifications for the current user
 * @apiName GetNotifications
 * @apiGroup Notifications
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiSuccess {Object[]} notifications List of notification objects sorted newest first.
 */
router.get('/notifications', authenticateToken, getNotifications);

/**
 * @api {put} /api/notifications/:id/read Mark a notification as read
 * @apiName MarkNotificationAsRead
 * @apiGroup Notifications
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} id Notification ID.
 *
 * @apiSuccess {String} message Notification marked as read.
 */
router.put('/notifications/:id/read', authenticateToken, markNotificationAsRead);

/**
 * @api {put} /api/notifications/read-all Mark all notifications as read
 * @apiName MarkAllNotificationsAsRead
 * @apiGroup Notifications
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiSuccess {String} message All notifications marked as read.
 */
router.put('/notifications/read-all', authenticateToken, markAllNotificationsAsRead);

/**
 * @api {delete} /api/notifications/:id Delete a notification
 * @apiName DeleteNotification
 * @apiGroup Notifications
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} id Notification ID.
 *
 * @apiSuccess {String} message Notification deleted successfully.
 */
router.delete('/notifications/:id', authenticateToken, deleteNotification);

export default router;
