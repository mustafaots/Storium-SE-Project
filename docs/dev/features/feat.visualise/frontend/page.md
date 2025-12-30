# Visualise Page

## Purpose
Main dashboard with charts, KPIs, and data visualization.

## File Location
`frontend/src/pages/Visualise/VisualisePage.jsx`

## Component State

```javascript
{
  dashboardData: DashboardData | null,
  stockLevels: StockLevel[],
  trends: Trend[],
  productPerformance: ProductPerformance[],
  loading: boolean,
  error: string | null,
  
  filters: {
    timeRange: string,        // '7days', '30days', '90days', 'custom'
    groupBy: string,          // 'location', 'category'
    metric: string            // 'stock', 'transactions'
  },
  
  // Methods
  loadDashboard: () => Promise<void>,
  loadTrends: (metric, range) => Promise<void>,
  setFilters: (filters) => void,
  exportData: (format) => Promise<void>
}

DashboardData = {
  total_products: number,
  total_stock_value: number,
  low_stock_count: number,
  overstock_count: number,
  locations_count: number,
  total_transactions_today: number,
  stock_by_location: StockByLocation[],
  products_by_category: ProductCategory[],
  stock_trend: Trend[],
  recent_transactions: Transaction[]
}
```

## Layout

```
┌─────────────────────────────────────────────┐
│  Dashboard                                   │
├─────────────────────────────────────────────┤
│  [KPI Cards]                                 │
│  Total Stock: $XXX,XXX │ Low Stock: XX       │
│  Products: XXX │ Transactions Today: XX      │
├─────────────────────────────────────────────┤
│  [Charts Row]                                │
│  ┌──────────────────┐  ┌──────────────────┐  │
│  │ Stock by Location│  │ Products by Cat  │  │
│  │ (Pie Chart)      │  │ (Bar Chart)      │  │
│  └──────────────────┘  └──────────────────┘  │
├─────────────────────────────────────────────┤
│  [Trend Chart]                               │
│  ┌──────────────────────────────────────┐    │
│  │ Stock Trend (Line Chart)             │    │
│  │ [7d] [30d] [90d] [Custom Range]     │    │
│  └──────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  [Product Performance Table]                 │
│  Top 10 Products by Turnover                │
└─────────────────────────────────────────────┘
```

## Key Sub-components

### KPICards - Summary statistics
### StockLevelChart - Location/category breakdown
### TrendChart - Historical trends
### ProductPerformanceTable - Top products
### ExportButton - Download reports

---

## Dependencies
- `hooks/useVisualise.js`
- `handlers/visualiseHandlers.js`
- `components/Dashboard/*`
- `recharts` - Charts library
