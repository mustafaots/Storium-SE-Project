# Transactions Routes

## Purpose
HTTP endpoints for inventory transactions (stock movements, adjustments, transfers).

## File Location
`backend/src/routes/transactions.routes.js`

## Endpoints

### GET /api/transactions

Retrieves transactions with pagination and filters.

**Query Parameters:**
```javascript
{
  page: number = 1,
  limit: number = 10,
  type: string = '',          // 'purchase', 'sale', 'adjustment', 'transfer'
  status: string = '',        // 'pending', 'completed', 'failed'
  product_id: number | null = null,
  location_id: number | null = null,
  date_from: string = '',     // ISO date
  date_to: string = ''
}
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: Transaction[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}

// Transaction type
Transaction = {
  transaction_id: number,
  transaction_type: string,        // 'purchase', 'sale', 'adjustment', 'transfer'
  status: string,                  // 'pending', 'completed', 'failed'
  reference_number: string,
  product_id: number,
  product_name: string,
  quantity: number,
  unit_price: Decimal,
  total_amount: Decimal,
  source_location: string | null,
  destination_location: string | null,
  notes: string | null,
  created_by: number,
  created_by_name: string,
  created_at: string,
  completed_at: string | null,
  failure_reason: string | null
}
```

---

### GET /api/transactions/:id

Retrieves specific transaction details.

**Response:** `200 OK` or `404 Not Found`

---

### POST /api/transactions

Creates a new transaction.

**Request Body:**
```javascript
{
  transaction_type: string,        // Required
  product_id: number,
  quantity: number,
  unit_price: number | null,
  source_location_id: number | null,
  destination_location_id: number | null,
  notes: string | null,
  reference_number: string | null
}
```

**Response:** `201 Created`
```javascript
{
  success: boolean,
  data: Transaction
}
```

---

### PUT /api/transactions/:id

Updates transaction (status, notes).

**Request Body:**
```javascript
{
  status: string,           // 'pending', 'completed', 'failed'
  notes: string | null,
  failure_reason: string | null
}
```

**Response:** `200 OK`

---

### DELETE /api/transactions/:id

Soft deletes a transaction.

**Response:** `200 OK`

---

### GET /api/transactions/report/daily

Generates transaction report.

**Query Parameters:**
```javascript
{
  date_from: string,
  date_to: string,
  groupBy: string = 'type'  // 'type', 'product', 'location'
}
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: {
    total_transactions: number,
    total_quantity: number,
    total_amount: Decimal,
    by_type: {...},
    by_product: {...}
  }
}
```

---

## Type Definitions

```typescript
interface Transaction {
  transaction_id: number;
  transaction_type: 'purchase' | 'sale' | 'adjustment' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  reference_number: string;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  source_location: string | null;
  destination_location: string | null;
  notes: string | null;
  created_by: number;
  created_by_name: string;
  created_at: string;
  completed_at: string | null;
  failure_reason: string | null;
}

interface TransactionQuery {
  page: number;
  limit: number;
  type: string;
  status: string;
  product_id: number | null;
  location_id: number | null;
  date_from: string;
  date_to: string;
}
```

---

## Dependencies
- `transactions.controller.js`
- `general_validators.js`
