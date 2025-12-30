# Sources Frontend - Components

## Purpose
React components for supplier management UI.

## File Location
`frontend/src/components/`

## Components

### SourceList

Table component displaying all suppliers.

**Props:**
```typescript
interface SourceListProps {
  sources: Source[];
  loading: boolean;
  pagination: Pagination;
  onSelectSource: (source: Source) => void;
  onDeleteSource: (id: number) => void;
  onPageChange: (page: number) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

**Features:**
- Sortable columns (name, lead_time_days, minimum_order_qty, rating, total_purchases)
- Row selection with checkbox
- Star rating display
- Actions column (View, Edit, Delete)
- Pagination controls
- Loading skeleton
- Empty state message

**Styling:**
```css
.source-list {
  width: 100%;
  border-collapse: collapse;
}

.source-list tbody tr:hover {
  background-color: #f5f5f5;
}

.source-list td {
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.rating-stars {
  color: #ffc107;
  font-size: 14px;
}

.lead-time-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 12px;
}
```

---

### SourceForm

Form component for creating/editing suppliers.

**Props:**
```typescript
interface SourceFormProps {
  source?: Source | null;
  onSubmit: (data: CreateSourceInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

**Features:**
- Text inputs: name, contact_person, email, phone, address, city, state, postal_code
- Text inputs: payment_terms
- Number inputs: minimum_order_qty, lead_time_days
- Form validation with inline error messages
- Submit/Cancel buttons
- Auto-population in edit mode

**Form Fields:**
```javascript
[
  { name: 'name', label: 'Supplier Name', type: 'text', required: true },
  { name: 'contact_person', label: 'Contact Person', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone', type: 'tel', required: true },
  { name: 'address', label: 'Address', type: 'text', required: true },
  { name: 'city', label: 'City', type: 'text', required: true },
  { name: 'state', label: 'State', type: 'text', required: true },
  { name: 'postal_code', label: 'Postal Code', type: 'text', required: true },
  { name: 'payment_terms', label: 'Payment Terms', type: 'text', required: true },
  { name: 'minimum_order_qty', label: 'Min Order Qty', type: 'number', required: true },
  { name: 'lead_time_days', label: 'Lead Time (Days)', type: 'number', required: true }
]
```

---

### SourceDetailModal

Modal component showing supplier details.

**Props:**
```typescript
interface SourceDetailModalProps {
  source: SourceDetail | null;
  open: boolean;
  onClose: () => void;
  onEdit: (source: Source) => void;
  onDelete: (id: number) => void;
}
```

**Features:**
- Supplier information summary
- Performance metrics (on-time %, avg delivery days)
- Purchase history table (last 10 purchases)
- Performance chart (on-time vs late deliveries)
- Action buttons (Edit, Delete, Print, View All Purchases)
- Tab navigation (Details, Performance, Purchases)

**Layout:**
```
┌───────────────────────────────────────┐
│  Supplier Detail - Acme Supplies  [X] │
├───────────────────────────────────────┤
│ [Details] [Performance] [Purchases]    │
├───────────────────────────────────────┤
│ Contact: John Smith                   │
│ Email: john@acme.com                  │
│ Phone: +1-555-0100                    │
│ Lead Time: 5 days                     │
│ Min Order: 100 units                  │
│                                       │
│ Performance (90 days):                │
│ ✓ On-Time: 97.14% (34/35)            │
│ ✓ Avg Delivery: 4.8 days             │
│                                       │
│ [Edit] [Delete] [Print]               │
└───────────────────────────────────────┘
```

---

### SourceSearch

Search and filter component.

**Props:**
```typescript
interface SourceSearchProps {
  onSearch: (search: string) => void;
  onFilterRating: (rating: number) => void;
  loading?: boolean;
}
```

**Features:**
- Text search by name/email/contact
- Filter dropdown by minimum rating (0-5 stars)
- Clear filters button
- Real-time search (debounced)

---

### PerformanceMetricsCard

Card component showing supplier performance.

**Props:**
```typescript
interface PerformanceMetricsCardProps {
  metrics: PerformanceMetrics;
  size?: 'small' | 'medium';
}
```

**Features:**
- On-time percentage with progress bar
- Average delivery days
- Total orders count
- Total spent amount
- Color coding: Green (>90%), Yellow (70-90%), Red (<70%)

---

### RatingDisplay

Star rating component.

**Props:**
```typescript
interface RatingDisplayProps {
  rating: number;
  count?: number;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
}
```

**Features:**
- Star display (1-5)
- Optional review count
- Optional click to edit (for admin)
- Hover feedback

---

## Dependencies
- `react`
- `axios` (for API calls)
- `react-toastify` (for notifications)
- `react-icons` (for icons)
- `recharts` (for performance charts)
