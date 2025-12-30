# Transactions Model

## Purpose
Database operations for transactions table.

## File Location
`backend/src/models/transactions.model.js`

## Database Schema

**Table:** `transactions`

```sql
CREATE TABLE transactions (
  transaction_id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_type ENUM('purchase', 'sale', 'adjustment', 'transfer') NOT NULL,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  product_id INT NOT NULL,
  quantity DECIMAL(12, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NULL,
  total_amount DECIMAL(15, 2) NULL,
  source_location_id INT NULL,
  destination_location_id INT NULL,
  notes TEXT NULL,
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  failure_reason VARCHAR(255) NULL,
  deleted_at DATETIME NULL,
  
  KEY idx_product (product_id),
  KEY idx_type (transaction_type),
  KEY idx_status (status),
  KEY idx_created_at (created_at),
  KEY idx_source_location (source_location_id),
  KEY idx_destination_location (destination_location_id),
  KEY idx_reference (reference_number),
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (source_location_id) REFERENCES locations(location_id),
  FOREIGN KEY (destination_location_id) REFERENCES locations(location_id),
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);
```

---

## Methods

### findAll(filters, page, limit)

**Parameters:**
```javascript
filters = {type, status, product_id, location_id, date_from, date_to}
page: number
limit: number
```

**SQL:** (See service.md)

**Return Type:**
```javascript
Transaction[]
```

---

### findById(id)

**SQL:**
```sql
SELECT t.* FROM transactions t
WHERE t.transaction_id = ? AND t.deleted_at IS NULL
```

**Return Type:**
```javascript
Transaction | null
```

---

### create(transactionData, userId)

**SQL:**
```sql
INSERT INTO transactions (
  transaction_type, status, reference_number, product_id,
  quantity, unit_price, total_amount,
  source_location_id, destination_location_id,
  notes, created_by, created_at
) VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
```

**Parameters:**
```javascript
[
  transactionData.transaction_type,
  referenceNumber,  // Auto-generated
  transactionData.product_id,
  transactionData.quantity,
  transactionData.unit_price || null,
  totalAmount,  // Calculated: quantity * unit_price
  transactionData.source_location_id || null,
  transactionData.destination_location_id || null,
  transactionData.notes || null,
  userId
]
```

**Return Type:**
```javascript
{
  transaction_id: number,
  status: 'pending',
  created_at: Date
}
```

---

### update(id, updateData)

**SQL:**
```sql
UPDATE transactions SET
  status = ?,
  notes = CONCAT(notes, '\n', ?),
  completed_at = CASE WHEN ? = 'completed' THEN NOW() ELSE NULL END,
  failure_reason = ?
WHERE transaction_id = ?
```

**Return Type:**
```javascript
{affectedRows: number}
```

---

### delete(id)

Soft delete.

**SQL:**
```sql
UPDATE transactions SET deleted_at = NOW()
WHERE transaction_id = ?
```

---

### findByReferenceNumber(refNumber)

**SQL:**
```sql
SELECT * FROM transactions WHERE reference_number = ? AND deleted_at IS NULL
```

**Return Type:**
```javascript
Transaction | null
```

---

### getReportByDateRange(dateFrom, dateTo, groupBy)

**SQL Examples:**

Group by type:
```sql
SELECT 
  transaction_type,
  COUNT(*) as count,
  SUM(quantity) as total_qty,
  SUM(total_amount) as total_amount
FROM transactions
WHERE DATE(created_at) >= ? AND DATE(created_at) <= ? AND deleted_at IS NULL
GROUP BY transaction_type
```

Group by product:
```sql
SELECT 
  p.product_id, p.name,
  COUNT(*) as count,
  SUM(t.quantity) as total_qty
FROM transactions t
JOIN products p ON t.product_id = p.product_id
WHERE DATE(t.created_at) >= ? AND DATE(t.created_at) <= ? AND t.deleted_at IS NULL
GROUP BY t.product_id, p.name
```

**Return Type:**
```javascript
Array<{
  [groupField]: string | number,
  count: number,
  total_qty: Decimal,
  total_amount: Decimal
}>
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
  total_amount: number | null;
  source_location_id: number | null;
  destination_location_id: number | null;
  notes: string | null;
  created_by: number;
  created_at: Date;
  completed_at: Date | null;
  failure_reason: string | null;
  deleted_at: Date | null;
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

interface TransactionUpdateInput {
  status: string;
  notes: string | null;
  failure_reason: string | null;
}
```

---

## Dependencies
- `database.js` - Connection pool
- `mysql2/promise` - MySQL driver
