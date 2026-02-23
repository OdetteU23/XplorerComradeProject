import type { chatMessages, notifications, userProfile } from '@xcomrade/types-server';
import type { Conversation } from '../../utilHelpers/types/localTypes';
import { useState, useEffect, useReducer } from 'react';
import { ChatList, ChatWindow } from '../components/Messages&Notifics';
import { NotificationList } from '../components/Messages&Notifics';
import { api } from '../../utilHelpers/FetchingData';
import { useKäyttäjä } from '../content/käyttänKontentti';

// ---- useReducer for MessagesView ----
type RecipientUser = Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'etunimi' | 'sukunimi' | 'profile_picture_url'>;

interface MessagesState {
  conversations: Conversation[];
  selectedUserId: number | null;
  messages: chatMessages[];
  recipientUser: RecipientUser | null;
  isLoading: boolean;
  isLoadingMessages: boolean;
  error: string | null;
}

type MessagesAction =
  | { type: 'CONVERSATIONS_LOADING' }
  | { type: 'CONVERSATIONS_LOADED'; payload: Conversation[] }
  | { type: 'CONVERSATIONS_ERROR'; payload: string }
  | { type: 'SELECT_CHAT'; payload: number }
  | { type: 'MESSAGES_LOADING' }
  | { type: 'MESSAGES_LOADED'; payload: chatMessages[] }
  | { type: 'MESSAGES_ERROR'; payload: string }
  | { type: 'SET_RECIPIENT'; payload: RecipientUser }
  | { type: 'APPEND_MESSAGE'; payload: chatMessages };

const messagesInitialState: MessagesState = {
  conversations: [],
  selectedUserId: null,
  messages: [],
  recipientUser: null,
  isLoading: true,
  isLoadingMessages: false,
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
      return { ...state, selectedUserId: action.payload, messages: [], recipientUser: null };
    case 'MESSAGES_LOADING':
      return { ...state, isLoadingMessages: true };
    case 'MESSAGES_LOADED':
      return { ...state, isLoadingMessages: false, messages: action.payload };
    case 'MESSAGES_ERROR':
      return { ...state, isLoadingMessages: false, error: action.payload };
    case 'SET_RECIPIENT':
      return { ...state, recipientUser: action.payload };
    case 'APPEND_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    default:
      return state;
  }
}

const MessagesView = () => {
  const { user } = useKäyttäjä();
  const currentUserId = user?.id ?? 0;
  const [state, dispatch] = useReducer(messagesReducer, messagesInitialState);
  const { conversations, selectedUserId, messages, recipientUser, isLoading, isLoadingMessages } = state;

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
      const convos = await api.message.getConversations();
      // Transform to Conversation interface (assumes getConversations returns proper structure)
      dispatch({ type: 'CONVERSATIONS_LOADED', payload: convos as unknown as Conversation[] });
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
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedUserId) return;

    try {
      const newMessage = await api.message.sendMessage(selectedUserId, message);
      dispatch({ type: 'APPEND_MESSAGE', payload: newMessage });
    } catch (err) {
      console.error('Send message error:', err);
      alert('Failed to send message');
    }
  };

  return (
    <div className="messages-view">
      <h2>Messages</h2>
      <div className="messages-container">
        <div className="conversations-sidebar">
          {isLoading ? (
            <p>Loading conversations...</p>
          ) : conversations.length === 0 ? (
            <p>No conversations yet. Start chatting with fellow travelers!</p>
          ) : (
            <ChatList
              conversations={conversations}
              onSelectChat={handleSelectChat}
            />
          )}
        </div>
        <div className="chat-window-container">
          {selectedUserId && recipientUser ? (
            isLoadingMessages ? (
              <p>Loading messages...</p>
            ) : (
              <ChatWindow
                messages={messages}
                currentUserId={currentUserId}
                recipientUser={recipientUser}
                onSendMessage={handleSendMessage}
              />
            )
          ) : (
            <div className="no-chat-selected">
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationsView = () => {
  const [notificationsList, setNotificationsList] = useState<notifications[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const notifs = await api.notification.getNotifications();
      setNotificationsList(notifs);
    } catch (err) {
      console.error('Load notifications error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notificationId: number) => {
    try {
      await api.notification.markAsRead(notificationId);
      // Remove from list or mark as read
      setNotificationsList(notificationsList.filter(n => n.id !== notificationId));
      // TODO: Navigate to related content based on notification type
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

  return (
    <div className="notifications-view">
      <h2>Notifications</h2>
      {isLoading ? (
        <p>Loading notifications...</p>
      ) : (
        <NotificationList
          notifications={notificationsList}
          onNotificationClick={handleNotificationClick}
          onMarkAllRead={handleMarkAllRead}
        />
      )}
    </div>
  );
};

export { MessagesView, NotificationsView };
export default MessagesView;
