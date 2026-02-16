import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import authRoutes from './api/routes/authRoutes';
import './database/db-manipulation'; // Initialize database

const app: Application = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow frontend origins
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'XplorerComrade Backend API is running!',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: unknown) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 XplorerComrade Backend Server is running on port ${port}`);
  console.log(`📍 API available at http://localhost:${port}/api`);
});

export default app;
