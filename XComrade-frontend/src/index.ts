import express, {Request, Response} from 'express';

const app = express();
const DEFAULT_PORT = 3004;
const port = process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT;

app.get('/', (_req: Request, res: Response<string>) => {
  res.send('Hello World!');
});

/*
app.listen(port, () => {
  console.log(`The frontend-Server is running on port ${port}`);
});
*/

const frontendServerRunner = (portToTry: number, maxAttempts: number = 10) => {
  const server = app.listen(portToTry, () => {
    console.log(`🚀 Frontend server is running on port ${portToTry}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      if (maxAttempts > 0) {
        console.log(`⚠️  Port ${portToTry} is in use, trying port ${portToTry + 1}...`);
        frontendServerRunner(portToTry + 1, maxAttempts - 1);
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

frontendServerRunner(port);

export default app;
