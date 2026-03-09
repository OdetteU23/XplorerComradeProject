import type { chatMessages, notifications } from '@xcomrade/types-server';
import type { Conversation, MessagesAction, MessagesState } from '../../utilHelpers/types/localTypes';
import { useState, useEffect, useReducer, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatList, ChatWindow, NotificationList, NotificationToastContainer, NewConversation } from '../components/Messages&Notifics';
import { api } from '../../utilHelpers/FetchingData';
import { useKäyttäjä } from '../content/käyttänKontentti';

// ─── Helper: build WS URL from the MEDIA_API env var ──────────────
const buildWsUrl = (): string => {
  const token = localStorage.getItem('authToken');
  const wsBase = (import.meta.env.VITE_MEDIA_API || 'http://localhost:3001')
    .replace(/^\/\/http/, 'ws')
    .replace(/^\/\/https/, 'wss')
    .replace(/^http/, 'ws')
    .replace(/\/api$/, '');
  return token ? `${wsBase}?token=${token}` : wsBase;
};

// ---- useReducer for MessagesView ----



const messagesInitialState: MessagesState = {
  conversations: [],
  selectedUserId: null,
  messages: [],
  recipientUser: null,
  isLoading: true,
  isLoadingMessages: false,
  isSending: false,
  isRecipientTyping: false,
  error: null,
};

function messagesReducer(state: MessagesState, action: MessagesAction): MessagesState {
  switch (action.type) {
    case 'CONVERSATIONS_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'CONVERSATIONS_LOADED':
      return { ...state, isLoading: false, conversations: action.payload };
    case 'CONVERSATIONS_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'SELECT_CHAT':
      return { ...state, selectedUserId: action.payload, messages: [], recipientUser: null, isRecipientTyping: false };
    case 'MESSAGES_LOADING':
      return { ...state, isLoadingMessages: true };
    case 'MESSAGES_LOADED':
      return { ...state, isLoadingMessages: false, messages: action.payload };
    case 'MESSAGES_ERROR':
      return { ...state, isLoadingMessages: false, error: action.payload };
    case 'SET_RECIPIENT':
      return { ...state, recipientUser: action.payload };
    case 'APPEND_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload], isSending: false };
    case 'SET_SENDING':
      return { ...state, isSending: action.payload };
    case 'SET_RECIPIENT_TYPING':
      return { ...state, isRecipientTyping: action.payload };
    default:
      return state;
  }
}

const MessagesView = () => {
  const { user } = useKäyttäjä();
  const currentUserId = user?.id ?? 0;
  const [state, dispatch] = useReducer(messagesReducer, messagesInitialState);
  const { conversations, selectedUserId, messages, recipientUser, isLoading, isLoadingMessages, isSending, isRecipientTyping } = state;
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
      loadRecipientUser(selectedUserId);
    }
  }, [selectedUserId]);

  const loadConversations = async () => {
    try {
      dispatch({ type: 'CONVERSATIONS_LOADING' });
      const rawConvos = await api.message.getConversations();

      // Hydrate each conversation: fetch user profile + last messages
      const hydrated: Conversation[] = await Promise.all(
        rawConvos.map(async (raw) => {
          // Fetch user profile and the last message in parallel
          const [profile, messages] = await Promise.all([
            api.user.getProfile(raw.otherUserId).catch(() => null),
            api.message.getMessages(raw.otherUserId).catch(() => [] as chatMessages[]),
          ]);

          const lastMessage = messages.length > 0
            ? messages[messages.length - 1]
            : { id: 0, senderId: 0, receiverId: 0, message: '', sentAt: raw.lastMessageTime } as unknown as chatMessages;

          return {
            user: profile ?? {
              id: raw.otherUserId,
              käyttäjäTunnus: 'Unknown',
              etunimi: 'Unknown',
              sukunimi: 'User',
              profile_picture_url: '',
            },
            lastMessage,
            unreadCount: 0, // Backend doesn't track read status yet
          } as Conversation;
        })
      );

      dispatch({ type: 'CONVERSATIONS_LOADED', payload: hydrated });
    } catch (err) {
      console.error('Load conversations error:', err);
      dispatch({ type: 'CONVERSATIONS_ERROR', payload: 'Failed to load conversations' });
    }
  };

  const loadMessages = async (userId: number) => {
    try {
      dispatch({ type: 'MESSAGES_LOADING' });
      const msgs = await api.message.getMessages(userId);
      dispatch({ type: 'MESSAGES_LOADED', payload: msgs });
      // Mark as read
      await api.message.markAsRead(userId);
    } catch (err) {
      console.error('Load messages error:', err);
      dispatch({ type: 'MESSAGES_ERROR', payload: 'Failed to load messages' });
    }
  };

  const loadRecipientUser = async (userId: number) => {
    try {
      const user = await api.user.getProfile(userId);
      dispatch({ type: 'SET_RECIPIENT', payload: user });
    } catch (err) {
      console.error('Load recipient error:', err);
    }
  };

  const handleSelectChat = (userId: number) => {
    dispatch({ type: 'SELECT_CHAT', payload: userId });
    setIsComposing(false);
  };

  const handleStartCompose = () => setIsComposing(true);
  const handleCancelCompose = () => setIsComposing(false);

  const handleSearchUsers = async (query: string) => {
    return api.user.searchUsers(query);
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedUserId) return;

    try {
      dispatch({ type: 'SET_SENDING', payload: true });
      const newMessage = await api.message.sendMessage(selectedUserId, message);
      dispatch({ type: 'APPEND_MESSAGE', payload: newMessage });
    } catch (err) {
      console.error('Send message error:', err);
      dispatch({ type: 'SET_SENDING', payload: false });
      alert('Failed to send message');
    }
  };

  /** Broadcast typing status over the WebSocket */
  const handleTyping = useCallback((isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && selectedUserId) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        payload: { receiverId: selectedUserId, isTyping },
      }));
    }
  }, [selectedUserId]);

  // WebSocket for real time message updates
  const wsRef = useRef<WebSocket | null>(null);
  const selectedUserIdRef = useRef<number | null>(selectedUserId);

  // Keep ref in sync so the WS handler always sees the latest value
  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  useEffect(() => {
    const wsUrl = buildWsUrl();
    // Don't attempt WS if there's no auth token
    if (!localStorage.getItem('authToken')) return;

    let attempts = 0;
    const MAX_ATTEMPTS = 8;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let unmounted = false;

    const connect = () => {
      if (unmounted || attempts >= MAX_ATTEMPTS) {
        if (attempts >= MAX_ATTEMPTS) {
          console.warn('Messages WebSocket: max reconnect attempts reached — giving up. Real-time updates unavailable.');
        }
        return;
      }

      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log('Messages WebSocket connected');
        attempts = 0; // reset on success
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'new_message') {
            const incoming: chatMessages = data.payload;
            if (
              incoming.senderId === selectedUserIdRef.current ||
              incoming.receiverId === selectedUserIdRef.current
            ) {
              dispatch({ type: 'APPEND_MESSAGE', payload: incoming });
            }
            loadConversations();
          }

          if (data.type === 'typing') {
            const { senderId, isTyping } = data.payload as { senderId: number; isTyping: boolean };
            if (senderId === selectedUserIdRef.current) {
              dispatch({ type: 'SET_RECIPIENT_TYPING', payload: isTyping });
            }
          }
        } catch (err) {
          console.error('WS message parse error:', err);
        }
      };

      socket.onclose = (e) => {
        if (unmounted || e.code === 1000) return;
        attempts++;
        const delay = Math.min(3000 * Math.pow(2, attempts - 1), 60000); // 3s → 6s → 12s … 60s
        console.log(`Messages WebSocket closed (${e.code}). Reconnect attempt ${attempts}/${MAX_ATTEMPTS} in ${delay / 1000}s`);
        reconnectTimer = setTimeout(connect, delay);
      };

      socket.onerror = () => {
        // onclose will fire after this — no need to double-log
        socket.close();
      };
    };

    connect();

    return () => {
      unmounted = true;
      clearTimeout(reconnectTimer);
      wsRef.current?.close(1000, 'component unmounted');
    };
  }, [currentUserId]);

  return (
    <div className="messages-view flex flex-col h-full">
      <h2 className="px-4 py-3 text-xl font-bold text-white">Messages</h2>
      <div className="messages-container flex flex-1 min-h-0">
        <div className="conversations-sidebar w-80 border-r border-white/10 overflow-y-auto flex flex-col">
          {isComposing ? (
            <NewConversation
              onSelectUser={handleSelectChat}
              onCancel={handleCancelCompose}
              onSearch={handleSearchUsers}
              currentUserId={currentUserId}
            />
          ) : (
            <>
              {/* New message button */}
              <div className="px-3 py-2">
                <button
                  onClick={handleStartCompose}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium py-2 px-3 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  New Message
                </button>
              </div>

              {/* Conversations list */}
              {isLoading ? (
                <p className="p-4 text-white/40 text-sm">Loading conversations…</p>
              ) : conversations.length === 0 ? (
                <p className="p-4 text-white/40 text-sm">No conversations yet. Start chatting with fellow travelers!</p>
              ) : (
                <ChatList
                  conversations={conversations}
                  onSelectChat={handleSelectChat}
                  selectedUserId={selectedUserId}
                />
              )}
            </>
          )}
        </div>
        <div className="chat-window-container flex-1 flex flex-col min-h-0">
          {selectedUserId && recipientUser ? (
            isLoadingMessages ? (
              <p className="p-4 text-white/40 text-sm">Loading messages…</p>
            ) : (
              <ChatWindow
                messages={messages}
                currentUserId={currentUserId}
                recipientUser={recipientUser}
                //notifications={notifications}
                onSendMessage={handleSendMessage}
                isRecipientTyping={isRecipientTyping}
                onTyping={handleTyping}
                isSending={isSending}
              />
            )
          ) : (
            <div className="no-chat-selected flex-1 flex items-center justify-center">
              <p className="text-white/30 text-sm">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationsView = () => {
  const navigate = useNavigate();
  const [notificationsList, setNotificationsList] = useState<notifications[]>([]);
  const [toasts, setToasts] = useState<notifications[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const prevIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    loadNotifications();
  }, []);

  // Poll for new notifications every 30 seconds (WS server not yet available)
  useEffect(() => {
    const POLL_INTERVAL = 30_000;
    const interval = setInterval(async () => {
      try {
        const notifs = await api.notification.getNotifications();

        // Detect genuinely new notifications for toast display
        const newIds = new Set(notifs.map(n => n.id));
        const freshNotifs = notifs.filter(n => !prevIdsRef.current.has(n.id));
        prevIdsRef.current = newIds;

        setNotificationsList(notifs);

        // Show toasts for new unread notifications
        if (freshNotifs.length > 0) {
          const unreadFresh = freshNotifs.filter(n => !n.isRead);
          if (unreadFresh.length > 0) {
            setToasts(prev => [...unreadFresh, ...prev].slice(0, 5));
          }
        }
      } catch (err) {
        // Silently fail — the initial load already showed the data
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const notifs = await api.notification.getNotifications();
      setNotificationsList(notifs);
      // Seed the known IDs so the first poll doesn't show toasts for old items
      prevIdsRef.current = new Set(notifs.map(n => n.id));
    } catch (err) {
      console.error('Load notifications error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: notifications) => {
    try {
      await api.notification.markAsRead(notification.id);
      setNotificationsList((prev) => prev.filter(n => n.id !== notification.id));

      // Navigate to the related content based on notification type
      switch (notification.notificationType) {
        case 'message':
          // relatedId = senderId → navigate to messages view
          navigate('/messages');
          break;
        case 'comment':
        case 'like':
          // relatedId = postId → navigate to the post detail
          if (notification.relatedId) {
            navigate(`/post/${notification.relatedId}`);
          }
          break;
        case 'buddy_request':
          // Buddy requests are handled inline via Accept/Reject buttons;
          // "accepted" confirmations just dismiss.
          break;
        case 'follow':
          // relatedId = follower user id
          if (notification.relatedId) {
            navigate(`/profile/${notification.relatedId}`);
          }
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Mark notification as read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notification.markAllAsRead();
      setNotificationsList([]);
    } catch (err) {
      console.error('Mark all notifications as read error:', err);
    }
  };

  /** Accept a buddy request directly from the notification */
  const handleAcceptBuddy = async (requestId: number, notificationId: number) => {
    try {
      await api.buddyRequest.acceptBuddyRequest(requestId);
      // Mark the notification as read & remove it
      await api.notification.markAsRead(notificationId).catch(() => {});
      setNotificationsList((prev) => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Accept buddy request error:', err);
      alert('Failed to accept buddy request');
    }
  };

  /** Reject a buddy request directly from the notification */
  const handleRejectBuddy = async (requestId: number, notificationId: number) => {
    try {
      await api.buddyRequest.rejectBuddyRequest(requestId);
      // Mark the notification as read & remove it
      await api.notification.markAsRead(notificationId).catch(() => {});
      setNotificationsList((prev) => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Reject buddy request error:', err);
      alert('Failed to reject buddy request');
    }
  };

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter(t => t.id !== id));
  }, []);

  // ── WebSocket for real-time notification updates ──
  useEffect(() => {
    // Don't attempt WS if there's no auth token
    if (!localStorage.getItem('authToken')) return;

    const wsUrl = buildWsUrl();
    let socket: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    const MAX_ATTEMPTS = 8;
    let unmounted = false;

    const connect = () => {
      if (unmounted || attempts >= MAX_ATTEMPTS) {
        if (attempts >= MAX_ATTEMPTS) {
          console.warn('Notifications WebSocket: max reconnect attempts reached — giving up.');
        }
        return;
      }

      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('Notifications WebSocket connected');
        attempts = 0;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'notification') {
            const newNotification: notifications = data.payload;
            setNotificationsList((prev) => [newNotification, ...prev]);
            setToasts((prev) => [newNotification, ...prev].slice(0, 5));
          }
        } catch (err) {
          console.error('WS notification parse error:', err);
        }
      };

      socket.onclose = (e) => {
        if (unmounted || e.code === 1000) return;
        attempts++;
        const delay = Math.min(3000 * Math.pow(2, attempts - 1), 60000);
        console.log(`Notifications WebSocket closed (${e.code}). Reconnect ${attempts}/${MAX_ATTEMPTS} in ${delay / 1000}s`);
        reconnectTimer = setTimeout(connect, delay);
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connect();

    return () => {
      unmounted = true;
      clearTimeout(reconnectTimer);
      socket?.close(1000, 'component unmounted');
    };
  }, []);

  return (
    <div className="notifications-view flex flex-col h-full">
      <h2 className="px-4 py-3 text-xl font-bold text-white">Notifications</h2>
      {isLoading ? (
        <p className="p-4 text-white/40 text-sm">Loading notifications…</p>
      ) : (
        <NotificationList
          notifications={notificationsList}
          onNotificationClick={handleNotificationClick}
          onMarkAllRead={handleMarkAllRead}
          onAcceptBuddy={handleAcceptBuddy}
          onRejectBuddy={handleRejectBuddy}
        />
      )}
      {/* Real-time notification toasts */}
      <NotificationToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export { MessagesView, NotificationsView };
export default MessagesView;
