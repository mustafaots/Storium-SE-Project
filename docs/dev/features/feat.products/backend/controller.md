# Products Controller

## Purpose
Handles HTTP requests and responses for product operations. Acts as the entry point for all product-related API calls.

## File Location
`backend/src/controllers/products.controller.js`

## Key Methods

### getAllProducts(req, res)
Fetches products with pagination and search support.

**Request Data Types:**
```javascript
req.query = {
  page: number,           // Page number (default: 1)
  limit: number,          // Items per page (default: 10, max: 100)
  search: string          // Search term for name, category, description
}
```

**Response Data Types:**
```javascript
{
  success: boolean,
  message: string,
  data: Product[],       // Array of product objects
  pagination: {
    page: number,
    limit: number,
    total: number,        // Total product count
    pages: number         // Total pages available
  }
}

// Individual Product type
Product = {
  product_id: number,
  name: string,
  category: string,
  description: string | null,
  unit: string,           // e.g., "kg", "box", "unit"
  rate: number,           // Unit price (decimal)
  rate_unit: string,      // Currency/unit designation
  image_data: string | null,  // Base64 encoded image
  image_mime_type: string | null,  // e.g., "image/jpeg"
  min_stock_level: number,
  max_stock_level: number,
  total_stock: number,    // Sum of all stocks
  supplier: string | null,  // Source name
  created_at: Date
}
```

**HTTP Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid page/limit parameters
- `500 Internal Server Error` - Database error

---

### getProductById(req, res)
Fetches a single product by ID with all associated data.

**Request Data Types:**
```javascript
req.params = {
  id: number  // Product ID
}
```

**Response Data Types:**
```javascript
{
  success: boolean,
  message: string,
  data: Product  // Single product object (see above)
}
```

**HTTP Status Codes:**
- `200 OK` - Product found
- `404 Not Found` - Product doesn't exist
- `500 Internal Server Error` - Database error

---

### createProduct(req, res)
Creates a new product with optional image upload.

**Request Data Types:**
```javascript
req.body = {
  name: string,                    // Product name (required)
  category: string,                // Product category (required)
  description: string | null,      // Optional description
  unit: string,                    // Measurement unit (required)
  rate: number,                    // Unit price (required)
  rate_unit: string,               // Currency/unit (required)
  min_stock_level: number,         // Minimum stock alert level
  max_stock_level: number          // Maximum capacity level
}

req.file = {
  fieldname: string,               // "image"
  originalname: string,            // Original filename
  encoding: string,
  mimetype: string,                // e.g., "image/jpeg", "image/png"
  size: number,                    // File size in bytes
  buffer: Buffer                   // Image file as bytes
}  // Optional, can be null if no file uploaded
```

**Response Data Types:**
```javascript
{
  success: boolean,
  message: string,
  data: {
    product_id: number,            // Generated ID
    name: string,
    category: string,
    unit: string,
    rate: number,
    rate_unit: string,
    created_at: Date
  }
}
```

**HTTP Status Codes:**
- `201 Created` - Product created successfully
- `400 Bad Request` - Validation error
- `500 Internal Server Error` - Database error

---

### updateProduct(req, res)
Updates an existing product with optional new image.

**Request Data Types:**
```javascript
req.params = {
  id: number  // Product ID to update
}

req.body = {
  name: string | undefined,
  category: string | undefined,
  description: string | null | undefined,
  unit: string | undefined,
  rate: number | undefined,
  rate_unit: string | undefined,
  min_stock_level: number | undefined,
  max_stock_level: number | undefined
}

req.file = {
  // Same as createProduct (optional)
}
```

**Response Data Types:**
```javascript
{
  success: boolean,
  message: string,
  data: Product  // Updated product object
}
```

**HTTP Status Codes:**
- `200 OK` - Updated successfully
- `404 Not Found` - Product doesn't exist
- `400 Bad Request` - Validation error
- `500 Internal Server Error` - Database error

---

### deleteProduct(req, res)
Deletes a product and cascades to related records.

**Request Data Types:**
```javascript
req.params = {
  id: number  // Product ID to delete
}
```

**Response Data Types:**
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

**HTTP Status Codes:**
- `200 OK` - Deleted successfully
- `404 Not Found` - Product doesn't exist
- `500 Internal Server Error` - Database error

---

## Error Handling

All errors are caught and formatted:

```javascript
try {
  // Operation
} catch (error) {
  return res.status(500).json(apiResponse.errorResponse(error.message));
}
```

## Middleware Chain

Products controller is accessed through:
```javascript
router.get('/', productsController.getAllProducts);
router.post('/', upload.single('image'), validateProducts, productsController.createProduct);
// Middlewares:
// 1. CORS (global)
// 2. JSON parser (global)
// 3. Logger (global)
// 4. Multer for file upload (route-specific)
// 5. Product validator (route-specific)
```

## Dependencies
- `services/products.service.js` - Business logic
- `utils/apiResponse.js` - Response formatting
- `utils/constants.js` - Configuration constants
- `middleware/special_validators/validateProducts.js` - Input validation
