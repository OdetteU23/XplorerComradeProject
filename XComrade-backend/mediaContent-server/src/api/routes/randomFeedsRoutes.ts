import express from 'express';
import {getRandomPosts, getRandomUsers} from '../controllers/randomFeedsController';
import { optionalAuth } from '../../middleware/mediaContent';

const router = express.Router();

/**
 * @api {get} /api/posts/random Get random posts
 * @apiName GetRandomPosts
 * @apiGroup RandomFeeds
 *
 * @apiQuery {Number} [count=10] Number of random posts to return.
 *
 * @apiSuccess {Object[]} posts List of random post objects.
 */
router.get('/posts/random', getRandomPosts);

/**
 * @api {get} /api/users/random Get random users
 * @apiName GetRandomUsers
 * @apiGroup RandomFeeds
 * @apiHeader {String} [Authorization] Bearer token (optional — excludes already-followed users when provided).
 *
 * @apiSuccess {Object[]} users List of random user objects.
 */
router.get('/users/random', optionalAuth, getRandomUsers);

export default router;
