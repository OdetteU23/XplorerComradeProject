# XplorerComrade

A social travel app for finding travel companions, sharing experiences, and exploring the world with people who share the same destinations and interests.

## Links

- **Frontend (live app):** https://xplorercomradeapp.vercel.app
- **GitHub repo:** https://github.com/OdetteU23/XplorerComradeProject
- **Auth API:** https://xcomrade-auth-wabq.onrender.com/api
- **MediaContent API:** https://xcomrade-mediacontent-wabq.onrender.com/api
- **Upload API:** https://xcomrade-upload-wabq.onrender.com/api

## API Documentation (apidoc)

- **Auth server apidoc:** https://xcomrade-auth-wabq.onrender.com/apidocs
- **MediaContent server apidoc:** https://xcomrade-mediacontent-wabq.onrender.com/apidocs
- **Upload server apidoc:** https://xcomrade-upload-wabq.onrender.com/apidocs

## Test User Credentials

| Field | Value |
|---|---|
| Name | Comrade User |
| Username | @ComradeUser |
| Password | 1234567 |

## Screenshots

![UI screenshot](palautusMD/Käyttöliittymä.png)

![App screenshot](palautusMD/image.png)

## Database Description

The app uses **SQLite** via `better-sqlite3`. Each backend server has its own database instance. All three servers share the same schema so JWT tokens and user data are consistent across services.

### Tables

| Table | Description |
|---|---|
| `käyttäjä` | Users — credentials (bcrypt-hashed password), profile info, bio, location |
| `julkaisu` | Posts — travel content with destination, description, media URL, activities |
| `tykkäykset` | Likes — links users to posts, unique constraint prevents duplicate likes |
| `kommentti` | Comments — threaded comments on posts with timestamp |
| `seuranta` | Follow relationships — who follows whom, unique per pair |
| `matkaAikeet` | Travel plans — destination, dates, activities, budget, description |
| `friendRequest` | Buddy requests — sent to travel plans, status: pending/accepted/rejected |
| `tripParticipants` | Trip participants — users who joined a travel plan as buddies |
| `chatMessages` | Direct messages between two users with read status |
| `notifications` | Notifications — likes, comments, follows, messages, buddy requests |
| `media_images` | Multiple images per post linked to a julkaisu |
| `file_storage` | Uploaded files stored as BLOBs in SQLite for persistence |

## Implemented Features

1. **User management & authentication** — Register, login, profile management with JWT tokens. Passwords hashed with bcrypt. (`auth-server`)

2. **Feed & posts** — Feed of followed users posts, random/explore posts, search, and trending posts. Guests see limited content. (`mediaContent-server`)

3. **Like system** — Like/unlike with optimistic UI updates (Zustand + useReducer). State synced in real time across components.

4. **Comments** — Add, display, and delete comments on posts. Thread-style format.

5. **Follow system** — Follow/unfollow users, list followers and following, check follow status. (`auth-server`)

6. **Real-time messages** — Two-way chat with WebSocket, typing indicators, message history, and read receipts. (`mediaContent-server: websocket.ts`)

7. **Notification system** — Notifications for likes, comments, follows, messages, and buddy requests. Toast notifications in real time.

8. **Travel plans** — Create travel plans (destination, dates, activities, budget), search, filter, and manage them.

9. **Travel buddy system** — Send buddy requests to travel plans, accept/reject, track participants.

10. **Media file management** — Upload images/videos with multer, store files in SQLite as BLOBs for persistence, user-specific delete permissions. (`upload-server`)

11. **UI** — Responsive SPA (React + Vite + Tailwind), protected routes, mobile and desktop navigation, form validation, loading states, error handling.

12. **Shared type library** — Common TypeScript type module (`@xcomrade/types-server`) for frontend and all backends — ensures type-safe data transfer throughout the architecture.

## Known Bugs / Issues

1. **Data resets on redeploy** — SQLite is stored in `/tmp` on Render free tier. All user data is wiped on every redeploy or service restart. Users need to re-register after each restart.

2. **Folder rename deployment bug** — Early in the project folder names were changed (`XplorerComrade-backend-server` to `XComrade-backend` etc.). This caused Azure deployment failures even though all CI/CD tests passed. See [palautusMD/Bugit.md](palautusMD/Bugit.md).

3. **Upload 500 on post creation** — Creating posts with media returned 500 errors due to orphaned SQLite WAL files committed to git. Fixed: WAL files removed, `DB_PATH` set to `/tmp`.

4. **Cold starts on Render free tier** — Services spin down after 15 min of inactivity. First request after idle takes 30-60 seconds.

## Tech Stack

- **Backend:** Node.js + Express + TypeScript + SQLite (better-sqlite3) + JWT + bcrypt + multer + WebSocket (ws)
- **Frontend:** React + Vite + TypeScript + Tailwind CSS + Zustand + React Router
- **Shared types:** `@xcomrade/types-server` TypeScript module (npm workspaces monorepo)
- **Deployment:** Frontend on Vercel, 3 backend servers on Render.com (Frankfurt)

---

*Made with love for travelers who love to explore and connect*
