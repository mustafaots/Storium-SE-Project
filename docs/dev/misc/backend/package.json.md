# Backend Package Configuration

## File Location
`backend/package.json`

## Purpose
NPM package manifest defining project metadata, scripts, dependencies, and configurations for the backend server.

## Package Information

```json
{
  "name": "storium-backend",
  "version": "1.0.0",
  "description": "Storium IMS - Inventory Management System Backend",
  "main": "server.js",
  "type": "module",
  "author": "Development Team",
  "license": "ISC"
}
```

## Scripts

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest",
  "lint": "eslint .",
  "migrate": "node ./database/migrations/run.js",
  "seed": "node ./database/seeds/run.js"
}
```

**Script Details:**

| Script | Command | Purpose |
|--------|---------|---------|
| `npm start` | `node server.js` | Run production server |
| `npm run dev` | `nodemon server.js` | Run with auto-restart on changes |
| `npm test` | `jest` | Run test suite |
| `npm run lint` | `eslint .` | Check code quality |
| `npm run migrate` | Database migration script | Run database migrations |
| `npm run seed` | Database seed script | Populate initial data |

## Dependencies

### Core Framework
```json
{
  "express": "5.2.1",
  "mysql2": "3.15.3"
}
```

- **express**: Web application framework
- **mysql2**: MySQL database driver with promise support

### Utilities
```json
{
  "dotenv": "^16.0.0",
  "cors": "^2.8.5",
  "morgan": "^1.10.0",
  "multer": "2.0.2"
}
```

- **dotenv**: Environment variable management
- **cors**: Cross-origin request handling
- **morgan**: HTTP request logger
- **multer**: File upload middleware

### Optional/Future
```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "joi": "^17.9.0",
  "node-cron": "^3.0.0"
}
```

- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **joi**: Data validation
- **node-cron**: Task scheduling

## Dev Dependencies

```json
{
  "nodemon": "^3.0.0",
  "eslint": "^8.0.0",
  "jest": "^29.0.0"
}
```

- **nodemon**: Auto-restart during development
- **eslint**: Code linting
- **jest**: Testing framework

## Node Version Requirement

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

**Minimum Requirements:**
- Node.js: v18.0.0 or higher
- NPM: v9.0.0 or higher

## Installation

```bash
# Install all dependencies
npm install

# Install specific package
npm install package-name

# Install dev dependency
npm install --save-dev package-name

# Install exact versions from lock file
npm ci
```

## Version Management

```bash
# Check outdated packages
npm outdated

# Update packages
npm update

# Update to latest major version
npm install package-name@latest
```

## Lock File

- **package-lock.json**: Contains exact dependency versions
- Lock this file in version control
- Use `npm ci` in CI/CD environments instead of `npm install`

## Environment Configuration

Create `.env` file in backend directory:

```
NODE_ENV=development
PORT=5000
HOST=localhost
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=storium
JWT_SECRET=your_secret
LOG_LEVEL=info
```

## NPM Configuration

Optional `.npmrc` file for custom settings:

```
registry=https://registry.npmjs.org/
strict-ssl=true
save-exact=true
engine-strict=true
```

## Security Best Practices

1. **Dependency Auditing**
   ```bash
   npm audit
   npm audit fix
   ```

2. **Keep Dependencies Updated**
   ```bash
   npm outdated
   npm update
   ```

3. **Use Exact Versions for Production**
   - Avoid `^` and `~` for critical packages
   - Use exact versions (e.g., "5.2.1")

4. **Review Packages**
   - Check security advisories
   - Review package sources
   - Use npm audit before deployment

## Common Commands

```bash
# List installed packages
npm list

# List global packages
npm list -g

# Search for package
npm search package-name

# View package information
npm view package-name

# Check for vulnerabilities
npm audit

# Remove package
npm uninstall package-name

# Clean cache
npm cache clean --force
```

## Dependency Tree Example

```
storium-backend@1.0.0
├── express@5.2.1
│   ├── body-parser
│   ├── cookie-parser
│   └── ...
├── mysql2@3.15.3
│   └── ...
├── cors@2.8.5
├── dotenv@16.0.0
├── morgan@1.10.0
└── multer@2.0.2
```

## Publishing (if needed)

```bash
# Increment version
npm version patch    # 1.0.0 → 1.0.1
npm version minor    # 1.0.0 → 1.1.0
npm version major    # 1.0.0 → 2.0.0

# Publish to registry
npm publish
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Module not found | Run `npm install` |
| Version conflicts | Delete `node_modules` and `package-lock.json`, run `npm install` |
| Port already in use | Change PORT in .env |
| Database connection failed | Check .env database settings |
| Old cache issues | Run `npm cache clean --force` |

## Performance Optimization

```json
{
  "scripts": {
    "start": "NODE_ENV=production node server.js",
    "dev": "NODE_ENV=development nodemon server.js"
  }
}
```

## Memory Management

For large applications:

```bash
# Increase Node.js heap size
NODE_OPTIONS=--max-old-space-size=4096 npm start
```
