# Architecture & Component Communication - Storium IMS

## Overview

This document explains the architecture of the Storium Inventory Management System, focusing on how all components communicate with each other across the frontend, backend, and database layers.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          STORIUM IMS ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────────────┘

                            FRONTEND (React 19)
    ┌──────────────────────────────────────────────────────────────────┐
    │                                                                  │
    │  Pages (ProductsPage, AlertsPage, etc.)                         │
    │    ↓                                                             │
    │  Components (DataTable, Forms, Charts)                          │
    │    ↓                                                             │
    │  Hooks (useProducts, useAlerts)                                 │
    │    ↓                                                             │
    │  Handlers (productsHandlers, alertsHandlers)                    │
    │    ↓                                                             │
    │  API Layer (productsAPI.js) ──┐                                │
    │                               │                                │
    └───────────────────────────────┼────────────────────────────────┘
                                    │
                        HTTP/REST/JSON (Axios)
                                    │
                                    ↓
    ┌──────────────────────────────────────────────────────────────────┐
    │                    BACKEND (Node.js/Express)                     │
    │                                                                  │
    │  Routes (/api/products, /api/alerts, etc.)                      │
    │    ↓                                                             │
    │  Middleware (Logger, Validators, Error Handler)                 │
    │    ↓                                                             │
    │  Controllers (productsController.js)                            │
    │    ↓                                                             │
    │  Services (productsService.js)                                  │
    │    ↓                                                             │
    │  Models (productsModel.js)                                      │
    │    ↓                                                             │
    │  Database Config (database.js)                                  │
    │                                                                  │
    └──────────────────────────────────────────────────────────────────┘
                                    │
                        SQL Queries (mysql2/promise)
                                    │
                                    ↓
    ┌──────────────────────────────────────────────────────────────────┐
    │                      DATABASE (MySQL)                            │
    │                                                                  │
    │  Tables (products, stocks, transactions, alerts, etc.)          │
    │  Indexes, Constraints, Triggers                                 │
    │  Stored Procedures (if any)                                     │
    │                                                                  │
    └──────────────────────────────────────────────────────────────────┘
```

---

## Component Communication Flow

### 1. Frontend to Backend Communication

#### The Flow: Page → Component → Hook → Handler → API → Backend

```
ProductsPage.jsx
    │
    ├─ useProducts() [Custom Hook]
    │   └─ Manages state: products, loading, error, pagination
    │
    ├─ productsHandlers.js [Business Logic]
    │   └─ Handles: create, update, delete operations
    │
    └─ productsAPI.js [API Communication]
        └─ Makes HTTP requests to backend
            └─ /api/products
```

#### Detailed Example: Fetching Products

```javascript
// 1. USER INTERACTION (Page)
// ProductsPage.jsx
function ProductsPage() {
  const { products, loading, loadProducts } = useProducts();
  
  useEffect(() => {
    loadProducts(); // Step 1: Trigger data fetch
  }, []);
}

// 2. STATE MANAGEMENT (Hook)
// useProducts.js
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProducts = async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    try {
      // Step 2: Call handler
      const data = await productsHandlers.fetchProducts(page, limit, search);
      setProducts(data.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, loadProducts };
};

// 3. BUSINESS LOGIC (Handler)
// productsHandlers.js
export const productsHandlers = {
  fetchProducts: async (page, limit, search) => {
    // Step 3: Call API
    const response = await productsAPI.getAll(page, limit, search);
    
    // Validation, transformation, etc.
    return {
      products: response.data,
      pagination: response.pagination
    };
  }
};

// 4. API COMMUNICATION (API Utility)
// productsAPI.js
export const productsAPI = {
  getAll: async (page = 1, limit = 10, search = '') => {
    // Step 4: Make HTTP request to backend
    const response = await api.get('/products', {
      params: { page, limit, search }
    });
    return response.data;
  }
};

// Step 5: HTTP Request sent to backend
// GET http://localhost:3001/api/products?page=1&limit=10&search=
```

---

### 2. Backend Request Processing

#### The Flow: Route → Middleware → Controller → Service → Model → Database

```
HTTP Request arrives at /api/products
    │
    ├─ Router matches route
    │   GET /api/products → productsController.getAllProducts()
    │
    ├─ Middleware Chain (Order matters!)
    │   1. CORS middleware
    │   2. JSON parser
    │   3. Request logger
    │   4. Validators (if POST/PUT)
    │   5. Error handler
    │
    ├─ Controller
    │   productsController.getAllProducts(req, res)
    │   └─ Extracts query params
    │   └─ Calls service
    │   └─ Returns response
    │
    ├─ Service
    │   productsService.getAllPaginated(page, limit, search)
    │   └─ Business logic
    │   └─ Calls model/query builder
    │   └─ Returns formatted data
    │
    ├─ Model/Query
    │   Database query execution
    │   └─ Executes SQL
    │
    └─ Response sent back to frontend
```

#### Detailed Example: GET Products Request

```javascript
// ROUTE DEFINITION
// routes/products.routes.js
const router = express.Router();
router.get('/', productsController.getAllProducts);

// MIDDLEWARE PROCESSING
// server.js
app.use(express.json()); // Parse JSON
app.use(requestLogger);  // Log requests
app.use(errorHandler);   // Handle errors

// CONTROLLER
// controllers/products.controller.js
const productsController = {
  getAllProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;        // Extract params
      const limit = parseInt(req.query.limit) || 10;
      const search = (req.query.search || '').trim();

      // Call service
      const { products, pagination } = await productsService.getAllPaginated(
        page, 
        limit, 
        search
      );

      // Return formatted response
      return res.json(apiResponse.paginatedResponse(products, pagination));
    } catch (error) {
      return res.status(500).json(apiResponse.errorResponse(error.message));
    }
  }
};

// SERVICE
// services/products.service.js
const productsService = {
  getAllPaginated: async (page, limit, search) => {
    const offset = (page - 1) * limit;

    // Build query
    const whereClause = search 
      ? `WHERE name LIKE '%${search}%'` 
      : '';
    
    // Execute query
    const query = `
      SELECT * FROM products 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;

    const [products] = await connection.execute(query, [limit, offset]);
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const [{ total }] = await connection.execute(countQuery);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
};

// DATABASE EXECUTION
// MySQL receives: SELECT * FROM products LIMIT 10 OFFSET 0
// Returns: Array of product rows
```

---

### 3. Frontend Data Submission (POST/PUT)

#### Example: Create New Product

```
USER INTERACTION
    │
    ├─ ProductForm.jsx
    │   └─ Form input fields
    │   └─ handleSubmit() triggered
    │
    ├─ productsHandlers.createProduct(formData)
    │   └─ Validation
    │   └─ Transformation
    │   └─ API call
    │
    ├─ productsAPI.create(formData)
    │   └─ POST /api/products
    │   └─ FormData (for file upload)
    │
    └─ Backend receives request
        │
        ├─ Middleware chain
        │   └─ Multer (file upload)
        │   └─ Validators (validateProducts)
        │
        ├─ Controller
        │   └─ createProduct(req, res)
        │   └─ Extract form data
        │   └─ Call service
        │
        ├─ Service
        │   └─ createProduct(productData)
        │   └─ Business logic
        │   └─ INSERT query
        │
        ├─ Database
        │   └─ Insert row in products table
        │   └─ Return inserted ID
        │
        └─ Response sent back
            └─ Update frontend state
            └─ Show success/error message
```

**Frontend Code Example:**

```javascript
// ProductForm.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('name', form.name);
  formData.append('category', form.category);
  formData.append('unit', form.unit);
  formData.append('image', form.image); // File upload

  try {
    // Step 1: Call handler
    await productsHandlers.createProduct(formData);
    
    // Step 2: Reload products list
    loadProducts();
    
    // Step 3: Show success message
    toast.success('Product created successfully!');
  } catch (error) {
    toast.error(error.message);
  }
};

// productsHandlers.js
export const productsHandlers = {
  createProduct: async (formData) => {
    // Step 2: Validate (client-side)
    if (!formData.get('name')) {
      throw new Error('Product name is required');
    }

    // Step 3: Call API
    const response = await productsAPI.create(formData);
    return response.data;
  }
};

// productsAPI.js
export const productsAPI = {
  create: async (formData) => {
    // Step 4: POST request with FormData
    const response = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
```

**Backend Code Example:**

```javascript
// routes/products.routes.js
router.post(
  '/', 
  upload.single('image'),         // Multer middleware (file upload)
  validateProducts,                // Validator middleware
  productsController.createProduct // Controller
);

// middleware/special_validators/validateProducts.js
const validateProducts = (req, res, next) => {
  const { name, category, unit } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  
  next(); // Pass to controller
};

// controllers/products.controller.js
const productsController = {
  createProduct: async (req, res) => {
    try {
      // Extract form data
      const { name, category, unit } = req.body;
      const imageFile = req.file; // From multer

      // Call service
      const newProduct = await productsService.createProduct({
        name,
        category,
        unit,
        image: imageFile
      });

      // Return response
      return res.status(201).json(apiResponse.successResponse(newProduct));
    } catch (error) {
      return res.status(500).json(apiResponse.errorResponse(error.message));
    }
  }
};

// services/products.service.js
const productsService = {
  createProduct: async (productData) => {
    const { name, category, unit, image } = productData;

    // Convert image to Base64 for storage
    const imageBase64 = image ? image.buffer.toString('base64') : null;

    // INSERT query
    const query = `
      INSERT INTO products (name, category, unit, image_data, image_mime_type, created_at)
      VALUES (?, ?, ?, FROM_BASE64(?), ?, NOW())
    `;

    const [result] = await connection.execute(query, [
      name,
      category,
      unit,
      imageBase64,
      image?.mimetype || 'image/jpeg'
    ]);

    return {
      product_id: result.insertId,
      name,
      category,
      unit
    };
  }
};
```

---

## Component Breakdown

### Frontend Components

#### Pages
- **Purpose:** Main screen containers for different features
- **Examples:** ProductsPage, AlertsPage, RacksPage
- **Responsibilities:**
  - Display UI layout
  - Manage page-level state
  - Coordinate between components
  - Handle user interactions

```javascript
// ProductsPage.jsx
function ProductsPage() {
  // Page-level state
  const { products, loading } = useProducts();

  return (
    <div>
      <Header title="Products" />
      <DataTable data={products} />
      <ProductForm />
    </div>
  );
}
```

#### Components
- **Purpose:** Reusable UI pieces
- **Examples:** DataTable, ProductForm, Chart, Button
- **Responsibilities:**
  - Render UI elements
  - Handle local interactions
  - Receive props from parent
  - Emit events to parent

```javascript
// ProductForm.jsx - Reusable component
function ProductForm({ product, onSubmit }) {
  const [form, setForm] = useState(product || {});

  return (
    <form onSubmit={(e) => onSubmit(e, form)}>
      <input 
        value={form.name} 
        onChange={(e) => setForm({...form, name: e.target.value})}
      />
      <button type="submit">Save</button>
    </form>
  );
}
```

#### Hooks
- **Purpose:** Reusable logic and state management
- **Examples:** useProducts, useAlerts, useTableSearch
- **Responsibilities:**
  - Manage state (useState)
  - Handle side effects (useEffect)
  - Provide data fetching logic
  - Return state and methods

```javascript
// useProducts.js
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    const data = await productsHandlers.fetchProducts();
    setProducts(data);
    setLoading(false);
  };

  return { products, loading, loadProducts };
};
```

#### Handlers
- **Purpose:** Business logic and API orchestration
- **Examples:** productsHandlers, alertsHandlers
- **Responsibilities:**
  - Validate data
  - Transform data
  - Call API methods
  - Error handling

```javascript
// productsHandlers.js
export const productsHandlers = {
  fetchProducts: async (page, limit, search) => {
    const response = await productsAPI.getAll(page, limit, search);
    return response.data;
  },

  createProduct: async (formData) => {
    // Validation
    if (!formData.name) throw new Error('Name required');
    
    // API call
    const response = await productsAPI.create(formData);
    
    // Return data
    return response.data;
  }
};
```

#### API Layer
- **Purpose:** HTTP communication with backend
- **Files:** productsAPI.js, alertsAPI.js, etc.
- **Responsibilities:**
  - Make HTTP requests
  - Handle response parsing
  - Error handling

```javascript
// productsAPI.js
export const productsAPI = {
  getAll: async (page = 1, limit = 10, search = '') => {
    const response = await api.get('/products', {
      params: { page, limit, search }
    });
    return response.data;
  },

  create: async (formData) => {
    const response = await api.post('/products', formData);
    return response.data;
  },

  update: async (id, formData) => {
    const response = await api.put(`/products/${id}`, formData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};
```

---

### Backend Components

#### Routes
- **Purpose:** Define API endpoints
- **File:** routes/*.routes.js
- **Responsibilities:**
  - Map HTTP methods to controllers
  - Apply route-specific middleware
  - Define URL patterns

```javascript
// routes/products.routes.js
const router = express.Router();

router.get('/', productsController.getAllProducts);           // GET /api/products
router.get('/:id', productsController.getProductById);       // GET /api/products/:id
router.post('/', upload.single('image'), productsController.createProduct);
router.put('/:id', upload.single('image'), productsController.updateProduct);
router.delete('/:id', productsController.deleteProduct);

export default router;
```

#### Middleware
- **Purpose:** Process requests before reaching controllers
- **Types:**
  1. **Global Middleware** (applied to all routes)
  2. **Route-specific Middleware** (applied to specific routes)
  3. **Error Handling Middleware**

**Global Middleware Chain:**

```javascript
// server.js - Middleware order MATTERS!
app.use(cors());                    // 1. Enable CORS
app.use(express.json());            // 2. Parse JSON body
app.use(requestLogger);             // 3. Log requests
app.use((req, res, next) => {       // 4. Attach DB
  req.db = db;
  next();
});
```

**Route-specific Middleware:**

```javascript
// routes/products.routes.js
router.post(
  '/',
  upload.single('image'),    // Multer - handle file upload
  validateProducts,          // Validator - validate data
  productsController.create  // Controller
);
```

**Example Middleware:**

```javascript
// middleware/logger.js
const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
};

// middleware/special_validators/validateProducts.js
const validateProducts = (req, res, next) => {
  const { name, unit } = req.body;
  
  if (!name || !unit) {
    return res.status(400).json({ message: 'Name and unit are required' });
  }
  
  next(); // Proceed to controller
};

// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};
```

#### Controllers
- **Purpose:** Handle HTTP requests and responses
- **File:** controllers/*.controller.js
- **Responsibilities:**
  - Extract request data (params, body, query)
  - Call service methods
  - Format and send responses

```javascript
// controllers/products.controller.js
const productsController = {
  // GET /api/products?page=1&limit=10
  getAllProducts: async (req, res) => {
    try {
      // Step 1: Extract request data
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = (req.query.search || '').trim();

      // Step 2: Call service
      const { products, pagination } = await productsService.getAllPaginated(
        page, limit, search
      );

      // Step 3: Send response
      return res.json(apiResponse.paginatedResponse(products, pagination));
    } catch (error) {
      return res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  // POST /api/products
  createProduct: async (req, res) => {
    try {
      // Extract form data
      const { name, category, unit } = req.body;
      const imageFile = req.file;

      // Call service
      const newProduct = await productsService.createProduct({
        name, category, unit, image: imageFile
      });

      // Return response
      return res.status(201).json(apiResponse.successResponse(newProduct));
    } catch (error) {
      return res.status(500).json(apiResponse.errorResponse(error.message));
    }
  }
};

export default productsController;
```

#### Services
- **Purpose:** Business logic and data operations
- **File:** services/*.service.js
- **Responsibilities:**
  - Implement business rules
  - Execute database queries
  - Transform and validate data
  - Return formatted results

```javascript
// services/products.service.js
const productsService = {
  // Fetch all products with pagination
  getAllPaginated: async (page, limit, search) => {
    const offset = (page - 1) * limit;

    // Build WHERE clause for search
    const whereClause = search 
      ? `WHERE (name LIKE ? OR category LIKE ? OR description LIKE ?)`
      : '';

    const searchParams = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];

    // Execute count query
    const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const [{ total }] = await connection.execute(countQuery, searchParams);

    // Execute data query
    const dataQuery = `
      SELECT * FROM products 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const [products] = await connection.execute(
      dataQuery,
      [...searchParams, limit, offset]
    );

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Create new product
  createProduct: async (productData) => {
    const { name, category, unit, image } = productData;

    const query = `
      INSERT INTO products (name, category, unit, image_data, created_at)
      VALUES (?, ?, ?, FROM_BASE64(?), NOW())
    `;

    const [result] = await connection.execute(query, [
      name,
      category,
      unit,
      image ? image.buffer.toString('base64') : null
    ]);

    return {
      product_id: result.insertId,
      name,
      category,
      unit
    };
  }
};

export default productsService;
```

#### Models
- **Purpose:** Database query builders/executors
- **File:** models/*.model.js
- **Responsibilities:**
  - Execute SQL queries
  - Handle database operations
  - Return raw data from DB

```javascript
// models/products.model.js
const productsModel = {
  findAll: async () => {
    const [rows] = await connection.execute('SELECT * FROM products');
    return rows;
  },

  findById: async (id) => {
    const [rows] = await connection.execute(
      'SELECT * FROM products WHERE product_id = ?',
      [id]
    );
    return rows[0];
  },

  create: async (productData) => {
    const query = `INSERT INTO products (name, category, unit) VALUES (?, ?, ?)`;
    const [result] = await connection.execute(query, [
      productData.name,
      productData.category,
      productData.unit
    ]);
    return result;
  }
};

export default productsModel;
```

---

## Data Flow Examples

### Example 1: Fetching Products List

```
┌─────────────────────────┐
│ ProductsPage.jsx        │
│ useProducts()           │
│ loadProducts()          │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ productsHandlers.js     │
│ fetchProducts(page,     │
│   limit, search)        │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ productsAPI.js          │
│ getAll(page, limit,     │
│   search)               │
│ GET /api/products       │
└────────────┬────────────┘
             │
       [HTTP Request]
             │
             ▼
┌──────────────────────────────────────┐
│ Backend: GET /api/products           │
│                                      │
│ routes → middlewares → controller   │
│   productsController.getAllProducts │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Service: productsService             │
│ .getAllPaginated(page, limit, search)│
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Database Query                       │
│ SELECT * FROM products               │
│ WHERE name LIKE '%search%'           │
│ LIMIT 10 OFFSET 0                    │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Response sent back to frontend       │
│ {                                    │
│   data: [...products],               │
│   pagination: {...}                  │
│ }                                    │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Frontend Updates                     │
│ setProducts(data)                    │
│ Re-render component with data        │
└──────────────────────────────────────┘
```

### Example 2: Creating a Product (POST with File)

```
┌──────────────────────────┐
│ ProductForm.jsx          │
│ handleSubmit()           │
│ FormData with image      │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────────┐
│ productsHandlers.js          │
│ createProduct(formData)      │
│ - Validation               │
│ - Transformation           │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ productsAPI.js               │
│ create(formData)             │
│ POST /api/products           │
│ multipart/form-data          │
└────────────┬─────────────────┘
             │
       [HTTP POST Request]
             │
             ▼
┌──────────────────────────────────────┐
│ Backend Route                        │
│ POST /api/products                   │
│                                      │
│ Middlewares (in order):              │
│ 1. multer - Extract image file       │
│ 2. validateProducts - Validate data  │
│ 3. controller - Process request      │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ productsController.createProduct()   │
│                                      │
│ Extract: name, category, unit,       │
│          req.file (image buffer)     │
│ Call: productsService.createProduct()│
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ productsService.createProduct()      │
│                                      │
│ 1. Convert image to Base64          │
│ 2. Build INSERT query               │
│ 3. Execute: INSERT INTO products... │
│ 4. Return: new product with ID      │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Database                             │
│                                      │
│ INSERT INTO products (name,          │
│   category, unit, image_data)        │
│ VALUES (?, ?, ?, FROM_BASE64(?))    │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Response sent to frontend            │
│ Status: 201 Created                  │
│ {                                    │
│   success: true,                     │
│   data: { product_id, name, ... }    │
│ }                                    │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Frontend (productsHandlers)          │
│ - Success toast                      │
│ - Reload products list               │
│ - Close form modal                   │
│ - Update UI                          │
└──────────────────────────────────────┘
```

---

## Request/Response Format

### Standard API Response Format

All API responses follow a consistent format:

```javascript
// Success Response (GET)
{
  success: true,
  message: "Products retrieved successfully",
  data: [
    { product_id: 1, name: "Product A", ... },
    { product_id: 2, name: "Product B", ... }
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    pages: 10
  }
}

// Success Response (POST/PUT)
{
  success: true,
  message: "Product created successfully",
  data: {
    product_id: 3,
    name: "Product C",
    category: "Electronics"
  }
}

// Error Response
{
  success: false,
  message: "Product not found",
  error: "Product with ID 999 does not exist"
}
```

### Common HTTP Status Codes

```
200 OK              - Request successful, data returned
201 Created         - Resource created successfully
400 Bad Request     - Invalid request data
401 Unauthorized    - Authentication required
403 Forbidden       - Not authorized to access
404 Not Found       - Resource not found
500 Server Error    - Internal server error
```

---

## Database Communication

### Query Execution Flow

```
Service Method
    │
    ├─ Build SQL query with placeholders
    │   SELECT * FROM products WHERE name LIKE ? LIMIT ?
    │
    ├─ Prepare parameters
    │   ["%search%", 10]
    │
    ├─ Execute via mysql2/promise
    │   connection.execute(query, params)
    │
    ├─ Database processes query
    │   │
    │   ├─ Parse SQL
    │   ├─ Check indexes
    │   ├─ Execute
    │   └─ Return rows
    │
    └─ Service receives [rows] from connection pool
        │
        ├─ Format results
        ├─ Calculate pagination
        └─ Return to controller
```

### Connection Pooling

```javascript
// config/database.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,      // Max 10 simultaneous connections
  queueLimit: 0             // Unlimited queue
});

// Every service method uses:
const [rows] = await pool.execute(query, params);

// Connections are reused from pool
// No new connection per request
```

---

## Error Handling

### Frontend Error Handling

```javascript
// hooks/useProducts.js
const loadProducts = async () => {
  try {
    setLoading(true);
    const data = await productsHandlers.fetchProducts();
    setProducts(data);
  } catch (error) {
    setError(error.message);
    toast.error('Failed to load products');
  } finally {
    setLoading(false);
  }
};
```

### Backend Error Handling

```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error details:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Use in controllers
try {
  const result = await productsService.getAllPaginated(...);
  res.json(result);
} catch (error) {
  // This error will be caught by errorHandler middleware
  next(error);
}
```

---

## Component Dependency Graph

```
Pages (Root)
├─ ProductsPage
│  ├─ useProducts (Hook)
│  │  └─ productsHandlers (Business Logic)
│  │     └─ productsAPI (HTTP)
│  │        └─ Axios instance
│  ├─ ProductForm (Component)
│  └─ DataTable (Component)
│
├─ AlertsPage
│  ├─ useAlerts (Hook)
│  │  └─ alertsHandlers
│  │     └─ alertsAPI
│  ├─ AlertForm (Component)
│  └─ AlertList (Component)
│
└─ RacksPage
   ├─ useRacks (Hook)
   │  └─ racksHandlers
   │     └─ racksAPI
   └─ RackVisualization (Component)
```

---

## Summary

The Storium IMS follows a **three-tier architecture**:

1. **Frontend Tier (React):** User interface and client-side logic
   - Pages → Components → Hooks → Handlers → API calls

2. **Backend Tier (Express):** Server logic and business operations
   - Routes → Middleware → Controllers → Services → Database

3. **Data Tier (MySQL):** Persistent storage and data management
   - Tables, indexes, constraints, triggers

**Communication Flow:**
```
User Action → Component → Hook → Handler → API → Route → Middleware → Controller → Service → Database → Response → Component Update
```

All components are loosely coupled, making the system maintainable, scalable, and testable.
