/*
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateToken } from '../src/middleware/auth';
import userModel from '../src/api/models/userModel';
import db from '../src/database/db-manipulation';
import type { registeringInfo } from '@xcomrade/types-server';

describe('Authentication Unit Tests', () => {
  // Clean up database before each test
  beforeEach(() => {
    db.prepare('DELETE FROM käyttäjä').run();
  });

  afterAll(() => {
    db.close();
  });

  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hashedPassword = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate valid JWT token', () => {
      const userId = 1;
      const username = 'testuser';

      const token = generateToken(userId, username);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should decode token with correct payload', () => {
      const userId = 1;
      const username = 'testuser';

      const token = generateToken(userId, username);
      const decoded = jwt.decode(token) as { id: number; username: string };

      expect(decoded.id).toBe(userId);
      expect(decoded.username).toBe(username);
    });
  });

  describe('User Model', () => {
    const testUser: registeringInfo = {
      käyttäjäTunnus: 'testuser',
      salasana: 'hashedPassword123',
      etunimi: 'Test',
      sukunimi: 'User',
      sahkoposti: 'test@example.com',
      bio: 'Test bio',
      location: 'Test City',
    };

    it('should create a new user', () => {
      const user = userModel.create(testUser);

      expect(user.id).toBeDefined();
      expect(user.käyttäjäTunnus).toBe(testUser.käyttäjäTunnus);
      expect(user.etunimi).toBe(testUser.etunimi);
      expect(user.sahkoposti).toBe(testUser.sahkoposti);
    });

    it('should find user by username', () => {
      userModel.create(testUser);

      const found = userModel.findByUsername('testuser');

      expect(found).toBeDefined();
      expect(found?.käyttäjäTunnus).toBe('testuser');
    });

    it('should find user by email', () => {
      userModel.create(testUser);

      const found = userModel.findByEmail('test@example.com');

      expect(found).toBeDefined();
      expect(found?.sahkoposti).toBe('test@example.com');
    });

    it('should return undefined for non-existent user', () => {
      const found = userModel.findByUsername('nonexistent');

      expect(found).toBeUndefined();
    });

    it('should convert user row to user profile (without password)', () => {
      const user = userModel.create(testUser);
      const profile = userModel.toUserProfile(user);

      expect(profile).toBeDefined();
      expect(profile.id).toBe(user.id);
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((profile as any).salasana).toBeUndefined();
    });

    it('should search users by query', () => {
      userModel.create(testUser);
      userModel.create({
        ...testUser,
        käyttäjäTunnus: 'anotheruser',
        sahkoposti: 'another@example.com',
        etunimi: 'Another',
      });

      const results = userModel.searchUsers('test');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(u => u.käyttäjäTunnus === 'testuser')).toBe(true);
    });

    it('should update user profile', () => {
      const user = userModel.create(testUser);

      const updated = userModel.update(user.id, {
        bio: 'Updated bio',
        location: 'New City',
      });

      expect(updated).toBeDefined();
      expect(updated?.bio).toBe('Updated bio');
      expect(updated?.location).toBe('New City');
    });

    it('should get user stats', () => {
      const user = userModel.create(testUser);
      const stats = userModel.getUserStats(user.id);

      expect(stats).toBeDefined();
      expect(stats.postsCount).toBe(0);
      expect(stats.followersCount).toBe(0);
      expect(stats.followingCount).toBe(0);
    });
  });
});
*/
