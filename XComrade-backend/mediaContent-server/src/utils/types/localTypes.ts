declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: number;
      käyttäjäTunnus: string;
    };
  }
}
interface PostRow {
  id: number;
  userId: number;
  otsikko: string;
  sisältö: string;
  kohde: string;
  media_url: string;
  media_type: string;
  Date_ajakohta: string;
  kuvaus: string;
  list_aktiviteetti: string;
  luotu: string;
  päivitetty: string;
  user_id: number;
  käyttäjäTunnus: string;
  etunimi: string;
  sukunimi: string;
  profile_picture_url: string;
}

export type { PostRow };
