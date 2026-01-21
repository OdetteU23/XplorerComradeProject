# XplorerComrade - Frontend Architecture

## 📱 Application Structure

### Core Pages/Screens

#### 1. **Authentication**
- **Login Screen** (`/login`)
  - Uses: `loginInfo` type
  - Fields: käyttäjäTunnus, salasana
  - Actions: Login, Navigate to Register
  
- **Register Screen** (`/register`)
  - Uses: `registeringInfo` type
  - Fields: käyttäjäTunnus, etunimi, sukunimi, sahkoposti, salasana, profile_picture_url, bio, location
  - Actions: Create account, Upload profile picture

#### 2. **Main Navigation Tabs**

##### 🏠 **Home Feed** (`/home`)
- **Component Structure:**
  ```
  HomeFeed
  ├── SearchBar (search destinations, users, activities)
  ├── StoryCarousel (ongoing trips - future feature)
  └── PostList
      └── PostCard (julkaisuWithRelations)
          ├── UserHeader (profile_picture, käyttäjäTunnus, kohde)
          ├── ImageCarousel (media_images[])
          ├── PostDescription (kuvaus, Date_ajakohta)
          ├── ActivityTags (list_aktiviteetti[])
          ├── EngagementBar
          │   ├── LikeButton (tykkäykset count)
          │   ├── CommentButton (kommentit count)
          │   └── ShareButton
          └── CommentSection (kommentti[])
  ```
- **State Management:**
  - Posts feed (infinite scroll)
  - User interactions (likes, comments)
  - Filter by destination/activities

##### 🗺️ **Explore** (`/explore`)
- **Component Structure:**
  ```
  ExplorePage
  ├── DestinationSearch
  ├── FilterPanel
  │   ├── DateRangePicker
  │   ├── ActivityFilter (list_aktiviteetti)
  │   └── BudgetFilter
  ├── TravelPlansGrid (matkaAikeet[])
  │   └── TripCard
  │       ├── Destination (kohde)
  │       ├── Dates (suunniteltu_alku_pvm - suunniteltu_loppu_pvm)
  │       ├── Activities (aktiviteetit[])
  │       ├── Budget (budjetti)
  │       ├── UserInfo (userProfile)
  │       └── JoinRequestButton
  └── MapView (interactive map with pins)
  ```
- **Features:**
  - Search trips by destination
  - Filter by date, activities, budget
  - Map visualization of trips
  - Send travel buddy requests

##### ➕ **Create Post/Trip** (`/create`)
- **Two Creation Modes:**
  
  **Mode 1: Create Post (julkaisu)**
  ```
  CreatePost
  ├── MediaUpload (multiple images)
  ├── DestinationInput (kohde)
  ├── DescriptionTextarea (kuvaus)
  ├── ActivitySelector (list_aktiviteetti[])
  ├── DatePicker (Date_ajakohta)
  └── PublishButton
  ```
  
  **Mode 2: Create Trip Plan (matkaAikeet)**
  ```
  CreateTrip
  ├── DestinationInput (kohde)
  ├── DateRangePicker (suunniteltu_alku_pvm, suunniteltu_loppu_pvm)
  ├── ActivityMultiSelect (aktiviteetit[])
  ├── BudgetInput (budjetti)
  ├── DescriptionTextarea (kuvaus)
  └── CreateTripButton
  ```

##### 💬 **Messages** (`/messages`)
- **Component Structure:**
  ```
  MessagesPage
  ├── ConversationList
  │   └── ConversationPreview (chatMessages last message)
  │       ├── UserAvatar
  │       ├── Username
  │       ├── LastMessage
  │       └── Timestamp (sentAt)
  └── ChatWindow
      ├── MessageHeader (receiver info)
      ├── MessageList (chatMessages[])
      │   └── MessageBubble
      │       ├── Message text
      │       └── Timestamp (sentAt)
      └── MessageInput
  ```
- **Real-time Features:**
  - WebSocket connection for live messaging
  - Typing indicators
  - Message delivery status

##### 👤 **Profile** (`/profile/:userId`)
- **Component Structure:**
  ```
  ProfilePage
  ├── ProfileHeader
  │   ├── ProfileImage (profile_picture_url)
  │   ├── UserInfo (käyttäjäTunnus, etunimi, sukunimi)
  │   ├── Bio (bio)
  │   ├── Location (location)
  │   ├── Stats (followers, following, posts)
  │   └── ActionButtons
  │       ├── FollowButton (seuranta)
  │       ├── MessageButton
  │       └── EditProfile (if own profile)
  ├── TabNavigation
  │   ├── PostsTab (julkaisu[])
  │   ├── TripsTab (matkaAikeet[])
  │   └── TravelBuddiesTab (tripParticipants[])
  └── ContentGrid
  ```
- **Own Profile Additional Features:**
  - Edit profile button
  - Account settings
  - Privacy settings

##### 🔔 **Notifications** (`/notifications`)
- **Component Structure:**
  ```
  NotificationsPage
  └── NotificationList (notifications[])
      └── NotificationItem
          ├── Avatar (related user)
          ├── Message (notification message)
          ├── Type Indicator (notificationType badge)
          ├── Timestamp (createdAt)
          └── ActionButton (navigate to related content)
  ```
- **Notification Types:**
  - `like`: Someone liked your post
  - `comment`: New comment on your post
  - `follow`: New follower
  - `message`: New message
  - `buddy_request`: Travel buddy request

#### 3. **Detailed/Modal Views**

##### **Trip Details Modal** (`/trip/:tripId`)
```
TripDetailsModal
├── TripHeader
│   ├── Destination (kohde)
│   ├── Dates (suunniteltu_alku_pvm - suunniteltu_loppu_pvm)
│   └── Owner (userProfile)
├── TripInfo
│   ├── Description (kuvaus)
│   ├── Activities (aktiviteetit[])
│   └── Budget (budjetti)
├── ParticipantsList (tripParticipants[])
│   └── ParticipantCard
│       ├── Avatar
│       ├── Name
│       └── Role (owner/buddy)
├── RelatedPosts (julkaisu[] filtered by kohde)
└── ActionBar
    ├── RequestToJoinButton (creates friendRequest)
    └── MessageOwnerButton
```

##### **Travel Buddy Requests** (`/buddy-requests`)
```
BuddyRequestsPage
├── SentRequests (friendRequest[] where requesterId = currentUser)
│   └── RequestCard
│       ├── TripInfo (matkaAikeet)
│       ├── Status Badge (pending/accepted/rejected)
│       └── CancelButton (if pending)
└── ReceivedRequests (friendRequest[] where ownerId = currentUser)
    └── RequestCard
        ├── RequesterInfo (userProfile)
        ├── Message
        ├── TripInfo (matkaAikeet)
        └── ActionButtons
            ├── AcceptButton
            └── RejectButton
```

##### **Followers/Following Modal**
```
ConnectionsModal
├── TabSwitch (Followers/Following)
└── UserList (seuranta[])
    └── UserCard
        ├── Avatar (profile_picture_url)
        ├── Username (käyttäjäTunnus)
        ├── Name (etunimi, sukunimi)
        ├── Bio preview
        └── FollowButton
```

##### **Post Details View** (`/post/:postId`)
```
PostDetailView
├── FullPost (julkaisuWithRelations)
│   ├── UserHeader
│   ├── ImageGallery (media_images[])
│   ├── PostContent
│   │   ├── Description (kuvaus)
│   │   ├── Destination (kohde)
│   │   ├── Activities (list_aktiviteetti[])
│   │   └── Date (Date_ajakohta)
│   └── EngagementBar
└── CommentSection
    ├── CommentInput
    └── CommentList (kommentti[])
        └── CommentItem
            ├── UserAvatar
            ├── Username
            ├── CommentText (teksti_kenttä)
            └── Timestamp (createdAt)
```

---

## 🎨 Component Library

### Reusable Components

#### **Core UI Components**
- `Button` - Primary, secondary, text variants
- `Input` - Text, password, email with validation
- `TextArea` - Multi-line input
- `Select` - Dropdown selection
- `MultiSelect` - Multiple selection (for activities)
- `DatePicker` - Single date or range
- `ImageUpload` - Multiple image upload with preview
- `Avatar` - User profile picture with fallback
- `Badge` - Status indicators, notification types
- `Card` - Container for posts, trips, users
- `Modal` - Overlay dialogs
- `Tabs` - Tab navigation
- `Spinner` - Loading indicator

#### **Domain-Specific Components**
- `PostCard` - Display post with engagement
- `TripCard` - Display trip plan
- `UserCard` - Display user profile preview
- `ActivityTag` - Display activity badge
- `DestinationTag` - Display destination with icon
- `CommentItem` - Single comment display
- `MessageBubble` - Chat message
- `NotificationItem` - Notification display
- `SearchBar` - Search with filters
- `FilterPanel` - Advanced filtering

---

## 🔄 State Management Architecture

### Global State (Context/Redux)
```typescript
AppState {
  auth: {
    currentUser: userProfile | null
    isAuthenticated: boolean
    token: string | null
  }
  
  feed: {
    posts: julkaisuWithRelations[]
    hasMore: boolean
    currentPage: number
  }
  
  trips: {
    upcomingTrips: matkaAikeet[]
    myTrips: matkaAikeet[]
    savedTrips: matkaAikeet[]
  }
  
  notifications: {
    unreadCount: number
    items: notifications[]
  }
  
  messages: {
    conversations: chatMessages[][]
    unreadCount: number
  }
  
  social: {
    followers: seuranta[]
    following: seuranta[]
  }
  
  buddyRequests: {
    sent: friendRequest[]
    received: friendRequest[]
  }
}
```

### API Integration Layer
```typescript
// api/endpoints.ts
export const API = {
  auth: {
    login: (data: loginInfo) => POST('/auth/login'),
    register: (data: registeringInfo) => POST('/auth/register'),
    logout: () => POST('/auth/logout')
  },
  
  posts: {
    getFeed: (page: number) => GET('/posts/feed'),
    getById: (id: number) => GET(`/posts/${id}`),
    create: (data: julkaisu, images: File[]) => POST('/posts'),
    like: (postId: number) => POST(`/posts/${postId}/like`),
    unlike: (postId: number) => DELETE(`/posts/${postId}/like`),
    comment: (postId: number, text: string) => POST(`/posts/${postId}/comment`)
  },
  
  trips: {
    search: (filters: TripFilters) => GET('/trips/search'),
    getById: (id: number) => GET(`/trips/${id}`),
    create: (data: matkaAikeet) => POST('/trips'),
    update: (id: number, data: Partial<matkaAikeet>) => PUT(`/trips/${id}`),
    delete: (id: number) => DELETE(`/trips/${id}`)
  },
  
  buddyRequests: {
    send: (data: Omit<friendRequest, 'id' | 'createdAt'>) => POST('/buddy-requests'),
    accept: (requestId: number) => PUT(`/buddy-requests/${requestId}/accept`),
    reject: (requestId: number) => PUT(`/buddy-requests/${requestId}/reject`),
    getSent: () => GET('/buddy-requests/sent'),
    getReceived: () => GET('/buddy-requests/received')
  },
  
  social: {
    follow: (userId: number) => POST(`/users/${userId}/follow`),
    unfollow: (userId: number) => DELETE(`/users/${userId}/follow`),
    getFollowers: (userId: number) => GET(`/users/${userId}/followers`),
    getFollowing: (userId: number) => GET(`/users/${userId}/following`)
  },
  
  messages: {
    getConversations: () => GET('/messages/conversations'),
    getMessages: (userId: number) => GET(`/messages/${userId}`),
    send: (data: Omit<chatMessages, 'id' | 'sentAt'>) => POST('/messages')
  },
  
  notifications: {
    getAll: () => GET('/notifications'),
    markAsRead: (id: number) => PUT(`/notifications/${id}/read`),
    markAllAsRead: () => PUT('/notifications/read-all')
  },
  
  profile: {
    getById: (userId: number) => GET(`/users/${userId}`),
    update: (data: Partial<userProfile>) => PUT('/users/me'),
    uploadAvatar: (file: File) => POST('/users/me/avatar')
  }
}
```

---

## 🗺️ Navigation Flow

```
App
├── Public Routes
│   ├── /login → Login Screen
│   └── /register → Register Screen
│
└── Protected Routes (requires authentication)
    ├── / → Redirect to /home
    ├── /home → Home Feed
    ├── /explore → Explore Trips
    ├── /create → Create Post/Trip
    ├── /messages → Messages
    │   └── /messages/:userId → Chat with specific user
    ├── /notifications → Notifications
    ├── /profile/:userId → User Profile
    ├── /post/:postId → Post Details
    ├── /trip/:tripId → Trip Details
    ├── /buddy-requests → Travel Buddy Requests
    ├── /settings → Account Settings
    └── /edit-profile → Edit Profile
```

---

## 📱 Mobile-First Design Considerations

### Bottom Navigation Bar
```
┌─────────────────────────────────┐
│  [🏠 Home] [🗺️ Explore] [➕]    │
│  [💬 Messages] [👤 Profile]     │
└─────────────────────────────────┘
```

### Responsive Breakpoints
- **Mobile**: < 768px (single column, bottom nav)
- **Tablet**: 768px - 1024px (2 columns, side nav optional)
- **Desktop**: > 1024px (3 columns with side nav, larger images)

---

## 🚀 Key Features Implementation

### 1. **Infinite Scroll Feed**
- Load posts in batches (20 per page)
- Intersection Observer API for lazy loading
- Skeleton loaders while fetching

### 2. **Real-time Updates**
- WebSocket connection for:
  - New messages
  - New notifications
  - Live post engagement updates
  - Buddy request status changes

### 3. **Search & Filters**
- Debounced search input
- Multi-criteria filtering:
  - Destination (autocomplete)
  - Date range
  - Activities (multi-select)
  - Budget range
- Save search preferences

### 4. **Image Optimization**
- Lazy loading images
- Multiple image sizes (thumbnail, medium, full)
- Progressive image loading
- Compression before upload

### 5. **Offline Support** (Progressive Web App)
- Service worker for caching
- Offline viewing of cached posts
- Queue actions for when back online

---

## 🎯 User Flows

### **Flow 1: Create Trip & Find Buddy**
```
1. User clicks "Create Trip" → /create (trip mode)
2. Fills trip details (destination, dates, activities, budget)
3. Submits → Trip created (matkaAikeet)
4. Trip appears in /explore for other users
5. Another user finds trip → clicks "Request to Join"
6. Creates friendRequest (pending status)
7. Trip owner receives notification
8. Owner accepts/rejects from /buddy-requests
9. If accepted → creates tripParticipants entry
10. Users can now message each other
```

### **Flow 2: Post Travel Experience**
```
1. User clicks "Create Post" → /create (post mode)
2. Uploads images, adds description, tags destination & activities
3. Submits → Creates julkaisu + media_images
4. Post appears in followers' feed
5. Users can like (tykkäykset) and comment (kommentti)
6. Engagement triggers notifications to post owner
```

### **Flow 3: Social Engagement**
```
1. User browses /home feed
2. Likes post → creates tykkäykset entry
3. Comments → creates kommentti entry
4. Post owner receives notification
5. User clicks on post author → /profile/:userId
6. Clicks Follow → creates seuranta entry
7. Now sees that user's posts in feed
```

---

## 🔐 Security & Privacy

### Protected Data
- Never expose `userDB.salasana` to frontend
- Always use `userProfile` type for user data
- Token-based authentication (JWT)
- Secure image upload with validation

### Privacy Settings (Future)
- Private/Public profile toggle
- Hide location option
- Block users
- Report inappropriate content

---

## 📊 Analytics & Tracking (Future)

- Track user engagement (likes, comments, shares)
- Popular destinations
- Active trip planners
- Conversion: posts → trips → buddy matches
- User retention metrics

---

## 🛠️ Technology Stack Recommendations

### Frontend Framework
- **React** or **React Native** (cross-platform mobile)
- **TypeScript** (using hybrid-types)
- **Tailwind CSS** or **Styled Components**

### State Management
- **React Context** + **useReducer** (lightweight)
- or **Redux Toolkit** (for complex state)

### API Communication
- **Axios** or **Fetch API**
- **React Query** (caching, optimistic updates)

### Real-time
- **Socket.io** (WebSocket client)

### Image Handling
- **react-image-gallery**
- **react-dropzone** (file uploads)

### Maps
- **Leaflet** or **Google Maps API**

### Date/Time
- **date-fns** or **Day.js**

### Forms
- **React Hook Form** + **Zod** validation

---

## 📝 Next Steps

1. ✅ **Types configured** (contentTypes.ts)
2. 🔲 **Create component library**
3. 🔲 **Set up routing**
4. 🔲 **Implement authentication flow**
5. 🔲 **Build home feed**
6. 🔲 **Build explore/trip search**
7. 🔲 **Implement buddy request system**
8. 🔲 **Add messaging**
9. 🔲 **Notifications system**
10. 🔲 **Polish UI/UX**

## Summary ###
### The frontend architecture document that includes:
#### 

📱 Complete Page Structure:

Authentication (Login/Register)
5 Main tabs (Home Feed, Explore, Create, Messages, Profile)
Detailed modal views (Trip Details, Buddy Requests, Post Details)
🎨 Component Architecture:

Full component hierarchy for each page
Reusable component library
Domain-specific components
🔄 State Management:

Global state structure
Complete API integration layer mapped to your backend types
🗺️ Navigation & User Flows:

Route structure
3 key user flows (Create Trip, Post Experience, Social Engagement)
📊 Technical Recommendations:

Technology stack suggestions
Real-time features (WebSocket)
Image optimization
Mobile-first responsive design