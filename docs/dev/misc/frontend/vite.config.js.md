# Frontend Vite Configuration

## File Location
`frontend/vite.config.js`

## Purpose
Configures Vite build tool and development server. Handles bundling, optimization, API proxy routing, and development server settings.

## Basic Configuration

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { /* ... */ },
  build: { /* ... */ }
})
```

## Plugins

### React Plugin

```javascript
import react from '@vitejs/plugin-react'

plugins: [react()]
```

**Features:**
- JSX transformation
- Fast Refresh (HMR)
- Automatic JSX imports
- JSX source maps

#### Advanced React Plugin Options

```javascript
plugins: [
  react({
    jsxImportSource: 'react',
    jsxRuntime: 'automatic',
    jsxPureAnnotations: true,
    fastRefresh: true
  })
]
```

## Development Server

### Server Configuration

```javascript
server: {
  port: 3000,
  host: 'localhost',
  open: true,
  cors: true,
  hmr: {
    host: 'localhost',
    port: 3000
  },
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

**Server Options:**

| Option | Default | Purpose |
|--------|---------|---------|
| `port` | 5173 | Dev server port |
| `host` | localhost | Listening hostname |
| `open` | false | Auto-open browser on start |
| `cors` | true | Enable CORS |
| `hmr` | auto | Hot Module Replacement config |
| `proxy` | - | API proxy configuration |

### Hot Module Replacement (HMR)

```javascript
hmr: {
  protocol: 'ws',
  host: 'localhost',
  port: 3000
}
```

For production HMR:

```javascript
hmr: {
  protocol: 'wss',
  host: 'vite.example.com',
  port: 443
}
```

### API Proxy

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',    // Backend server
    changeOrigin: true,                  // Change Host header
    rewrite: (path) =>                  // Rewrite path
      path.replace(/^\/api/, '')
  }
}
```

**Example:**
- Request: `http://localhost:3000/api/products`
- Proxied to: `http://localhost:5000/products`

Multiple proxies:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000'
  },
  '/auth': {
    target: 'http://localhost:5001'
  }
}
```

## Build Configuration

### Build Options

```javascript
build: {
  outDir: 'dist',           // Output directory
  assetsDir: 'assets',      // Assets subdirectory
  sourcemap: false,         // Source maps (dev only)
  minify: 'terser',         // Minifier (terser or esbuild)
  manifest: true,           // Generate manifest.json
  ssrManifest: false,       // SSR manifest
  emptyOutDir: true,        // Clear outDir before build
  target: 'ES2020',         // Target ECMAScript version
  rollupOptions: {
    output: {
      entryFileNames: 'js/[name]-[hash].js',
      chunkFileNames: 'js/[name]-[hash].js',
      assetFileNames: '[ext]/[name]-[hash].[ext]'
    }
  }
}
```

**Build Options Details:**

| Option | Value | Purpose |
|--------|-------|---------|
| `outDir` | dist | Output directory |
| `assetsDir` | assets | Assets folder within outDir |
| `sourcemap` | false | Skip source maps (smaller builds) |
| `minify` | terser | JavaScript minification |
| `target` | ES2020 | Browser compatibility |

### Asset Handling

```javascript
build: {
  assetsInlineLimit: 4096,  // Inline assets < 4KB
  cssCodeSplit: true,       // Split CSS per chunk
  rollupOptions: {
    output: {
      assetFileNames: (assetInfo) => {
        if (assetInfo.name.endsWith('.css')) {
          return 'css/[name]-[hash][extname]'
        }
        return 'assets/[name]-[hash][extname]'
      }
    }
  }
}
```

## Complete Configuration Example

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 3000,
    host: 'localhost',
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['recharts', 'react-icons', 'react-toastify']
        }
      }
    }
  },
  
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

## Environment Variables

### Access in Code

```javascript
// Only expose VITE_ prefixed variables
const apiUrl = import.meta.env.VITE_API_URL

// Check if development
if (import.meta.env.DEV) {
  console.log('Development mode')
}

// Check if production
if (import.meta.env.PROD) {
  console.log('Production mode')
}
```

### .env Files

```
.env                 # All modes
.env.local           # All modes (local override)
.env.development     # Dev mode
.env.production      # Prod mode
```

File: `.env`

```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Storium IMS
VITE_APP_VERSION=1.0.0
```

## Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Build analysis
npm run build -- --analyze
```

## Performance Optimization

### Code Splitting

```javascript
rollupOptions: {
  output: {
    manualChunks: {
      'react': ['react', 'react-dom'],
      'router': ['react-router-dom'],
      'charts': ['recharts']
    }
  }
}
```

### Lazy Loading Routes

```javascript
import { lazy } from 'react'

const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const AlertsPage = lazy(() => import('./pages/AlertsPage'))
```

### Image Optimization

```javascript
import logo from './logo.png?w=400'
import thumbLogo from './logo.png?w=100'

<img src={logo} alt="Logo" />
<img src={thumbLogo} alt="Logo Thumb" />
```

## Aliases

```javascript
resolve: {
  alias: {
    '@': '/src',
    '@components': '/src/components',
    '@hooks': '/src/hooks',
    '@utils': '/src/utils',
    '@pages': '/src/pages'
  }
}
```

Usage in code:

```javascript
import Button from '@components/Button'
import { useUser } from '@hooks/useUser'
```

## CSS Processing

### PostCSS

```javascript
// Uses postcss.config.js automatically
```

File: `postcss.config.js`

```javascript
export default {
  plugins: {
    'postcss-preset-env': {},
    'postcss-nesting': {}
  }
}
```

### Preprocessors

#### Sass/SCSS

```bash
npm install --save-dev sass
```

```javascript
// Automatically detected
import styles from './style.module.scss'
```

#### Less

```bash
npm install --save-dev less
```

## TypeScript (Optional)

```bash
npm install --save-dev typescript
```

```javascript
import react from '@vitejs/plugin-react'

export default {
  plugins: [react()]
  // TypeScript support automatic
}
```

## Build Output Example

```
dist/
├── index.html
├── assets/
│   ├── js/
│   │   ├── index-xxxxx.js      (main bundle)
│   │   ├── react-vendor-xxxxx.js
│   │   └── ui-vendor-xxxxx.js
│   ├── css/
│   │   └── index-xxxxx.css
│   └── images/
│       └── logo-xxxxx.png
└── manifest.json
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API requests fail | Check proxy config in server.proxy |
| Port already in use | Change server.port or kill process |
| Hot reload not working | Check HMR settings |
| Build too large | Enable code splitting, lazy loading |
| Styles not loading | Check CSS import path |
| Asset not found | Verify asset in src/ folder |

## Environment Detection

```javascript
export const isDev = import.meta.env.DEV
export const isProd = import.meta.env.PROD
export const apiUrl = import.meta.env.VITE_API_URL
```

## Development Workflow

```bash
# 1. Start dev server
npm run dev
# Vite runs on http://localhost:3000
# API proxied to http://localhost:5000

# 2. Edit files - HMR applies changes
# Edit src/App.jsx → hot reload in browser

# 3. Build when ready
npm run build

# 4. Preview production build
npm run preview
```

## Best Practices

1. Define all environment variables in .env files
2. Use aliases for cleaner imports
3. Configure proxy for API during development
4. Split code for large dependencies
5. Lazy load routes and components
6. Monitor bundle size
7. Use source maps only in development
8. Set appropriate target for browsers
9. Configure HMR for development environments
10. Test production build before deployment
