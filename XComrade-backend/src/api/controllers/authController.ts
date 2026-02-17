import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import type { loginInfo, registeringInfo } from '@xcomrade/types-server';
import userModel from '../models/userModel';
import { generateToken } from '../../middleware/auth';

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData: registeringInfo = req.body;

    // Validate required fields
    if (!userData.käyttäjäTunnus || !userData.salasana || !userData.etunimi ||
        !userData.sukunimi || !userData.sahkoposti) {
      res.status(400).json({ message: 'All required fields must be provided' });
      return;
    }

    // Check if username already exists
    const existingUsername = userModel.findByUsername(userData.käyttäjäTunnus);
    if (existingUsername) {
      res.status(409).json({ message: 'Username already exists' });
      return;
    }

    // Check if email already exists
    const existingEmail = userModel.findByEmail(userData.sahkoposti);
    if (existingEmail) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.salasana, 10);

    // Create user with hashed password
    const newUserData = {
      ...userData,
      salasana: hashedPassword,
    };

    const userRow = userModel.create(newUserData);
    const user = userModel.toUserProfile(userRow);

    // Generate JWT token
    const token = generateToken(user.id, user.käyttäjäTunnus);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const credentials: loginInfo = req.body;

    // Validate required fields
    if (!credentials.käyttäjäTunnus || !credentials.salasana) {
      res.status(400).json({ message: 'Username and password are required' });
      return;
    }

    // Find user by username
    const userRow = userModel.findByUsername(credentials.käyttäjäTunnus);
    if (!userRow) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.salasana, userRow.salasana);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    // Convert to userProfile (remove password)
    const user = userModel.toUserProfile(userRow);

    // Generate JWT token
    const token = generateToken(user.id, user.käyttäjäTunnus);

    res.status(200).json({
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user (requires authentication)
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user is set by authenticateToken middleware
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const userRow = userModel.findById(req.user.id);
    if (!userRow) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = userModel.toUserProfile(userRow);
    res.status(200).json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout (client-side token removal, but we can track if needed)
export const logout = async (req: Request, res: Response): Promise<void> => {
  // In a simple JWT implementation, logout is handled client-side by removing the token
  // Here we just send a success response
  res.status(200).json({ message: 'Logout successful' });
};

export default {
  register,
  login,
  getCurrentUser,
  logout,
};
