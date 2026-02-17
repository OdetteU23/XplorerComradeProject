import type { chatMessages, notifications, userProfile } from '@xcomrade/types-server';
import { useState } from 'react';

// {Messaging Components}
/*
- ChatList --> List of conversations
- ChatWindow --> Individual chat conversation (chatMessages)
- MessageBubble --> Single message display
*/

interface Conversation {
  user: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'etunimi' | 'sukunimi' | 'profile_picture_url'>;
  lastMessage: chatMessages;
  unreadCount: number;
}

interface ChatListProps {
  conversations: Conversation[];
  onSelectChat: (userId: number) => void;
}

const ChatList = ({ conversations, onSelectChat }: ChatListProps) => {
  return (
    <div className="chat-list">
      <h3>Messages</h3>
      {conversations.map((conversation) => (
        <div
          key={conversation.user.id}
          className="conversation-item"
          onClick={() => onSelectChat(conversation.user.id)}
        >
          <img
            src={conversation.user.profile_picture_url || '/default-avatar.png'}
            alt={conversation.user.käyttäjäTunnus}
            className="conversation-avatar"
          />
          <div className="conversation-info">
            <h4>{conversation.user.etunimi} {conversation.user.sukunimi}</h4>
            <p className="last-message">{conversation.lastMessage.message}</p>
          </div>
          {conversation.unreadCount > 0 && (
            <span className="unread-badge">{conversation.unreadCount}</span>
          )}
        </div>
      ))}
    </div>
  );
};

interface ChatWindowProps {
  messages: chatMessages[];
  currentUserId: number;
  recipientUser: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'etunimi' | 'sukunimi' | 'profile_picture_url'>;
  onSendMessage: (message: string) => void;
}

const ChatWindow = ({ messages, currentUserId, recipientUser, onSendMessage }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <img
          src={recipientUser.profile_picture_url || '/default-avatar.png'}
          alt={recipientUser.käyttäjäTunnus}
        />
        <h3>{recipientUser.etunimi} {recipientUser.sukunimi}</h3>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwnMessage={msg.senderId === currentUserId}
          />
        ))}
      </div>

      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: chatMessages;
  isOwnMessage: boolean;
}

const MessageBubble = ({ message, isOwnMessage }: MessageBubbleProps) => {
  return (
    <div className={`message-bubble ${isOwnMessage ? 'own-message' : 'other-message'}`}>
      <p>{message.message}</p>
      <span className="message-time">
        {new Date(message.sentAt).toLocaleTimeString()}
      </span>
    </div>
  );
};

//{Notification Components}
/*
- NotificationItem --> Single notification (notifications)
- NotificationList --> List of notifications with badge
*/

interface NotificationItemProps {
  notification: notifications;
  onClick: (notificationId: number) => void;
}

const NotificationItem = ({ notification, onClick }: NotificationItemProps) => {
  const getNotificationIcon = (type: notifications['notificationType']) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'follow': return '👥';
      case 'message': return '✉️';
      case 'buddy_request': return '🌍';
      default: return '🔔';
    }
  };

  return (
    <div
      className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
      onClick={() => onClick(notification.id)}
    >
      <span className="notification-icon">
        {getNotificationIcon(notification.notificationType)}
      </span>
      <div className="notification-content">
        <p>{notification.message}</p>
        <small>{new Date(notification.createdAt).toLocaleString()}</small>
      </div>
      {!notification.isRead && <span className="unread-dot"></span>}
    </div>
  );
};

interface NotificationListProps {
  notifications: notifications[];
  onNotificationClick: (notificationId: number) => void;
  onMarkAllRead?: () => void;
}

const NotificationList = ({
  notifications: notificationList,
  onNotificationClick,
  onMarkAllRead
}: NotificationListProps) => {
  const unreadCount = notificationList.filter(n => !n.isRead).length;

  return (
    <div className="notification-list">
      <div className="notification-header">
        <h3>
          Notifications
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </h3>
        {unreadCount > 0 && onMarkAllRead && (
          <button onClick={onMarkAllRead}>Mark all as read</button>
        )}
      </div>
      <div className="notifications-container">
        {notificationList.length === 0 ? (
          <p className="no-notifications">No notifications yet</p>
        ) : (
          notificationList.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={onNotificationClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

export { ChatList, ChatWindow, MessageBubble, NotificationItem, NotificationList };
export default { ChatList, ChatWindow, MessageBubble, NotificationItem, NotificationList };
