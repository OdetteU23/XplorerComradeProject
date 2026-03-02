import express from 'express';
import {getRandomPosts, getRandomUsers} from '../controllers/randomFeedsController';
import { optionalAuth } from '../../middleware/mediaContent';

const router = express.Router();

router.get('/posts/random', getRandomPosts);
router.get('/users/random', optionalAuth, getRandomUsers);

export default router;
