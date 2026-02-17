/*
import request from 'supertest';
import express, { Application } from 'express';
import authRoutes from '../src/api/routes/authRoutes';
import db from '../src/database/db-manipulation';
import { registeringInfo, loginInfo } from '@xcomrade/types-server';

// Create minimal express app for testing
const app: Application = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication API Integration Tests', () => {
  // Clean up database before each test
  beforeEach(() => {
    db.prepare('DELETE FROM users').run();
  });

  afterAll(() => {
    db.close();
  });

  describe('POST /api/auth/register', () => {
    const validUser: registeringInfo = {
      käyttäjäTunnus: 'testuser',
      salasana: 'TestPassword123',
      etunimi: 'Test',
      sukunimi: 'User',
      sahkoposti: 'test@example.com',
      bio: 'Test bio',
      location: 'Test City',
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.käyttäjäTunnus).toBe(validUser.käyttäjäTunnus);
      expect(response.body.user.salasana).toBeUndefined(); // Password should not be returned
    });

    it('should return 400 for missing required fields', async () => {
      const invalidUser = {
        käyttäjäTunnus: 'testuser',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.message).toContain('required');
    });

    it('should return 409 for duplicate username', async () => {
      // Register first user
      await request(app).post('/api/auth/register').send(validUser);

      // Try to register with same username
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(409);

      expect(response.body.message).toBe('Username already exists');
    });

    it('should return 409 for duplicate email', async () => {
      await request(app).post('/api/auth/register').send(validUser);

      // Try to register with different username but same email
      const duplicateEmail = {
        ...validUser,
        käyttäjäTunnus: 'differentuser',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateEmail)
        .expect(409);

      expect(response.body.message).toBe('Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    const testUser: registeringInfo = {
      käyttäjäTunnus: 'logintest',
      salasana: 'LoginPassword123',
      etunimi: 'Login',
      sukunimi: 'Test',
      sahkoposti: 'login@example.com',
    };

    beforeEach(async () => {
      // Register a user before each login test
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should login successfully with correct credentials', async () => {
      const credentials: loginInfo = {
        käyttäjäTunnus: testUser.käyttäjäTunnus,
        salasana: testUser.salasana,
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.käyttäjäTunnus).toBe(testUser.käyttäjäTunnus);
    });

    it('should return 401 for non-existent username', async () => {
      const credentials: loginInfo = {
        käyttäjäTunnus: 'nonexistent',
        salasana: 'password',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.message).toBe('Invalid username or password');
    });

    it('should return 401 for incorrect password', async () => {
      const credentials: loginInfo = {
        käyttäjäTunnus: testUser.käyttäjäTunnus,
        salasana: 'WrongPassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.message).toBe('Invalid username or password');
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('required');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken: string;

    beforeEach(async () => {
      const testUser: registeringInfo = {
        käyttäjäTunnus: 'metest',
        salasana: 'MeTestPassword123',
        etunimi: 'Me',
        sukunimi: 'Test',
        sahkoposti: 'me@example.com',
      };

      // Register and get token
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      authToken = response.body.token;
    });

    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.käyttäjäTunnus).toBe('metest');
      expect(response.body.etunimi).toBe('Me');
      expect(response.body.salasana).toBeUndefined();
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should return 403 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(403);

      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.message).toBe('Logout successful');
    });
  });
});
*/
