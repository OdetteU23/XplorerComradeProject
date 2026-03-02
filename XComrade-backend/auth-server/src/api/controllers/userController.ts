import { Request, Response } from 'express';
import type { UserSearchResult, UserProfileWithStats } from '@xcomrade/types-server';
import userModel from '../models/userModel';
import db from '../../database/db-manipulation';

// Search users (requires authentication — only registered users can search)
export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;

    if (!query || !query.trim()) {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    const userRows = userModel.searchUsers(query.trim());
    const results: UserSearchResult[] = userRows.map((row) => {
      const profile = userModel.toUserProfile(row);
      const stats = userModel.getUserStats(row.id);
      return {
        ...profile,
        postsCount: stats.postsCount,
        followersCount: stats.followersCount,
        followingCount: stats.followingCount,
      };
    });

    res.status(200).json(results);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error while searching users' });
  }
};

// Get user profile by ID (public — optionalAuth for follow status)
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const userRow = userModel.findById(userId);
    if (!userRow) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const profile = userModel.toUserProfile(userRow);
    const stats = userModel.getUserStats(userId);

    const result: UserProfileWithStats = {
      ...profile,
      postsCount: stats.postsCount,
      followersCount: stats.followersCount,
      followingCount: stats.followingCount,
    };

    // If viewer is authenticated, check follow status
    if (req.user) {
      const followCheck = db.prepare(
        'SELECT id FROM seuranta WHERE seuraajaId = ? AND seurattavaId = ?'
      ).get(req.user.id, userId) as { id: number } | undefined;
      result.isFollowing = !!followCheck;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error while fetching user profile' });
  }
};

// Update user profile (auth required, can only update own profile)
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    // Users can only update their own profile
    if (req.user.id !== userId) {
      res.status(403).json({ message: 'You can only update your own profile' });
      return;
    }

    const updatedRow = userModel.update(userId, req.body);
    if (!updatedRow) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const profile = userModel.toUserProfile(updatedRow);
    res.status(200).json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// Get user stats (public)
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const userRow = userModel.findById(userId);
    if (!userRow) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const stats = userModel.getUserStats(userId);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error while fetching user stats' });
  }
};

// Follow a user (auth required)
export const followUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const targetUserId = parseInt(req.params.id, 10);
    if (isNaN(targetUserId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    // Can't follow yourself
    if (req.user.id === targetUserId) {
      res.status(400).json({ message: 'You cannot follow yourself' });
      return;
    }

    // Check if target user exists
    const targetUser = userModel.findById(targetUserId);
    if (!targetUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if already following
    const existing = db.prepare(
      'SELECT id FROM seuranta WHERE seuraajaId = ? AND seurattavaId = ?'
    ).get(req.user.id, targetUserId) as { id: number } | undefined;

    if (existing) {
      res.status(409).json({ message: 'Already following this user' });
      return;
    }

    const stmt = db.prepare(
      'INSERT INTO seuranta (seuraajaId, seurattavaId) VALUES (?, ?)'
    );
    const result = stmt.run(req.user.id, targetUserId);

    res.status(201).json({
      id: Number(result.lastInsertRowid),
      seuraajaId: req.user.id,
      seurattavaId: targetUserId,
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error while following user' });
  }
};

// Unfollow a user (auth required)
export const unfollowUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const targetUserId = parseInt(req.params.id, 10);
    if (isNaN(targetUserId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const result = db.prepare(
      'DELETE FROM seuranta WHERE seuraajaId = ? AND seurattavaId = ?'
    ).run(req.user.id, targetUserId);

    if (result.changes === 0) {
      res.status(404).json({ message: 'You are not following this user' });
      return;
    }

    res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error while unfollowing user' });
  }
};

// Get followers of a user (public)
export const getFollowers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const userRow = userModel.findById(userId);
    if (!userRow) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const followers = db.prepare(`
      SELECT u.* FROM käyttäjä u
      INNER JOIN seuranta f ON f.seuraajaId = u.id
      WHERE f.seurattavaId = ?
    `).all(userId);

    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profiles = (followers as Record<string, any>[]).map((row) => userModel.toUserProfile(row as any));
    res.status(200).json(profiles);
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error while fetching followers' });
  }
};

// Get following of a user (public)
export const getFollowing = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const userRow = userModel.findById(userId);
    if (!userRow) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const following = db.prepare(`
      SELECT u.* FROM käyttäjä u
      INNER JOIN seuranta f ON f.seurattavaId = u.id
      WHERE f.seuraajaId = ?
    `).all(userId);

    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profiles = (following as Record<string, any>[]).map((row) => userModel.toUserProfile(row as any));
    res.status(200).json(profiles);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error while fetching following' });
  }
};

// Check if following a user (auth required)
export const getFollowStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const targetUserId = parseInt(req.params.id, 10);
    if (isNaN(targetUserId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const existing = db.prepare(
      'SELECT id FROM seuranta WHERE seuraajaId = ? AND seurattavaId = ?'
    ).get(req.user.id, targetUserId) as { id: number } | undefined;

    res.status(200).json({
      message: existing ? 'Following' : 'Not following',
      success: !!existing,
    });
  } catch (error) {
    console.error('Get follow status error:', error);
    res.status(500).json({ message: 'Server error while checking follow status' });
  }
};

export default {
  searchUsers,
  getUserProfile,
  updateProfile,
  getUserStats,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStatus,
};
