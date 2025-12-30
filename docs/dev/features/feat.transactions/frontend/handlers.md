# Transactions Handlers

## Purpose
Business logic layer for transaction operations.

## File Location
`frontend/src/handlers/transactionsHandlers.js`

## Handler Methods

### fetchTransactions(filters, page, limit)

Fetches transactions with pagination and filters.

**Input:**
```javascript
filters = {
  type: string,
  status: string,
  product_id: number | null,
  location_id: number | null,
  date_from: string,
  date_to: string
}
page: number
limit: number
```

**Validation:**
```javascript
- Validate date format (YYYY-MM-DD)
- Ensure date_to >= date_from
- Validate type, status are valid enums
```

**API Call:**
```javascript
transactionsAPI.getAll({page, limit, ...filters})
```

**Output:**
```javascript
{
  transactions: Transaction[],
  pagination: {page, limit, total, pages}
}
```

---

### createTransaction(formData)

Creates a new transaction.

**Input:**
```javascript
{
  transaction_type: string,
  product_id: number,
  quantity: number,
  unit_price: number | null,
  source_location_id: number | null,
  destination_location_id: number | null,
  notes: string | null
}
```

**Validation:**
```javascript
- quantity > 0
- Type is valid enum
- Product exists
- Source/destination locations exist (if specified)
```

**API Call:**
```javascript
transactionsAPI.create(formData)
```

**Output:** Created transaction with reference_number

---

### updateTransaction(id, updateData)

Updates transaction (complete or fail).

**Input:**
```javascript
{
  status: string,           // 'completed', 'failed'
  notes: string | null,
  failure_reason: string | null
}
```

**API Call:**
```javascript
transactionsAPI.update(id, updateData)
```

---

### deleteTransaction(id)

Soft deletes transaction.

**API Call:**
```javascript
transactionsAPI.delete(id)
```

---

## Dependencies
- `utils/transactionsAPI.js`
