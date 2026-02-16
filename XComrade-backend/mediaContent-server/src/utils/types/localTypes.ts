//import { Response as ExpressResponse } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: number;
      käyttäjäTunnus: string;
    };
  }
}

//type Response = Express.Response;

//type Response = ExpressResponse<unknown | undefined>;

export type {  };
