import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import path from 'path';
import uploadRoutes from './api/routes/uploadRoutes';
import db from './database/db-manipulation';

const app: Application = express();
const DEFAULT_PORT = 3002;
const port = process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets (disk first, then DB fallback)
app.use('/uploads', express.static('uploads'));

// Fallback: serve from DB when the file is missing from disk
app.get('/uploads/:filename', (req: Request, res: Response) => {
  const row = db
    .prepare('SELECT mime_type, file_data FROM file_storage WHERE filename = ?')
    .get(req.params.filename) as { mime_type: string; file_data: Buffer } | undefined;

  if (!row) {
    return res.status(404).json({ message: 'File not found' });
  }

  res.setHeader('Content-Type', row.mime_type);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(row.file_data);
});

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'upload-server Backend API is running!',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/upload', uploadRoutes);

// Serve generated API documentation
app.use('/apidocs', express.static(path.join(__dirname, '..', 'apidocs')));

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
const uploadServerStarter = (portToTry: number, maxAttempts: number = 10) => {
  const server = app.listen(portToTry, () => {
    console.log(`🚀 upload-server is running on port ${portToTry}`);
    console.log(`📍 API available at http://localhost:${portToTry}/api`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      if (maxAttempts > 0) {
        console.log(`⚠️  Port ${portToTry} is in use, trying port ${portToTry + 1}...`);
        uploadServerStarter(portToTry + 1, maxAttempts - 1);
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

uploadServerStarter(port);

export default app;
