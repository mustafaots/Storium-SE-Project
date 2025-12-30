# Transactions Components

## Purpose
Reusable components for transactions feature UI.

## File Location
`frontend/src/components/Transactions/`

---

## TransactionList

Table of transactions with sorting and filtering.

**Props:**
```typescript
interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onSelectTransaction: (t: Transaction) => void;
  onComplete: (id: number) => void;
  onFail: (id: number, reason: string) => void;
}
```

**Features:**
- Sortable columns
- Status badge (pending/completed/failed)
- Transaction type icon
- Click to view details

---

## TransactionForm

Form for creating or editing transactions.

**Props:**
```typescript
interface TransactionFormProps {
  onSubmit: (data: CreateInput) => Promise<void>;
  onCancel: () => void;
}
```

**Fields:**
- Transaction type (dropdown)
- Product (searchable dropdown)
- Quantity (number)
- Unit price (decimal)
- Source location (for transfers)
- Destination location (required for all)
- Notes (textarea)

**Features:**
- Dynamic fields based on transaction type
- Auto-calculate total amount
- Product search with type-ahead
- Date picker for transaction date

---

## TransactionDetailModal

Shows full transaction details with action buttons.

**Props:**
```typescript
interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (id: number) => void;
  onFail: (id: number, reason: string) => void;
}
```

**Displays:**
- Full transaction details
- Stock impact summary
- Timeline of status changes
- Associated product/location info

---

## TransactionTimeline

Visual timeline of stock movements.

**Props:**
```typescript
interface TransactionTimelineProps {
  transactions: Transaction[];
}
```

**Shows:**
- Chronological order
- Quantity changes
- Location changes
- Status indicators

---

## Type Definitions

```typescript
interface Transaction {
  transaction_id: number;
  transaction_type: 'purchase' | 'sale' | 'adjustment' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  reference_number: string;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number | null;
  total_amount: number | null;
  source_location: string | null;
  destination_location: string | null;
  notes: string | null;
  created_by_name: string;
  created_at: string;
  completed_at: string | null;
}
```

---

## Dependencies
- `react` - Core library
- `react-icons` - Icons
- `react-toastify` - Notifications
