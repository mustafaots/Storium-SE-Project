# Visualise API

## Purpose
HTTP communication for dashboard endpoints.

## File Location
`frontend/src/utils/visualiseAPI.js`

## API Methods

### getDashboard()

**HTTP Request:**
```
GET /api/visualise/dashboard
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: DashboardData
}
```

---

### getTrends(params)

**HTTP Request:**
```
GET /api/visualise/trends?metric=stock&groupBy=day&startDate=2025-01-01&endDate=2025-01-31
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: Trend[]
}
```

---

### getStockLevels(params)

**HTTP Request:**
```
GET /api/visualise/stock-levels?groupBy=location
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: StockLevel[]
}
```

---

### getProductPerformance(params)

**HTTP Request:**
```
GET /api/visualise/product-performance?orderBy=turnover&limit=20
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: ProductPerformance[]
}
```

---

### export(format, params)

**HTTP Request:**
```
GET /api/visualise/export/csv?metric=stock
```

**Response:** File download (CSV/Excel/PDF)

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
  utilization: number;
}

interface Trend {
  date: string;
  value: number;
  change: number;
}
```

---

## Dependencies
- `axios` - HTTP client
