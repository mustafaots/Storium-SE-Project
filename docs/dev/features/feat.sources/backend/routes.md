# Sources Routes

## Purpose
Defines HTTP endpoints for supplier/source management. Handles CRUD operations, search filtering, and supplier information management.

## File Location
`backend/src/routes/sources.routes.js`

## Route Definitions

### GET /api/sources
List all sources with pagination and search.

**Query Parameters:**
```javascript
{
  page: string | number,      // Page number (default: 1)
  limit: string | number,     // Items per page (default: 10)
  search: string              // Search term (name, email, address, phone)
}
```

**Response (200 OK):**
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

// Source Type
Source = {
  source_id: number,
  source_name: string,
  contact_email: string | null,
  contact_phone: string | null,
  address: string | null,
  coordinates: string | null,    // "lat,lng" format
  lead_time_days: number | null,
  payment_terms: string | null,
  min_order_qty: number | null,
  is_preferred: boolean,
  rating: number | null,         // 1-5 stars
  last_purchase_date: string | null,
  created_at: string
}
```

---

### GET /api/sources/:id
Get single source details.

**Path Parameters:**
```javascript
{
  id: number  // Source ID
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: Source
}
```

**Possible Errors:**
- `404 Not Found` - Source doesn't exist
- `500 Server Error` - Database error

---

### POST /api/sources
Create a new source.

**Body Data Types:**
```javascript
{
  source_name: string,              // Required
  contact_email: string | null,     // Optional
  contact_phone: string | null,     // Optional
  address: string | null,           // Optional
  coordinates: string | null,       // Optional, "lat,lng" format
  lead_time_days: number | null,    // Optional, expected delivery days
  payment_terms: string | null,     // Optional, e.g., "NET30", "COD"
  min_order_qty: number | null,     // Optional, minimum order quantity
  is_preferred: boolean              // Optional, default: false
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
    contact_email: string | null,
    contact_phone: string | null,
    address: string | null,
    coordinates: string | null,
    lead_time_days: number | null,
    payment_terms: string | null,
    min_order_qty: number | null,
    is_preferred: boolean,
    created_at: string
  }
}
```

**Validation Rules:**
```javascript
{
  source_name: {
    required: true,
    type: string,
    minLength: 2,
    maxLength: 255
  },
  contact_email: {
    required: false,
    pattern: "email"
  },
  contact_phone: {
    required: false,
    pattern: "phone"
  },
  coordinates: {
    required: false,
    pattern: "^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$"
  },
  lead_time_days: {
    required: false,
    type: number,
    min: 0,
    max: 365
  },
  min_order_qty: {
    required: false,
    type: number,
    min: 0
  }
}
```

---

### PUT /api/sources/:id
Update a source.

**Path Parameters:**
```javascript
{
  id: number  // Source ID
}
```

**Body Data Types:**
```javascript
{
  source_name: string | undefined,
  contact_email: string | null | undefined,
  contact_phone: string | null | undefined,
  address: string | null | undefined,
  coordinates: string | null | undefined,
  lead_time_days: number | null | undefined,
  payment_terms: string | null | undefined,
  min_order_qty: number | null | undefined,
  is_preferred: boolean | undefined,
  rating: number | null | undefined
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: null
}
```

---

### DELETE /api/sources/:id
Delete a source.

**Path Parameters:**
```javascript
{
  id: number  // Source ID
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: null
}
```

**Cascade Behavior:**
- Transactions referencing this source retain source_id but source record is deleted
- Foreign key: `source_id INT` with `ON DELETE SET NULL` constraint

---

## Additional Endpoints

### GET /api/sources/products/:sourceId
Get all products supplied by a source.

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: Array<{
    product_id: number,
    name: string,
    cost_price: number,
    lead_time_days: number,
    is_preferred_supplier: boolean
  }>,
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

---

### POST /api/sources/:sourceId/products/:productId
Link product to source.

**Body Data Types:**
```javascript
{
  cost_price: number,              // Unit cost
  lead_time_days: number,          // Delivery time
  is_preferred_supplier: boolean   // Is primary supplier
}
```

---

### GET /api/sources/stats/:sourceId
Get supplier performance metrics.

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: {
    source_id: number,
    source_name: string,
    total_products: number,
    total_purchases: number,
    total_quantity: number,
    average_lead_time: number,    // Days
    on_time_delivery_rate: number, // Percentage
    quality_rating: number,        // 1-5
    total_amount_spent: number,    // Currency
    last_purchase_date: string,
    next_due_date: string | null
  }
}
```
