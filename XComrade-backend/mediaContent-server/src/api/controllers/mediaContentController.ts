/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import type {
  julkaisu,
  kommentti,
  tykkäykset,
  matkaAikeet,
  notifications,
  chatMessages,
  friendRequest,
  tripParticipants,
  userProfile
} from '@xcomrade/types-server';
import mediaContentModel from '../models/mediaContentModel';
import { sendToUser } from '../../websocket';
import db from '../../database/db-manipulation';

// Extend Express Request to include authenticated user
interface AuthenticatedRequest extends Request {
  user?: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'user_level_id'>;
}

const getFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const posts = mediaContentModel.getPostsEnriched(limit, offset);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ message: 'Server error while fetching feed' });
  }
};

const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = parseInt(req.params.id);
    const post = mediaContentModel.getPostByIdEnriched(postId);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error while fetching post' });
  }
};

const getUserPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);
    const posts = mediaContentModel.getUserPostsEnriched(userId);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Server error while fetching user posts' });
  }
};

const createPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { kuvaus, kohde, list_aktiviteetti, media_images, otsikko, media_type, media_url, sisältö } = req.body as Pick<julkaisu, 'kuvaus' | 'kohde' | 'list_aktiviteetti'> & { media_images?: string[]; otsikko?: string; media_type?: string; media_url?: string; sisältö?: string };
    const userId: number = req.user!.id;

    if (!kuvaus || !kohde) {
      res.status(400).json({ message: 'Description and destination are required' });
      return;
    }

    const result = mediaContentModel.createNewPost(
      kuvaus,
      kohde,
      userId,
      list_aktiviteetti ? JSON.stringify(list_aktiviteetti) : undefined,
      otsikko,
      media_type,
      media_url,
      sisältö
    );

    const postId = result.lastInsertRowid as number;

    // Insert media images if provided
    if (media_images && Array.isArray(media_images)) {
      for (const imageUrl of media_images) {
        mediaContentModel.addMediaImage(postId, imageUrl);
      }
    }

    const newPost = mediaContentModel.getPostByIdEnriched(postId);
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error while creating post' });
  }
};

const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = parseInt(req.params.id);
    const { kuvaus, kohde, list_aktiviteetti } = req.body as Partial<Pick<julkaisu, 'kuvaus' | 'kohde' | 'list_aktiviteetti'>>;

    mediaContentModel.updatePost(
      postId,
      kuvaus,
      kohde,
      list_aktiviteetti ? JSON.stringify(list_aktiviteetti) : undefined
    );

    const updatedPost: julkaisu | undefined = mediaContentModel.getPostById(postId);
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error while updating post' });
  }
};

const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = parseInt(req.params.id);
    mediaContentModel.deletePost(postId);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error while deleting post' });
  }
};

const searchPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    const posts = mediaContentModel.searchPosts(query);

    res.json(posts);
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({ message: 'Server error while searching posts' });
  }
};

const searchTravelPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    const plans: matkaAikeet[] = mediaContentModel.searchTravelPlans(query);
    res.json(plans);
  } catch (error) {
    console.error('Error searching travel plans:', error);
    res.status(500).json({ message: 'Server error while searching travel plans' });
  }
};

const getTrendingPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const daysBack = parseInt(req.query.days as string) || 7;

    const posts: julkaisu[] = mediaContentModel.getTrendingPosts(limit, daysBack);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    res.status(500).json({ message: 'Server error while fetching trending posts' });
  }
};

const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = parseInt(req.params.postId);
    const comments: kommentti[] = mediaContentModel.getCommentsForPost(postId);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error while fetching comments' });
  }
};

const addComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const postId = parseInt(req.params.postId);
    const { teksti_kenttä } = req.body as Pick<kommentti, 'teksti_kenttä'>;
    const userId: number = req.user!.id;

    if (!teksti_kenttä) {
      res.status(400).json({ message: 'Comment text is required' });
      return;
    }

    const result = mediaContentModel.addComment(teksti_kenttä, postId, userId);

    // Notify the post owner about the comment
    try {
      const post = mediaContentModel.getPostById(postId);
      if (post && post.userId !== userId) {
        const commenterName = req.user!.käyttäjäTunnus;
        const notifMsg = `@${commenterName} commented on your post`;
        const notifResult = mediaContentModel.createNotification(
          post.userId,
          notifMsg,
          'comment',
          postId
        );
        sendToUser(post.userId, {
          type: 'notification',
          payload: {
            id: Number(notifResult.lastInsertRowid),
            userId: post.userId,
            message: notifMsg,
            isRead: false,
            notificationType: 'comment',
            relatedId: postId,
            createdAt: new Date(),
          },
        });
      }
    } catch (notifErr) {
      console.error('Failed to create comment notification:', notifErr);
    }

    // Return the full comment with user data so the frontend can display it immediately
    const user = db.prepare(
      `SELECT id, käyttäjäTunnus, profile_picture_url FROM käyttäjä WHERE id = ?`
    ).get(userId) as { id: number; käyttäjäTunnus: string; profile_picture_url: string } | undefined;

    res.status(201).json({
      id: result.lastInsertRowid,
      teksti_kenttä,
      julkaisuId: postId,
      userId,
      createdAt: new Date().toISOString(),
      user: user || { id: userId, käyttäjäTunnus: 'unknown', profile_picture_url: '' },
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error while adding comment' });
  }
};

const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const commentId = parseInt(req.params.id);
    mediaContentModel.deleteComment(commentId);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error while deleting comment' });
  }
};

const likePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const postId = parseInt(req.params.postId);
    const userId: number = req.user!.id;

    // Check if already liked to avoid unique constraint violation
    const existing = mediaContentModel.checkUserLiked(postId, userId);
    if (existing) {
      res.status(409).json({ message: 'Post already liked' });
      return;
    }

    const result = mediaContentModel.addLike(postId, userId);

    // Notify the post owner about the like
    try {
      const post = mediaContentModel.getPostById(postId);
      if (post && post.userId !== userId) {
        const likerName = req.user!.käyttäjäTunnus;
        const notifMsg = `@${likerName} liked your post`;
        const notifResult = mediaContentModel.createNotification(
          post.userId,
          notifMsg,
          'like',
          postId
        );
        sendToUser(post.userId, {
          type: 'notification',
          payload: {
            id: Number(notifResult.lastInsertRowid),
            userId: post.userId,
            message: notifMsg,
            isRead: false,
            notificationType: 'like',
            relatedId: postId,
            createdAt: new Date(),
          },
        });
      }
    } catch (notifErr) {
      console.error('Failed to create like notification:', notifErr);
    }

    res.status(201).json({ id: result.lastInsertRowid, julkaisuId: postId, userId });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Server error while liking post' });
  }
};

const unlikePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const postId = parseInt(req.params.postId);
    const userId: number = req.user!.id;

    mediaContentModel.removeLike(postId, userId);
    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ message: 'Server error while unliking post' });
  }
};

const checkLikeStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const postId = parseInt(req.params.postId);
    const userId: number = req.user!.id;

    const liked: tykkäykset | undefined = mediaContentModel.checkUserLiked(postId, userId);
    res.json({ liked: !!liked });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ message: 'Server error while checking like status' });
  }
};

const getTravelPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = mediaContentModel.getTravelPlans();
    res.json(plans);
  } catch (error) {
    console.error('Error fetching travel plans:', error);
    res.status(500).json({ message: 'Server error while fetching travel plans' });
  }
};

const getTravelPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const planId = parseInt(req.params.id);
    const plan: matkaAikeet | undefined = mediaContentModel.getTravelPlanById(planId);

    if (!plan) {
      res.status(404).json({ message: 'Travel plan not found' });
      return;
    }

    res.json(plan);
  } catch (error) {
    console.error('Error fetching travel plan:', error);
    res.status(500).json({ message: 'Server error while fetching travel plan' });
  }
};

const getUserTravelPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);
    const plans: matkaAikeet[] = mediaContentModel.getUserTravelPlans(userId);
    res.json(plans);
  } catch (error) {
    console.error('Error fetching user travel plans:', error);
    res.status(500).json({ message: 'Server error while fetching user travel plans' });
  }
};

const createTravelPlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { kohde, suunniteltu_alku_pvm, suunniteltu_loppu_pvm, aktiviteetit, budjetti, kuvaus } =
      req.body as Pick<matkaAikeet, 'kohde' | 'suunniteltu_alku_pvm' | 'suunniteltu_loppu_pvm' | 'aktiviteetit' | 'budjetti' | 'kuvaus'>;
    const userId: number = req.user!.id;

    if (!kohde || !suunniteltu_alku_pvm || !suunniteltu_loppu_pvm) {
      res.status(400).json({ message: 'Destination and dates are required' });
      return;
    }

    const result = mediaContentModel.createTravelPlan(
      userId,
      kohde,
      suunniteltu_alku_pvm instanceof Date ? suunniteltu_alku_pvm.toISOString() : suunniteltu_alku_pvm,
      suunniteltu_loppu_pvm instanceof Date ? suunniteltu_loppu_pvm.toISOString() : suunniteltu_loppu_pvm,
      aktiviteetit ? JSON.stringify(aktiviteetit) : undefined,
      budjetti ? JSON.stringify(budjetti) : undefined,
      kuvaus
    );

    const newPlan: matkaAikeet | undefined = mediaContentModel.getTravelPlanById(result.lastInsertRowid as number);
    res.status(201).json(newPlan);
  } catch (error) {
    console.error('Error creating travel plan:', error);
    res.status(500).json({ message: 'Server error while creating travel plan' });
  }
};

const updateTravelPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const planId = parseInt(req.params.id);
    mediaContentModel.updateTravelPlan(planId, req.body as Partial<matkaAikeet>);

    const updatedPlan: matkaAikeet | undefined = mediaContentModel.getTravelPlanById(planId);
    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating travel plan:', error);
    res.status(500).json({ message: 'Server error while updating travel plan' });
  }
};

const deleteTravelPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const planId = parseInt(req.params.id);
    mediaContentModel.deleteTravelPlan(planId);
    res.json({ message: 'Travel plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting travel plan:', error);
    res.status(500).json({ message: 'Server error while deleting travel plan' });
  }
};

const getBuddyRequests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId: number = req.user!.id;
    const requests: friendRequest[] = mediaContentModel.getBuddyRequests(userId);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching buddy requests:', error);
    res.status(500).json({ message: 'Server error while fetching buddy requests' });
  }
};

const getPlanBuddyRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const planId = parseInt(req.params.planId);
    const requests: friendRequest[] = mediaContentModel.getPlanBuddyRequests(planId);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching plan buddy requests:', error);
    res.status(500).json({ message: 'Server error while fetching plan buddy requests' });
  }
};

const sendBuddyRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const planId = parseInt(req.params.planId);
    const { message } = req.body as Pick<friendRequest, 'message'>;
    const requesterId: number = req.user!.id;

    const plan: matkaAikeet | undefined = mediaContentModel.getTravelPlanById(planId);
    if (!plan) {
      res.status(404).json({ message: 'Travel plan not found' });
      return;
    }

    const result = mediaContentModel.createBuddyRequest(planId, requesterId, (plan as any).userId, message);
    const buddyRequestId = Number(result.lastInsertRowid);
    const requesterName = req.user!.käyttäjäTunnus;

    // Notify the plan owner about the buddy request
    try {
      const ownerId = (plan as any).userId as number;
      if (ownerId !== requesterId) {
        const notifMsg = `@${requesterName} sent you a buddy request for your travel plan`;
        const notifResult = mediaContentModel.createNotification(
          ownerId,
          notifMsg,
          'buddy_request',
          buddyRequestId
        );
        sendToUser(ownerId, {
          type: 'notification',
          payload: {
            id: Number(notifResult.lastInsertRowid),
            userId: ownerId,
            message: notifMsg,
            isRead: false,
            notificationType: 'buddy_request',
            relatedId: buddyRequestId,
            createdAt: new Date(),
          },
        });
      }
    } catch (notifErr) {
      console.error('Failed to create buddy request notification:', notifErr);
    }

    res.status(201).json({ id: buddyRequestId, message: 'Buddy request sent successfully' });
  } catch (error) {
    console.error('Error sending buddy request:', error);
    res.status(500).json({ message: 'Server error while sending buddy request' });
  }
};

const acceptBuddyRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestId = parseInt(req.params.id);

    // Look up the request so we can notify the requester
    const buddyReq = mediaContentModel.getBuddyRequestById(requestId);

    mediaContentModel.acceptBuddyRequest(requestId);

    // Notify the requester that their buddy request was accepted
    if (buddyReq) {
      try {
        const notifResult = mediaContentModel.createNotification(
          buddyReq.requesterId,
          'Your buddy request was accepted! ',
          'buddy_request',
          requestId
        );
        sendToUser(buddyReq.requesterId, {
          type: 'notification',
          payload: {
            id: Number(notifResult.lastInsertRowid),
            userId: buddyReq.requesterId,
            message: 'Your buddy request was accepted! ',
            isRead: false,
            notificationType: 'buddy_request',
            relatedId: requestId,
            createdAt: new Date(),
          },
        });
      } catch (notifErr) {
        console.error('Failed to create acceptance notification:', notifErr);
      }
    }

    res.json({ message: 'Buddy request accepted' });
  } catch (error) {
    console.error('Error accepting buddy request:', error);
    res.status(500).json({ message: 'Server error while accepting buddy request' });
  }
};

const rejectBuddyRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestId = parseInt(req.params.id);
    mediaContentModel.rejectBuddyRequest(requestId);
    res.json({ message: 'Buddy request rejected' });
  } catch (error) {
    console.error('Error rejecting buddy request:', error);
    res.status(500).json({ message: 'Server error while rejecting buddy request' });
  }
};

const getTripParticipants = async (req: Request, res: Response): Promise<void> => {
  try {
    const planId = parseInt(req.params.planId);
    const participants: tripParticipants[] = mediaContentModel.getTripParticipants(planId);
    res.json(participants);
  } catch (error) {
    console.error('Error fetching trip participants:', error);
    res.status(500).json({ message: 'Server error while fetching trip participants' });
  }
};

const removeTripParticipant = async (req: Request, res: Response): Promise<void> => {
  try {
    const participantId = parseInt(req.params.id);
    mediaContentModel.removeTripParticipant(participantId);
    res.json({ message: 'Participant removed successfully' });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ message: 'Server error while removing participant' });
  }
};

const getConversations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId: number = req.user!.id;
    const conversations = mediaContentModel.getUserConversations(userId);
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error while fetching conversations' });
  }
};

const getMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const otherUserId = parseInt(req.params.userId);
    const currentUserId: number = req.user!.id;

    const messages: chatMessages[] = mediaContentModel.getConversation(currentUserId, otherUserId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
};

const sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { receiverId, message } = req.body as { receiverId: number; message: string };
    const senderId: number = req.user!.id;

    if (!message) {
      res.status(400).json({ message: 'Message text is required' });
      return;
    }

    const result = mediaContentModel.sendMessage(senderId, receiverId, message);

    // Broadcast the new message to the receiver in real-time via WebSocket
    const newMsg: chatMessages = {
      id: Number(result.lastInsertRowid),
      senderId,
      receiverId,
      message,
      sentAt: new Date(),
    };
    sendToUser(receiverId, { type: 'new_message', payload: newMsg });

    // Create a notification for the message receiver
    try {
      const senderName = req.user!.käyttäjäTunnus;
      const notifMsg = `@${senderName} sent you a message`;
      const notifResult = mediaContentModel.createNotification(
        receiverId,
        notifMsg,
        'message',
        senderId
      );
      // Push the notification in real-time via WebSocket
      const notif: notifications = {
        id: Number(notifResult.lastInsertRowid),
        userId: receiverId,
        message: notifMsg,
        isRead: false,
        notificationType: 'message',
        relatedId: senderId,
        createdAt: new Date(),
      };
      sendToUser(receiverId, { type: 'notification', payload: notif });
    } catch (notifErr) {
      console.error('Failed to create message notification:', notifErr);
    }

    res.status(201).json({ id: result.lastInsertRowid, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
};

const markMessagesAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const senderId = parseInt(req.params.senderId);
    const receiverId: number = req.user!.id;
    mediaContentModel.markMessagesAsRead(receiverId, senderId);
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error while marking messages as read' });
  }
};

const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId: number = req.user!.id;
    const notifications: notifications[] = mediaContentModel.getNotificationsForUser(userId);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error while fetching notifications' });
  }
};

const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const notificationId = parseInt(req.params.id);
    mediaContentModel.markNotificationAsRead(notificationId);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error while marking notification as read' });
  }
};

const markAllNotificationsAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId: number = req.user!.id;
    mediaContentModel.markAllNotificationsAsRead(userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error while marking all notifications as read' });
  }
};

const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const notificationId = parseInt(req.params.id);
    mediaContentModel.deleteNotification(notificationId);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error while deleting notification' });
  }
};

export {
  getFeed, getPost, getUserPosts, createPost, updatePost, deletePost, searchPosts, searchTravelPlans, getTrendingPosts,
  getComments, addComment, deleteComment,
  likePost, unlikePost, checkLikeStatus,
  getTravelPlans, getTravelPlan, getUserTravelPlans, createTravelPlan, updateTravelPlan, deleteTravelPlan,
  getBuddyRequests,
  getPlanBuddyRequests,
  sendBuddyRequest,
  acceptBuddyRequest,
  rejectBuddyRequest,
  getTripParticipants,
  removeTripParticipant,
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
