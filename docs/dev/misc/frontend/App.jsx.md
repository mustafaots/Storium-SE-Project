# Frontend App Component

## File Location
`frontend/src/App.jsx`

## Purpose
Root component for the React application. Handles routing, global state management, theme configuration, and main application structure.

## Component Structure

```
App
├── BrowserRouter / Router
├── Theme Provider (optional)
├── Auth Context Provider
├── Routes
│   ├── / → HomePage
│   ├── /login → LoginPage
│   ├── /register → RegisterPage
│   ├── /dashboard → DashboardPage
│   ├── /products → ProductsPage
│   ├── /alerts → AlertsPage
│   ├── /transactions → TransactionsPage
│   ├── /clients → ClientsPage
│   ├── /sources → SourcesPage
│   ├── /routines → RoutinesPage
│   ├── /schema → SchemaPage
│   ├── /visualise → VisualisePage
│   └── /404 → NotFoundPage
└── Global Components
    ├── Navigation Bar
    ├── Sidebar
    └── Footer
```

## Key Features

### 1. Routing Configuration

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    // ... more routes
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
</BrowserRouter>
```

### 2. Protected Routes

Routes requiring authentication should be wrapped with `ProtectedRoute`:

```javascript
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};
```

### 3. Global State Management

Using React Context or Redux:

```javascript
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

<AuthProvider>
  <ThemeProvider>
    <BrowserRouter>
      <Routes>...</Routes>
    </BrowserRouter>
  </ThemeProvider>
</AuthProvider>
```

### 4. Theme Configuration

```javascript
const theme = {
  colors: {
    primary: '#1976d2',
    secondary: '#f50057',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  }
};
```

## Layout Structure

```jsx
export default function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="app-container">
      <Navigation onMenuToggle={() => setIsNavOpen(!isNavOpen)} />
      
      <div className="app-content">
        <Sidebar isOpen={isNavOpen} />
        
        <main className="main-content">
          <Routes>
            {/* Routes here */}
          </Routes>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
```

## Props & State

```typescript
interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  theme: 'light' | 'dark';
  loading: boolean;
}

interface AppProps {
  // No props required for root component
}
```

## Initialization

### 1. Check Authentication

```javascript
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    // Verify token validity
    validateToken(token);
  }
}, []);
```

### 2. Load User Preferences

```javascript
useEffect(() => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
}, []);
```

### 3. Initialize Global State

```javascript
useEffect(() => {
  // Load initial data
  loadUserData();
  loadApplicationSettings();
}, []);
```

## Global Navigation

### Route Definitions

| Route | Component | Protected | Purpose |
|-------|-----------|-----------|---------|
| `/` | HomePage | No | Landing page |
| `/login` | LoginPage | No | User authentication |
| `/register` | RegisterPage | No | User registration |
| `/dashboard` | DashboardPage | Yes | Main dashboard |
| `/products` | ProductsPage | Yes | Product management |
| `/alerts` | AlertsPage | Yes | Alert management |
| `/transactions` | TransactionsPage | Yes | Transaction tracking |
| `/clients` | ClientsPage | Yes | Client management |
| `/sources` | SourcesPage | Yes | Supplier management |
| `/routines` | RoutinesPage | Yes | Schedule management |
| `/schema` | SchemaPage | Yes | Warehouse structure |
| `/visualise` | VisualisePage | Yes | Analytics & reports |

## Error Handling

```javascript
// Global error boundary
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Handle API errors globally
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Loading States

```javascript
const [loading, setLoading] = useState(true);

useEffect(() => {
  initializeApp().finally(() => setLoading(false));
}, []);

if (loading) return <LoadingSpinner />;
```

## Dependencies

```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^6.x.x",
  "axios": "^1.x.x"
}
```

## Environment Variables

```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Storium IMS
VITE_APP_VERSION=1.0.0
```

## CSS/Styling

App-level styles in `App.css` or `App.module.css`:

```css
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.app-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
```

## Performance Optimization

### Code Splitting

```javascript
import { lazy, Suspense } from 'react';

const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/products" element={<ProductsPage />} />
    <Route path="/alerts" element={<AlertsPage />} />
  </Routes>
</Suspense>
```

### Memoization

```javascript
const App = React.memo(() => {
  // Component code
});
```

## Debugging

```javascript
// Enable React DevTools
import React from 'react';
if (process.env.NODE_ENV === 'development') {
  // Debugging code
}
```

## Common Patterns

### Authentication Check

```javascript
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};
```

### Route Guards

```javascript
const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};
```

### Breadcrumb Navigation

```javascript
const breadcrumbs = useLocation().pathname
  .split('/')
  .filter(x => x)
  .map((crumb, index) => ({
    label: crumb.charAt(0).toUpperCase() + crumb.slice(1),
    path: `/${crumb}`
  }));
```

## Best Practices

1. Keep App component lightweight
2. Extract routing logic to separate config
3. Use context for global state
4. Implement proper error boundaries
5. Handle loading states
6. Protect sensitive routes
7. Use code splitting for large apps
8. Optimize bundle size
9. Implement proper logging
10. Handle offline scenarios
