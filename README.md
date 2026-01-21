# XplorerComrade Project

XplorerComrade app --> Finding travel companions, share experiences, and explore the world with the explorer(s) who share the same interest based location, destination uploader's/user's uploaded/posted contents

## Project Structure,  (Monoservers repo)

```
XplorerComradeProject/
├── XplorerComrade-backend-server/          # Node.js/  Express backend API

├── XplorerComrade-frontendserver/         # React/React Native frontend

├── XplorerComrade-hybrid-types-server/     # Shared TypeScript types

├── .gitignore                       # Root gitignore (security critical)
├── package.json                     # Monorepo workspace configuration
└── README.md                        # This file
```

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/OdetteU23/XplorerComradeProject.git
cd XplorerComradeProject
```

### 2. Install All Dependencies (Workspaces)
```bash
npm install
```
This installs dependencies for all three projects at once using npm workspaces.

### 3. Set Up Environment Variables

**Backend:**
```bash
cd XplorerComrade-backend-server
```

**Frontend:**
```bash
cd ../XplorerComrade-frontend-server
cp .env.example .env
```

### 4. Build Shared Types
```bash
npm run build:types
```

### 5. Run Development Servers

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

## Using Shared Types

Both frontend and backend  import types from the shared package:

### In Backend (`XplorerComrade-backend-server/`):


### In Frontend (`XplorerComrade-frontend-server/`):


##  Available Scripts

### Root Level:
- `npm install` - Install all dependencies for all workspaces
- `npm run build:all` - Build types, backend, and frontend
- `npm run build:types` - Build only shared types
- `npm run dev:backend` - Run backend in development mode
- `npm run dev:frontend` - Run frontend in development mode

### Individual Projects:
Navigate to each folder and run:
- `npm run dev` - Development mode
- `npm run build` - Production build
- `npm run test` - Run tests

##  Project Documentation
*(To be added )*

##  Tech Stack

**Backend:**
- Node.js + Express
- TypeScript
- PostgreSQL/MySQL
- JWT Authentication

**Frontend:**
- React / React Native
- TypeScript
- Tailwind CSS / Styled Components

**Shared:**
- TypeScript types
- npm workspaces

## Features

- User authentication & profiles
- Post travel experiences with photos
- Create and share trip plans
- Travel buddy matching system
- Direct messaging
- Likes & comments
- Follow system
- Real-time notifications

## Deployment

*(deployment instructions to be added when ready)*



##  License

MIT

---

**Made with ❤️ for travelers/exploeres who love to travel and connect**
