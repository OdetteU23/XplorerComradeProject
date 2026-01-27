### To install the shared types:

# ==>    npm install file:../XplorerComrade-hybrid-types-server

# In the root folder to build the types: 
    npm run build
    The results:
> xplorercomrade-monorepo@1.0.0 build:types
> npm run build --workspace=XplorerComrade-hybrid-types-server


> @xplorercomrade/types-server@1.0.0 build
> tsc


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
Backend linked      -->     can import from @xplorercomrade/types-server
Frontend linked     -->     can import from @xplorercomrade/types-server
Monorepo configured -->     npm workspaces manage all three projects