import type { notifications } from '@xcomrade/types-server';
import { useState, useRef, useEffect, useCallback } from 'react';
import { IoIosNotificationsOutline } from "react-icons/io";
import { ChatWindowProps,NotificationItemProps, NotificationToastContainerProps,
  NewConversationProps, ChatListProps,
  MessageBubbleProps, NotificationToastProps } from '../../utilHelpers/types/localTypes';
import { FaRegHeart, FaRegComment, FaRegUser, FaRegEnvelope, FaRegHandshake } from "react-icons/fa";
import { DEFAULT_AVATAR_SM as DEFAULT_AVATAR } from '../../utilHelpers/constants';

// ─── Messaging Components ───────────────────────────────────────────
/*
- ChatList        → List of conversations with online indicator & relative time
- ChatWindow      → Chat conversation with auto-scroll, typing indicator, send-on-enter
- MessageBubble   → Single message display with delivery status
- TypingIndicator → Animated dots when the other user is typing
*/

const ChatList = ({ conversations, onSelectChat, selectedUserId }: ChatListProps) => {
  return (
    <div className="chat-list flex flex-col gap-1">
      <h3 className="px-3 py-2 text-lg font-semibold text-white/90">Messages</h3>
      {conversations.filter(c => c?.user).map((conversation) => {
        const isSelected = selectedUserId === conversation.user.id;
        return (
          <div
            key={conversation.user.id}
            className={`conversation-item flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors
              ${isSelected ? 'bg-indigo-600/30' : 'hover:bg-white/5'}`}
            onClick={() => onSelectChat(conversation.user.id)}
          >
            <div className="relative shrink-0">
              <img
                src={conversation.user.profile_picture_url || DEFAULT_AVATAR}
                alt={conversation.user.käyttäjäTunnus}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-white/10"
              />
            </div>
            <div className="conversation-info flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h4 className="font-medium text-sm text-white truncate">
                  {conversation.user.etunimi} {conversation.user.sukunimi}
                </h4>
                <span className="text-[11px] text-white/40 shrink-0 ml-2">
                  {relativeTime(conversation.lastMessage.sentAt)}
                </span>
              </div>
              <p className="last-message text-xs text-white/50 truncate mt-0.5">
                {conversation.lastMessage.message}
              </p>
            </div>
            {conversation.unreadCount > 0 && (
              <span className="unread-badge shrink-0 flex items-center justify-center h-5 min-w-[20px] rounded-full bg-indigo-500 text-white text-[11px] font-bold px-1.5">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
const relativeTime = (date: Date | string): string => {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(date).toLocaleDateString();
};


//  Typing Indicator

const TypingIndicator = ({ name }: { name: string }) => (
  <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-white/40 italic">
    <span>{name} is typing</span>
    <span className="flex gap-0.5">
      <span className="animate-bounce [animation-delay:0ms] h-1 w-1 rounded-full bg-white/40" />
      <span className="animate-bounce [animation-delay:150ms] h-1 w-1 rounded-full bg-white/40" />
      <span className="animate-bounce [animation-delay:300ms] h-1 w-1 rounded-full bg-white/40" />
    </span>
  </div>
);

// ── ChatWindow ──



const ChatWindow = ({
  messages,
  currentUserId,
  recipientUser,
  onSendMessage,
  isRecipientTyping = false,
  onTyping,
  isSending = false,
}: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Auto-scroll to latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isRecipientTyping, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    inputRef.current?.focus();
  }, [recipientUser.id]);

  const handleSend = () => {
    const text = newMessage.trim();
    if (!text || isSending) return;
    onSendMessage(text);
    setNewMessage('');
    // Notify parent that we stopped typing
    onTyping?.(false);
    clearTimeout(typingTimeoutRef.current);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Typing indicator: signal "typing" and debounce a "stopped" signal
    if (onTyping) {
      onTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => onTyping(false), 2000);
    }
  };

  // Date separator helper
  const shouldShowDateSeparator = (idx: number): boolean => {
    if (idx === 0) return true;
    const prev = new Date(messages[idx - 1].sentAt).toDateString();
    const curr = new Date(messages[idx].sentAt).toDateString();
    return prev !== curr;
  };

  return (
    <div className="chat-window flex flex-col h-full">
      {/* Header */}
      <div className="chat-header flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <img
          src={recipientUser.profile_picture_url || DEFAULT_AVATAR}
          alt={recipientUser.käyttäjäTunnus}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
        />
        <div>
          <h3 className="text-sm font-semibold text-white">
            {recipientUser.etunimi} {recipientUser.sukunimi}
          </h3>
          <span className="text-[11px] text-white/40">@{recipientUser.käyttäjäTunnus}</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {messages.length === 0 && (
          <p className="text-center text-white/30 text-sm mt-8">
            No messages yet. Start the conversation by sending a message!
          </p>
        )}
        {messages.map((msg, idx) => (
          <div key={msg.id}>
            {shouldShowDateSeparator(idx) && (
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] text-white/30">
                  {new Date(msg.sentAt).toLocaleDateString(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric',
                  })}
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            )}
            <MessageBubble
              message={msg}
              isOwnMessage={msg.senderId === currentUserId}
            />
          </div>
        ))}
        {isRecipientTyping && <TypingIndicator name={recipientUser.etunimi} />}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center gap-2 px-4 py-3 border-t border-white/10">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Type a message…"
          className="flex-1 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={isSending}
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || isSending}
          className="flex items-center justify-center h-9 w-9 rounded-full bg-indigo-500 text-white disabled:opacity-40 hover:bg-indigo-400 transition shrink-0"
          aria-label="Send message"
        >
          {isSending ? (
            /* spinner */
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            /* send arrow */
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

const MessageBubble = ({ message, isOwnMessage }: MessageBubbleProps) => {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`message-bubble max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed
          ${isOwnMessage
            ? 'bg-indigo-500 text-white rounded-br-md'
            : 'bg-white/10 text-white/90 rounded-bl-md'
          }`}
      >
        <p className="break-words">{message.message}</p>
        <span
          className={`block text-[10px] mt-1 ${isOwnMessage ? 'text-white/50 text-right' : 'text-white/30'}`}
        >
          {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

// ─── Notification Components ────────────────────────────────────────
/*
- NotificationItem  → Single notification with icon, message & timestamp
- NotificationList  → Scrollable list with unread badge + mark-all-read
- NotificationToast → Ephemeral pop-up for new real-time notifications
*/


/** Small pop-up that appears for a few seconds for incoming real-time notifications. */
const NotificationToast = ({ notification, onDismiss, duration = 5000 }: NotificationToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // let the exit animation finish
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const icon = (() => {
    switch (notification.notificationType) {
      case 'like': return <FaRegHeart />;
      case 'comment': return <FaRegComment />;
      case 'follow': return <FaRegUser />;
      case 'message': return <FaRegEnvelope />;
      case 'buddy_request': return <FaRegHandshake />;
      default: return <IoIosNotificationsOutline />;
    }
  })();

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 w-80 rounded-xl bg-gray-900/95 border border-white/10 shadow-2xl px-4 py-3 backdrop-blur-md
        transition-all duration-300
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      role="alert"
    >
      <span className="text-lg shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white leading-snug break-words">{notification.message}</p>
        <span className="text-[10px] text-white/40">
          {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <button
        onClick={() => { setIsVisible(false); setTimeout(onDismiss, 300); }}
        className="shrink-0 text-white/30 hover:text-white/60 transition text-sm"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
};

// ── NotificationToastContainer ──
// Renders a stack of up to 5 toasts anchored to top-right of the viewport.



const NotificationToastContainer = ({ toasts, onDismiss }: NotificationToastContainerProps) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.slice(0, 5).map((n) => (
        <NotificationToast
          key={n.id}
          notification={n}
          onDismiss={() => onDismiss(n.id)}
        />
      ))}
    </div>
  );
};

// ── NotificationItem ──



const NotificationItem = ({ notification, onClick, onAcceptBuddy, onRejectBuddy }: NotificationItemProps) => {
  const getNotificationIcon = (type: notifications['notificationType']) => {
    switch (type) {
      case 'like': return <FaRegHeart />;
      case 'comment': return <FaRegComment />;
      case 'follow': return <FaRegUser />;
      case 'message': return <FaRegEnvelope />;
      case 'buddy_request': return <FaRegHandshake />;
      default: return <IoIosNotificationsOutline />;
    }
  };

  // Buddy request notifications that are actionable (incoming requests, not "accepted" confirmations)
  const isBuddyRequestActionable =
    notification.notificationType === 'buddy_request' &&
    !notification.isRead &&
    notification.relatedId != null &&
    !notification.message.toLowerCase().includes('accepted');

  return (
    <div
      className={`notification-item flex items-start gap-3 px-4 py-3 rounded-lg transition-colors
        ${notification.isRead ? 'opacity-60 hover:bg-white/5' : 'bg-white/5 hover:bg-white/10'}
        ${isBuddyRequestActionable ? '' : 'cursor-pointer'}`}
      onClick={() => { if (!isBuddyRequestActionable) onClick(notification); }}
    >
      <span className="notification-icon text-lg shrink-0 mt-0.5">
        {getNotificationIcon(notification.notificationType)}
      </span>
      <div className="notification-content flex-1 min-w-0">
        <p className="text-sm text-white leading-snug break-words">{notification.message}</p>
        <small className="text-[11px] text-white/40">{relativeTime(notification.createdAt)}</small>

        {/* Accept / Reject buttons for incoming buddy requests */}
        {isBuddyRequestActionable && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAcceptBuddy?.(notification.relatedId!, notification.id);
              }}
              className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 py-1 transition"
            >
              Accept
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRejectBuddy?.(notification.relatedId!, notification.id);
              }}
              className="rounded-md bg-red-600/80 hover:bg-red-500 text-white text-xs font-medium px-3 py-1 transition"
            >
              Reject
            </button>
          </div>
        )}
      </div>
      {!notification.isRead && !isBuddyRequestActionable && (
        <span className="unread-dot shrink-0 mt-2 h-2 w-2 rounded-full bg-indigo-400" />
      )}
    </div>
  );
};

// ── NotificationList ──

interface NotificationListProps {
  notifications: notifications[];
  onNotificationClick: (notification: notifications) => void;
  onMarkAllRead?: () => void;
  onAcceptBuddy?: (requestId: number, notificationId: number) => void;
  onRejectBuddy?: (requestId: number, notificationId: number) => void;
}

const NotificationList = ({
  notifications: notificationList,
  onNotificationClick,
  onMarkAllRead,
  onAcceptBuddy,
  onRejectBuddy,
}: NotificationListProps) => {
  const unreadCount = notificationList.filter(n => !n.isRead).length;

  return (
    <div className="notification-list flex flex-col">
      <div className="notification-header flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="notification-badge flex items-center justify-center h-5 min-w-[20px] rounded-full bg-indigo-500 text-white text-[11px] font-bold px-1.5">
              {unreadCount}
            </span>
          )}
        </h3>
        {unreadCount > 0 && onMarkAllRead && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            Mark all as read
          </button>
        )}
      </div>
      <div className="notifications-container flex flex-col gap-1 py-2 overflow-y-auto max-h-[70vh]">
        {notificationList.length === 0 ? (
          <p className="no-notifications text-center text-white/30 text-sm py-8">
            No notifications yet
          </p>
        ) : (
          notificationList.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={onNotificationClick}
              onAcceptBuddy={onAcceptBuddy}
              onRejectBuddy={onRejectBuddy}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ── NewConversation ──
// Search-to-compose panel: lets the user find a user and start a new chat.

interface UserSearchResult {
  id: number;
  käyttäjäTunnus: string;
  etunimi: string;
  sukunimi: string;
  profile_picture_url?: string;
}



const NewConversation = ({ onSelectUser, onCancel, onSearch, currentUserId }: NewConversationProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Auto-focus the search input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await onSearch(value.trim());
        // Filter out the current user
        setResults(res.filter(u => u.id !== currentUserId));
        setHasSearched(true);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  return (
    <div className="new-conversation flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10">
        <button
          onClick={onCancel}
          className="text-white/50 hover:text-white transition text-sm p-1"
          aria-label="Cancel"
        >
          ←
        </button>
        <h3 className="text-sm font-semibold text-white">New Message</h3>
      </div>

      {/* Search input */}
      <div className="px-3 py-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search users…"
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
        />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {isSearching && (
          <p className="px-3 py-4 text-xs text-white/40 text-center">Searching…</p>
        )}

        {!isSearching && hasSearched && results.length === 0 && (
          <p className="px-3 py-4 text-xs text-white/40 text-center">No users found</p>
        )}

        {!isSearching && results.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-white/5 transition-colors rounded-lg mx-1"
            onClick={() => onSelectUser(user.id)}
          >
            <img
              src={user.profile_picture_url || DEFAULT_AVATAR}
              alt={user.käyttäjäTunnus}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.etunimi} {user.sukunimi}
              </p>
              <p className="text-xs text-white/40 truncate">@{user.käyttäjäTunnus}</p>
            </div>
          </div>
        ))}

        {!isSearching && !hasSearched && (
          <p className="px-3 py-6 text-xs text-white/30 text-center">
            Type at least 2 characters to search
          </p>
        )}
      </div>
    </div>
  );
};

export {
  ChatList,
  ChatWindow,
  MessageBubble,
  TypingIndicator,
  NotificationItem,
  NotificationList,
  NotificationToast,
  NotificationToastContainer,
  NewConversation,
};
export default { ChatList, ChatWindow, MessageBubble, TypingIndicator, NotificationItem, NotificationList, NotificationToast, NotificationToastContainer, NewConversation };
