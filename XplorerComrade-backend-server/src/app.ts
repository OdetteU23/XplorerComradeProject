import express, { Request, Response, NextFunction } from 'express';
//import CustomError from './CustomError';
import CustomError from './classes/CustomErrors';

const app = express();


app.get('/', (req: Request, res: Response, next: NextFunction) => {
   // do something that might cause an error
   const errorCondition = true; // Replace with actual condition logic
   if (errorCondition) {
     next(new CustomError('Custom error message', 400));
     return; // this is important to prevent the next middleware from running
   }
});

app.use((err: CustomError, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(err.status).send(err.message);
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
