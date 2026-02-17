import db from '../../database/db-manipulation';
import type { userProfile, registeringInfo } from '@xcomrade/types-server';
interface UserRow {
  id: number;
  käyttäjäTunnus: string;
  salasana: string;
  etunimi: string;
  sukunimi: string;
  sahkoposti: string;
  profile_picture_url?: string | null;
  bio?: string | null;
  location?: string | null;
  created_at: string;
}

const userModel = {
  // Find user by username
  findByUsername: (username: string): UserRow | undefined => {
    const stmt = db.prepare('SELECT * FROM users WHERE käyttäjäTunnus = ?');
    return stmt.get(username) as UserRow | undefined;
  },

  // Find user by email
  findByEmail: (email: string): UserRow | undefined => {
    const stmt = db.prepare('SELECT * FROM users WHERE sahkoposti = ?');
    return stmt.get(email) as UserRow | undefined;
  },

  // Find user by ID
  findById: (id: number): UserRow | undefined => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as UserRow | undefined;
  },

  // Create new user
  create: (userData: registeringInfo): UserRow => {
    const stmt = db.prepare(`
      INSERT INTO users (käyttäjäTunnus, salasana, etunimi, sukunimi, sahkoposti, bio, location)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userData.käyttäjäTunnus,
      userData.salasana, // Should be hashed before passing here
      userData.etunimi,
      userData.sukunimi,
      userData.sahkoposti,
      userData.bio || null,
      userData.location || null
    );

    const user = userModel.findById(Number(result.lastInsertRowid));
    if (!user) {
      throw new Error('Failed to create user');
    }
    return user;
  },

  // Update user profile
  update: (id: number, updates: Partial<userProfile>): UserRow | undefined => {
    const allowedFields = ['etunimi', 'sukunimi', 'sahkoposti', 'profile_picture_url', 'bio', 'location'];
    const fields: string[] = [];
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return userModel.findById(id);
    }

    values.push(id);
    const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return userModel.findById(id);
  },

  // Get user stats (posts, followers, following)
  getUserStats: (userId: number): { postsCount: number; followersCount: number; followingCount: number } => {
    const postsCount = (db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(userId) as { count: number }).count;
    const followersCount = (db.prepare('SELECT COUNT(*) as count FROM follows WHERE seurattu_id = ?').get(userId) as { count: number }).count;
    const followingCount = (db.prepare('SELECT COUNT(*) as count FROM follows WHERE seuraaja_id = ?').get(userId) as { count: number }).count;

    return { postsCount, followersCount, followingCount };
  },

  // Search users by username or name
  searchUsers: (query: string): UserRow[] => {
    const searchPattern = `%${query}%`;
    const stmt = db.prepare(`
      SELECT * FROM users
      WHERE käyttäjäTunnus LIKE ?
      OR etunimi LIKE ?
      OR sukunimi LIKE ?
      LIMIT 50
    `);
    return stmt.all(searchPattern, searchPattern, searchPattern) as UserRow[];
  },

  // Convert UserRow to userProfile (remove password)
  toUserProfile: (userRow: UserRow): userProfile => {
    return {
      id: userRow.id,
      käyttäjäTunnus: userRow.käyttäjäTunnus,
      etunimi: userRow.etunimi,
      sukunimi: userRow.sukunimi,
      sahkoposti: userRow.sahkoposti,
      profile_picture_url: userRow.profile_picture_url || undefined,
      bio: userRow.bio || undefined,
      location: userRow.location || undefined,
      registeredAt: userRow.created_at,
    };
  },
};

export default userModel;
