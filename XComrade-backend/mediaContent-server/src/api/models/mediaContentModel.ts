import db from '../../database/db-manipulation';
import type {
  julkaisu,
  kommentti,
  tykkäykset,
  matkaAikeet,
  seuranta,
  notifications,
  chatMessages,
  friendRequest,
  tripParticipants
} from '@xcomrade/types-server';
import type { RunResult } from 'better-sqlite3';

const postContentsModel = {
  //  julkaisut (posts)
  createNewPost: (kuvaus: string, kohde: string, userId: number, list_aktiviteetti?: string): RunResult => {
    const stmt = db.prepare(`
      INSERT INTO julkaisu (userId, kuvaus, kohde, list_aktiviteetti, Date_ajakohta)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    const result = stmt.run(userId, kuvaus, kohde, list_aktiviteetti || '[]');
    return result;
  },

  getPosts: (limit: number = 20, offset: number = 0): julkaisu[] => {
    const stmt = db.prepare(`
      SELECT * FROM julkaisu
      ORDER BY Date_ajakohta DESC
      LIMIT ? OFFSET ?
    `);
    const result = stmt.all(limit, offset) as julkaisu[];
    return result;
  },

  getPostById: (julkaisuId: number): julkaisu | undefined => {
    const stmt = db.prepare(`
      SELECT * FROM julkaisu
      WHERE id = ?
    `);
    const result = stmt.get(julkaisuId) as julkaisu | undefined;
    return result;
  },

  getUserPosts: (userId: number): julkaisu[] => {
    const stmt = db.prepare(`
      SELECT * FROM julkaisu
      WHERE userId = ?
      ORDER BY Date_ajakohta DESC
    `);
    const result = stmt.all(userId) as julkaisu[];
    return result;
  },

  updatePost: (julkaisuId: number, kuvaus?: string, kohde?: string, list_aktiviteetti?: string): RunResult | null => {
    const updates: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any[] = [];

    if (kuvaus !== undefined) {
      updates.push('kuvaus = ?');
      params.push(kuvaus);
    }
    if (kohde !== undefined) {
      updates.push('kohde = ?');
      params.push(kohde);
    }
    if (list_aktiviteetti !== undefined) {
      updates.push('list_aktiviteetti = ?');
      params.push(list_aktiviteetti);
    }

    params.push(julkaisuId);
    const stmt = db.prepare(`
      UPDATE julkaisu
      SET ${updates.join(', ')}
      WHERE id = ?
    `);
    const result = stmt.run(...params);
    return result;
  },

  deletePost: (julkaisuId: number): RunResult => {
    const stmt = db.prepare(`
      DELETE FROM julkaisu WHERE id = ?
    `);
    const result = stmt.run(julkaisuId);
    return result;
  },

  //  komentit
  addComment: (teksti_kenttä: string, julkaisuId: number, userId: number): RunResult => {
    const stmt = db.prepare(`
      INSERT INTO kommentti (teksti_kenttä, julkaisuId, userId, createdAt)
      VALUES (?, ?, ?, datetime('now'))
    `);
    const result = stmt.run(teksti_kenttä, julkaisuId, userId);
    return result;
  },

  getCommentsForPost: (julkaisuId: number): kommentti[] => {
    const stmt = db.prepare(`
      SELECT * FROM kommentti
      WHERE julkaisuId = ?
      ORDER BY createdAt DESC
    `);
    const result = stmt.all(julkaisuId) as kommentti[];
    return result;
  },

  deleteComment: (kommenttiId: number): RunResult => {
    const stmt = db.prepare(`
      DELETE FROM kommentti WHERE id = ?
    `);
    const result = stmt.run(kommenttiId);
    return result;
  },

  //TYKKÄYKSET (Likes)
  addLike: (julkaisuId: number, userId: number): RunResult => {
    const stmt = db.prepare(`
      INSERT INTO tykkäykset (julkaisuId, userId)
      VALUES (?, ?)
    `);
    const result = stmt.run(julkaisuId, userId);
    return result;
  },

  removeLike: (julkaisuId: number, userId: number): RunResult => {
    const stmt = db.prepare(`
      DELETE FROM tykkäykset
      WHERE julkaisuId = ? AND userId = ?
    `);
    const result = stmt.run(julkaisuId, userId);
    return result;
  },

  getLikesForPost: (julkaisuId: number): tykkäykset[] => {
    const stmt = db.prepare(`
      SELECT * FROM tykkäykset
      WHERE julkaisuId = ?
    `);
    const result = stmt.all(julkaisuId) as tykkäykset[];
    return result;
  },

  checkUserLiked: (julkaisuId: number, userId: number): tykkäykset | undefined => {
    const stmt = db.prepare(`
      SELECT * FROM tykkäykset
      WHERE julkaisuId = ? AND userId = ?
    `);
    const result = stmt.get(julkaisuId, userId) as tykkäykset | undefined;
    return result;
  },

  // SEURANTA
  followUser: (seuraajaId: number, seurattavaId: number): RunResult => {
    const stmt = db.prepare(`
      INSERT INTO seuranta (seuraajaId, seurattavaId)
      VALUES (?, ?)
    `);
    const result = stmt.run(seuraajaId, seurattavaId);
    return result;
  },

  unfollowUser: (seuraajaId: number, seurattavaId: number): RunResult => {
    const stmt = db.prepare(`
      DELETE FROM seuranta
      WHERE seuraajaId = ? AND seurattavaId = ?
    `);
    const result = stmt.run(seuraajaId, seurattavaId);
    return result;
  },

  getFollowers: (userId: number): seuranta[] => {
    const stmt = db.prepare(`
      SELECT * FROM seuranta
      WHERE seurattavaId = ?
    `);
    const result = stmt.all(userId) as seuranta[];
    return result;
  },

  getFollowing: (userId: number): seuranta[] => {
    const stmt = db.prepare(`
      SELECT * FROM seuranta
      WHERE seuraajaId = ?
    `);
    const result = stmt.all(userId) as seuranta[];
    return result;
  },

  // MATKA-AIKEET (Travel Plans)
  createTravelPlan: (userId: number, kohde: string, suunniteltu_alku_pvm: string, suunniteltu_loppu_pvm: string, aktiviteetit?: string, budjetti?: string, kuvaus?: string): RunResult => {
    const stmt = db.prepare(`
      INSERT INTO matkaAikeet (userId, kohde, suunniteltu_alku_pvm, suunniteltu_loppu_pvm, aktiviteetit, budjetti, kuvaus)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(userId, kohde, suunniteltu_alku_pvm, suunniteltu_loppu_pvm, aktiviteetit || '[]', budjetti || '[]', kuvaus);
    return result;
  },

  getTravelPlans: (): matkaAikeet[] => {
    const stmt = db.prepare(`
      SELECT * FROM matkaAikeet
      ORDER BY suunniteltu_alku_pvm DESC
    `);
    const result = stmt.all() as matkaAikeet[];
    return result;
  },

  getTravelPlanById: (matkaAikeetId: number): matkaAikeet | undefined => {
    const stmt = db.prepare(`
      SELECT * FROM matkaAikeet
      WHERE id = ?
    `);
    const result = stmt.get(matkaAikeetId) as matkaAikeet | undefined;
    return result;
  },

  getUserTravelPlans: (userId: number): matkaAikeet[] => {
    const stmt = db.prepare(`
      SELECT * FROM matkaAikeet
      WHERE userId = ?
      ORDER BY suunniteltu_alku_pvm DESC
    `);
    const result = stmt.all(userId) as matkaAikeet[];
    return result;
  },


  updateTravelPlan: (matkaAikeetId: number, data: Partial<matkaAikeet>) => {
    const updates: string[] = [];

    const params: (string | number | string[] | Date)[] = [];

    const fields: (keyof matkaAikeet)[] = ['kohde', 'suunniteltu_alku_pvm', 'suunniteltu_loppu_pvm', 'aktiviteetit', 'budjetti', 'kuvaus'];
    fields.forEach(field => {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(data[field]);
      }
    });

    if (updates.length === 0) return null;

    params.push(matkaAikeetId);
    const stmt = db.prepare(`
      UPDATE matkaAikeet
      SET ${updates.join(', ')}
      WHERE id = ?
    `);
    const result = stmt.run(...params);
    return result;
  },

  deleteTravelPlan: (matkaAikeetId: number): RunResult => {
    const stmt = db.prepare(`
      DELETE FROM matkaAikeet WHERE id = ?
    `);
    const result = stmt.run(matkaAikeetId);
    return result;
  },

  //  FRIEND REQUEST --> Kaveripyynnöt
  createBuddyRequest: (matkaAikeetId: number, requesterId: number, ownerId: number, message: string): RunResult => {
    const stmt = db.prepare(`
      INSERT INTO friendRequest (matkaAikeetId, requesterId, ownerId, message, status, createdAt)
      VALUES (?, ?, ?, ?, 'pending', datetime('now'))
    `);
    const result = stmt.run(matkaAikeetId, requesterId, ownerId, message);
    return result;
  },

  getBuddyRequests: (userId: number): friendRequest[] => {
    const stmt = db.prepare(`
      SELECT * FROM friendRequest
      WHERE ownerId = ? AND status = 'pending'
      ORDER BY createdAt DESC
    `);
    const result = stmt.all(userId) as friendRequest[];
    return result;
  },

  getPlanBuddyRequests: (matkaAikeetId: number): friendRequest[] => {
    const stmt = db.prepare(`
      SELECT * FROM friendRequest
      WHERE matkaAikeetId = ?
      ORDER BY createdAt DESC
    `);
    const result = stmt.all(matkaAikeetId) as friendRequest[];
    return result;
  },

  acceptBuddyRequest: (requestId: number): RunResult => {
    const stmt = db.prepare(`
      UPDATE friendRequest
      SET status = 'accepted'
      WHERE id = ?
    `);
    const result = stmt.run(requestId);
    return result;
  },

  rejectBuddyRequest: (requestId: number): RunResult => {
    const stmt = db.prepare(`
      UPDATE friendRequest
      SET status = 'rejected'
      WHERE id = ?
    `);
    const result = stmt.run(requestId);
    return result;
  },

  //  TRIP PARTICIPANTS --> Osallistujat
  addTripParticipant: (matkaAikeetId: number, userId: number, role: 'owner' | 'buddy'): RunResult => {
    const stmt = db.prepare(`
      INSERT INTO tripParticipants (matkaAikeetId, userId, joinedAt, role)
      VALUES (?, ?, datetime('now'), ?)
    `);
    const result = stmt.run(matkaAikeetId, userId, role);
    return result;
  },

  getTripParticipants: (matkaAikeetId: number): tripParticipants[] => {
    const stmt = db.prepare(`
      SELECT * FROM tripParticipants
      WHERE matkaAikeetId = ?
      ORDER BY joinedAt ASC
    `);
    const result = stmt.all(matkaAikeetId) as tripParticipants[];
    return result;
  },

  removeTripParticipant: (participantId: number): RunResult => {
    const stmt = db.prepare(`
      DELETE FROM tripParticipants WHERE id = ?
    `);
    const result = stmt.run(participantId);
    return result;
  },

  //  MESSAGES --> Viestit
  sendMessage: (senderId: number, receiverId: number, message: string): RunResult => {
    const stmt = db.prepare(`
      INSERT INTO chatMessages (senderId, receiverId, message, sentAt)
      VALUES (?, ?, ?, datetime('now'))
    `);
    const result = stmt.run(senderId, receiverId, message);
    return result;
  },

  getConversation: (userId1: number, userId2: number): chatMessages[] => {
    const stmt = db.prepare(`
      SELECT * FROM chatMessages
      WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
      ORDER BY sentAt ASC
    `);
    const result = stmt.all(userId1, userId2, userId2, userId1) as chatMessages[];
    return result;
  },

  getUserConversations: (userId: number) => {
    const stmt = db.prepare(`
      SELECT DISTINCT
        CASE
          WHEN senderId = ? THEN receiverId
          ELSE senderId
        END as otherUserId,
        MAX(sentAt) as lastMessageTime
      FROM chatMessages
      WHERE senderId = ? OR receiverId = ?
      GROUP BY otherUserId
      ORDER BY lastMessageTime DESC
    `);
    const result = stmt.all(userId, userId, userId);
    return result as { otherUserId: number; lastMessageTime: string }[];
  },

  //  --> Ilmoitukset
  createNotification: (userId: number, message: string, notificationType: notifications['notificationType'], relatedId?: number): RunResult => {
    const stmt = db.prepare(`
      INSERT INTO notifications (userId, message, isRead, notificationType, relatedId, createdAt)
      VALUES (?, ?, 0, ?, ?, datetime('now'))
    `);
    const result = stmt.run(userId, message, notificationType, relatedId || null);
    return result;
  },

  getNotificationsForUser: (userId: number): notifications[] => {
    const stmt = db.prepare(`
      SELECT * FROM notifications
      WHERE userId = ?
      ORDER BY createdAt DESC
    `);
    const result = stmt.all(userId) as notifications[];
    return result;
  },

  markNotificationAsRead: (notificationId: number): RunResult => {
    const stmt = db.prepare(`
      UPDATE notifications
      SET isRead = 1
      WHERE id = ?
    `);
    const result = stmt.run(notificationId);
    return result;
  },

  markAllNotificationsAsRead: (userId: number): RunResult => {
    const stmt = db.prepare(`
      UPDATE notifications
      SET isRead = 1
      WHERE userId = ?
    `);
    const result = stmt.run(userId);
    return result;
  },

  deleteNotification: (notificationId: number): RunResult => {
    const stmt = db.prepare(`
      DELETE FROM notifications WHERE id = ?
    `);
    const result = stmt.run(notificationId);
    return result;
  },
  //  --> HAKU (Search)
  searchPosts: (query: string): julkaisu[] => {
    const stmt = db.prepare(`
      SELECT * FROM julkaisu
      WHERE kuvaus LIKE ? OR kohde LIKE ?
      ORDER BY Date_ajakohta DESC
    `);
    const likeQuery = `%${query}%`;
    const result = stmt.all(likeQuery, likeQuery) as julkaisu[];
    return result;
  },

  searchTravelPlans: (query: string): matkaAikeet[] => {
    const stmt = db.prepare(`
      SELECT * FROM matkaAikeet
      WHERE kohde LIKE ? OR kuvaus LIKE ?
      ORDER BY suunniteltu_alku_pvm DESC
    `);
    const likeQuery = `%${query}%`;
    const result = stmt.all(likeQuery, likeQuery) as matkaAikeet[];
    return result;
  },
  //  --> TRENDING (Suositut julkaisut)
  getTrendingPosts: (limit: number = 10, daysBack: number = 7): julkaisu[] => {
    const stmt = db.prepare(`
      SELECT
        j.*,
        (
          (SELECT COUNT(*) FROM tykkäykset WHERE julkaisuId = j.id) +
          (SELECT COUNT(*) FROM kommentti WHERE julkaisuId = j.id) * 2
        ) as engagement_score
      FROM julkaisu j
      WHERE datetime(j.Date_ajakohta) >= datetime('now', '-' || ? || ' days')
      ORDER BY engagement_score DESC
      LIMIT ?
    `);
    const result = stmt.all(daysBack, limit) as julkaisu[];
    return result;
  },};

export default postContentsModel;
