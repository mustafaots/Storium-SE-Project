# Frontend Index HTML

## File Location
`frontend/index.html`

## Purpose
Entry HTML file for the Vite application. Serves as the template for the Single Page Application (SPA).

## Basic Structure

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

## Head Section

### Meta Tags

#### Charset
```html
<meta charset="UTF-8" />
```

Declares UTF-8 character encoding for the document.

#### Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

**Attributes:**
- `width=device-width` - Match viewport to device width
- `initial-scale=1.0` - Initial zoom level
- `maximum-scale=5.0` - Max zoom allowed
- `user-scalable=yes` - Allow user zoom

### Title

```html
<title>Storium IMS - Inventory Management System</title>
```

Appears in:
- Browser tab
- Browser history
- Search results

### Description

```html
<meta name="description" content="Storium Inventory Management System - Track products, alerts, transactions, and warehouse operations." />
```

Used by search engines for preview text.

### Icons

Favicon:

```html
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
```

Apple icon:

```html
<link rel="apple-touch-icon" href="/apple-icon.png" />
```

### Open Graph (Social Media)

```html
<meta property="og:title" content="Storium IMS" />
<meta property="og:description" content="Inventory Management System" />
<meta property="og:image" content="/og-image.png" />
<meta property="og:url" content="https://storium.example.com" />
<meta property="og:type" content="website" />
```

### Twitter Card

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Storium IMS" />
<meta name="twitter:description" content="Inventory Management System" />
<meta name="twitter:image" content="/twitter-image.png" />
```

### Preload Resources

```html
<!-- Preload fonts -->
<link rel="preload" href="/fonts/roboto.woff2" as="font" type="font/woff2" crossorigin />

<!-- Preload critical images -->
<link rel="preload" href="/logo.svg" as="image" />

<!-- DNS prefetch -->
<link rel="dns-prefetch" href="https://api.example.com" />

<!-- Prefetch API -->
<link rel="prefetch" href="https://api.example.com" />
```

### Theme Color

```html
<meta name="theme-color" content="#1976d2" />
```

Used by browsers for UI coloring (mobile).

## Complete Head Example

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Basic Info -->
  <title>Storium IMS - Inventory Management System</title>
  <meta name="description" content="Comprehensive inventory management system for tracking products, alerts, transactions, and warehouse operations." />
  <meta name="keywords" content="inventory, management, warehouse, stock, products" />
  <meta name="author" content="Development Team" />
  
  <!-- Icons -->
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <link rel="apple-touch-icon" href="/apple-icon.png" />
  
  <!-- Security -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'" />
  
  <!-- Theme -->
  <meta name="theme-color" content="#1976d2" />
  <meta name="color-scheme" content="light dark" />
  
  <!-- Social Media -->
  <meta property="og:title" content="Storium IMS" />
  <meta property="og:description" content="Inventory Management System" />
  <meta property="og:image" content="/og-image.png" />
  <meta property="og:type" content="website" />
  
  <!-- Performance -->
  <link rel="dns-prefetch" href="https://api.example.com" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preload" href="/fonts/roboto.woff2" as="font" type="font/woff2" crossorigin />
</head>
```

## Body Section

### Root Element

```html
<body>
  <div id="root"></div>
</body>
```

**Purpose:**
- React mounts here via `ReactDOM.createRoot(document.getElementById('root'))`
- Must have exactly `id="root"`
- Must be empty (React fills it)

### Script Entry

```html
<script type="module" src="/src/main.jsx"></script>
```

**Attributes:**
- `type="module"` - ES module syntax
- `src="/src/main.jsx"` - Entry point file
- `/` - Relative to root (Vite handles this)

## No-Script Fallback

```html
<body>
  <div id="root"></div>
  <noscript>
    <p>This application requires JavaScript to be enabled. Please enable JavaScript in your browser settings.</p>
  </noscript>
  <script type="module" src="/src/main.jsx"></script>
</body>
```

## Loading State

Add CSS for initial load:

```html
<style>
  #root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
  }
  
  .loading-spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #1976d2;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
```

## Extended Example with Loading UI

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Storium IMS</title>
    <meta name="description" content="Inventory Management System" />
    <meta name="theme-color" content="#1976d2" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      html, body {
        height: 100%;
        width: 100%;
        font-family: system-ui, -apple-system, sans-serif;
      }
      
      #root {
        height: 100%;
        width: 100%;
      }
      
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      .spinner {
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  </head>
  <body>
    <div id="root">
      <div class="loading">
        <div class="spinner"></div>
      </div>
    </div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## Environment Variables in HTML

Vite doesn't support server-side templating, but you can use:

```javascript
// In main.jsx
const apiUrl = import.meta.env.VITE_API_URL

// Not available in HTML directly
// Use JavaScript to set data
window.ENV = {
  API_URL: import.meta.env.VITE_API_URL
}
```

## SEO Best Practices

```html
<!-- Semantic HTML -->
<meta name="language" content="English" />

<!-- Structured Data (JSON-LD) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Storium IMS",
  "description": "Inventory Management System",
  "url": "https://storium.example.com"
}
</script>

<!-- Sitemap and Robots -->
<link rel="sitemap" href="/sitemap.xml" />
<meta name="robots" content="index, follow" />
```

## Security Headers

```html
<!-- Content Security Policy -->
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; 
           script-src 'self' 'unsafe-inline'; 
           style-src 'self' 'unsafe-inline'; 
           img-src 'self' data: https:;" />

<!-- X-UA-Compatible for old IE -->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />

<!-- Prevent MIME sniffing -->
<meta http-equiv="X-Content-Type-Options" content="nosniff" />
```

## Performance Tips

1. **Minimal CSS in Head** - Reduce render-blocking
2. **Lazy Load Images** - Use native lazy loading
3. **Defer Script** - Though not applicable with module type
4. **Minify HTML** - Done automatically by Vite
5. **Use CDN** - For assets and fonts
6. **Preload Critical** - Fonts and images

## Vite Special Features

### Asset References

```html
<!-- Vite processes these automatically -->
<img src="/src/assets/logo.svg" alt="Logo" />
<link rel="icon" href="/favicon.ico" />
```

### Environment Variables

```javascript
// In JavaScript, not HTML
const isDev = import.meta.env.DEV
const apiUrl = import.meta.env.VITE_API_URL
```

## Common Patterns

### Dark Mode Support

```html
<meta name="color-scheme" content="light dark" />
```

CSS handles it:

```css
@media (prefers-color-scheme: dark) {
  /* Dark mode styles */
}
```

### Progressive Enhancement

```html
<noscript>
  <p>JavaScript is required to use this application.</p>
  <a href="https://enable-javascript.com">Learn how to enable JavaScript</a>
</noscript>
```

## Validation

Check HTML validity:

```bash
# Using W3C Validator
https://validator.w3.org/

# Using local tools
npm install --save-dev html-validate
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| App not loading | Check #root element exists, check browser console |
| CSS not applying | Verify stylesheet imports in main.jsx or App.jsx |
| Fonts not loading | Check font URLs, add CORS headers if needed |
| Images broken | Verify image paths, ensure public folder setup |

## Best Practices

1. Keep it minimal and semantic
2. Use appropriate meta tags for SEO
3. Include security headers
4. Add social media meta tags
5. Implement loading UI
6. Use valid HTML5
7. Optimize for Core Web Vitals
8. Include accessibility meta tags
9. Test in multiple browsers
10. Validate with W3C validator
