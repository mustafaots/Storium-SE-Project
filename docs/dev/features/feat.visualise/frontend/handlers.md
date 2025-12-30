# Visualise Handlers

## Purpose
Business logic for dashboard data aggregation on frontend.

## File Location
`frontend/src/handlers/visualiseHandlers.js`

## Handler Methods

### fetchDashboardData()

Fetches main dashboard data.

**API Call:**
```javascript
visualiseAPI.getDashboard()
```

**Output:**
```javascript
{
  total_products: number,
  total_stock_value: number,
  low_stock_count: number,
  overstock_count: number,
  locations_count: number,
  total_transactions_today: number,
  stock_by_location: [...],
  products_by_category: [...],
  stock_trend: [...],
  recent_transactions: [...]
}
```

---

### fetchTrends(metric, groupBy, startDate, endDate)

Fetches trend data for charts.

**Input:**
```javascript
metric: string,     // 'stock', 'transactions', 'alerts'
groupBy: string,    // 'day', 'week', 'month'
startDate: string,  // ISO date
endDate: string
```

**API Call:**
```javascript
visualiseAPI.getTrends({metric, groupBy, startDate, endDate})
```

**Output:** Trend[]

---

### fetchStockLevels(groupBy)

Fetches stock level breakdown.

**Input:**
```javascript
groupBy: string  // 'location', 'category', 'product'
```

**API Call:**
```javascript
visualiseAPI.getStockLevels({groupBy})
```

**Output:** StockLevel[]

---

### fetchProductPerformance(orderBy, limit)

Fetches product metrics.

**Input:**
```javascript
orderBy: string,    // 'quantity', 'value', 'turnover'
limit: number = 10
```

**API Call:**
```javascript
visualiseAPI.getProductPerformance({orderBy, limit})
```

**Output:** ProductPerformance[]

---

### exportData(format, metric)

Exports visualization data.

**Input:**
```javascript
format: string,  // 'csv', 'excel', 'pdf'
metric: string   // Which data to export
```

**API Call:**
```javascript
visualiseAPI.export(format, {metric})
```

---

## Dependencies
- `utils/visualiseAPI.js`
