# Root Package Configuration

## File Location
`package.json` (root directory)

## Purpose
Root-level NPM configuration for the monorepo structure. Manages workspaces, shared dependencies, and root-level scripts.

## Monorepo Structure

```json
{
  "name": "storium-ims",
  "version": "1.0.0",
  "description": "Storium Inventory Management System - Full Stack",
  "private": true,
  "workspaces": [
    "backend",
    "frontend"
  ]
}
```

## Workspace Configuration

```json
{
  "workspaces": [
    "backend",
    "frontend"
  ]
}
```

**Benefits:**
- Shared `node_modules` (monorepo optimization)
- Single lock file (`package-lock.json`)
- Install all deps with single `npm install`
- Run scripts in specific workspaces

## Root-Level Scripts

```json
{
  "scripts": {
    "install-all": "npm install",
    "dev": "npm run dev --workspaces",
    "build": "npm run build --workspaces",
    "start-backend": "npm run start --workspace=backend",
    "start-frontend": "npm run start --workspace=frontend",
    "dev-backend": "npm run dev --workspace=backend",
    "dev-frontend": "npm run dev --workspace=frontend",
    "test": "npm test --workspaces",
    "lint": "npm run lint --workspaces",
    "format": "npm run format --workspaces"
  }
}
```

**Script Details:**

| Script | Purpose |
|--------|---------|
| `npm run install-all` | Install all dependencies |
| `npm run dev` | Start both frontend and backend dev servers |
| `npm run build` | Build both frontend and backend |
| `npm run start-backend` | Run backend server only |
| `npm run start-frontend` | Run frontend server only |
| `npm run dev-backend` | Dev mode backend only |
| `npm run dev-frontend` | Dev mode frontend only |
| `npm run test` | Test all workspaces |
| `npm run lint` | Lint all workspaces |

## Workspace Commands

### Install in Specific Workspace

```bash
npm install package-name --workspace=backend
npm install package-name --workspace=frontend
```

### Run Script in Workspace

```bash
npm run dev --workspace=backend
npm run build --workspace=frontend
```

### Run in All Workspaces

```bash
npm run lint --workspaces
npm run test --workspaces
```

## Root Dependencies (Optional)

```json
{
  "devDependencies": {
    "concurrently": "^8.0.0",
    "dotenv": "^16.0.0"
  }
}
```

- **concurrently**: Run multiple commands in parallel
- **dotenv**: Shared environment variables

## Example with Concurrently

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace=backend\" \"npm run dev --workspace=frontend\"",
    "build": "npm run build --workspace=backend && npm run build --workspace=frontend"
  }
}
```

## Environment Variables

Create `.env` in root:

```
# Shared configuration
NODE_ENV=development
LOG_LEVEL=info

# Backend
BACKEND_PORT=5000
BACKEND_HOST=localhost

# Frontend
FRONTEND_PORT=3000
FRONTEND_HOST=localhost

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=storium

# API
API_URL=http://localhost:5000
```

## Git Configuration

Create `.gitignore` in root:

```
node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
.vscode/
.idea/
```

## Directory Structure

```
.
├── package.json                 # Root monorepo config
├── package-lock.json            # Dependency lock
├── .gitignore                   # Git ignore rules
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── README.md                    # Project README
├── backend/                     # Express backend
│   ├── package.json
│   ├── server.js
│   └── src/
├── frontend/                    # React frontend
│   ├── package.json
│   ├── src/
│   └── vite.config.js
└── docs/                        # Documentation
    └── ...
```

## Installation

### Clone and Install

```bash
# Clone repository
git clone <repo-url>
cd storium-ims

# Install all workspaces
npm install

# Or specific workspace
npm install --workspace=backend
```

### Setup Environment

```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env
```

## Development Workflow

### Option 1: Parallel Development

```bash
# Terminal 1 - All services
npm run dev

# Or specifically
npm run dev-backend
npm run dev-frontend
```

### Option 2: Individual Terminals

```bash
# Terminal 1 - Backend
npm run dev --workspace=backend

# Terminal 2 - Frontend
npm run dev --workspace=frontend
```

## Production Build

```bash
# Build both
npm run build

# Or specific
npm run build --workspace=backend
npm run build --workspace=frontend

# Check output
ls backend/dist/  # compiled backend
ls frontend/dist/ # optimized frontend
```

## Deployment

### Backend Deployment

```bash
cd backend
npm install --production
npm start
```

### Frontend Deployment

```bash
cd frontend
npm install
npm run build
# Deploy frontend/dist to static hosting (Vercel, Netlify, AWS S3)
```

## Version Management

```bash
# Update versions across workspaces
npm version major
npm version minor
npm version patch
```

## Shared Dependencies

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/build.yml`:

```yaml
name: Build and Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run lint --workspaces
      
      - run: npm run build --workspaces
      
      - run: npm test --workspaces
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Workspace not recognized | Check workspaces array in root package.json |
| Dependencies not installing | Run `npm install` in root directory |
| Script not found in workspace | Verify script exists in workspace package.json |
| Conflicting versions | Lock file should resolve, else use npm dedupe |

## Best Practices

1. **Shared Configuration** - Keep common settings in root
2. **Workspace Isolation** - Each workspace has own dependencies
3. **Single Lock File** - Maintains consistency across workspaces
4. **Clear Scripts** - Document what each script does
5. **Environment Management** - Use .env files consistently
6. **Version Alignment** - Keep Node/npm versions aligned
7. **CI/CD Integration** - Test and build both workspaces
8. **Documentation** - Maintain clear development guides

## Monorepo Advantages

✅ Single repository for full stack
✅ Shared configuration and dependencies
✅ Coordinated versioning
✅ Simplified deployment
✅ Code sharing between frontend/backend
✅ Unified CI/CD pipeline

## Advanced Configuration

### Lerna Integration (Optional)

```bash
npm install --save-dev lerna
npx lerna init
```

### Nx Integration (Optional)

```bash
npm install --save-dev nx

# Manage monorepo with Nx
npx nx affected --target=build
```

## Security

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check specific workspace
npm audit --workspace=backend
```

## Performance Optimization

```bash
# Use npm ci in CI/CD (faster, more secure)
npm ci

# Deduplicate packages
npm dedupe

# Check for unused packages
npm ls --depth=0
```
