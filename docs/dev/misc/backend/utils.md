# Backend Utilities Documentation

## File Location
`backend/src/utils/` directory

## Purpose
Collection of utility modules that provide reusable functions, constants, and configurations across the backend application.

## Key Utility Modules

### 1. apiResponse.js

**Purpose:** Standardized API response formatting

```javascript
// Export standard response formatter
module.exports = {
  success: (data, message, statusCode = 200) => ({
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date()
  }),
  
  error: (message, statusCode = 400, error = null) => ({
    success: false,
    statusCode,
    message,
    error: error?.message || null,
    timestamp: new Date()
  }),
  
  paginated: (data, page, pageSize, total) => ({
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  })
}
```

**Usage:**

```javascript
const { success, error, paginated } = require('../utils/apiResponse');

// Success response
res.json(success(product, 'Product created', 201));

// Error response
res.status(400).json(error('Invalid request'));

// Paginated response
res.json(paginated(products, 1, 10, total));
```

### 2. constants.js

**Purpose:** Application-wide constants and enums

```javascript
module.exports = {
  // Product Status
  PRODUCT_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DISCONTINUED: 'discontinued'
  },
  
  // Alert Severity Levels
  ALERT_SEVERITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },
  
  // Alert Types
  ALERT_TYPE: {
    LOW_STOCK: 'low_stock',
    OVERSTOCK: 'overstock',
    EXPIRATION: 'expiration',
    QUALITY: 'quality'
  },
  
  // Transaction Types
  TRANSACTION_TYPE: {
    INBOUND: 'inbound',
    OUTBOUND: 'outbound',
    RETURN: 'return',
    ADJUSTMENT: 'adjustment'
  },
  
  // Transaction Status
  TRANSACTION_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    FAILED: 'failed'
  },
  
  // Client Types
  CLIENT_TYPE: {
    WHOLESALER: 'wholesaler',
    RETAILER: 'retailer',
    DISTRIBUTOR: 'distributor',
    DIRECT: 'direct'
  },
  
  // Routine Types
  ROUTINE_STATUS: {
    ACTIVE: 'active',
    PAUSED: 'paused',
    FAILED: 'failed',
    COMPLETED: 'completed'
  },
  
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500
  },
  
  // Pagination Defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100
  },
  
  // File Upload
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024,  // 5MB
    ALLOWED_TYPES: ['application/json', 'text/csv']
  }
}
```

### 3. database.js (Utilities)

**Purpose:** Database utility functions and helpers

```javascript
module.exports = {
  // Generate parameter placeholders
  generatePlaceholders: (count) => {
    return Array(count).fill('?').join(',');
  },
  
  // Build dynamic WHERE clause
  buildWhereClause: (filters) => {
    const conditions = [];
    const values = [];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        conditions.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    return {
      whereClause: conditions.length > 0 
        ? `WHERE ${conditions.join(' AND ')}` 
        : '',
      values
    };
  },
  
  // Build dynamic query from object
  buildUpdateQuery: (table, updates, id) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    
    return {
      query,
      values: [...values, id]
    };
  },
  
  // Parse pagination params
  parsePagination: (page, pageSize, maxSize = 100) => {
    const p = Math.max(1, parseInt(page) || 1);
    const ps = Math.min(parseInt(pageSize) || 10, maxSize);
    const offset = (p - 1) * ps;
    
    return { page: p, pageSize: ps, offset };
  },
  
  // Escape SQL wildcards for LIKE
  escapeLike: (value) => {
    return value.replace(/[\\%_]/g, '\\$&');
  }
}
```

**Usage:**

```javascript
const { parsePagination, buildWhereClause } = require('../utils/database');

// Pagination
const { page, pageSize, offset } = parsePagination(req.query.page, req.query.pageSize);

// Dynamic WHERE clause
const { whereClause, values } = buildWhereClause({
  status: 'active',
  category: req.query.category
});

const query = `SELECT * FROM products ${whereClause} LIMIT ? OFFSET ?`;
const params = [...values, pageSize, offset];
```

### 4. validators.js (Helper)

**Purpose:** Validation helper functions

```javascript
module.exports = {
  // Email validation
  isValidEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },
  
  // Phone validation
  isValidPhone: (phone) => {
    const regex = /^[\d\s\-\+\(\)]{10,}$/;
    return regex.test(phone);
  },
  
  // Decimal validation
  isValidDecimal: (value, precision = 2) => {
    const regex = new RegExp(`^\\d+(\\.\\d{1,${precision}})?$`);
    return regex.test(value);
  },
  
  // Date validation
  isValidDate: (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  },
  
  // Product ID validation
  isValidProductId: (id) => /^\d+$/.test(id),
  
  // Required fields check
  hasRequiredFields: (obj, requiredFields) => {
    return requiredFields.every(field => 
      obj[field] !== undefined && obj[field] !== null && obj[field] !== ''
    );
  },
  
  // Enum validation
  isValidEnum: (value, enumObj) => {
    return Object.values(enumObj).includes(value);
  }
}
```

### 5. errorHandler.js (in middleware)

**Purpose:** Error handling and logging

```javascript
module.exports = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log error
  console.error({
    timestamp: new Date(),
    status,
    message,
    path: req.path,
    method: req.method,
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
  
  // Send response
  res.status(status).json({
    success: false,
    statusCode: status,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

## Utility Patterns

### 1. Query Builder Pattern

```javascript
class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.conditions = [];
    this.params = [];
  }
  
  where(field, operator, value) {
    this.conditions.push(`${field} ${operator} ?`);
    this.params.push(value);
    return this;
  }
  
  orderBy(field, direction = 'ASC') {
    this.orderClause = `ORDER BY ${field} ${direction}`;
    return this;
  }
  
  limit(count) {
    this.limitClause = `LIMIT ${count}`;
    return this;
  }
  
  build() {
    let query = `SELECT * FROM ${this.table}`;
    
    if (this.conditions.length > 0) {
      query += ` WHERE ${this.conditions.join(' AND ')}`;
    }
    
    if (this.orderClause) {
      query += ` ${this.orderClause}`;
    }
    
    if (this.limitClause) {
      query += ` ${this.limitClause}`;
    }
    
    return { query, params: this.params };
  }
}

// Usage
const qb = new QueryBuilder('products')
  .where('status', '=', 'active')
  .where('category', '=', 'electronics')
  .orderBy('created_at', 'DESC')
  .limit(10);

const { query, params } = qb.build();
```

### 2. Async Error Handler

```javascript
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
const asyncHandler = require('../utils/asyncHandler');

router.get('/products', asyncHandler(async (req, res) => {
  const products = await getProducts();
  res.json(products);
}));
```

### 3. Caching Utility

```javascript
class Cache {
  constructor(ttl = 3600) {
    this.ttl = ttl;
    this.cache = new Map();
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      expires: Date.now() + this.ttl * 1000
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  clear() {
    this.cache.clear();
  }
}

module.exports = Cache;

// Usage
const cache = new Cache(60); // 60 second TTL

app.get('/products', (req, res) => {
  const cached = cache.get('products');
  if (cached) return res.json(cached);
  
  const products = getFromDatabase();
  cache.set('products', products);
  
  res.json(products);
});
```

## Best Practices

1. **Separation of Concerns** - Keep utilities focused
2. **Reusability** - Functions should be generic
3. **Error Handling** - Wrap utilities with try-catch
4. **Documentation** - Comment complex logic
5. **Testing** - Write unit tests for utilities
6. **Performance** - Optimize frequently-used functions
7. **Naming** - Use clear, descriptive names
8. **Type Safety** - Use JSDoc or TypeScript

## Export Pattern

```javascript
module.exports = {
  apiResponse: require('./apiResponse'),
  constants: require('./constants'),
  database: require('./database'),
  validators: require('./validators'),
  asyncHandler: require('./asyncHandler')
};

// Usage
const { apiResponse, constants } = require('../utils');
```

## Directory Structure

```
backend/src/utils/
├── apiResponse.js         # Standard response formatting
├── constants.js           # Application constants
├── database.js            # Database utilities
├── validators.js          # Validation functions
├── asyncHandler.js        # Error handling wrapper
├── cache.js               # Caching utility
├── logger.js              # Logging utility
└── dateTime.js            # Date/time utilities
```

## Common Utilities Summary

| Utility | Purpose |
|---------|---------|
| apiResponse.js | Standardized JSON responses |
| constants.js | Enums and constants |
| database.js | SQL query builders |
| validators.js | Input validation |
| asyncHandler.js | Error wrapping |
| cache.js | In-memory caching |
| logger.js | Application logging |
| dateTime.js | Date formatting/parsing |

## Integration Example

```javascript
// Controller example using utilities
const { asyncHandler } = require('../utils');
const { success, error } = require('../utils/apiResponse');
const { PRODUCT_STATUS, HTTP_STATUS } = require('../utils/constants');
const { hasRequiredFields, isValidDecimal } = require('../utils/validators');

exports.createProduct = asyncHandler(async (req, res) => {
  const requiredFields = ['name', 'price', 'quantity'];
  
  if (!hasRequiredFields(req.body, requiredFields)) {
    return res.status(HTTP_STATUS.BAD_REQUEST)
      .json(error('Missing required fields'));
  }
  
  if (!isValidDecimal(req.body.price, 2)) {
    return res.status(HTTP_STATUS.BAD_REQUEST)
      .json(error('Invalid price format'));
  }
  
  const product = await Product.create({
    ...req.body,
    status: PRODUCT_STATUS.ACTIVE
  });
  
  res.status(HTTP_STATUS.CREATED)
    .json(success(product, 'Product created successfully'));
});
```
