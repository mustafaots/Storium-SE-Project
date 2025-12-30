# Transactions Service

## Purpose
Business logic for transaction processing and inventory management.

## File Location
`backend/src/services/transactions.service.js`

## Methods

### getAllTransactions(filters, pagination)

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

pagination = {
  page: number,
  limit: number
}
```

**SQL Query:**
```sql
SELECT 
  t.*,
  p.name as product_name,
  u.name as created_by_name,
  l1.name as source_location,
  l2.name as destination_location
FROM transactions t
JOIN products p ON t.product_id = p.product_id
JOIN users u ON t.created_by = u.user_id
LEFT JOIN locations l1 ON t.source_location_id = l1.location_id
LEFT JOIN locations l2 ON t.destination_location_id = l2.location_id
WHERE (? = '' OR t.transaction_type = ?)
  AND (? = '' OR t.status = ?)
  AND (? IS NULL OR t.product_id = ?)
  AND (? IS NULL OR t.source_location_id = ? OR t.destination_location_id = ?)
  AND (? = '' OR DATE(t.created_at) >= ?)
  AND (? = '' OR DATE(t.created_at) <= ?)
  AND t.deleted_at IS NULL
ORDER BY t.created_at DESC
LIMIT ? OFFSET ?
```

**Output:**
```javascript
{
  transactions: Transaction[],
  pagination: {page, limit, total, pages}
}
```

---

### createTransaction(transactionData, userId)

**Input:**
```javascript
transactionData = {
  transaction_type: string,
  product_id: number,
  quantity: number,
  unit_price: number | null,
  source_location_id: number | null,
  destination_location_id: number | null,
  notes: string | null,
  reference_number: string | null
}

userId: number
```

**Processing:**
```
1. Validate product exists and is active
2. Check source location has sufficient stock (if applicable)
3. Generate reference_number if not provided: TXN-YYYYMMDD-XXXXX
4. Start transaction (DB transaction)
5. Insert into transactions table with status='pending'
6. Update stock levels based on type:
   - purchase: increase destination stock
   - sale: decrease source stock
   - transfer: decrease source, increase destination
   - adjustment: adjust as specified
7. Create audit log entry
8. Commit transaction
9. Return created transaction
```

**SQL (Insert):**
```sql
INSERT INTO transactions (
  transaction_type, status, reference_number, product_id,
  quantity, unit_price, total_amount,
  source_location_id, destination_location_id,
  notes, created_by, created_at
) VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
```

**Output:**
```javascript
{
  transaction_id: number,
  ...transactionData,
  status: 'pending',
  created_at: Date
}
```

---

### updateTransaction(id, updateData)

**Input:**
```javascript
id: number

updateData = {
  status: string,           // 'completed', 'failed'
  notes: string | null,
  failure_reason: string | null
}
```

**Processing:**
```
1. Fetch current transaction
2. Validate status transition
3. If status='completed':
   - Finalize stock adjustments
   - Set completed_at = NOW()
4. If status='failed':
   - Reverse any stock changes
   - Log failure reason
5. Update transaction
6. Return updated transaction
```

**Output:**
```javascript
{
  transaction_id: number,
  status: string,
  completed_at: Date | null
}
```

---

### getTransactionReport(filters)

**Input:**
```javascript
filters = {
  date_from: string,
  date_to: string,
  groupBy: string  // 'type', 'product', 'location'
}
```

**Processing:**
```
1. Query transactions within date range
2. Group by specified field
3. Calculate:
   - Total count
   - Total quantity
   - Total amount (sum of total_amount)
4. Return aggregated report
```

**Output:**
```javascript
{
  total_transactions: number,
  total_quantity: number,
  total_amount: Decimal,
  by_type: {
    purchase: {count, qty, amount},
    sale: {...},
    adjustment: {...},
    transfer: {...}
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
  quantity: number;
  unit_price: number | null;
  total_amount: number;
  source_location_id: number | null;
  destination_location_id: number | null;
  notes: string | null;
  created_by: number;
  created_at: Date;
  completed_at: Date | null;
  failure_reason: string | null;
}

interface TransactionCreateInput {
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
- `transactions.model.js`
- `stocks.model.js` - For stock updates
- `database.js` - DB transactions
