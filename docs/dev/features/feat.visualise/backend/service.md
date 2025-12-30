# Visualise Service

## Purpose
Business logic for data aggregation and report generation.

## File Location
`backend/src/services/visualise.service.js`

## Methods

### getDashboardData()

Aggregates data for main dashboard.

**SQL Queries:**
```sql
-- Total products
SELECT COUNT(*) as count FROM products WHERE deleted_at IS NULL

-- Stock value
SELECT SUM(s.quantity * p.rate) as total_value
FROM stocks s JOIN products p ON s.product_id = p.product_id

-- Low stock
SELECT COUNT(*) FROM stocks s
WHERE s.quantity < (SELECT min_stock_level FROM products WHERE product_id = s.product_id)

-- Stock by location
SELECT l.location_id, l.name, SUM(s.quantity * p.rate) as stock_value
FROM stocks s
JOIN locations l ON s.location_id = l.location_id
JOIN products p ON s.product_id = p.product_id
GROUP BY l.location_id
```

**Output:**
```javascript
{
  total_products: number,
  total_stock_value: Decimal,
  low_stock_count: number,
  overstock_count: number,
  ...
}
```

---

### getStockLevelsByLocation()

Analyzes stock levels grouped by location.

**SQL:**
```sql
SELECT 
  l.location_id, l.name,
  SUM(s.quantity) as total,
  COUNT(CASE WHEN s.quantity > 0 THEN 1 END) as available,
  COUNT(CASE WHEN s.quantity < p.min_stock_level THEN 1 END) as low_stock,
  COUNT(CASE WHEN s.quantity > p.max_stock_level THEN 1 END) as overstock,
  (SUM(s.quantity) / SUM(p.max_stock_level)) * 100 as utilization
FROM stocks s
JOIN locations l ON s.location_id = l.location_id
JOIN products p ON s.product_id = p.product_id
GROUP BY l.location_id
```

**Output:** StockLevel[]

---

### getStockTrend(days)

Gets stock quantity trend over time.

**SQL:**
```sql
SELECT 
  DATE(t.created_at) as date,
  SUM(t.quantity) as value
FROM transactions t
WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
  AND t.status = 'completed'
GROUP BY DATE(t.created_at)
ORDER BY date ASC
```

**Output:** Trend[]

---

### getProductPerformance()

Calculates product performance metrics.

**Processing:**
```
1. Get all active products
2. For each product:
   - Current stock from stocks table
   - Recent transaction count (last 30 days)
   - Turnover rate = recent_qty / current_stock
   - Status = normal/warning/critical based on level
3. Sort and return
```

**Output:**
```javascript
[
  {
    product_id, name, category,
    current_stock, min_level, max_level,
    turnover_rate, status, last_transaction
  }
]
```

---

## Type Definitions

```typescript
interface DashboardData {
  total_products: number;
  total_stock_value: number;
  low_stock_count: number;
  overstock_count: number;
  locations_count: number;
  total_transactions_today: number;
}

interface StockLevel {
  id: string;
  name: string;
  total: number;
  available: number;
  low_stock: number;
  overstock: number;
  utilization: number;
}

interface Trend {
  date: string;
  value: number;
  change: number;
}

interface ProductPerformance {
  product_id: number;
  name: string;
  category: string;
  current_stock: number;
  min_level: number;
  max_level: number;
  turnover_rate: number;
  status: string;
  last_transaction: Date;
}
```

---

## Dependencies
- `visualise.model.js`
- `stocks.model.js`
- `transactions.model.js`
- `database.js`
