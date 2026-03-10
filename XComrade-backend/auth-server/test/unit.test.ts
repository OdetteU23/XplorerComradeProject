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

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../src/api/models/userModel';
import { generateToken } from '../src/middleware/auth';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockDb = require('../src/database/db-manipulation').default;

const BASE_USER = {
  käyttäjäTunnus: 'testuser',
  salasana: 'hashed_password',
  etunimi: 'Test',
  sukunimi: 'User',
  sahkoposti: 'test@example.com',
};

afterEach(() => {
  mockDb.exec('DELETE FROM seuranta');
  mockDb.exec('DELETE FROM julkaisu');
  mockDb.exec('DELETE FROM käyttäjä');
});

describe('userModel.create', () => {
  it('inserts a user and returns the row', () => {
    const user = userModel.create(BASE_USER);
    expect(user.id).toBeGreaterThan(0);
    expect(user.käyttäjäTunnus).toBe('testuser');
  });

  it('throws on duplicate käyttäjäTunnus', () => {
    userModel.create(BASE_USER);
    expect(() => userModel.create(BASE_USER)).toThrow();
  });

  it('throws on duplicate sahkoposti', () => {
    userModel.create(BASE_USER);
    expect(() => userModel.create({ ...BASE_USER, käyttäjäTunnus: 'other' })).toThrow();
  });
});

describe('userModel.findByUsername', () => {
  it('returns the user for an existing username', () => {
    userModel.create(BASE_USER);
    const found = userModel.findByUsername('testuser');
    expect(found).toBeDefined();
    expect(found!.sahkoposti).toBe('test@example.com');
  });

  it('returns undefined for an unknown username', () => {
    expect(userModel.findByUsername('nobody')).toBeUndefined();
  });
});

describe('userModel.findByEmail', () => {
  it('returns the user for an existing email', () => {
    userModel.create(BASE_USER);
    expect(userModel.findByEmail('test@example.com')).toBeDefined();
  });

  it('returns undefined for an unknown email', () => {
    expect(userModel.findByEmail('ghost@example.com')).toBeUndefined();
  });
});

describe('userModel.findById', () => {
  it('returns the user for a valid id', () => {
    const created = userModel.create(BASE_USER);
    expect(userModel.findById(created.id)).toBeDefined();
  });

  it('returns undefined for an unknown id', () => {
    expect(userModel.findById(99999)).toBeUndefined();
  });
});

describe('userModel.toUserProfile', () => {
  it('strips salasana from the row', () => {
    const created = userModel.create(BASE_USER);
    const profile = userModel.toUserProfile(created);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((profile as any).salasana).toBeUndefined();
    expect(profile.id).toBe(created.id);
    expect(profile.käyttäjäTunnus).toBe('testuser');
  });
});

describe('userModel.update', () => {
  it('updates bio and location', () => {
    const created = userModel.create(BASE_USER);
    const updated = userModel.update(created.id, { bio: 'Hello', location: 'Helsinki' });
    expect(updated!.bio).toBe('Hello');
    expect(updated!.location).toBe('Helsinki');
  });

  it('returns undefined for a non-existent id', () => {
    expect(userModel.update(99999, { bio: 'x' })).toBeUndefined();
  });

  it('returns unchanged user when no valid fields are provided', () => {
    const created = userModel.create(BASE_USER);
    const result = userModel.update(created.id, {});
    expect(result!.id).toBe(created.id);
  });
});

describe('userModel.getUserStats', () => {
  it('returns zero counts for a fresh user', () => {
    const created = userModel.create(BASE_USER);
    const stats = userModel.getUserStats(created.id);
    expect(stats.postsCount).toBe(0);
    expect(stats.followersCount).toBe(0);
    expect(stats.followingCount).toBe(0);
  });
});

describe('userModel.searchUsers', () => {
  it('finds users by partial username match', () => {
    userModel.create(BASE_USER);
    const results = userModel.searchUsers('test');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].käyttäjäTunnus).toBe('testuser');
  });

  it('returns empty array when no match', () => {
    userModel.create(BASE_USER);
    expect(userModel.searchUsers('zzznomatch')).toHaveLength(0);
  });
});

describe('generateToken', () => {
  it('returns a signed JWT string', () => {
    const token = generateToken(1, 'alice');
    expect(typeof token).toBe('string');
    const decoded = jwt.decode(token) as Record<string, unknown>;
    expect(decoded['id']).toBe(1);
    expect(decoded['käyttäjäTunnus']).toBe('alice');
  });

  it('expires in 7 days', () => {
    const token = generateToken(1, 'alice');
    const decoded = jwt.decode(token) as Record<string, number>;
    expect(decoded['exp'] - decoded['iat']).toBe(7 * 24 * 60 * 60);
  });
});

describe('bcrypt password hashing', () => {
  it('hashes and verifies a correct password', async () => {
    const hash = await bcrypt.hash('mysecret', 10);
    await expect(bcrypt.compare('mysecret', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await bcrypt.hash('correct', 10);
    await expect(bcrypt.compare('wrong', hash)).resolves.toBe(false);
  });
});

