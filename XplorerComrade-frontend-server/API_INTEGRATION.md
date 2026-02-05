# API Integration Documentation

## Overview

The XplorerComrade frontend application is now fully integrated with the backend API using TypeScript and the MessageResponse types from `@xplorercomrade/types-server`.

## Environment Configuration

Create a `.env` file in the frontend root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

For production, set the appropriate backend URL.

## API Client Structure

### Location
`util Helpers/FetchingData.ts`

### Features
- **Type-safe API calls** using MessageResponse, ErrorResponse, BooleanResponse
- **Authentication management** via localStorage tokens
- **Error handling** with proper try-catch blocks
- **FormData support** for image uploads
- **Generic fetchAPI wrapper** for consistent error handling

### API Modules

#### 1. Authentication API (`authAPI`)
```typescript
- login(credentials: loginInfo): Promise<MessageResponse<{ token: string; user: userProfile }>>
- register(data: registeringInfo): Promise<MessageResponse<userProfile>>
- logout(): Promise<MessageResponse<string>>
- getCurrentUser(): Promise<userProfile>
```

#### 2. User API (`userAPI`)
```typescript
- getProfile(userId: number): Promise<userProfile>
- updateProfile(userId: number, updates: Partial<userProfile>): Promise<userProfile>
- getUserStats(userId: number): Promise<UserStats>
- searchUsers(query: string): Promise<userProfile[]>
```

#### 3. Post API (`postAPI`)
```typescript
- getFeed(): Promise<julkaisuWithRelations[]>
- getPost(postId: number): Promise<julkaisuWithRelations>
- getUserPosts(userId: number): Promise<julkaisuWithRelations[]>
- createPost(post: Partial<julkaisu>): Promise<julkaisu>
- updatePost(postId: number, updates: Partial<julkaisu>): Promise<julkaisu>
- deletePost(postId: number): Promise<BooleanResponse>
- searchPosts(query: string): Promise<julkaisuWithRelations[]>
- getTrendingPosts(): Promise<julkaisuWithRelations[]>
```

#### 4. Like API (`likeAPI`)
```typescript
- likePost(postId: number): Promise<BooleanResponse>
- unlikePost(postId: number): Promise<BooleanResponse>
- isPostLiked(postId: number): Promise<boolean>
```

#### 5. Comment API (`commentAPI`)
```typescript
- getComments(postId: number): Promise<kommentti[]>
- addComment(postId: number, content: string): Promise<kommentti>
- deleteComment(commentId: number): Promise<BooleanResponse>
```

#### 6. Follow API (`followAPI`)
```typescript
- followUser(userId: number): Promise<BooleanResponse>
- unfollowUser(userId: number): Promise<BooleanResponse>
- getFollowers(userId: number): Promise<userProfile[]>
- getFollowing(userId: number): Promise<userProfile[]>
- isFollowing(userId: number): Promise<boolean>
```

#### 7. Travel Plan API (`travelPlanAPI`)
```typescript
- getTravelPlans(): Promise<matkaAikeet[]>
- getTravelPlan(planId: number): Promise<matkaAikeet>
- createTravelPlan(plan: Partial<matkaAikeet>): Promise<matkaAikeet>
- updateTravelPlan(planId: number, updates: Partial<matkaAikeet>): Promise<matkaAikeet>
- deleteTravelPlan(planId: number): Promise<BooleanResponse>
- searchTravelPlans(query: string): Promise<matkaAikeet[]>
```

#### 8. Buddy Request API (`buddyRequestAPI`)
```typescript
- getBuddyRequests(): Promise<friendRequest[]>
- sendBuddyRequest(planId: number): Promise<friendRequest>
- acceptBuddyRequest(requestId: number): Promise<BooleanResponse>
- rejectBuddyRequest(requestId: number): Promise<BooleanResponse>
```

#### 9. Participant API (`participantAPI`)
```typescript
- getParticipants(planId: number): Promise<tripParticipants[]>
- removeParticipant(planId: number, userId: number): Promise<BooleanResponse>
```

#### 10. Message API (`messageAPI`)
```typescript
- getConversations(): Promise<chatMessages[]>
- getMessages(recipientId: number): Promise<chatMessages[]>
- sendMessage(recipientId: number, content: string): Promise<chatMessages>
- markAsRead(messageId: number): Promise<BooleanResponse>
```

#### 11. Notification API (`notificationAPI`)
```typescript
- getNotifications(): Promise<notifications[]>
- markAsRead(notificationId: number): Promise<BooleanResponse>
- markAllAsRead(): Promise<BooleanResponse>
- deleteNotification(notificationId: number): Promise<BooleanResponse>
```

#### 12. Media API (`mediaAPI`)
```typescript
- uploadImages(files: File[]): Promise<string[]>
- getPostImages(postId: number): Promise<media_images[]>
- deleteImage(imageId: number): Promise<BooleanResponse>
```

## Custom Hooks

### Location
`src/hooks/useAPI.ts`

### useAPI Hook
Generic hook for API calls with loading, error, and data states.

```typescript
const { data, isLoading, error, execute, reset } = useAPI(
  () => api.post.getFeed(),
  { immediate: true }
);
```

**Parameters:**
- `apiFunction`: Async function that returns a Promise
- `options.immediate`: Execute immediately on mount (default: false)

**Returns:**
- `data`: Response data or null
- `isLoading`: Boolean loading state
- `error`: Error message or null
- `execute`: Function to manually execute the API call
- `reset`: Function to reset state

### useFormSubmit Hook
Specialized hook for form submissions.

```typescript
const { submit, isSubmitting, error, success, reset } = useFormSubmit(
  (data) => api.auth.login(data)
);
```

**Parameters:**
- `submitFunction`: Async function for form submission

**Returns:**
- `submit`: Function to submit form data
- `isSubmitting`: Boolean submission state
- `error`: Error message or null
- `success`: Boolean success state
- `reset`: Function to reset state

## View Integration

### HomeView
- **Feed loading**: Fetches user feed on mount
- **Like/Comment**: Real-time post interactions
- **Error handling**: Retry button on failed requests

### SearchView
- **User search**: Real-time user search with debouncing
- **Post search**: Content-based post search
- **Tab switching**: Toggle between users and posts results

### ExploreView
- **Trending posts**: Displays popular content
- **Popular destinations**: Extracted from trending posts
- **Auto-refresh**: Updates after interactions

### MessagesView
- **Conversations list**: Loads all user conversations
- **Real-time messaging**: Send and receive messages
- **Read receipts**: Marks messages as read automatically

### NotificationsView
- **Notification feed**: Displays all notifications
- **Mark as read**: Individual and bulk actions
- **Auto-removal**: Removes notifications after marking as read

### ProfileView
- **Profile loading**: Fetches user profile and stats
- **Follow/Unfollow**: Toggle follow status
- **User posts**: Displays user's published content
- **Followers/Following**: Lists user connections

### BuddyRequestsView
- **Request list**: Shows pending, accepted, rejected requests
- **Accept/Reject**: Handle buddy requests
- **Real-time updates**: Refreshes participant lists

### TravelPlansView
- **Plan listing**: Displays all travel plans
- **Create plan**: Form for creating new plans
- **Search**: Search plans by destination
- **Join requests**: Send requests to join plans

### TravelPlanDetailView
- **Plan details**: Full plan information
- **Participants list**: Shows all participants
- **Request handling**: Accept/reject join requests (owners only)

### UploadView
- **Multi-step form**: Post details then image upload
- **Image upload**: Drag-drop interface with preview
- **Progress tracking**: Loading states during upload

### PostDetailView
- **Full post display**: Complete post with all interactions
- **Comments section**: View and add comments
- **Like functionality**: Toggle like status

### Register&LoginView
- **Registration**: Creates new user account with validation
- **Login**: Authenticates user and stores token
- **Error display**: Shows authentication errors
- **Auto-redirect**: Refreshes app on successful login

## Authentication Flow

1. **Login/Register**: User submits credentials
2. **Token Storage**: JWT token stored in localStorage as 'auth_token'
3. **Auto-Headers**: Token automatically added to all requests
4. **getCurrentUser**: Fetches user profile using stored token
5. **Logout**: Clears token from localStorage

## Error Handling

All API calls follow this pattern:

```typescript
try {
  setIsLoading(true);
  const data = await api.module.method();
  // Handle success
} catch (err) {
  console.error('Operation error:', err);
  // Show user-friendly message
} finally {
  setIsLoading(false);
}
```

## Loading States

All views implement proper loading states:
- Initial load: `isLoading` state
- User feedback: "Loading..." messages
- Error recovery: Retry buttons

## Type Safety

All API calls are fully typed using:
- `MessageResponse<T>` for successful responses
- `ErrorResponse` for error responses
- `BooleanResponse` for boolean operations
- Database types from `@xplorercomrade/types-server`

## Best Practices

1. **Always handle errors**: Use try-catch blocks
2. **Show loading states**: Provide user feedback
3. **Update local state**: Optimistic UI updates when possible
4. **Token management**: Check token validity before protected requests
5. **Type safety**: Use TypeScript types from shared package

## Testing

To test API integration:

1. Start the backend server
2. Configure `.env` with correct API_URL
3. Start the frontend: `npm run dev`
4. Test each view's functionality
5. Check browser console for errors
6. Verify network requests in DevTools

## Future Enhancements

- [ ] Implement request caching
- [ ] Add request retry logic
- [ ] Implement optimistic updates
- [ ] Add offline support
- [ ] Implement WebSocket for real-time updates
- [ ] Add request cancellation
- [ ] Implement pagination for lists
- [ ] Add request rate limiting
