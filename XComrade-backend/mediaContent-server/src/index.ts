import express, { Request, Response, Application } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import mediaContentRoutes from './api/routes/mediaContentRoutes';
import randomFeedsRoutes from './api/routes/randomFeedsRoutes';
import { createWebSocketServer } from './websocket';
import './database/db-manipulation'; // Initialize database

const app: Application = express();
const DEFAULT_PORT = 3001;
const port = process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'mediaContent-server API is running!',
    version: '1.0.0'
  });
});

// API Routes - randomFeedsRoutes MUST be before mediaContentRoutes
// so /posts/random matches before /posts/:id
app.use('/api', randomFeedsRoutes);
app.use('/api', mediaContentRoutes);

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

// Start server with automatic port fallback
const mediaContentServerStarter = (portToTry: number, maxAttempts: number = 10) => {
  const httpServer = createServer(app);

  // Attach WebSocket server to the same HTTP server
  createWebSocketServer(httpServer);

  httpServer.listen(portToTry, () => {
    console.log(`🚀 mediaContent-server is running on port ${portToTry}`);
    console.log(`📍 API available at http://localhost:${portToTry}/api`);
    console.log(`🔌 WebSocket available at ws://localhost:${portToTry}`);
  });

  httpServer.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      if (maxAttempts > 0) {
        console.log(`⚠️ Port ${portToTry} is in use, trying port ${portToTry + 1}...`);
        mediaContentServerStarter(portToTry + 1, maxAttempts - 1);
      } else {
        console.error(`❌ Could not find an available port after ${10} attempts`);
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
};

mediaContentServerStarter(port);

export default app;
