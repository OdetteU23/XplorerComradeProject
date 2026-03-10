import db from '../../database/db-manipulation';
import { UserRow } from '../../utils/types/localTypes';

const userModel = {
  // Find user by ID (used by auth middleware to verify token)
  findById: (id: number): UserRow | undefined => {
    const stmt = db.prepare('SELECT * FROM käyttäjä WHERE id = ?');
    return stmt.get(id) as UserRow | undefined;
  },
};

export default userModel;

