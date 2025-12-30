# Frontend Main Entry Point

## File Location
`frontend/src/main.jsx`

## Purpose
Bootstrap file that mounts the React application to the DOM. Initializes Vite, renders the root App component, and sets up global React configuration.

## Basic Structure

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Key Components

### 1. React DOM Root

```javascript
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

- Mounts React app to HTML element with id "root"
- Uses React 18+ createRoot API (replaces ReactDOM.render)
- Enables concurrent rendering features

### 2. Strict Mode

```javascript
<React.StrictMode>
  <App />
</React.StrictMode>
```

**Features (Development Only):**
- Identifies unsafe lifecycles
- Warns about legacy string ref API
- Warns about deprecated findDOMNode usage
- Checks for unexpected side effects
- Validates component names
- Double-invokes certain functions to detect issues

## DOM Target

### Required HTML Element

File: `frontend/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Storium IMS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

The element with id="root" is where React renders the entire application.

## Global Setup Pattern

Extended version with global configuration:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Global configurations
import { configureAxios } from './config/axios';
import { initializeAnalytics } from './utils/analytics';

// Initialize axios defaults
configureAxios();

// Initialize analytics
initializeAnalytics();

// Create and render app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Dependencies

```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1"
}
```

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.1.1 | Core React library |
| react-dom | 19.1.1 | DOM rendering |

## Lifecycle

```
1. index.html loads
2. Vite dev server/bundler processes JSX
3. main.jsx executes
4. React root created
5. App component mounts
6. Component tree renders to DOM
7. Event listeners attached
8. App becomes interactive
```

## Global CSS

Import global styles in main.jsx:

```javascript
import './index.css';
```

File: `frontend/src/index.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html, body, #root {
  height: 100%;
  width: 100%;
}
```

## Global Error Handling

Add error listeners in main.jsx:

```javascript
// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled rejection:', event.reason);
  // Send to error tracking service
});

// Handle global errors
window.addEventListener('error', event => {
  console.error('Global error:', event.error);
  // Send to error tracking service
});
```

## Environment Variables

Access via `import.meta.env`:

```javascript
const API_URL = import.meta.env.VITE_API_URL;
const APP_ENV = import.meta.env.MODE; // development or production
```

File: `frontend/.env` or `frontend/.env.local`

```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Storium IMS
VITE_APP_VERSION=1.0.0
```

## Debugging

### React DevTools

```javascript
// In development
if (process.env.NODE_ENV === 'development') {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.isDisabled = false;
}
```

### Console Logging

```javascript
if (import.meta.env.DEV) {
  console.log('Development mode enabled');
}
```

## Performance Monitoring

```javascript
// Measure initial render time
const startTime = performance.now();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const endTime = performance.now();
console.log(`Initial render: ${endTime - startTime}ms`);
```

## Vite Specific Features

### Hot Module Replacement (HMR)

Automatically enabled in development:

```javascript
if (import.meta.hot) {
  import.meta.hot.accept();
}
```

### Dynamic Imports

```javascript
const LazyComponent = React.lazy(() => import('./components/LazyComponent'));
```

## Common Patterns

### Global Provider Setup

```javascript
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
```

### API Configuration

```javascript
import axios from 'axios';

// Set default API URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// Add request interceptor for auth token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "root element not found" | Check id="root" in index.html |
| App not rendering | Check console for errors, ensure App.jsx is valid |
| Hot reload not working | Clear node_modules, restart dev server |
| CSS not loading | Verify index.css import path in main.jsx |

## Development vs Production

### Development
```bash
npm run dev
# Uses Vite dev server with HMR
# Includes React.StrictMode checks
# Source maps enabled
# Fast refresh enabled
```

### Production
```bash
npm run build
# Minified and optimized bundle
# Tree-shaken dead code
# Source maps optional
# Optimized for performance
```

## Security Considerations

1. **XSS Prevention**: React escapes content by default
2. **CSRF Tokens**: Send with API requests
3. **Secure Storage**: Don't store sensitive data in localStorage
4. **HTTPS**: Use in production
5. **Content Security Policy**: Configure in meta tags

## Best Practices

1. Keep main.jsx minimal and focused
2. Move complex setup to separate files
3. Use environment variables for configuration
4. Implement global error boundaries
5. Set up proper logging early
6. Configure API defaults
7. Initialize analytics once
8. Handle offline scenarios
9. Set up performance monitoring
10. Use React.StrictMode in development
