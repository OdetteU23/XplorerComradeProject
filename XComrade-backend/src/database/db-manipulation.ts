import Database from 'better-sqlite3';
import {filename, tables} from './db-config';

const db = new Database(filename);
db.pragma('journal_mode = WAL');

// init tables, use exec only for CREATE TABLE
db.exec(tables);

export default db;
