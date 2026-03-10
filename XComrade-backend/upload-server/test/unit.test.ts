
import jwt from 'jsonwebtoken';
import { generateToken } from '../src/middleware/auth';
import userModel from '../src/api/models/uploadModel';
import { DeletingCache } from '../src/api/controllers/uploadController';
import fs from 'fs';
import path from 'path';
import os from 'os';

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

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockDb = require('../src/database/db-manipulation').default;

function insertUser(käyttäjäTunnus = 'uploader', sahkoposti = 'upload@test.com'): number {
  const r = mockDb
    .prepare(
      'INSERT INTO käyttäjä (käyttäjäTunnus, salasana, etunimi, sukunimi, sahkoposti) VALUES (?,?,?,?,?)',
    )
    .run(käyttäjäTunnus, 'pw', 'Up', 'Loader', sahkoposti);
  return r.lastInsertRowid as number;
}

afterEach(() => {
  mockDb.exec('DELETE FROM käyttäjä');
});

// ── generateToken ──────────────────────────────────────────────────────────

describe('generateToken', () => {
  it('returns a valid JWT string', () => {
    const token = generateToken(5, 'uploader');
    expect(typeof token).toBe('string');
    const decoded = jwt.decode(token) as Record<string, unknown>;
    expect(decoded['id']).toBe(5);
    expect(decoded['käyttäjäTunnus']).toBe('uploader');
  });

  it('expires in 7 days', () => {
    const token = generateToken(1, 'u');
    const decoded = jwt.decode(token) as Record<string, number>;
    expect(decoded['exp'] - decoded['iat']).toBe(7 * 24 * 60 * 60);
  });
});

// ── uploadModel.findById ───────────────────────────────────────────────────

describe('uploadModel.findById', () => {
  it('returns the user row for a valid id', () => {
    const uid = insertUser();
    const found = userModel.findById(uid);
    expect(found).toBeDefined();
    expect(found!.käyttäjäTunnus).toBe('uploader');
  });

  it('returns undefined for a non-existent id', () => {
    expect(userModel.findById(99999)).toBeUndefined();
  });
});

// ── DeletingCache ──────────────────────────────────────────────────────────

describe('DeletingCache', () => {
  it('deletes existing temp files', () => {
    const tmpFile = path.join(os.tmpdir(), `jest-del-${Date.now()}.txt`);
    fs.writeFileSync(tmpFile, 'data');
    DeletingCache([tmpFile]);
    expect(fs.existsSync(tmpFile)).toBe(false);
  });

  it('does not throw if file does not exist', () => {
    expect(() => DeletingCache(['/nonexistent/path/file.txt'])).not.toThrow();
  });

  it('handles empty array', () => {
    expect(() => DeletingCache([])).not.toThrow();
  });
});


