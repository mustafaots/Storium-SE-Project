# Visualise Hooks

## Purpose
State management for dashboard and visualization data.

## File Location
`frontend/src/hooks/useVisualise.js`

## useVisualise Hook

### State

```javascript
{
  dashboardData: DashboardData | null,
  stockLevels: StockLevel[],
  trends: Trend[],
  productPerformance: ProductPerformance[],
  loading: boolean,
  error: string | null,
  
  filters: {
    timeRange: string = '30days',
    groupBy: string = 'location',
    metric: string = 'stock'
  },
  
  // Methods
  loadDashboard: () => Promise<void>,
  loadTrends: (metric, range) => Promise<void>,
  loadStockLevels: (groupBy) => Promise<void>,
  loadProductPerformance: () => Promise<void>,
  setFilters: (filters) => void,
  exportData: (format) => Promise<void>
}
```

### Methods

**loadDashboard()**
- GET /api/visualise/dashboard
- Update dashboardData state

**loadTrends(metric, range)**
- GET /api/visualise/trends?metric={metric}&groupBy={range}
- Update trends state

**loadStockLevels(groupBy)**
- GET /api/visualise/stock-levels?groupBy={groupBy}
- Update stockLevels state

**exportData(format)**
- GET /api/visualise/export/{format}
- Download file

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
  turnover_rate: number;
  status: string;
}
```

---

## Dependencies
- `handlers/visualiseHandlers.js`
- `react` hooks
