import type { chatMessages, notifications, userProfile } from '@xcomrade/types-server';
import type { Conversation } from '../../utilHelpers/types/localTypes';
import { useState, useEffect } from 'react';
import { ChatList, ChatWindow } from '../components/Messages&Notifics';
import { NotificationList } from '../components/Messages&Notifics';
import { api } from '../../utilHelpers/FetchingData';
import { useKäyttäjä } from '../content/käyttänKontentti';

const MessagesView = () => {
  const { user } = useKäyttäjä();
  const currentUserId = user?.id ?? 0;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<chatMessages[]>([]);
  const [recipientUser, setRecipientUser] = useState<Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'etunimi' | 'sukunimi' | 'profile_picture_url'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

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
      setIsLoading(true);
      const convos = await api.message.getConversations();
      // Transform to Conversation interface (assumes getConversations returns proper structure)
      setConversations(convos as unknown as Conversation[]);
    } catch (err) {
      console.error('Load conversations error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (userId: number) => {
    try {
      setIsLoadingMessages(true);
      const msgs = await api.message.getMessages(userId);
      setMessages(msgs);
      // Mark as read
      await api.message.markAsRead(userId);
    } catch (err) {
      console.error('Load messages error:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const loadRecipientUser = async (userId: number) => {
    try {
      const user = await api.user.getProfile(userId);
      setRecipientUser(user);
    } catch (err) {
      console.error('Load recipient error:', err);
    }
  };

  const handleSelectChat = (userId: number) => {
    setSelectedUserId(userId);
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedUserId) return;

    try {
      const newMessage = await api.message.sendMessage(selectedUserId, message);
      setMessages([...messages, newMessage]);
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
