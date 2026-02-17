//import { Response as ExpressResponse } from 'express';
//import { chatMessages } from '@xcomrade/types-server';

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
type UploadMessage =  {
  message: string;
  data: {
    filename: string;
    media_type: string;
    filesize: number;
    screenshots: string[];
  };
};

export type { UploadMessage };
