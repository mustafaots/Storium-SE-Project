# Visualise Model

## Purpose
Database query operations for visualization data.

## File Location
`backend/src/models/visualise.model.js`

## Query Methods

### getTotalProductsCount()

**SQL:**
```sql
SELECT COUNT(*) as count FROM products WHERE deleted_at IS NULL
```

**Return:** `number`

---

### getTotalStockValue()

**SQL:**
```sql
SELECT SUM(s.quantity * p.rate) as total_value
FROM stocks s
JOIN products p ON s.product_id = p.product_id
WHERE s.deleted_at IS NULL AND p.deleted_at IS NULL
```

**Return:** `Decimal`

---

### getLowStockCount()

**SQL:**
```sql
SELECT COUNT(DISTINCT s.product_id) as count
FROM stocks s
JOIN products p ON s.product_id = p.product_id
WHERE s.quantity < p.min_stock_level AND s.deleted_at IS NULL
```

**Return:** `number`

---

### getOverstockCount()

**SQL:**
```sql
SELECT COUNT(DISTINCT s.product_id) as count
FROM stocks s
JOIN products p ON s.product_id = p.product_id
WHERE s.quantity > p.max_stock_level AND s.deleted_at IS NULL
```

**Return:** `number`

---

### getStockByLocation()

**SQL:**
```sql
SELECT 
  l.location_id, l.name,
  SUM(s.quantity * p.rate) as stock_value
FROM stocks s
JOIN locations l ON s.location_id = l.location_id
JOIN products p ON s.product_id = p.product_id
WHERE s.deleted_at IS NULL
GROUP BY l.location_id
ORDER BY stock_value DESC
```

**Return:** `Array<{location_id, name, stock_value}>`

---

### getProductsByCategory()

**SQL:**
```sql
SELECT 
  p.category,
  COUNT(*) as count,
  SUM(s.quantity * p.rate) as value
FROM products p
LEFT JOIN stocks s ON p.product_id = s.product_id
WHERE p.deleted_at IS NULL
GROUP BY p.category
ORDER BY value DESC
```

**Return:** `Array<{category, count, value}>`

---

### getStockTrend(days)

**SQL:**
```sql
SELECT 
  DATE(t.created_at) as date,
  SUM(t.quantity) as quantity
FROM transactions t
WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
  AND t.status = 'completed'
  AND t.deleted_at IS NULL
GROUP BY DATE(t.created_at)
ORDER BY date ASC
```

**Return:** `Array<{date, quantity}>`

---

### getRecentTransactions(limit)

**SQL:**
```sql
SELECT t.* FROM transactions t
WHERE t.status = 'completed' AND t.deleted_at IS NULL
ORDER BY t.completed_at DESC
LIMIT ?
```

**Return:** `Transaction[]`

---

## Type Definitions

```typescript
interface StockLevel {
  location_id: number;
  name: string;
  stock_value: number;
}

interface ProductCategory {
  category: string;
  count: number;
  value: number;
}

interface DailyTrend {
  date: string;
  quantity: number;
}

interface Transaction {
  transaction_id: number;
  reference_number: string;
  transaction_type: string;
  quantity: number;
  created_at: Date;
}
```

---

## Dependencies
- `database.js` - Connection pool
- `mysql2/promise`
