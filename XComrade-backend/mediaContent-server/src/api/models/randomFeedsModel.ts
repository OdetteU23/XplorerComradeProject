import db from '../../database/db-manipulation';
import type {PostRow} from '../../utils/types/localTypes';
import type { julkaisuWithRelations, userProfile, kommentti, tykkäykset, media_images } from '@xcomrade/types-server';

const randomFeedsModel = {
  randomPosts: (count: number = 10): julkaisuWithRelations[] => {
    const posts = db.prepare(`
      SELECT p.*,
             u.id AS user_id, u.käyttäjäTunnus, u.etunimi, u.sukunimi, u.profile_picture_url
      FROM julkaisu p
      JOIN käyttäjä u ON p.userId = u.id
      ORDER BY RANDOM()
      LIMIT ?
    `).all(count) as PostRow[];

    const postsWithRelations: julkaisuWithRelations[] = posts.map((post) => {
      const kommentit = db.prepare(`
        SELECT c.*, u.käyttäjäTunnus, u.etunimi, u.sukunimi, u.profile_picture_url
        FROM kommentti c
        JOIN käyttäjä u ON c.userId = u.id
        WHERE c.julkaisuId = ?
        ORDER BY c.createdAt ASC
      `).all(post.id) as (kommentti & {
        käyttäjäTunnus: string;
        etunimi: string;
        sukunimi: string;
        profile_picture_url: string;
      })[];

      const tykkäykset = db.prepare(`
        SELECT * FROM tykkäykset WHERE julkaisuId = ?
      `).all(post.id) as tykkäykset[];

      const media_images = db.prepare(`
        SELECT id, julkaisuId, url AS image_url FROM media_images WHERE julkaisuId = ?
      `).all(post.id) as media_images[];

      // Parsing list_aktiviteetti from JSON string to string[]
      let list_aktiviteetti: string[] = [];
      try {
        list_aktiviteetti = JSON.parse(post.list_aktiviteetti ?? '[]');
      } catch {
        list_aktiviteetti = [];
      }

      return {
        id: post.id,
        userId: post.userId,
        otsikko: post.otsikko,
        sisältö: post.sisältö,
        kohde: post.kohde,
        media_url: post.media_url,
        media_type: post.media_type,
        Date_ajakohta: new Date(post.Date_ajakohta),
        kuvaus: post.kuvaus,
        list_aktiviteetti,
        luotu: post.luotu,
        päivitetty: post.päivitetty,
        user: {
          id: post.user_id,
          käyttäjäTunnus: post.käyttäjäTunnus,
          etunimi: post.etunimi,
          sukunimi: post.sukunimi,
          profile_picture_url: post.profile_picture_url,
        },
        kommentit,
        tykkäykset,
        media_images,
      } as unknown as julkaisuWithRelations;
    });

    return postsWithRelations;
  },



  randomUsersPopping: (currentUsername: string, followedUsernames: string[]): userProfile[] => {
    // Handling the case where user follows nobody
    if (followedUsernames.length === 0) {
      const stmt = db.prepare(`
        SELECT id, käyttäjäTunnus, etunimi, sukunimi, profile_picture_url
        FROM käyttäjä
        WHERE käyttäjäTunnus != ?
        ORDER BY RANDOM()
        LIMIT 5
      `);
      return stmt.all(currentUsername) as userProfile[];
    }

    const stmt = db.prepare(`
      SELECT id, käyttäjäTunnus, etunimi, sukunimi, profile_picture_url
      FROM käyttäjä
      WHERE käyttäjäTunnus != ? AND käyttäjäTunnus NOT IN (${followedUsernames.map(() => '?').join(',')})
      ORDER BY RANDOM()
      LIMIT 5
    `);

    const params: string[] = [currentUsername, ...followedUsernames];
    const randomUsers = stmt.all(...params);
    return randomUsers as userProfile[];
  },
};

export default randomFeedsModel;

