import express from 'express';
import {getRandomPosts, getRandomUsers} from '../controllers/randomFeedsController';
//import { authenticateToken } from '../../middlewares/authentication';

//Todo: Add authentication middleware to these routes when ready

const router = express.Router();

router.get('/posts/random', /*authenticateToken,*/ getRandomPosts);
router.get('/users/random', /*authenticateToken,*/ getRandomUsers);

export default router;
