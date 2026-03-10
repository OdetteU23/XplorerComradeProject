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

import jwt from 'jsonwebtoken';
import { generateToken } from '../src/middleware/mediaContent';
import postContentsModel from '../src/api/models/mediaContentModel';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockDb = require('../src/database/db-manipulation').default;

// Base user fixture — inserted directly since we don't have auth in this server
const BASE_USER = {
  käyttäjäTunnus: 'contentuser',
  salasana: 'hashed_pw',
  etunimi: 'Content',
  sukunimi: 'User',
  sahkoposti: 'content@example.com',
};

function insertUser(overrides: Partial<typeof BASE_USER> = {}): number {
  const u = { ...BASE_USER, ...overrides };
  const result = mockDb
    .prepare(
      'INSERT INTO käyttäjä (käyttäjäTunnus, salasana, etunimi, sukunimi, sahkoposti) VALUES (?,?,?,?,?)',
    )
    .run(u.käyttäjäTunnus, u.salasana, u.etunimi, u.sukunimi, u.sahkoposti);
  return result.lastInsertRowid as number;
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

// ── generateToken ──────────────────────────────────────────────────────────

describe('generateToken', () => {
  it('returns a signed JWT string', () => {
    const token = generateToken(42, 'traveler');
    expect(typeof token).toBe('string');
    const decoded = jwt.decode(token) as Record<string, unknown>;
    expect(decoded['id']).toBe(42);
    expect(decoded['käyttäjäTunnus']).toBe('traveler');
  });

  it('expires in 7 days', () => {
    const token = generateToken(1, 'u');
    const decoded = jwt.decode(token) as Record<string, number>;
    expect(decoded['exp'] - decoded['iat']).toBe(7 * 24 * 60 * 60);
  });
});

// ── postContentsModel ──────────────────────────────────────────────────────

describe('postContentsModel.createNewPost / getPostById / getPosts', () => {
  it('inserts a post and retrieves it by id', () => {
    const userId = insertUser();
    const result = postContentsModel.createNewPost('Nice view', 'Helsinki', userId);
    expect(result.changes).toBe(1);
    const id = result.lastInsertRowid as number;
    const post = postContentsModel.getPostById(id);
    expect(post).toBeDefined();
    expect(post!.kuvaus).toBe('Nice view');
    expect(post!.kohde).toBe('Helsinki');
  });

  it('returns undefined for a non-existent post id', () => {
    expect(postContentsModel.getPostById(99999)).toBeUndefined();
  });

  it('getPosts returns all posts ordered by date DESC', () => {
    const uid = insertUser();
    postContentsModel.createNewPost('First', 'Tallinn', uid);
    postContentsModel.createNewPost('Second', 'Riga', uid);
    const posts = postContentsModel.getPosts();
    expect(posts.length).toBeGreaterThanOrEqual(2);
  });
});

describe('postContentsModel.getUserPosts', () => {
  it('returns only posts by the given user', () => {
    const uid1 = insertUser();
    const uid2 = insertUser({ käyttäjäTunnus: 'other', sahkoposti: 'other@x.com' });
    postContentsModel.createNewPost('User1 post', 'Oslo', uid1);
    postContentsModel.createNewPost('User2 post', 'Stockholm', uid2);
    const posts = postContentsModel.getUserPosts(uid1);
    expect(posts.every(p => p.userId === uid1)).toBe(true);
  });
});

describe('postContentsModel.updatePost', () => {
  it('updates kuvaus and kohde', () => {
    const uid = insertUser();
    const r = postContentsModel.createNewPost('Old desc', 'OldCity', uid);
    const id = r.lastInsertRowid as number;
    postContentsModel.updatePost(id, 'New desc', 'NewCity');
    const updated = postContentsModel.getPostById(id);
    expect(updated!.kuvaus).toBe('New desc');
    expect(updated!.kohde).toBe('NewCity');
  });

  it('returns null when no fields provided', () => {
    const uid = insertUser();
    const r = postContentsModel.createNewPost('X', 'Y', uid);
    const id = r.lastInsertRowid as number;
    const result = postContentsModel.updatePost(id);
    expect(result).toBeNull();
  });
});

describe('postContentsModel.deletePost', () => {
  it('deletes the post', () => {
    const uid = insertUser();
    const r = postContentsModel.createNewPost('Del', 'City', uid);
    const id = r.lastInsertRowid as number;
    const result = postContentsModel.deletePost(id);
    expect(result.changes).toBe(1);
    expect(postContentsModel.getPostById(id)).toBeUndefined();
  });
});

// ── Comments ──────────────────────────────────────────────────────────────

describe('postContentsModel comments', () => {
  it('adds and retrieves a comment', () => {
    const uid = insertUser();
    const r = postContentsModel.createNewPost('Post', 'City', uid);
    const postId = r.lastInsertRowid as number;
    postContentsModel.addComment('Great place!', postId, uid);
    const comments = postContentsModel.getCommentsForPost(postId);
    expect(comments.length).toBe(1);
    expect(comments[0].teksti_kenttä).toBe('Great place!');
  });

  it('deletes a comment', () => {
    const uid = insertUser();
    const r = postContentsModel.createNewPost('Post', 'City', uid);
    const postId = r.lastInsertRowid as number;
    const cr = postContentsModel.addComment('Hi', postId, uid);
    const commentId = cr.lastInsertRowid as number;
    postContentsModel.deleteComment(commentId);
    expect(postContentsModel.getCommentsForPost(postId)).toHaveLength(0);
  });
});

// ── Likes ─────────────────────────────────────────────────────────────────

describe('postContentsModel likes', () => {
  it('adds a like and checks status', () => {
    const uid = insertUser();
    const r = postContentsModel.createNewPost('P', 'C', uid);
    const postId = r.lastInsertRowid as number;
    postContentsModel.addLike(postId, uid);
    const liked = postContentsModel.checkUserLiked(postId, uid);
    expect(liked).toBeDefined();
  });

  it('removes a like', () => {
    const uid = insertUser();
    const r = postContentsModel.createNewPost('P', 'C', uid);
    const postId = r.lastInsertRowid as number;
    postContentsModel.addLike(postId, uid);
    postContentsModel.removeLike(postId, uid);
    expect(postContentsModel.checkUserLiked(postId, uid)).toBeUndefined();
  });
});

// ── Travel plans ──────────────────────────────────────────────────────────

describe('postContentsModel travel plans', () => {
  it('creates and retrieves a travel plan', () => {
    const uid = insertUser();
    const r = postContentsModel.createTravelPlan(uid, 'Tokyo', '2025-01-01', '2025-01-10');
    const id = r.lastInsertRowid as number;
    const plan = postContentsModel.getTravelPlanById(id);
    expect(plan).toBeDefined();
    expect(plan!.kohde).toBe('Tokyo');
  });

  it('updates a travel plan', () => {
    const uid = insertUser();
    const r = postContentsModel.createTravelPlan(uid, 'Paris', '2025-06-01', '2025-06-07');
    const id = r.lastInsertRowid as number;
    postContentsModel.updateTravelPlan(id, { kohde: 'Lyon' });
    const plan = postContentsModel.getTravelPlanById(id);
    expect(plan!.kohde).toBe('Lyon');
  });

  it('deletes a travel plan', () => {
    const uid = insertUser();
    const r = postContentsModel.createTravelPlan(uid, 'Rome', '2025-03-01', '2025-03-05');
    const id = r.lastInsertRowid as number;
    postContentsModel.deleteTravelPlan(id);
    expect(postContentsModel.getTravelPlanById(id)).toBeUndefined();
  });
});

