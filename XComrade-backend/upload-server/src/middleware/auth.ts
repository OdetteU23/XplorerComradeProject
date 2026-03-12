import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
//import userModel from '../api/models/uploadModel';
import db from '../database/db-manipulation';
const JWT_SECRET = process.env.JWT_SECRET || 'backend-server-secret-key-change-this-in-production';


// Auto-sync user from auth-server JWT into local DB if not present
const ensureUserExists = (id: number, käyttäjäTunnus: string): void => {
  const existing = db.prepare('SELECT id FROM käyttäjä WHERE id = ?').get(id);
  if (!existing) {
    db.prepare(
      `INSERT OR IGNORE INTO käyttäjä (id, käyttäjäTunnus, salasana, etunimi, sukunimi, sahkoposti)
       VALUES (?, ?, 'synced', ?, '', ?)`
    ).run(id, käyttäjäTunnus, käyttäjäTunnus, `${käyttäjäTunnus}@synced.local`);
  }
};

// Generate JWT token
export const generateToken = (userId: number, käyttäjäTunnus: string): string => {
  return jwt.sign(
    { id: userId, käyttäjäTunnus },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// Verify JWT token middleware
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; käyttäjäTunnus: string };

    // Auto-sync user to local DB if not present (users register on auth-server)
    ensureUserExists(decoded.id, decoded.käyttäjäTunnus);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      käyttäjäTunnus: decoded.käyttäjäTunnus,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
      return;
    }
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Optional authentication (doesn't require token but attaches user if present)
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; käyttäjäTunnus: string };
    ensureUserExists(decoded.id, decoded.käyttäjäTunnus);
    req.user = {
      id: decoded.id,
      käyttäjäTunnus: decoded.käyttäjäTunnus,
    };
  } catch (error) {
        console.error('Error verifying token:', error);
    // Silently fail for optional auth
  }

  next();
};

export default { generateToken, authenticateToken, optionalAuth };
