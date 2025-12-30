# Frontend ESLint Configuration

## File Location
`frontend/eslint.config.js`

## Purpose
Defines code quality rules and linting standards for the React frontend application. Enforces consistent code style and catches potential errors.

## Configuration Structure

```javascript
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  // Configuration blocks...
]
```

## Ignore Patterns

```javascript
{
  ignores: ['dist', 'node_modules', 'build', 'coverage']
}
```

**Files/Folders Ignored:**
- `dist/` - Build output
- `node_modules/` - Dependencies
- `build/` - Compiled files
- `coverage/` - Test coverage reports

## File Patterns

```javascript
{
  files: ['**/*.{js,jsx}']
}
```

Applies rules to all JavaScript and JSX files in the project.

## Language Options

```javascript
{
  languageOptions: {
    ecmaVersion: 2020,           // ES2020 features
    sourceType: 'module',         // Use ES modules
    globals: globals.browser,     // Browser APIs (window, document, etc.)
    parserOptions: {
      ecmaFeatures: { jsx: true } // Enable JSX parsing
    }
  }
}
```

## Settings

```javascript
{
  settings: {
    react: {
      version: '19.1'  // React version for plugin
    }
  }
}
```

## Plugins

### ESLint Core
```javascript
import js from '@eslint/js'
```

Provides essential JavaScript linting rules.

### React Plugin
```javascript
import react from 'eslint-plugin-react'
```

**Rules Include:**
- `react/prop-types` - Validate prop types
- `react/no-unescaped-entities` - Escape HTML entities
- `react/jsx-uses-react` - React in scope check
- `react/react-in-jsx-scope` - React availability (not needed with new JSX transform)

### React Hooks Plugin
```javascript
import reactHooks from 'eslint-plugin-react-hooks'
```

**Rules Include:**
- `react-hooks/rules-of-hooks` - Hooks at top level
- `react-hooks/exhaustive-deps` - Dependency array completeness

## Common Rules

### Recommended Configurations

```javascript
rules: {
  // Merge multiple configs
  ...js.configs.recommended.rules,
  ...react.configs.recommended.rules,
  ...reactHooks.configs.recommended.rules
}
```

### Custom Rules

```javascript
rules: {
  'no-console': 'warn',                    // Warn on console.log
  'no-unused-vars': 'error',               // Error on unused variables
  'no-var': 'error',                       // Use let/const instead
  'prefer-const': 'warn',                  // Prefer const
  'eqeqeq': ['error', 'always'],          // Use === instead of ==
  'no-empty-function': 'warn',             // Warn on empty functions
  'react/prop-types': 'off',               // Disable prop-types (use TypeScript)
  'react-hooks/exhaustive-deps': 'warn'    // Warn on incomplete deps
}
```

## Rule Severity Levels

```javascript
// off / 0     - Rule disabled
// warn / 1    - Warning (doesn't fail build)
// error / 2   - Error (fails build)
```

## Running ESLint

### CLI Commands

```bash
# Check all files
npm run lint

# Check specific file
npx eslint src/App.jsx

# Fix auto-fixable issues
npx eslint . --fix

# Format output
npx eslint . --format stylish

# Check with detailed output
npx eslint . --debug
```

### Configuration Files

The `eslint.config.js` file replaces:
- `.eslintrc.js` (old flat config)
- `.eslintrc.json`
- `.eslintrc.yaml`

## Integration

### VS Code Integration

Install **ESLint** extension (`dbaeumer.vscode-eslint`):

```json
// settings.json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Pre-commit Hook

Using Husky:

```bash
npm install --save-dev husky
husky install

# Create pre-commit hook
npx husky add .husky/pre-commit "npm run lint"
```

## Environment-Specific Rules

```javascript
{
  files: ['**/*.test.js', '**/*.spec.js'],
  languageOptions: {
    globals: {
      describe: 'readonly',
      it: 'readonly',
      expect: 'readonly'
    }
  }
}
```

## Overrides for Specific Files

```javascript
{
  files: ['src/pages/**/*.jsx'],
  rules: {
    'no-console': 'off'  // Allow console in pages
  }
}
```

## Popular Rule Presets

### Airbnb Style Guide

```bash
npm install --save-dev eslint-config-airbnb
```

### Google Style Guide

```bash
npm install --save-dev eslint-config-google
```

## Examples

### Good Code

```javascript
// ✅ Passes ESLint
const handleClick = (e) => {
  const { id } = e.target;
  console.warn('Clicked:', id);
};

const [count, setCount] = useState(0);
```

### Bad Code

```javascript
// ❌ Fails ESLint
var handleClick = function(e) {
  console.log('Clicked:', e.target.id);
};

// Missing dependency in useEffect
useEffect(() => {
  setData(count);
}, []);  // Should include count
```

## Disable Rules

### Per Line

```javascript
// eslint-disable-next-line react/prop-types
function Component({ prop }) {
  return <div>{prop}</div>;
}
```

### Per Block

```javascript
/* eslint-disable no-console */
console.log('debug');
console.log('info');
/* eslint-enable no-console */
```

### Per File

```javascript
/* eslint-disable react/prop-types */
// All rules disabled for this file
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Lint
on: [push]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run lint
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Rules not applied | Check file patterns match, restart VS Code |
| Auto-fix not working | Ensure `--fix` flag used, rule supports fixing |
| Too many warnings | Adjust rule severity or disable non-critical rules |
| Plugin not found | Verify plugin installed in node_modules |
| Old config format | Migrate to flat config (eslint.config.js) |

## Performance

### Skip Expensive Checks

```bash
# Run faster lint
npm run lint -- --max-warnings 0
```

### Cache Results

ESLint automatically caches results in `.eslintcache`.

## Best Practices

1. **Be Consistent** - Enforce same rules across team
2. **Start Strict** - Enable important rules early
3. **Comment Disables** - Always explain why rule is disabled
4. **Regular Updates** - Keep ESLint and plugins current
5. **Version Control** - Commit eslint.config.js
6. **CI/CD Check** - Fail build on lint errors
7. **Team Agreement** - Discuss rule strictness with team
8. **Progressive Adoption** - Introduce rules gradually
9. **Documentation** - Document custom rules
10. **Developer Experience** - Balance strictness with productivity

## Common Configurations

### Strict Development

```javascript
rules: {
  'no-console': 'error',
  'no-debugger': 'error',
  'no-unused-vars': 'error',
  'prefer-const': 'error',
  'eqeqeq': 'error'
}
```

### Balanced Production

```javascript
rules: {
  'no-console': 'warn',
  'no-debugger': 'error',
  'no-unused-vars': 'warn',
  'prefer-const': 'warn'
}
```

### Lenient Prototyping

```javascript
rules: {
  'no-console': 'off',
  'no-unused-vars': 'off',
  'prefer-const': 'warn'
}
```
