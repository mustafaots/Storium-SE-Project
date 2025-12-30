# Visualise Controller

## Purpose
HTTP handlers for visualization endpoints.

## File Location
`backend/src/controllers/visualise.controller.js`

## Methods

### getDashboardData(req, res)

Handles GET /api/visualise/dashboard.

**Processing:**
```
1. Query total products count
2. Calculate total stock value (SUM all stocks)
3. Count products below min_stock_level
4. Count products above max_stock_level
5. Get stock value by location
6. Get products grouped by category
7. Get stock trend (last 30 days)
8. Get last 5 transactions
9. Aggregate and return
```

**Output:** `200 OK` with DashboardData

---

### getStockLevels(req, res)

Handles GET /api/visualise/stock-levels.

**Input:**
```javascript
{
  groupBy: string = 'location',
  includeDetails: boolean = false
}
```

**Processing:**
```
1. GROUP BY specified field (location, category, or product)
2. Calculate for each group:
   - Total stock quantity
   - Available quantity
   - Low stock items count
   - Overstock items count
   - Utilization percentage
3. Return aggregated data
```

**Output:** `200 OK` with StockLevel[]

---

### getTrends(req, res)

Handles GET /api/visualise/trends.

**Input:**
```javascript
{
  metric: string,
  groupBy: string = 'day',
  startDate: string,
  endDate: string
}
```

**Processing:**
```
1. GROUP BY date (day/week/month)
2. Aggregate metric values
3. Calculate period-over-period change
4. Sort by date ascending
5. Return trend data
```

**Output:** `200 OK` with Trend[]

---

### getProductPerformance(req, res)

Handles GET /api/visualise/product-performance.

**Input:**
```javascript
{
  orderBy: string = 'quantity',
  limit: number = 20,
  includeWarnings: boolean = true
}
```

**Processing:**
```
1. Get all products
2. Calculate turnover_rate (recent transactions / current stock)
3. Determine status (normal/warning/critical)
4. Sort by orderBy metric
5. Limit to specified count
6. Return data
```

**Output:** `200 OK` with ProductPerformance[]

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
  stock_by_location: any[];
  products_by_category: any[];
  stock_trend: Trend[];
  recent_transactions: any[];
}

interface Trend {
  date: string;
  value: number;
  change: number;
}
```

---

## Dependencies
- `visualise.service.js`
- `stocks.model.js`
- `transactions.model.js`
