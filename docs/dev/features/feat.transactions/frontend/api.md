# Transactions API

## Purpose
HTTP communication layer for transactions endpoints.

## File Location
`frontend/src/utils/transactionsAPI.js`

## API Methods

### getAll(params)

Fetches transactions with filters and pagination.

**HTTP Request:**
```
GET /api/transactions?page=1&limit=10&type=purchase&status=completed&date_from=2025-01-01&date_to=2025-12-31
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: Transaction[],
  pagination: {page, limit, total, pages}
}
```

---

### getById(id)

Fetches single transaction.

**HTTP Request:**
```
GET /api/transactions/5
```

**Response:** `200 OK` or `404 Not Found`

---

### create(transactionData)

Creates a new transaction.

**HTTP Request:**
```
POST /api/transactions
Content-Type: application/json

{
  "transaction_type": "purchase",
  "product_id": 3,
  "quantity": 100,
  "unit_price": 50.00,
  "destination_location_id": 1,
  "notes": "Order from supplier ABC"
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

### update(id, updateData)

Updates transaction status.

**HTTP Request:**
```
PUT /api/transactions/5
Content-Type: application/json

{
  "status": "completed",
  "notes": "Received and verified"
}
```

**Response:** `200 OK`

---

### delete(id)

Soft deletes transaction.

**HTTP Request:**
```
DELETE /api/transactions/5
```

**Response:** `200 OK`

---

### getReport(dateFrom, dateTo, groupBy)

Generates transaction report.

**HTTP Request:**
```
GET /api/transactions/report/daily?date_from=2025-01-01&date_to=2025-01-31&groupBy=type
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: {
    total_transactions: number,
    total_quantity: number,
    total_amount: number,
    by_type: {...}
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
  unit_price: number | null;
  total_amount: number | null;
  source_location: string | null;
  destination_location: string | null;
  notes: string | null;
  created_by_name: string;
  created_at: string;
  completed_at: string | null;
}
```

---

## Dependencies
- `axios` - HTTP client
