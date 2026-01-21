### types Readme.md
# @xplorercomrade/types

Shared TypeScript type definitions for XplorerComrade app project.

## Installation

### From GitHub
```bash
npm install github:yourusername/xplorercomrade-types
```

### From Local (Development)
```bash
# In your frontend or backend project
npm install file:../XplorerComrade-hybrid-types
```

### Using npm link (Development)
```bash
# In XplorerComrade-hybrid-types folder
npm link

# In your frontend project
cd ../XplorerComrade-frontend
npm link @xplorercomrade/types

# In your backend project
cd ../XplorerComrade-backend
npm link @xplorercomrade/types
```


```

### To npm (Optional)
```bash
npm login
npm publish --access public
```

## License

MIT

## Usage

```typescript
import { 
  userProfile, 
  julkaisu, 
  matkaAikeet,
  friendRequest,
  MessageResponse 
} from '@xplorercomrade/types';

// Use the types
const user: userProfile = {
  id: 1,
  käyttäjäTunnus: 'john_doe',
  // ... rest of properties
};
```

## Available Types

### Content Types (`contentTypes.ts`)
- `userDB` - Database user type (includes password hash)
- `userProfile` - Public user profile (safe for frontend)
- `registeringInfo` - Registration form data
- `loginInfo` - Login credentials
- `julkaisu` - Travel post
- `julkaisuWithRelations` - Post with user, likes, comments, images
- `tykkäykset` - Post likes
- `kommentti` - Post comments
- `seuranta` - Follow relationships
- `matkaAikeet` - Trip plans
- `friendRequest` - Travel buddy requests
- `tripParticipants` - Trip participants
- `notifications` - User notifications
- `media_images` - Post images
- `chatMessages` - Direct messages

### Database Types (`DBTypes.ts`)
- `userLevel` - User role levels (Admin/User)
- `UserLevels` - User with level information
- `TokenContents` - JWT token payload

### Message Types (`messageTypes.ts`)
- `MessageResponse` - Generic API response
- `ErrorResponse` - Error response with stack trace
- `UserDeleteResponse` - User deletion response
- `AvailableResponse` - Availability check response
- `BooleanResponse` - Success/failure response

## Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run watch
```

### Clean
```bash
npm run clean
```

## Publishing

### To GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/xplorercomrade-types.git
git push -u origin main 


### In Backend (`XplorerComrade-backend/`):
```json
// package.json
{
  "dependencies": {
    "@xplorercomrade/types": "file:../XplorerComrade-hybrid-types"
  }
}
```

```typescript
// src/controllers/userController.ts
import { userProfile, registeringInfo } from '@xplorercomrade/types';

const getUser = (req, res): userProfile => {
  // ...
};
```

### In Frontend (`XplorerComrade-frontend/`):
```json
// package.json
{
  "dependencies": {
    "@xplorercomrade/types": "file:../XplorerComrade-hybrid-types"
  }
}
```

```typescript
// src/types/index.ts or components
import { julkaisu, matkaAikeet, userProfile } from '@xplorercomrade/types';

const post: julkaisu = {
  // ...
};
```


### Environment Variables Example:
```bash
# .env.example (safe to commit)
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_here
API_URL=http://localhost:3000
```

###  Project Documentation

- [Frontend Architecture](./frontend-architecture.md)
- [Backend API Documentation](./XplorerComrade-backend/README.md) *(create this)*
- [Shared Types Documentation](./XplorerComrade-hybrid-types/README.md)