jest.mock('../src/database/db-manipulation', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require('better-sqlite3');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { tables } = require('../src/database/db-config');
  const db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  db.exec(tables);
  return { __esModule: true, default: db };
});

import request from 'supertest';
import express, { Application } from 'express';
import mediaContentRoutes from '../src/api/routes/mediaContentRoutes';
import randomFeedsRoutes from '../src/api/routes/randomFeedsRoutes';
import { generateToken } from '../src/middleware/mediaContent';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockDb = require('../src/database/db-manipulation').default;

const app: Application = express();
app.use(express.json());
// randomFeedsRoutes must be mounted BEFORE mediaContentRoutes so that
// /posts/random is not captured by the /posts/:id param route first.
app.use('/api', randomFeedsRoutes);
app.use('/api', mediaContentRoutes);

function insertUser(käyttäjäTunnus = 'integuser', sahkoposti = 'integ@test.com'): number {
  const r = mockDb
    .prepare(
      'INSERT INTO käyttäjä (käyttäjäTunnus, salasana, etunimi, sukunimi, sahkoposti) VALUES (?,?,?,?,?)',
    )
    .run(käyttäjäTunnus, 'pw', 'Int', 'Eg', sahkoposti);
  return r.lastInsertRowid as number;
}

function makeToken(userId: number, username: string): string {
  return generateToken(userId, username);
}

afterEach(() => {
  mockDb.exec('DELETE FROM friendRequest');
  mockDb.exec('DELETE FROM tripParticipants');
  mockDb.exec('DELETE FROM matkaAikeet');
  mockDb.exec('DELETE FROM chatMessages');
  mockDb.exec('DELETE FROM notifications');
  mockDb.exec('DELETE FROM tykkäykset');
  mockDb.exec('DELETE FROM kommentti');
  mockDb.exec('DELETE FROM media_images');
  mockDb.exec('DELETE FROM seuranta');
  mockDb.exec('DELETE FROM julkaisu');
  mockDb.exec('DELETE FROM käyttäjä');
});

// ── Posts feed ────────────────────────────────────────────────────────────

describe('GET /api/posts', () => {
  it('returns empty array when no posts', async () => {
    const res = await request(app).get('/api/posts').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns created posts', async () => {
    const uid = insertUser();
    const token = makeToken(uid, 'integuser');
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ kuvaus: 'Hello world', kohde: 'Helsinki' })
      .expect(201);
    const res = await request(app).get('/api/posts').expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('POST /api/posts (auth required)', () => {
  it('returns 401 without token', async () => {
    await request(app)
      .post('/api/posts')
      .send({ kuvaus: 'x', kohde: 'y' })
      .expect(401);
  });

  it('creates a post with valid token', async () => {
    const uid = insertUser();
    const token = makeToken(uid, 'integuser');
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ kuvaus: 'Sunrise', kohde: 'Lapland' })
      .expect(201);
    expect(res.body.post ?? res.body).toBeDefined();
  });
});

describe('GET /api/posts/:id', () => {
  it('returns 404 for non-existent post', async () => {
    await request(app).get('/api/posts/99999').expect(404);
  });

  it('returns the post for a valid id', async () => {
    const uid = insertUser();
    const token = makeToken(uid, 'integuser');
    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ kuvaus: 'View', kohde: 'Turku' })
      .expect(201);
    const postId = (createRes.body.post?.id ?? createRes.body.id) as number;
    const res = await request(app).get(`/api/posts/${postId}`).expect(200);
    expect(res.body.id ?? res.body.post?.id).toBeDefined();
  });
});

describe('PUT /api/posts/:id (auth required)', () => {
  it('updates a post authored by the requester', async () => {
    const uid = insertUser();
    const token = makeToken(uid, 'integuser');
    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ kuvaus: 'Original', kohde: 'Espoo' })
      .expect(201);
    const postId = (createRes.body.post?.id ?? createRes.body.id) as number;
    await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ kuvaus: 'Updated' })
      .expect(200);
  });
});

describe('DELETE /api/posts/:id (auth required)', () => {
  it('deletes own post', async () => {
    const uid = insertUser();
    const token = makeToken(uid, 'integuser');
    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ kuvaus: 'ToDelete', kohde: 'Vantaa' })
      .expect(201);
    const postId = (createRes.body.post?.id ?? createRes.body.id) as number;
    await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});

// ── Comments ──────────────────────────────────────────────────────────────

describe('POST /api/posts/:postId/comments', () => {
  it('adds a comment to a post', async () => {
    const uid = insertUser();
    const token = makeToken(uid, 'integuser');
    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ kuvaus: 'Post', kohde: 'City' })
      .expect(201);
    const postId = (createRes.body.post?.id ?? createRes.body.id) as number;
    const commentRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ teksti_kenttä: 'Nice shot!' })
      .expect(201);
    expect(commentRes.body).toBeDefined();
  });
});

// ── Likes ─────────────────────────────────────────────────────────────────

describe('POST /api/posts/:postId/like', () => {
  it('likes a post', async () => {
    const uid = insertUser();
    const token = makeToken(uid, 'integuser');
    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ kuvaus: 'LikeMe', kohde: 'Oslo' })
      .expect(201);
    const postId = (createRes.body.post?.id ?? createRes.body.id) as number;
    await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
  });
});

// ── Travel plans ──────────────────────────────────────────────────────────

describe('GET /api/travel-plans', () => {
  it('returns empty array when no plans', async () => {
    const res = await request(app).get('/api/travel-plans').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/travel-plans', () => {
  it('creates a travel plan', async () => {
    const uid = insertUser();
    const token = makeToken(uid, 'integuser');
    const res = await request(app)
      .post('/api/travel-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({
        kohde: 'Kyoto',
        suunniteltu_alku_pvm: '2025-09-01',
        suunniteltu_loppu_pvm: '2025-09-14',
      })
      .expect(201);
    expect(res.body).toBeDefined();
  });
});

// ── Random feeds ──────────────────────────────────────────────────────────

describe('GET /api/posts/random', () => {
  it('returns an array', async () => {
    const res = await request(app).get('/api/posts/random').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

