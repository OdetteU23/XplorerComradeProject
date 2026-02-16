import express from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/authController';
import { authenticateToken } from '../../middleware/auth';

const router = express.Router();

/**
 * @api {post} /api/auth/register Register a new user
 * @apiName Register
 * @apiGroup Authentication
 *
 * @apiBody {String} käyttäjäTunnus Username (unique)
 * @apiBody {String} salasana Password
 * @apiBody {String} etunimi First name
 * @apiBody {String} sukunimi Last name
 * @apiBody {String} sahkoposti Email address (unique)
 * @apiBody {String} [bio] User bio
 * @apiBody {String} [location] User location
 *
 * @apiSuccess {String} message Success message
 * @apiSuccess {String} token JWT authentication token
 * @apiSuccess {Object} user User profile object
 */
router.post('/register', register);

/**
 * @api {post} /api/auth/login Login user
 * @apiName Login
 * @apiGroup Authentication
 *
 * @apiBody {String} käyttäjäTunnus Username
 * @apiBody {String} salasana Password
 *
 * @apiSuccess {String} message Success message
 * @apiSuccess {String} token JWT authentication token
 * @apiSuccess {Object} user User profile object
 */
router.post('/login', login);

/**
 * @api {get} /api/auth/me Get current user
 * @apiName GetCurrentUser
 * @apiGroup Authentication
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiSuccess {Object} user Current user profile object
 */
router.get('/me', authenticateToken, getCurrentUser);

/**
 * @api {post} /api/auth/logout Logout user
 * @apiName Logout
 * @apiGroup Authentication
 *
 * @apiSuccess {String} message Success message
 */
router.post('/logout', logout);

export default router;
