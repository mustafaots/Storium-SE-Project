# Frontend Package Configuration

## File Location
`frontend/package.json`

## Purpose
NPM package manifest for the frontend application. Defines dependencies, scripts, build configuration, and project metadata.

## Package Information

```json
{
  "name": "storium-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "description": "Storium IMS - Inventory Management System Frontend",
  "author": "Development Team",
  "license": "ISC"
}
```

## Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext .js,.jsx",
  "format": "prettier --write src/"
}
```

**Script Details:**

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run dev` | `vite` | Start development server with HMR |
| `npm run build` | `vite build` | Create optimized production build |
| `npm run preview` | `vite preview` | Preview production build locally |
| `npm run lint` | `eslint .` | Check code quality |
| `npm run format` | `prettier` | Auto-format code |

## Dependencies

### Core Framework
```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^6.x.x"
}
```

- **react**: UI library
- **react-dom**: DOM rendering
- **react-router-dom**: Client-side routing

### HTTP Client
```json
{
  "axios": "^1.x.x"
}
```

- **axios**: Promise-based HTTP client

### UI & Visualization
```json
{
  "recharts": "^2.x.x",
  "react-icons": "^5.x.x",
  "react-toastify": "^10.x.x"
}
```

- **recharts**: Chart library built on React
- **react-icons**: Icon library
- **react-toastify**: Toast notifications

### Data Processing
```json
{
  "papaparse": "^5.x.x"
}
```

- **papaparse**: CSV parser for imports/exports

### PDF Generation
```json
{
  "jspdf": "^2.x.x"
}
```

- **jspdf**: PDF generation library

### Date/Time
```json
{
  "date-fns": "^2.x.x"
}
```

- **date-fns**: Modern date utility library

### Form Handling (Optional)
```json
{
  "react-hook-form": "^7.x.x",
  "zod": "^3.x.x"
}
```

- **react-hook-form**: Performant forms
- **zod**: Schema validation

## Dev Dependencies

```json
{
  "@vitejs/plugin-react": "^4.x.x",
  "vite": "^5.x.x",
  "eslint": "^8.x.x",
  "eslint-plugin-react": "^7.x.x",
  "eslint-plugin-react-hooks": "^4.x.x",
  "prettier": "^3.x.x"
}
```

- **vite**: Build tool & dev server
- **@vitejs/plugin-react**: React plugin for Vite
- **eslint**: Code linting
- **prettier**: Code formatter

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

# Use exact versions from lock file
npm ci
```

## Build Optimization

### Production Build Output

```
dist/
├── index.html          # Entry HTML file
├── assets/
│   ├── index-xxxxx.js  # Main bundle (minified, gzipped)
│   ├── chunk-xxxxx.js  # Code-split chunks
│   └── style-xxxxx.css # Minified CSS
└── manifest.json       # Build manifest
```

**File Size Targets:**
- Main bundle: < 100KB (gzipped)
- Total assets: < 500KB (gzipped)

### Build Command

```bash
npm run build

# Output shows file sizes:
# dist/index.html                    0.68 kB │ gzip:  0.32 kB
# dist/assets/index-xxxxx.js    185.45 kB │ gzip: 55.34 kB
# dist/assets/style-xxxxx.css    25.00 kB │ gzip:  6.50 kB
```

## Deployment

### Environment Variables

Create `.env.production`:

```
VITE_API_URL=https://api.production.com
VITE_APP_NAME=Storium IMS
VITE_APP_VERSION=1.0.0
```

### Build for Production

```bash
# Build
npm run build

# Preview built version locally
npm run preview

# Deploy dist/ folder to hosting
```

## Vite Configuration

File: `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})
```

## ESLint Configuration

File: `eslint.config.js`

```javascript
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  {
    ignores: ['dist']
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    settings: {
      react: { version: '19.1' }
    },
    plugins: {
      react,
      'react-hooks': reactHooks
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules
    }
  }
]
```

## PostCSS Configuration

File: `postcss.config.js`

```javascript
export default {
  plugins: {
    'postcss-nesting': {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'custom-properties': false
      }
    }
  }
}
```

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format

# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Dependency Updates

```bash
# Check outdated packages
npm outdated

# Update to latest versions
npm update

# Update specific package to latest major version
npm install package-name@latest

# Show what would be updated
npm update --dry-run
```

## Security Best Practices

1. **Regular Audits**
   ```bash
   npm audit
   npm audit fix
   ```

2. **Update Dependencies**
   ```bash
   npm outdated
   npm update
   ```

3. **Review New Packages**
   - Check npm package page
   - Review GitHub repository
   - Check security advisories

4. **Lock File**
   - Commit `package-lock.json`
   - Use `npm ci` in CI/CD

## Performance Optimization

### Code Splitting

Automatic with Vite and dynamic imports:

```javascript
const ProductsPage = React.lazy(() => 
  import('./pages/ProductsPage')
);
```

### Image Optimization

```javascript
import logo from './assets/logo.png?w=400'
```

### Bundle Analysis

```bash
npm install --save-dev rollup-plugin-visualizer

# Then add to vite.config.js
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Change port in vite.config.js or kill process |
| Module not found | Run `npm install` |
| Build fails | Check console errors, ensure dependencies installed |
| API requests fail | Check VITE_API_URL in .env file |
| Hot reload not working | Restart dev server |

## Git Workflow

### Ignored Files

File: `.gitignore`

```
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Build

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

## Performance Monitoring

- Use Chrome DevTools Lighthouse
- Monitor bundle size over time
- Track Core Web Vitals
- Use Sentry or similar for error tracking

## Best Practices

1. Keep dependencies minimal
2. Update regularly but test thoroughly
3. Use exact versions for critical packages
4. Implement proper error handling
5. Lazy load routes and components
6. Optimize images
7. Monitor bundle size
8. Use code splitting
9. Enable compression
10. Cache assets properly
