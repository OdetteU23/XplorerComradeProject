import express, {Request, Response} from 'express';

const app = express();
const port = 3000;

app.get('/', (_req: Request, res: Response<string>) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`The frontend-Server is running on port ${port}`);
});
