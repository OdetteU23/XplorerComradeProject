import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: number;
      käyttäjäTunnus: string;
    };
  }
}
export type UserRow = {
  id: number;
  user?: {
      id: number;
      käyttäjäTunnus: string;
    };
 // käyttäjäTunnus: string;
  salasana: string;
  etunimi: string;
  sukunimi: string;
  sahkoposti: string;
  profile_picture_url?: string | null;
  bio?: string | null;
  location?: string | null;
  created_at: string;
}
