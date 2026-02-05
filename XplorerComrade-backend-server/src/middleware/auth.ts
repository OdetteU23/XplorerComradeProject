import { Request, Response as ExpressResponse, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import userModel from '../api/models/userModel';
//import { Response } from '../utils/types/localTypes';

type Response = ExpressResponse< | unknown | undefined>;


declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: number;
      käyttäjäTunnus: string;
    };
  }
}


// JWT Secret - In production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

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

    // Verify user still exists
    const user = userModel.findById(decoded.id);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

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
