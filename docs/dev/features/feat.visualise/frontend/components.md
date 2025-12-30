# Visualise Components

## Purpose
Reusable chart and dashboard components.

## File Location
`frontend/src/components/Visualise/` or `Dashboard/`

---

## KPICard

Summary statistic card.

**Props:**
```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;        // % change
  changeDirection?: 'up' | 'down';
  onClick?: () => void;
}
```

**Features:**
- Icon and value display
- Optional trend indicator
- Clickable for drilling down

---

## TrendChart

Line chart for historical trends.

**Props:**
```typescript
interface TrendChartProps {
  data: Trend[];
  metric: string;
  title: string;
  timeRange: string;
  onRangeChange: (range: string) => void;
}
```

**Uses:** Recharts LineChart

**Features:**
- Time range selector (7d, 30d, 90d, custom)
- Tooltip on hover
- Responsive sizing

---

## StockLevelChart

Pie/Bar chart showing stock distribution.

**Props:**
```typescript
interface StockLevelChartProps {
  data: StockLevel[];
  groupBy: string;
  onGroupChange: (groupBy: string) => void;
}
```

**Uses:** Recharts PieChart/BarChart

---

## ProductPerformanceTable

Table of top products.

**Props:**
```typescript
interface ProductPerformanceTableProps {
  data: ProductPerformance[];
  orderBy: string;
  onOrderByChange: (orderBy: string) => void;
  onProductClick: (productId: number) => void;
}
```

**Features:**
- Sortable columns
- Status indicators
- Click product for details

---

## Type Definitions

```typescript
interface Trend {
  date: string;
  value: number;
  change: number;
}

interface StockLevel {
  id: string;
  name: string;
  total: number;
  utilization: number;
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
- `recharts` - Charting library
- `react` - Core library
- `react-icons` - Icons
