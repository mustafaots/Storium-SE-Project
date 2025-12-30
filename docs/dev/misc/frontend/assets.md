# Frontend Assets

## File Location
`frontend/src/assets/` or `frontend/public/`

## Purpose
Static asset directory containing images, icons, fonts, and other media files used throughout the frontend application.

## Asset Types and Organization

### 1. Images

**Location:** `frontend/public/images/` or `frontend/src/assets/images/`

```
images/
├── logo.svg              # Main logo (vector)
├── logo-dark.svg         # Dark theme logo
├── logo.png              # Logo raster fallback
├── favicon.ico           # Browser tab icon
├── apple-icon.png        # iOS home screen icon
├── og-image.png          # Social media preview
├── hero-banner.jpg       # Hero section
├── placeholder.svg       # Generic placeholder
└── icons/
    ├── dashboard.svg
    ├── products.svg
    ├── alerts.svg
    ├── transactions.svg
    ├── clients.svg
    ├── sources.svg
    ├── schema.svg
    ├── visualise.svg
    └── settings.svg
```

**Optimization:**
- SVG for logos and icons (scalable)
- PNG for images with transparency
- JPG for photographs (smaller file size)
- WebP for modern browsers

### 2. Icons

**Using react-icons package:**

```jsx
import { FiHome, FiSettings, FiMenu } from 'react-icons/fi';
import { BsCart, BsGear } from 'react-icons/bs';
import { IoAlerts, IoAnalytics } from 'react-icons/io5';

<FiHome size={24} />
<FiSettings color="#1976d2" />
<BsCart className="icon-large" />
```

**Icon Sets Available:**
- `ri`: Remix Icon
- `fi`: Feather Icons
- `bs`: Bootstrap Icons
- `io`: Ionicons
- `md`: Material Design
- `fa`: Font Awesome
- `cg`: css.gg

### 3. Fonts

**Location:** `frontend/public/fonts/` or imported from CDN

```
fonts/
├── Roboto-Regular.woff2
├── Roboto-Bold.woff2
├── Roboto-Light.woff2
└── OpenSans-Regular.woff2
```

**CSS Import:**

```css
@font-face {
  font-family: 'Roboto';
  src: url('/fonts/Roboto-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: 'Roboto';
  src: url('/fonts/Roboto-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}
```

**Or from CDN:**

```html
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap" rel="stylesheet" />
```

### 4. Styles/CSS

**Location:** `frontend/src/`

```
src/
├── index.css              # Global styles
├── App.css                # App component styles
├── assets/
│   ├── variables.css      # CSS custom properties
│   ├── reset.css          # CSS reset
│   └── theme/
│       ├── light.css      # Light theme
│       └── dark.css       # Dark theme
└── components/
    ├── Button.module.css
    ├── Card.module.css
    └── ...
```

## Asset Usage Patterns

### 1. Static Image Import

```jsx
import logo from '../assets/images/logo.svg';

<img src={logo} alt="Logo" />
```

### 2. Public Folder Reference

```jsx
<img src="/images/hero-banner.jpg" alt="Hero Banner" />
```

### 3. Dynamic Asset Loading

```jsx
const getIconForFeature = (featureName) => {
  const icons = {
    products: '/icons/products.svg',
    alerts: '/icons/alerts.svg',
    transactions: '/icons/transactions.svg',
    clients: '/icons/clients.svg',
    schema: '/icons/schema.svg',
    visualise: '/icons/visualise.svg'
  };
  return icons[featureName];
};

<img src={getIconForFeature(feature)} alt={feature} />
```

### 4. SVG as React Component

```jsx
import { ReactComponent as Logo } from '../assets/logo.svg';

<Logo width={40} height={40} />
```

### 5. Background Images in CSS

```css
.hero-section {
  background-image: url('/images/hero-banner.jpg');
  background-size: cover;
  background-position: center;
  min-height: 500px;
}
```

## Asset Optimization

### Image Optimization

```jsx
import { lazy, Suspense } from 'react';

// Lazy load heavy images
const HeavyImage = lazy(() => import('./HeavyImage'));

<Suspense fallback={<div>Loading...</div>}>
  <HeavyImage />
</Suspense>
```

### Responsive Images

```jsx
<picture>
  <source 
    srcSet="/images/hero-mobile.jpg" 
    media="(max-width: 600px)" 
  />
  <source 
    srcSet="/images/hero-desktop.jpg" 
    media="(min-width: 601px)" 
  />
  <img src="/images/hero-desktop.jpg" alt="Hero" />
</picture>
```

### Next-Gen Formats

```jsx
<picture>
  <source 
    srcSet="/images/hero.webp" 
    type="image/webp" 
  />
  <img src="/images/hero.jpg" alt="Hero" />
</picture>
```

### Lazy Loading

```jsx
<img 
  src="/images/large-image.jpg" 
  alt="Description"
  loading="lazy"
/>
```

## Asset Size Guidelines

| Asset Type | Target Size | Format |
|-----------|-------------|--------|
| Logo | < 10KB | SVG |
| Icon | < 5KB | SVG |
| Hero Image | < 200KB | WebP/JPG |
| Thumbnail | < 50KB | PNG/JPG |
| Background | < 300KB | WebP/JPG |
| Font | < 50KB per weight | WOFF2 |

## CSS Variables for Theming

File: `frontend/src/assets/variables.css`

```css
:root {
  /* Colors */
  --color-primary: #1976d2;
  --color-secondary: #f50057;
  --color-success: #4caf50;
  --color-warning: #ff9800;
  --color-error: #f44336;
  --color-info: #2196f3;
  
  /* Neutral Colors */
  --color-bg: #ffffff;
  --color-surface: #f5f5f5;
  --color-text: #212121;
  --color-text-secondary: #757575;
  --color-border: #e0e0e0;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-round: 9999px;
  
  /* Typography */
  --font-family: 'Roboto', system-ui, sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
}

/* Dark Mode */
[data-theme="dark"] {
  --color-bg: #1e1e1e;
  --color-surface: #2d2d2d;
  --color-text: #ffffff;
  --color-text-secondary: #b0b0b0;
  --color-border: #404040;
}
```

## Asset Serving

### Public Folder Assets

Files in `frontend/public/` are served at root:

```
frontend/public/
├── favicon.ico            → /favicon.ico
├── images/
│   └── logo.png           → /images/logo.png
└── robots.txt             → /robots.txt
```

### Import Assets

```jsx
// Vite imports and optimizes
import logo from '../assets/logo.svg?react'

// Returns optimized URL
const url = new URL('../assets/image.jpg', import.meta.url).href
```

## Performance Considerations

1. **SVG for Icons** - Scalable and small
2. **Lazy Load Images** - Use native lazy loading
3. **Responsive Images** - Use srcset for different sizes
4. **WebP Format** - Modern format with fallback
5. **Compress Images** - Use tools like ImageOptim
6. **Font Subsetting** - Load only needed characters
7. **Cache Busting** - Vite handles with hashes

## Asset Checklist

- [ ] Logo (SVG, PNG, ICO)
- [ ] Feature icons (SVG)
- [ ] Favicon
- [ ] Social media images (OG, Twitter)
- [ ] Hero/banner images
- [ ] Placeholder graphics
- [ ] Custom fonts
- [ ] CSS variables/theme
- [ ] Dark mode assets
- [ ] Mobile-optimized images

## Common Assets Needed

```
frontend/public/
├── favicon.ico
├── apple-icon.png
├── robots.txt
├── sitemap.xml
├── og-image.png
└── images/
    ├── logo.svg
    ├── logo.png
    ├── hero-banner.jpg
    ├── error-404.svg
    └── empty-state.svg
```

## Tools for Asset Management

```bash
# Image optimization
npm install --save-dev imagemin

# SVG optimization
npm install --save-dev svgo

# WebP conversion
npm install --save-dev imagemin-webp

# Icon generation
npm install --save-dev svg-to-png
```

## Best Practices

1. Store optimized assets
2. Use semantic file names
3. Include alt text for images
4. Version control optimized files
5. Document asset sources
6. Optimize before upload
7. Use CSS for simple graphics
8. Consider accessibility
9. Test on mobile
10. Monitor bundle size
