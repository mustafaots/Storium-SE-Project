# Frontend PostCSS Configuration

## File Location
`frontend/postcss.config.js`

## Purpose
Configures PostCSS for CSS transformation and optimization. Enables modern CSS features, nesting syntax, and vendor prefix automation.

## Basic Configuration

```javascript
export default {
  plugins: {
    'postcss-preset-env': {},
    'postcss-nesting': {}
  }
}
```

## Plugins Overview

### 1. PostCSS Preset Env

**Transforms modern CSS into compatible versions**

```javascript
'postcss-preset-env': {
  stage: 3,  // Stage 3+ features
  features: {
    'custom-properties': false,
    'nesting-rules': false  // Use postcss-nesting instead
  }
}
```

**Features Enabled:**
- CSS Custom Properties (variables)
- CSS Gradients
- CSS Grid
- Flexbox
- Media Queries
- Color Functions
- Logical Properties
- Cascade Layers

**Browser Support:**
Automatically adds vendor prefixes and polyfills for:
- Chrome, Firefox, Safari
- Edge, IE (limited)
- Mobile browsers

#### Stages

```javascript
stage: 0  // Experimental
stage: 1  // Proposal
stage: 2  // Draft
stage: 3  // Candidate (default)
stage: 4  // Finished
```

### 2. PostCSS Nesting

**Enables CSS nesting syntax**

```javascript
'postcss-nesting': {}
```

Transforms:

```css
/* Input */
.card {
  padding: 10px;
  
  .header {
    font-weight: bold;
  }
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
}

/* Output */
.card {
  padding: 10px;
}

.card .header {
  font-weight: bold;
}

.card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

## Complete Configuration

```javascript
export default {
  plugins: {
    'postcss-import': {},
    'postcss-nesting': {},
    'postcss-preset-env': {
      stage: 3,
      preserve: false,
      features: {
        'custom-properties': true,
        'is-pseudo-class': true,
        'logical-properties-and-values': true
      }
    },
    'postcss-flexbugs-fixes': {},
    cssnano: {
      preset: ['default', {
        discardComments: {
          removeAll: true
        }
      }]
    }
  }
}
```

## Optional Plugins

### CSS Imports

```bash
npm install --save-dev postcss-import
```

```javascript
'postcss-import': {
  path: ['src/styles']
}
```

Enables:

```css
@import 'variables';
@import 'base';
```

### Flexbox Fixes

```bash
npm install --save-dev postcss-flexbugs-fixes
```

```javascript
'postcss-flexbugs-fixes': {}
```

Fixes IE 10-11 flexbox bugs.

### CSS Minification

```bash
npm install --save-dev cssnano
```

```javascript
cssnano: {
  preset: ['default', {
    discardComments: { removeAll: true }
  }]
}
```

### Autoprefixer

```bash
npm install --save-dev autoprefixer
```

```javascript
autoprefixer: {
  overrideBrowserslist: [
    'defaults',
    'not IE 11'
  ]
}
```

## CSS Features Enabled

### CSS Variables (Custom Properties)

```css
:root {
  --primary-color: #1976d2;
  --spacing-unit: 8px;
}

.button {
  background: var(--primary-color);
  padding: calc(var(--spacing-unit) * 2);
}
```

### Grid Auto Placement

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
```

### Logical Properties

```css
.sidebar {
  /* Logical (respects RTL) */
  padding-inline: 20px;
  margin-block: 10px;
  
  /* Physical (LTR only) */
  /* padding-left: 20px; */
  /* margin-top: 10px; */
}
```

### `:is()` Pseudo-Class

```css
button:is(.primary, .secondary),
input:is(.primary, .secondary) {
  padding: 10px 20px;
}
```

### Media Queries

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

## Environment-Specific Configuration

```javascript
const isDev = process.env.NODE_ENV === 'development'

export default {
  plugins: {
    'postcss-import': {},
    'postcss-nesting': {},
    'postcss-preset-env': {
      stage: 3
    },
    ...(isDev ? {} : {
      cssnano: {
        preset: ['default', {
          discardComments: { removeAll: true }
        }]
      }
    })
  }
}
```

## Browser Targets

Specify target browsers:

```javascript
'postcss-preset-env': {
  stage: 3,
  browsers: [
    '> 1%',
    'last 2 versions',
    'not dead'
  ]
}
```

Or in `.browserslistrc`:

```
> 1%
last 2 versions
not dead
not IE 11
```

## CSS Best Practices with PostCSS

### 1. Use CSS Variables

```css
:root {
  --color-primary: #1976d2;
  --color-secondary: #f50057;
  --color-success: #4caf50;
  --color-error: #f44336;
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
}

.button {
  background: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}
```

### 2. Use Nesting for Organized Code

```css
.card {
  background: white;
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid #eee;
  }
  
  .title {
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  .actions {
    display: flex;
    gap: var(--spacing-sm);
  }
  
  .content {
    color: #666;
    line-height: 1.6;
  }
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
}
```

### 3. Modern Selectors

```css
/* Using :is() for cleaner code */
button:is(.primary, .secondary, .danger),
a:is(.primary, .secondary, .danger) {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.3s ease;
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Styles not updating | Restart dev server, check PostCSS config |
| Vendor prefixes missing | Check browser targets in preset-env |
| Variables not working | Ensure `--variable-name` syntax |
| Nesting not working | Verify postcss-nesting installed and ordered first |

## Installation

```bash
npm install --save-dev \
  postcss \
  postcss-preset-env \
  postcss-nesting \
  postcss-import \
  postcss-flexbugs-fixes
```

## File Order Matters

Plugin order is important:

```javascript
export default {
  plugins: {
    'postcss-import': {},      // Must be first
    'postcss-nesting': {},     // Before preset-env
    'postcss-preset-env': {},  // Core transformations
    'postcss-flexbugs-fixes': {} // Fixes last
  }
}
```

## Testing CSS Transformations

```bash
# Check what PostCSS does
npx postcss src/style.css -o dist/style.css

# With specific plugin
npx postcss --use postcss-nesting src/style.css
```

## Integration with Vite

Vite automatically uses `postcss.config.js`:

```bash
npm run dev
# Vite processes CSS through PostCSS automatically
```

## Performance Tips

1. Order plugins correctly
2. Limit nesting depth
3. Use CSS variables instead of repeating values
4. Minify in production only
5. Use logical properties for RTL support
6. Test CSS in target browsers

## Common Patterns

### Theme Switching

```css
:root {
  --theme: light;
}

[data-theme="dark"] {
  --bg-color: #1e1e1e;
  --text-color: #fff;
}

[data-theme="light"] {
  --bg-color: #fff;
  --text-color: #000;
}

body {
  background: var(--bg-color);
  color: var(--text-color);
}
```

### Responsive Design

```css
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Best Practices

1. Use custom properties for theming
2. Organize with nesting
3. Keep specificity low
4. Use logical properties
5. Test in target browsers
6. Document color/spacing system
7. Use :is() for multiple selectors
8. Minify for production
9. Version control config
10. Use consistent naming conventions
