import express from 'express';
import {
  searchUsers,
  getUserProfile,
  updateProfile,
  getUserStats,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStatus,
} from '../controllers/userController';
import { authenticateToken, optionalAuth } from '../../middleware/auth';

const router = express.Router();

/**
 * @api {get} /api/users/search Search users
 * @apiName SearchUsers
 * @apiGroup Users
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiQuery {String} q Search query (matches username, first name, last name)
 *
 * @apiSuccess {Object[]} users Array of matching user profiles with stats
 */
router.get('/search', authenticateToken, searchUsers);

/**
 * @api {get} /api/users/:id Get user profile
 * @apiName GetUserProfile
 * @apiGroup Users
 * @apiHeader {String} [Authorization] Bearer token (optional, enables follow status)
 *
 * @apiParam {Number} id User ID
 *
 * @apiSuccess {Object} user User profile with stats and optional follow status
 */
router.get('/:id', optionalAuth, getUserProfile);

/**
 * @api {put} /api/users/:id Update user profile
 * @apiName UpdateUserProfile
 * @apiGroup Users
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {Number} id User ID (must match authenticated user)
 * @apiBody {String} [etunimi] First name
 * @apiBody {String} [sukunimi] Last name
 * @apiBody {String} [sahkoposti] Email
 * @apiBody {String} [profile_picture_url] Profile picture URL
 * @apiBody {String} [bio] User bio
 * @apiBody {String} [location] User location
 *
 * @apiSuccess {Object} user Updated user profile
 */
router.put('/:id', authenticateToken, updateProfile);

/**
 * @api {get} /api/users/:id/stats Get user stats
 * @apiName GetUserStats
 * @apiGroup Users
 *
 * @apiParam {Number} id User ID
 *
 * @apiSuccess {Number} postsCount Number of posts
 * @apiSuccess {Number} followersCount Number of followers
 * @apiSuccess {Number} followingCount Number of following
 */
router.get('/:id/stats', getUserStats);

/**
 * @api {post} /api/users/:id/follow Follow a user
 * @apiName FollowUser
 * @apiGroup Follow
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {Number} id User ID to follow
 *
 * @apiSuccess {Object} follow Follow relationship object
 */
router.post('/:id/follow', authenticateToken, followUser);

/**
 * @api {delete} /api/users/:id/follow Unfollow a user
 * @apiName UnfollowUser
 * @apiGroup Follow
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {Number} id User ID to unfollow
 *
 * @apiSuccess {String} message Success message
 */
router.delete('/:id/follow', authenticateToken, unfollowUser);

/**
 * @api {get} /api/users/:id/followers Get user's followers
 * @apiName GetFollowers
 * @apiGroup Follow
 *
 * @apiParam {Number} id User ID
 *
 * @apiSuccess {Object[]} users Array of follower profiles
 */
router.get('/:id/followers', getFollowers);

/**
 * @api {get} /api/users/:id/following Get user's following
 * @apiName GetFollowing
 * @apiGroup Follow
 *
 * @apiParam {Number} id User ID
 *
 * @apiSuccess {Object[]} users Array of following profiles
 */
router.get('/:id/following', getFollowing);

/**
 * @api {get} /api/users/:id/follow/status Check follow status
 * @apiName GetFollowStatus
 * @apiGroup Follow
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {Number} id Target user ID
 *
 * @apiSuccess {String} message Follow status message
 * @apiSuccess {Boolean} success Whether currently following
 */
router.get('/:id/follow/status', authenticateToken, getFollowStatus);

export default router;
