# Transactions Hooks

## Purpose
State management for transactions feature.

## File Location
`frontend/src/hooks/useTransactions.js`

## useTransactions Hook

### State

```javascript
{
  transactions: Transaction[],
  loading: boolean,
  error: string | null,
  
  filters: {
    type: string,
    status: string,
    product_id: number | null,
    location_id: number | null,
    date_from: string,
    date_to: string
  },
  
  pagination: {page, limit, total, pages},
  selectedTransaction: Transaction | null,
  showDetailModal: boolean,
  
  // Methods
  loadTransactions: (page?: number) => Promise<void>,
  createTransaction: (data) => Promise<void>,
  updateTransaction: (id, data) => Promise<void>,
  deleteTransaction: (id) => Promise<void>,
  setFilters: (filters) => void,
  handlePageChange: (newPage) => void
}
```

### Methods

**loadTransactions(page)**
- Fetch transactions with current filters
- Update pagination state

**createTransaction(formData)**
- Validate form data
- POST /api/transactions
- Reload transactions list

**updateTransaction(id, updateData)**
- PUT /api/transactions/{id}
- Update transaction status to 'completed' or 'failed'
- Refresh list

**setFilters(filters)**
- Update filter state
- Reload transactions with new filters

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

interface TransactionFilters {
  type: string;
  status: string;
  product_id: number | null;
  location_id: number | null;
  date_from: string;
  date_to: string;
}

interface CreateTransactionInput {
  transaction_type: string;
  product_id: number;
  quantity: number;
  unit_price: number | null;
  source_location_id: number | null;
  destination_location_id: number | null;
  notes: string | null;
}
```

---

## Dependencies
- `handlers/transactionsHandlers.js`
- `react` hooks
