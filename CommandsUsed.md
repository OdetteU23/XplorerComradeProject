# To install the shared types/Rebuilding the types package:
### cd XplorerComrade-hybrid-types-server
    ==> npm run build
## Importing the types:
    ==> import {...} from '@xcomrade/types-server';

# Run backend-server in dev mode
npm run dev:backend

# Run frontend-server in dev mode
npm run dev:frontend

# Build everything
npm run build:all

# Install all dependencies
npm install

## Summary of commands:
Types package built -->     compiled to dist/ folder
Backend linked      -->     can import from '@xcomrade/types-server'
Frontend linked     -->     can import from '@xcomrade/types-server'
Monorepo configured -->     npm workspaces manage all three projects