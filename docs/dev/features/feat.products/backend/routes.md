# Products Routes

## Purpose
Defines API endpoints for product operations and applies route-specific middleware.

## File Location
`backend/src/routes/products.routes.js`

## Route Definitions

### GET /api/products
List all products with pagination and search.

**Middleware Chain:**
1. `cors()` - CORS headers
2. `express.json()` - Parse JSON body
3. `requestLogger` - Log request
4. Route handler

**Query Parameters:**
```javascript
{
  page: string | number,      // Converts to number
  limit: string | number,     // Converts to number
  search: string              // Optional search term
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: Product[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

**Example Request:**
```
GET /api/products?page=1&limit=10&search=laptop
```

---

### GET /api/products/:id
Get single product details.

**Path Parameters:**
```javascript
{
  id: string      // Converts to number in controller
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: Product
}
```

**Possible Errors:**
- `404 Not Found` - Product doesn't exist
- `500 Server Error` - Database error

**Example Request:**
```
GET /api/products/5
```

---

### POST /api/products
Create a new product with optional image upload.

**Middleware Chain:**
1. `upload.single('image')` - Multer file upload
2. `validateProducts` - Custom validator
3. Route handler

**Request Content-Type:**
```
multipart/form-data
```

**Body Data Types:**
```javascript
{
  name: string,                 // Required
  category: string,             // Required
  description: string | null,   // Optional
  unit: string,                 // Required
  rate: number | string,        // Required (will parse to number)
  rate_unit: string,            // Required
  min_stock_level: number | string,  // Optional
  max_stock_level: number | string,  // Optional
  image: File                   // Optional, multipart file
}
```

**File Data (if image provided):**
```javascript
req.file = {
  fieldname: "image",
  originalname: string,         // Original filename
  encoding: string,
  mimetype: string,             // "image/jpeg", "image/png", "image/gif", "image/webp"
  size: number,                 // Bytes
  buffer: Buffer,               // Raw file bytes
  destination: string,          // Storage path (memory in this case)
  filename: string
}
```

**Response (201 Created):**
```javascript
{
  success: boolean,
  message: string,
  data: {
    product_id: number,
    name: string,
    category: string,
    unit: string,
    rate: number,
    rate_unit: string,
    created_at: Date
  }
}
```

**Validation Rules (from validateProducts middleware):**
```javascript
{
  name: {
    required: true,
    type: string
  },
  category: {
    required: true,
    type: string
  },
  unit: {
    required: true,
    type: string
  },
  rate: {
    required: true,
    type: number | string    // Will be parsed to number
  },
  rate_unit: {
    required: true,
    type: string
  }
}
```

**File Validation (Multer):**
```javascript
{
  limits: {
    fileSize: 5 * 1024 * 1024   // 5MB max
  },
  fileFilter: (req, file, cb) => {
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"]
  }
}
```

**Possible Errors:**
- `400 Bad Request` - Missing required fields or invalid file type
- `413 Payload Too Large` - File exceeds 5MB
- `500 Server Error` - Database error

**Example Request (using fetch):**
```javascript
const formData = new FormData();
formData.append('name', 'Laptop');
formData.append('category', 'Electronics');
formData.append('unit', 'unit');
formData.append('rate', 999.99);
formData.append('rate_unit', 'USD');
formData.append('image', fileInput.files[0]);

fetch('/api/products', {
  method: 'POST',
  body: formData
});
```

---

### PUT /api/products/:id
Update an existing product.

**Middleware Chain:**
1. `upload.single('image')` - Multer file upload
2. `validateProducts` - Custom validator
3. Route handler

**Path Parameters:**
```javascript
{
  id: string      // Converts to number
}
```

**Body Data Types (all optional):**
```javascript
{
  name: string | undefined,
  category: string | undefined,
  description: string | null | undefined,
  unit: string | undefined,
  rate: number | string | undefined,
  rate_unit: string | undefined,
  min_stock_level: number | string | undefined,
  max_stock_level: number | string | undefined,
  image: File | undefined       // Optional replacement image
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: Product
}
```

**Possible Errors:**
- `404 Not Found` - Product doesn't exist
- `400 Bad Request` - Invalid data
- `500 Server Error` - Database error

**Example Request:**
```
PUT /api/products/5
Content-Type: multipart/form-data

{
  name: "Laptop Pro",
  rate: 1299.99,
  image: <new image file>
}
```

---

### DELETE /api/products/:id
Delete a product.

**Path Parameters:**
```javascript
{
  id: string      // Converts to number
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: {
    product_id: number,
    name: string,
    deleted: boolean
  }
}
```

**Possible Errors:**
- `404 Not Found` - Product doesn't exist
- `500 Server Error` - Database error (e.g., FK constraints)

**Example Request:**
```
DELETE /api/products/5
```

---

## Middleware Execution Order

```
Request arrives
  ↓
1. CORS middleware (global) - Check origin, add headers
  ↓
2. JSON parser (global) - Parse application/json body
  ↓
3. URL parser (global) - Parse URL encoded body
  ↓
4. Request logger (global) - Log request details
  ↓
5. Attach DB to request (global) - req.db = connection
  ↓
6. Route matching - Match to /api/products/* path
  ↓
7. Multer middleware (route-specific) - Process file upload
  ↓
8. Validator middleware (route-specific) - Validate input data
  ↓
9. Controller handler - Execute business logic
  ↓
10. Response sent to client
```

---

## HTTP Status Codes Reference

```javascript
{
  200: "OK - Request successful",
  201: "Created - Resource created successfully",
  400: "Bad Request - Invalid input data",
  404: "Not Found - Resource doesn't exist",
  413: "Payload Too Large - File exceeds size limit",
  500: "Internal Server Error - Server error"
}
```

---

## Error Response Format

All errors returned as:
```javascript
{
  success: false,
  message: string,           // Human-readable error message
  error: string | undefined  // Stack trace (only in development)
}
```

---

## Dependencies
- `multer` - File upload handling
- `express.Router` - Route definition
- `productsController` - Request handlers
- `validateProducts` - Input validation middleware
