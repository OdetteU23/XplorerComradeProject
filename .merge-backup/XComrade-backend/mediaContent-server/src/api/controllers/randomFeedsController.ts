import type { Request, Response, NextFunction } from 'express';
import randomFeedsModel from '../models/randomFeedsModel';
//import postContentsModel from '../models/mediaContentModel';
import db from '../../database/db-manipulation';

const randomFeedsControllers = {

  // GET /api/posts/random
  getRandomPosts: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const count = req.query.count ? parseInt(req.query.count as string) : 10;
      const posts = randomFeedsModel.randomPosts(count);
      res.json(posts);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/users/random
  getRandomUsers: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const currentUserId = res.locals.user?.id as number;
      const currentUsername = res.locals.user?.käyttäjäTunnus as string;

       // If no authenticated user, return random users without filtering
      if (!currentUserId || !currentUsername) {
        const users = randomFeedsModel.randomUsersPopping('', []);
        res.json(users);
        return;
      }

      // Joining seurattavaID with users table to get the usernames
      const followedUsernames = db.prepare(`
        SELECT u.käyttäjäTunnus
        FROM seuranta s
        JOIN käyttäjä u ON s.seurattavaId = u.id
        WHERE s.seuraajaId = ?
      `).all(currentUserId) as { käyttäjäTunnus: string }[];

      const usernames = followedUsernames.map((u) => u.käyttäjäTunnus);

      const users = randomFeedsModel.randomUsersPopping(currentUsername, usernames);
      res.json(users);
    } catch (err) {
      next(err);
    }
  },

};
export const  {getRandomPosts, getRandomUsers} = randomFeedsControllers;

export default randomFeedsControllers;
