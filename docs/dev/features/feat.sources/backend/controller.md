# Sources Controller, Service, and Model

## Purpose
Implements complete sources/suppliers management layer. Controllers handle HTTP requests, services implement business logic, and models manage database access.

## File Locations
- `backend/src/controllers/sources.controller.js`
- `backend/src/services/sources.service.js`
- `backend/src/models/sources.model.js`

---

## DATABASE SCHEMA

```sql
CREATE TABLE sources (
    source_id INT AUTO_INCREMENT PRIMARY KEY 
        COMMENT 'Unique supplier/source identifier',
    
    source_name VARCHAR(255) NOT NULL 
        COMMENT 'Supplier company name',
    
    contact_email VARCHAR(255) 
        COMMENT 'Contact email address',
    
    contact_phone VARCHAR(50) 
        COMMENT 'Contact phone number',
    
    address TEXT 
        COMMENT 'Supplier address',
    
    coordinates VARCHAR(255) 
        COMMENT 'GPS coordinates in "lat,lng" format',
    
    lead_time_days INT 
        COMMENT 'Typical delivery time in days',
    
    payment_terms VARCHAR(50) 
        COMMENT 'Payment terms (e.g., NET30, COD, Prepaid)',
    
    min_order_qty INT 
        COMMENT 'Minimum order quantity',
    
    is_preferred BOOLEAN DEFAULT FALSE 
        COMMENT 'Is this the preferred supplier',
    
    rating DECIMAL(3,2) 
        COMMENT 'Supplier rating (1-5 stars)',
    
    last_purchase_date DATE 
        COMMENT 'Date of last purchase',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_source_name (source_name),
    INDEX idx_is_preferred (is_preferred),
    INDEX idx_rating (rating)
);

-- Junction table for products and suppliers
CREATE TABLE product_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    source_id INT NOT NULL,
    cost_price DECIMAL(10,2),
    lead_time_days INT,
    is_preferred_supplier BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (source_id) REFERENCES sources(source_id) ON DELETE CASCADE,
    UNIQUE KEY uk_product_source (product_id, source_id)
);
```

---

## CONTROLLERS

### getAllSources(req, res)
Fetches all sources with pagination and search.

**Request Data Types:**
```javascript
req.query = {
  page: number,
  limit: number,
  search: string,
  preferred_only: boolean  // Optional filter
}
```

**Processing Steps:**
```
1. Extract & validate pagination
2. Extract & trim search term
3. Parse preferred_only filter
4. Call sourcesService.getAllPaginated()
5. Format data (date, phone)
6. Return paginated response
```

**Response Data Types:**
```javascript
{
  success: boolean,
  message: string,
  data: Source[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

**HTTP Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Database error

---

### getSourceById(req, res)
Fetches a single source by ID.

**Request Data Types:**
```javascript
req.params = {
  id: number  // Source ID
}
```

**Response Data Types:**
```javascript
{
  success: boolean,
  message: string,
  data: Source
}
```

---

### createSource(req, res)
Creates a new source.

**Request Data Types:**
```javascript
req.body = {
  source_name: string,
  contact_email: string | null,
  contact_phone: string | null,
  address: string | null,
  coordinates: string | null,
  lead_time_days: number | null,
  payment_terms: string | null,
  min_order_qty: number | null,
  is_preferred: boolean
}
```

**Validation Rules:**
```javascript
{
  source_name: {
    required: true,
    minLength: 2,
    maxLength: 255
  },
  coordinates: {
    pattern: "^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$"
  },
  lead_time_days: {
    min: 0,
    max: 365
  },
  min_order_qty: {
    min: 0
  },
  rating: {
    min: 1,
    max: 5
  }
}
```

**Response (201 Created):**
```javascript
{
  success: boolean,
  message: string,
  data: {
    source_id: number,
    source_name: string,
    // ... all input fields
    created_at: string
  }
}
```

---

### updateSource(req, res)
Updates an existing source.

**Request Data Types:**
```javascript
req.params = {
  id: number
}

req.body = {
  // Any fields to update (partial)
}
```

**Processing Steps:**
```
1. Verify source exists
2. Validate update fields
3. Build dynamic UPDATE query
4. Execute update
5. Return success or 404
```

---

### deleteSource(req, res)
Deletes a source.

**Cascade Behavior:**
- Transactions with this source get source_id = NULL
- product_sources records are deleted (cascade)

---

## SERVICES

### getAllPaginated(page, limit, search, preferred_only)
Fetches paginated sources with optional filters.

**Input Parameters:**
```javascript
page: number = 1
limit: number = 10
search: string = ""
preferred_only: boolean = false
```

**SQL Query:**
```sql
SELECT * FROM sources
WHERE (
  source_name LIKE ? 
  OR contact_email LIKE ? 
  OR address LIKE ? 
  OR contact_phone LIKE ?
)
AND (? IS NULL OR is_preferred = ?)
ORDER BY created_at DESC
LIMIT ? OFFSET ?;
```

**Response Data:**
```javascript
{
  sources: Source[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

---

### getById(id)
Fetches a single source by ID.

**SQL Query:**
```sql
SELECT * FROM sources WHERE source_id = ?;
```

---

### create(sourceData)
Creates a new source.

**Validation Logic:**
```javascript
if (!sourceData.source_name) 
  throw new Error('source_name is required')

if (sourceData.coordinates) {
  const pattern = /^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$/
  if (!pattern.test(sourceData.coordinates))
    throw new Error('Invalid coordinates format')
}

if (sourceData.lead_time_days) {
  const days = parseInt(sourceData.lead_time_days)
  if (days < 0 || days > 365)
    throw new Error('Lead time must be 0-365 days')
}

if (sourceData.min_order_qty) {
  const qty = parseInt(sourceData.min_order_qty)
  if (qty < 0)
    throw new Error('Minimum order qty must be positive')
}

if (sourceData.rating) {
  const rating = parseFloat(sourceData.rating)
  if (rating < 1 || rating > 5)
    throw new Error('Rating must be 1-5')
}
```

**SQL Query:**
```sql
INSERT INTO sources (
  source_name, contact_email, contact_phone, address, 
  coordinates, lead_time_days, payment_terms, min_order_qty, 
  is_preferred, rating
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
```

---

### update(id, sourceData)
Updates a source with dynamic fields.

**SQL Query (dynamic):**
```sql
UPDATE sources 
SET source_name = ?, contact_email = ?, ..., rating = ?
WHERE source_id = ?;
```

---

### delete(id)
Deletes a source.

**SQL Query:**
```sql
DELETE FROM sources WHERE source_id = ?;
```

**Cascade Effects:**
```
DELETE sources WHERE source_id = 5
  ↓
product_sources records:
  FOREIGN KEY (source_id) REFERENCES sources(source_id) ON DELETE CASCADE
  
Result: All product_source links deleted

transactions records:
  FOREIGN KEY (source_id) REFERENCES sources(source_id) ON DELETE SET NULL
  
Result: Transactions keep data but source_id = NULL
```

---

## MODELS

### Source.getAllPaginated(page, limit, search, preferred)

Fetches paginated sources with filters.

**Implementation:**
```javascript
getAllPaginated: (page = 1, limit = 10, search = '', preferred = false) => {
  return new Promise((resolve, reject) => {
    const { limit: queryLimit, offset } = buildPagination(page, limit);
    const params = [];

    let query = `SELECT * FROM sources`;

    if (search && String(search).trim()) {
      query += ' WHERE source_name LIKE ? OR contact_email LIKE ? OR address LIKE ?';
      const term = `%${search}%`;
      params.push(term, term, term);
    } else if (preferred) {
      query += ' WHERE is_preferred = ?';
      params.push(true);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(queryLimit, offset);

    connection.query(query, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}
```

---

### Source.getTotalCount(search, preferred)

Gets total count for pagination.

**SQL Query:**
```sql
SELECT COUNT(*) as total FROM sources
WHERE (source_name LIKE ? OR contact_email LIKE ? OR address LIKE ?)
AND (? IS NULL OR is_preferred = ?);
```

---

### Source.getById(id)

Fetches single source.

**SQL Query:**
```sql
SELECT * FROM sources WHERE source_id = ?;
```

---

### Source.create(sourceData)

Creates new source.

**SQL Query:**
```sql
INSERT INTO sources (
  source_name, contact_email, contact_phone, address, 
  coordinates, lead_time_days, payment_terms, min_order_qty, 
  is_preferred, rating
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
```

---

### Source.update(id, sourceData)

Updates existing source.

**SQL Query:**
```sql
UPDATE sources 
SET source_name = ?, contact_email = ?, contact_phone = ?, 
    address = ?, coordinates = ?, lead_time_days = ?, 
    payment_terms = ?, min_order_qty = ?, is_preferred = ?, rating = ?
WHERE source_id = ?;
```

---

### Source.delete(id)

Deletes source.

**SQL Query:**
```sql
DELETE FROM sources WHERE source_id = ?;
```

---

## Product-Source Junction Methods

### Source.getProductsBySource(sourceId)

Gets all products supplied by a source.

**SQL Query:**
```sql
SELECT 
  p.product_id,
  p.name,
  ps.cost_price,
  ps.lead_time_days,
  ps.is_preferred_supplier
FROM product_sources ps
JOIN products p ON ps.product_id = p.product_id
WHERE ps.source_id = ?
ORDER BY p.name ASC;
```

---

### Source.addProductToSource(productId, sourceId, costPrice, leadTime)

Links a product to a source.

**SQL Query:**
```sql
INSERT INTO product_sources (product_id, source_id, cost_price, lead_time_days)
VALUES (?, ?, ?, ?);
```

**Error Handling:**
- Duplicate entry: Unique constraint on (product_id, source_id)

---

### Source.getSupplierStats(sourceId)

Gets supplier performance metrics.

**SQL Query:**
```sql
SELECT 
  s.source_id,
  s.source_name,
  COUNT(DISTINCT ps.product_id) as total_products,
  COUNT(DISTINCT t.txn_id) as total_purchases,
  SUM(t.quantity) as total_quantity,
  AVG(s.lead_time_days) as average_lead_time,
  s.rating as quality_rating,
  SUM(t.total_value) as total_amount_spent,
  MAX(t.timestamp) as last_purchase_date
FROM sources s
LEFT JOIN product_sources ps ON s.source_id = ps.source_id
LEFT JOIN transactions t ON s.source_id = t.source_id
WHERE s.source_id = ?
GROUP BY s.source_id;
```

---

## Error Handling

**Validation Errors:**
```javascript
{
  success: false,
  message: "Validation error",
  error: "source_name is required"
}
```

**Duplicate Entry (409):**
```javascript
{
  success: false,
  message: "Duplicate entry",
  error: "Product already linked to this supplier"
}
```

**Not Found (404):**
```javascript
{
  success: false,
  message: "Not found",
  error: "Source with ID 999 not found"
}
```
