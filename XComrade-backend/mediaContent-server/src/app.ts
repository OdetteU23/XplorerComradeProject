import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import CustomError from './classes/CustomErrors';
import mediaContentRoutes from './api/routes/mediaContentRoutes';
import randomFeedsRoutes from './api/routes/randomFeedsRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', randomFeedsRoutes);
app.use('/api', mediaContentRoutes);


// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'MediaContent API Server is running' });
});

// Error handling middleware
//eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: CustomError, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message });
});

export default app;
