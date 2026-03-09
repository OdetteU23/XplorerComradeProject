import Database from 'better-sqlite3';
import {filename, tables} from './db-config';

const db = new Database(filename);
db.pragma('journal_mode = WAL');

// init tables, use exec only for CREATE TABLE
db.exec(tables);
console.log('Database initialized and tables created if they did not exist.');

// Migration: add isRead column to chatMessages if it doesn't exist
try {
  const cols = db.prepare("PRAGMA table_info('chatMessages')").all() as { name: string }[];
  if (!cols.some(c => c.name === 'isRead')) {
    db.exec('ALTER TABLE chatMessages ADD COLUMN isRead BOOLEAN DEFAULT 0');
    console.log('Added isRead column to chatMessages.');
  }
} catch (err) {
  console.error('Migration check for chatMessages.isRead failed:', err);
}

export default db;
