# Sources Frontend - Hooks

## Purpose
React hooks for supplier management state and operations.

## File Location
`frontend/src/hooks/useSources.js`

## Hook State

```typescript
interface SourcesState {
  sources: Source[];
  selectedSource: Source | null;
  sourceDetail: SourceDetail | null;
  performanceData: PerformanceMetrics | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    search: string;
    minRating: number;
  };
}

interface Source {
  source_id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  payment_terms: string;
  minimum_order_qty: number;
  lead_time_days: number;
  rating: number;
  status: string;
  created_at: string;
  total_purchases?: number;
  total_spent?: number;
  last_purchase_date?: string;
}

interface SourceDetail extends Source {
  purchase_history: Purchase[];
  performance_metrics: PerformanceMetrics;
}

interface Purchase {
  purchase_id: number;
  order_date: string;
  received_date: string | null;
  amount: number;
  status: 'pending' | 'received' | 'rejected';
}

interface PerformanceMetrics {
  total_orders: number;
  on_time_orders: number;
  on_time_percentage: number;
  avg_delivery_days: number;
  total_spent: number;
}
```

## Hook Methods

```typescript
// Load all sources
loadSources(page: number = 1, limit: number = 10): Promise<void>

// Get single source with detail
getSourceDetail(id: number): Promise<SourceDetail>

// Get performance metrics
getSourcePerformance(id: number, days: number = 90): Promise<PerformanceMetrics>

// Create new source
createSource(sourceData: CreateSourceInput): Promise<Source>

// Update source
updateSource(id: number, updates: Partial<Source>): Promise<Source>

// Delete source
deleteSource(id: number): Promise<void>

// Get source purchase history
getSourcePurchaseHistory(id: number, page: number): Promise<Purchase[]>

// Set search filter
setSearchFilter(search: string): void

// Set rating filter
setMinRatingFilter(rating: number): void

// Handle pagination
handlePageChange(page: number): void
```

## Usage Example

```javascript
import { useSources } from '../hooks/useSources';

function SourcesPage() {
  const { 
    sources, 
    selectedSource,
    performanceData,
    loading, 
    pagination,
    filters,
    loadSources,
    getSourceDetail,
    getSourcePerformance,
    createSource,
    setSearchFilter,
    handlePageChange
  } = useSources();

  useEffect(() => {
    loadSources(pagination.page, pagination.limit);
  }, [pagination.page, filters]);

  return (
    // UI code
  );
}
```

---

## Type Definitions

```typescript
interface CreateSourceInput {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  payment_terms: string;
  minimum_order_qty: number;
  lead_time_days: number;
}
```

---

## Dependencies
- `../api/sourcesAPI.js`
- `useState`, `useEffect`, `useCallback` from React
