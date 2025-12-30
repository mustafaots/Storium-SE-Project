# Transactions Controller

## Purpose
HTTP handlers for transaction operations.

## File Location
`backend/src/controllers/transactions.controller.js`

## Methods

### getAllTransactions(req, res)

Handles GET /api/transactions.

**Input:**
```javascript
{
  page: number = 1,
  limit: number = 10,
  type: string = '',
  status: string = '',
  product_id: number | null = null,
  location_id: number | null = null,
  date_from: string = '',
  date_to: string = ''
}
```

**Processing:**
```
Extract and validate query params
  ↓
Build filter object
  ↓
Call transactionsService.getAllTransactions(filters, pagination)
  ↓
Return 200 with paginated transactions
```

**Output:**
```javascript
{
  success: boolean,
  data: Transaction[],
  pagination: {page, limit, total, pages}
}
```

---

### getTransactionById(req, res)

Handles GET /api/transactions/:id.

**Output:** `200 OK` with Transaction or `404 Not Found`

---

### createTransaction(req, res)

Handles POST /api/transactions.

**Input:**
```javascript
{
  transaction_type: string,
  product_id: number,
  quantity: number,
  unit_price: number | null,
  source_location_id: number | null,
  destination_location_id: number | null,
  notes: string | null,
  reference_number: string | null
}
```

**Validation:**
```javascript
Rules = {
  transaction_type: ['required', 'in:purchase,sale,adjustment,transfer'],
  product_id: ['required', 'integer', 'min:1'],
  quantity: ['required', 'numeric', 'min:0.01'],
  unit_price: ['nullable', 'numeric', 'min:0'],
  notes: ['nullable', 'string', 'max:500']
}
```

**Processing:**
```
Validate input
  ↓
Check product exists
  ↓
Check source/destination locations if transfer
  ↓
Generate reference number if not provided
  ↓
Create transaction
  ↓
Update stock levels
  ↓
Create audit log
  ↓
Return 201 with transaction
```

**Output:** `201 Created`

---

### updateTransaction(req, res)

Handles PUT /api/transactions/:id.

**Input:**
```javascript
{
  status: string,
  notes: string | null,
  failure_reason: string | null
}
```

**Processing:**
```
Validate status transition
  ↓
Update transaction
  ↓
If completed: update stock levels
  ↓
If failed: log reason
  ↓
Return 200
```

---

### deleteTransaction(req, res)

Handles DELETE /api/transactions/:id.

**Processing:**
```
Soft delete transaction
  ↓
Reverse stock adjustments if completed
  ↓
Return 200
```

---

### getTransactionReport(req, res)

Handles GET /api/transactions/report/daily.

**Input:**
```javascript
{
  date_from: string,
  date_to: string,
  groupBy: string = 'type'
}
```

**Output:**
```javascript
{
  success: boolean,
  data: {
    total_transactions: number,
    total_quantity: number,
    total_amount: number,
    by_type: {purchase: {...}, sale: {...}},
    by_product: {...}
  }
}
```

---

## Type Definitions

```typescript
interface Transaction {
  transaction_id: number;
  transaction_type: string;
  status: string;
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
  created_at: Date;
  completed_at: Date | null;
  failure_reason: string | null;
}

interface CreateTransactionInput {
  transaction_type: string;
  product_id: number;
  quantity: number;
  unit_price: number | null;
  source_location_id: number | null;
  destination_location_id: number | null;
  notes: string | null;
  reference_number: string | null;
}
```

---

## Dependencies
- `transactions.service.js`
- `general_validators.js`
