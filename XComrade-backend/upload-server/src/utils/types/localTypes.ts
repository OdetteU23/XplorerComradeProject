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
type UserRow = {
  id: number;
  käyttäjäTunnus: string;
  salasana: string;
  etunimi: string;
  sukunimi: string;
  sahkoposti: string;
  profile_picture_url?: string | null;
  bio?: string | null;
  location?: string | null;
  created_at: string;
}

export type { UploadMessage, UserRow };
