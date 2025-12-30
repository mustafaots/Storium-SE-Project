# Visualise Routes

## Purpose
HTTP endpoints for data visualization and reporting.

## File Location
`backend/src/routes/visualise.routes.js`

## Endpoints

### GET /api/visualise/dashboard

Gets data for main dashboard (charts, KPIs).

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: {
    total_products: number,
    total_stock_value: Decimal,
    low_stock_count: number,
    overstock_count: number,
    locations_count: number,
    total_transactions_today: number,
    
    stock_by_location: [{location_id, name, stock_value}],
    products_by_category: [{category, count, value}],
    stock_trend: [{date, quantity}],  // Last 30 days
    recent_transactions: Transaction[]
  }
}
```

---

### GET /api/visualise/stock-levels

Stock level analysis by location/category.

**Query Parameters:**
```javascript
{
  groupBy: string = 'location',  // 'location', 'category', 'product'
  includeDetails: boolean = false
}
```

**Response:** `200 OK`
```javascript
{
  data: [
    {
      id: string,
      name: string,
      total: number,
      available: number,
      low_stock: number,
      overstock: number,
      utilization: number  // percentage
    }
  ]
}
```

---

### GET /api/visualise/trends

Historical trends for charts.

**Query Parameters:**
```javascript
{
  metric: string,             // 'stock', 'transactions', 'alerts'
  groupBy: string = 'day',    // 'day', 'week', 'month'
  startDate: string,          // ISO date
  endDate: string
}
```

**Response:** `200 OK`
```javascript
{
  data: [
    {
      date: string,
      value: number,
      change: number,           // % change from previous period
      [metric]_details: {...}
    }
  ]
}
```

---

### GET /api/visualise/product-performance

Product performance metrics.

**Query Parameters:**
```javascript
{
  orderBy: string = 'quantity',  // 'quantity', 'value', 'turnover'
  limit: number = 20,
  includeWarnings: boolean = true
}
```

**Response:** `200 OK`
```javascript
{
  data: [
    {
      product_id: number,
      name: string,
      category: string,
      current_stock: number,
      min_level: number,
      max_level: number,
      turnover_rate: Decimal,
      status: string,         // 'normal', 'warning', 'critical'
      last_transaction: Date
    }
  ]
}
```

---

### GET /api/visualise/export/:format

Exports visualization data.

**URL Parameters:**
```javascript
{
  format: string  // 'csv', 'excel', 'pdf'
}
```

**Response:** File download or `200 OK` with data

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
  stock_by_location: StockByLocation[];
  products_by_category: ProductsByCategory[];
  stock_trend: StockTrend[];
  recent_transactions: Transaction[];
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
```

---

## Dependencies
- `visualise.controller.js`
- `general_validators.js`
