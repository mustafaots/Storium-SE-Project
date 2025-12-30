# Products Model

## Purpose
Executes raw SQL queries against the database. Acts as the data access layer for product operations.

## File Location
`backend/src/models/products.model.js`

## Key Methods

### findAll()
Fetches all products without pagination.

**Input Data Types:**
```javascript
// No parameters
```

**SQL Query:**
```sql
SELECT * FROM products ORDER BY created_at DESC
```

**Output Data Types:**
```javascript
Promise<Product[]>

Product = {
  product_id: number,
  name: string,
  category: string,
  description: string | null,
  unit: string,
  rate: number,            // Decimal(10,2)
  rate_unit: string,
  min_stock_level: number,
  max_stock_level: number,
  image_data: Buffer | null,
  image_mime_type: string | null,
  created_at: Date,
  updated_at: Date | null
}
```

---

### findById(id)
Retrieves a single product by ID.

**Input Data Types:**
```javascript
id: number  // Product ID
```

**SQL Query (Parameterized):**
```sql
SELECT * FROM products WHERE product_id = ?
Parameters: [id]
```

**Output Data Types:**
```javascript
Promise<Product | undefined>  // Single product or undefined if not found
```

---

### findByCategory(category)
Finds all products in a specific category.

**Input Data Types:**
```javascript
category: string
```

**SQL Query:**
```sql
SELECT * FROM products WHERE category = ? ORDER BY name ASC
Parameters: [category]
```

**Output Data Types:**
```javascript
Promise<Product[]>
```

---

### create(productData)
Inserts a new product into the database.

**Input Data Types:**
```javascript
productData = {
  name: string,
  category: string,
  description: string | null,
  unit: string,
  rate: number,
  rate_unit: string,
  min_stock_level: number,
  max_stock_level: number,
  image_data: string | null,        // Base64 encoded
  image_mime_type: string | null
}
```

**SQL Query:**
```sql
INSERT INTO products 
(name, category, description, unit, rate, rate_unit, min_stock_level, max_stock_level, image_data, image_mime_type, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, FROM_BASE64(?), ?, NOW())

Parameters: [
  productData.name,
  productData.category,
  productData.description,
  productData.unit,
  productData.rate,
  productData.rate_unit,
  productData.min_stock_level,
  productData.max_stock_level,
  productData.image_data,
  productData.image_mime_type
]
```

**Output Data Types:**
```javascript
Promise<{
  insertId: number,         // Auto-generated product_id
  affectedRows: number      // Should be 1
}>
```

---

### update(id, productData)
Updates an existing product.

**Input Data Types:**
```javascript
id: number

productData = {
  name: string | undefined,
  category: string | undefined,
  description: string | null | undefined,
  unit: string | undefined,
  rate: number | undefined,
  rate_unit: string | undefined,
  min_stock_level: number | undefined,
  max_stock_level: number | undefined,
  image_data: string | null | undefined,
  image_mime_type: string | null | undefined
}
```

**SQL Query (Dynamic based on provided fields):**
```sql
UPDATE products 
SET [dynamic fields based on input]
WHERE product_id = ?
```

**Example:**
```sql
UPDATE products 
SET name=?, category=?, rate=?, updated_at=NOW()
WHERE product_id=?
Parameters: [productData.name, productData.category, productData.rate, id]
```

**Output Data Types:**
```javascript
Promise<{
  affectedRows: number,     // 0 or 1
  changedRows: number,      // Number of actually changed rows
  warningCount: number
}>
```

---

### delete(id)
Deletes a product (with CASCADE constraints).

**Input Data Types:**
```javascript
id: number
```

**SQL Query:**
```sql
DELETE FROM products WHERE product_id = ?
Parameters: [id]

-- Cascading deletes (via FK constraints):
-- DELETE FROM stocks WHERE product_id = id
-- DELETE FROM transactions WHERE product_id = id
-- DELETE FROM product_sources WHERE product_id = id
```

**Output Data Types:**
```javascript
Promise<{
  affectedRows: number,     // Number of deleted rows (usually 1)
  warningCount: number
}>
```

---

### getStockByProduct(productId)
Gets total stock quantity for a product across all slots.

**Input Data Types:**
```javascript
productId: number
```

**SQL Query:**
```sql
SELECT 
  product_id,
  SUM(quantity) as total_stock,
  COUNT(slot_id) as slots_occupied,
  MIN(quantity) as min_in_slot,
  MAX(quantity) as max_in_slot
FROM stocks
WHERE product_id = ?
GROUP BY product_id
Parameters: [productId]
```

**Output Data Types:**
```javascript
Promise<{
  product_id: number,
  total_stock: number,
  slots_occupied: number,
  min_in_slot: number,
  max_in_slot: number
} | undefined>
```

---

### getProductsWithLowStock(reorderLevel)
Finds products below their minimum stock level.

**Input Data Types:**
```javascript
reorderLevel: number  // Optional, uses product.min_stock_level if not provided
```

**SQL Query:**
```sql
SELECT 
  p.product_id,
  p.name,
  p.min_stock_level,
  COALESCE(SUM(s.quantity), 0) as current_stock,
  (p.min_stock_level - COALESCE(SUM(s.quantity), 0)) as shortage
FROM products p
LEFT JOIN stocks s ON p.product_id = s.product_id
GROUP BY p.product_id
HAVING current_stock < p.min_stock_level
ORDER BY shortage DESC
```

**Output Data Types:**
```javascript
Promise<Array<{
  product_id: number,
  name: string,
  min_stock_level: number,
  current_stock: number,
  shortage: number
}>>
```

---

## Database Table Definition

### Products Table Schema

```sql
CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  unit VARCHAR(50) NOT NULL,                    -- e.g., "kg", "box", "unit"
  rate DECIMAL(10,2),                           -- Unit price
  rate_unit VARCHAR(50),                        -- Currency/unit code
  min_stock_level INT DEFAULT 0,
  max_stock_level INT DEFAULT 1000,
  image_data LONGBLOB,                          -- Binary image data
  image_mime_type VARCHAR(50),                  -- e.g., "image/jpeg"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_name (name),
  KEY idx_category (category),
  KEY idx_created_at (created_at)
);
```

---

## Connection Details

### Database Configuration
```javascript
// Uses mysql2/promise connection pool
// Connection pooling configured in config/database.js
// - Host: process.env.DB_HOST (default: localhost)
// - User: process.env.DB_USER (default: root)
// - Database: process.env.DB_NAME (default: storium_ims)
// - Max connections: 10
```

### Query Execution Method
```javascript
// All queries use parameterized statements to prevent SQL injection
const [rows] = await connection.execute(query, parameters);
// Returns: [rows, fields] from mysql2/promise

// Returns as Promise that resolves to [rows, fields] tuple
```

---

## Error Handling

Common database errors handled:

```javascript
// Error Types
Error: {
  code: string,           // e.g., "ER_DUP_ENTRY", "ER_NO_REFERENCED_ROW"
  message: string,
  errno: number,
  sqlState: string,
  sqlMessage: string
}

// Common codes:
// "ER_DUP_ENTRY" - Duplicate key (e.g., duplicate product_id)
// "ER_NO_REFERENCED_ROW" - FK constraint violation
// "ER_ROW_IS_REFERENCED" - Cannot delete (FK references exist)
```

---

## Dependencies
- `config/database.js` - MySQL connection pool
- Requires: mysql2/promise driver
