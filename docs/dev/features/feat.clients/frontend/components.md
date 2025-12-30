# Clients Frontend - Components

## Purpose
React components for client management UI.

## File Location
`frontend/src/components/`

## Components

### ClientList

Table component displaying all clients.

**Props:**
```typescript
interface ClientListProps {
  clients: Client[];
  loading: boolean;
  pagination: Pagination;
  onSelectClient: (client: Client) => void;
  onDeleteClient: (id: number) => void;
  onPageChange: (page: number) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

**Features:**
- Sortable columns (name, email, credit_limit, outstanding_balance, type)
- Row selection with checkbox
- Actions column (View, Edit, Delete)
- Pagination controls
- Loading skeleton
- Empty state message

**Styling:**
```css
.client-list {
  width: 100%;
  border-collapse: collapse;
}

.client-list tbody tr:hover {
  background-color: #f5f5f5;
}

.client-list td {
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.client-type-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.badge-wholesaler {
  background: #e3f2fd;
  color: #1976d2;
}

.badge-retailer {
  background: #f3e5f5;
  color: #7b1fa2;
}

.badge-distributor {
  background: #e8f5e9;
  color: #388e3c;
}
```

---

### ClientForm

Form component for creating/editing clients.

**Props:**
```typescript
interface ClientFormProps {
  client?: Client | null;
  onSubmit: (data: CreateClientInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

**Features:**
- Text inputs: name, email, phone, address, city, state, postal_code
- Select dropdown: client_type (wholesaler, retailer, distributor)
- Number input: credit_limit
- Form validation with inline error messages
- Submit/Cancel buttons
- Auto-population in edit mode

**Form Fields:**
```javascript
[
  { name: 'name', label: 'Client Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone', type: 'tel', required: true },
  { name: 'client_type', label: 'Client Type', type: 'select', 
    options: ['wholesaler', 'retailer', 'distributor'], required: true },
  { name: 'address', label: 'Address', type: 'text', required: true },
  { name: 'city', label: 'City', type: 'text', required: true },
  { name: 'state', label: 'State', type: 'text', required: true },
  { name: 'postal_code', label: 'Postal Code', type: 'text', required: true },
  { name: 'credit_limit', label: 'Credit Limit (₹)', type: 'number', required: true }
]
```

---

### ClientDetailModal

Modal component showing full client details.

**Props:**
```typescript
interface ClientDetailModalProps {
  client: ClientDetail | null;
  open: boolean;
  onClose: () => void;
  onEdit: (client: Client) => void;
  onDelete: (id: number) => void;
}
```

**Features:**
- Client information summary
- Credit utilization progress bar
- Recent transactions table
- Payment history
- Action buttons (Edit, Delete, Print)
- Tab navigation (Details, Transactions, Payments)

**Layout:**
```
┌─────────────────────────────────────┐
│  Client Detail - Acme Corp      [X] │
├─────────────────────────────────────┤
│  [Details] [Transactions] [Payments] │
├─────────────────────────────────────┤
│ Email: contact@acme.com             │
│ Phone: +1-555-0001                  │
│ Type: Wholesaler                    │
│ Status: Active                      │
│                                     │
│ Credit Limit: ₹50,000               │
│ Outstanding: ₹12,500 (25%)          │
│ ▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░          │
│                                     │
│ [Edit] [Delete] [Print]             │
└─────────────────────────────────────┘
```

---

### ClientSearch

Search and filter component.

**Props:**
```typescript
interface ClientSearchProps {
  onSearch: (search: string) => void;
  onFilterType: (type: string) => void;
  loading?: boolean;
}
```

**Features:**
- Text search by name/email
- Filter dropdown by client_type
- Clear filters button
- Real-time search (debounced)

---

### CreditUtilizationBadge

Badge component showing credit utilization status.

**Props:**
```typescript
interface CreditUtilizationBadgeProps {
  outstanding: number;
  credit_limit: number;
  size?: 'small' | 'medium' | 'large';
}
```

**Features:**
- Color coding: Green (<50%), Yellow (50-80%), Red (>80%)
- Percentage display
- Percentage bar
- Tooltip on hover

---

### ClientStatistics

Statistics panel for client overview.

**Props:**
```typescript
interface ClientStatisticsProps {
  totalClients: number;
  activeClients: number;
  totalOutstanding: number;
  totalCredit: number;
}
```

**Features:**
- 4 stat cards with icons
- Percentage change indicators
- Last updated timestamp

---

## Dependencies
- `react`
- `axios` (for API calls)
- `react-toastify` (for notifications)
- `react-icons` (for icons)
- `recharts` (optional, for visualizations)
