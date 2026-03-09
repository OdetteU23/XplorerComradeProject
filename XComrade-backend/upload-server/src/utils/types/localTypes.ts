declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: number;
      käyttäjäTunnus: string;
    };
  }
}

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
