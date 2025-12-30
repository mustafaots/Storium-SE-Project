# Sources Frontend - Complete Documentation

## File Locations
- `frontend/src/pages/Sources/SourcesPage.jsx`
- `frontend/src/hooks/useSources.js`
- `frontend/src/handlers/sourcesHandlers.js`
- `frontend/src/utils/sourcesAPI.js`
- `frontend/src/components/Sources/`

---

## Page Component

### Component State

```javascript
{
  sources: Source[],
  loading: boolean,
  error: string | null,
  showForm: boolean,
  isEditing: boolean,
  currentSource: Source | null,
  showStatsModal: boolean,
  selectedSource: Source | null,
  
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  },
  
  searchQuery: string,
  filterPreferred: boolean  // Filter preferred suppliers
}

type Source = {
  source_id: number,
  source_name: string,
  contact_email: string | null,
  contact_phone: string | null,
  address: string | null,
  coordinates: string | null,
  lead_time_days: number | null,
  payment_terms: string | null,
  min_order_qty: number | null,
  is_preferred: boolean,
  rating: number | null,
  last_purchase_date: string | null,
  created_at: string
}

type SourceStats = {
  source_id: number,
  source_name: string,
  total_products: number,
  total_purchases: number,
  total_quantity: number,
  average_lead_time: number,
  on_time_delivery_rate: number,
  quality_rating: number,
  total_amount_spent: number,
  last_purchase_date: string,
  next_due_date: string | null
}
```

### Key Sub-components

```javascript
<SearchBar value={searchQuery} onChange={handleSearch} />
<PreferredSupplierFilter
  checked={filterPreferred}
  onChange={setFilterPreferred}
/>
<SourcesTable
  data={sources}
  onSelect={handleSelectSource}
  onEdit={handleEditSource}
  onDelete={handleDeleteSource}
  onViewStats={handleViewStats}
/>
<SourceForm
  source={currentSource}
  onSubmit={handleFormSubmit}
  isEditing={isEditing}
/>
<SupplierStatsModal
  source={selectedSource}
  stats={stats}
  onClose={closeStatsModal}
/>
<SupplierRating rating={source.rating} />
```

### User Interactions

**View Supplier Performance:**
```
Click "View Stats" on source
  ↓
loadSourceStats(source_id)
  ↓
GET /api/sources/stats/5
  ↓
Display StatsModal with metrics
  ├── Total products supplied
  ├── Purchase history
  ├── On-time delivery rate
  ├── Quality rating
  └── Total amount spent
```

**Filter Preferred Suppliers:**
```
Check "Preferred Suppliers Only"
  ↓
setFilterPreferred(true)
  ↓
loadSources(1, limit, search, true)
  ↓
GET /api/sources?preferred_only=true
  ↓
Display only preferred suppliers
```

---

## Hooks (useSources.js)

```javascript
const [sources, setSources] = useState<Source[]>([])
const [loading, setLoading] = useState<boolean>(false)
const [error, setError] = useState<string | null>(null)
const [showForm, setShowForm] = useState<boolean>(false)
const [isEditing, setIsEditing] = useState<boolean>(false)
const [currentSource, setCurrentSource] = useState<Source | null>(null)
const [sourceStats, setSourceStats] = useState<SourceStats | null>(null)
const [pagination, setPagination] = useState<PaginationState>({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

return {
  sources, loading, error, showForm, isEditing, currentSource, sourceStats, pagination,
  setError, setShowForm, setIsEditing, setCurrentSource,
  
  loadSources: (page?: number, limit?: number, search?: string, preferredOnly?: boolean) => Promise<void>,
  loadSourceStats: (sourceId: number) => Promise<void>,
  createSource: (data: SourceData) => Promise<void>,
  updateSource: (id: number, data: SourceData) => Promise<void>,
  deleteSource: (id: number) => Promise<void>,
  linkProduct: (sourceId: number, productId: number, costPrice: number) => Promise<void>,
  handlePageChange: (newPage: number) => void
}
```

### Hook Methods

**loadSourceStats(sourceId)**
```javascript
Process:
1. setLoading(true)
2. sourcesHandlers.fetchSourceStats(sourceId)
3. setSourceStats(data)
4. setLoading(false)

Returns:
{
  source_id: number,
  total_products: number,
  total_purchases: number,
  on_time_delivery_rate: number,  // Percentage
  quality_rating: number,         // 1-5
  total_amount_spent: number,
  average_lead_time: number       // Days
}
```

**createSource(data)**
```javascript
Input: {
  source_name: string,
  contact_email: string | null,
  contact_phone: string | null,
  address: string | null,
  coordinates: string | null,
  lead_time_days: number | null,
  payment_terms: string | null,
  min_order_qty: number | null,
  is_preferred: boolean
}

Process:
1. Validate all fields
2. Call sourcesHandlers.createSource()
3. POST /api/sources
4. Reload sources list
5. Reset form, show success toast
```

---

## Handlers (sourcesHandlers.js)

### fetchSources(page, limit, search, preferredOnly)

```javascript
page = Math.max(1, page)
limit = Math.min(Math.max(1, limit), 100)
search = search.trim()

const response = await sourcesAPI.getAll(page, limit, search, preferredOnly)
return response.data
```

### createSource(data)

```javascript
// Validation
if (!data.source_name || data.source_name.trim().length < 2)
  throw new Error('Source name must be at least 2 characters')

if (data.coordinates) {
  const pattern = /^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$/
  if (!pattern.test(data.coordinates))
    throw new Error('Invalid coordinates format (use lat,lng)')
}

if (data.lead_time_days) {
  const days = parseInt(data.lead_time_days)
  if (days < 0 || days > 365)
    throw new Error('Lead time must be 0-365 days')
}

// API call
const response = await sourcesAPI.create(data)
return response.data
```

### fetchSourceStats(sourceId)

```javascript
const response = await sourcesAPI.getStats(sourceId)
return response.data

// Returns: {
//   total_products: number,
//   on_time_delivery_rate: number,
//   quality_rating: number,
//   total_amount_spent: number,
//   ...
// }
```

### linkProductToSource(sourceId, productId, costPrice, leadTime)

```javascript
// Validation
if (!Number.isInteger(costPrice) || costPrice < 0)
  throw new Error('Cost price must be positive')

if (!Number.isInteger(leadTime) || leadTime < 0 || leadTime > 365)
  throw new Error('Lead time must be 0-365 days')

// API call
const response = await sourcesAPI.linkProduct(
  sourceId,
  productId,
  costPrice,
  leadTime
)
return response.data
```

---

## API Methods (sourcesAPI.js)

### getAll(page, limit, search, preferredOnly)

```javascript
GET /api/sources?page=1&limit=10&search=&preferred_only=false

Response (200):
{
  success: boolean,
  message: string,
  data: Source[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

### getById(id)

```javascript
GET /api/sources/5

Response (200):
{
  success: boolean,
  message: string,
  data: Source
}
```

### create(data)

```javascript
POST /api/sources

{
  "source_name": "Supplier Inc",
  "contact_email": "sales@supplier.com",
  "contact_phone": "+1-555-0100",
  "address": "456 Supply Way",
  "coordinates": "-23.5505,-46.6333",
  "lead_time_days": 7,
  "payment_terms": "NET30",
  "min_order_qty": 100,
  "is_preferred": true,
  "rating": 4.5
}

Response (201):
{
  success: boolean,
  message: string,
  data: Source
}
```

### update(id, data)

```javascript
PUT /api/sources/5

Response (200):
{
  success: boolean,
  message: string,
  data: null
}
```

### delete(id)

```javascript
DELETE /api/sources/5

Response (200):
{
  success: boolean,
  message: string,
  data: null
}
```

### getStats(sourceId)

```javascript
GET /api/sources/stats/5

Response (200):
{
  success: boolean,
  message: string,
  data: {
    source_id: number,
    source_name: string,
    total_products: number,
    total_purchases: number,
    total_quantity: number,
    average_lead_time: number,
    on_time_delivery_rate: number,
    quality_rating: number,
    total_amount_spent: number,
    last_purchase_date: string,
    next_due_date: string | null
  }
}
```

### getProductsBySource(sourceId, page, limit)

```javascript
GET /api/sources/products/5?page=1&limit=10

Response (200):
{
  success: boolean,
  data: Array<{
    product_id: number,
    name: string,
    cost_price: number,
    lead_time_days: number,
    is_preferred_supplier: boolean
  }>,
  pagination: { ... }
}
```

### linkProduct(sourceId, productId, costPrice, leadTime)

```javascript
POST /api/sources/5/products/10

{
  "cost_price": 25.50,
  "lead_time_days": 7,
  "is_preferred_supplier": true
}

Response (201):
{
  success: boolean,
  message: string,
  data: { product_id, source_id, cost_price, ... }
}
```

---

## Components

### SourcesTable

```javascript
Columns:
  - Name
  - Email
  - Phone
  - Lead Time
  - Rating
  - Preferred (badge)
  - Actions (Edit, Delete, View Stats)
```

### SourceForm

```javascript
Fields:
  - source_name (required)
  - contact_email (email validation)
  - contact_phone (phone validation)
  - address
  - coordinates (lat,lng format)
  - lead_time_days (0-365)
  - payment_terms (dropdown: NET30, NET60, COD, Prepaid)
  - min_order_qty
  - is_preferred (checkbox)
  - rating (1-5 star picker)

Validation: inline + server
```

### SupplierStatsModal

```javascript
interface SupplierStatsModalProps {
  source: Source,
  stats: SourceStats,
  onClose: () => void
}

Content:
  - Total products supplied
  - Total purchases
  - Average lead time
  - On-time delivery rate (%)
  - Quality rating
  - Total amount spent
  - Last purchase date
  - Chart: Purchase history over time
```

### SupplierRating

```javascript
interface SupplierRatingProps {
  rating: number | null,
  onRatingChange?: (newRating: number) => void,
  editable?: boolean
}

Shows: Star display (1-5)
```

---

## Data Types

```typescript
interface SourceData {
  source_name: string,
  contact_email: string | null,
  contact_phone: string | null,
  address: string | null,
  coordinates: string | null,
  lead_time_days: number | null,
  payment_terms: string | null,
  min_order_qty: number | null,
  is_preferred: boolean,
  rating: number | null
}

interface SourceStats {
  source_id: number,
  source_name: string,
  total_products: number,
  total_purchases: number,
  total_quantity: number,
  average_lead_time: number,
  on_time_delivery_rate: number,
  quality_rating: number,
  total_amount_spent: number,
  last_purchase_date: string,
  next_due_date: string | null
}
```
