# Transactions Page

## Purpose
Main UI for viewing and managing inventory transactions/stock movements.

## File Location
`frontend/src/pages/Transactions/TransactionsPage.jsx`

## Component State

```javascript
{
  transactions: Transaction[],
  loading: boolean,
  error: string | null,
  
  filters: {
    type: string,           // 'purchase', 'sale', 'adjustment', 'transfer'
    status: string,         // 'pending', 'completed', 'failed'
    product_id: number | null,
    location_id: number | null,
    date_from: string,
    date_to: string
  },
  
  pagination: {page, limit, total, pages},
  
  selectedTransaction: Transaction | null,
  showDetailModal: boolean,
  showCreateForm: boolean,
  
  // Methods
  loadTransactions: (page?: number) => Promise<void>,
  createTransaction: (data: CreateInput) => Promise<void>,
  updateTransaction: (id: number, data: UpdateInput) => Promise<void>,
  setFilters: (filters: FilterConfig) => void
}

Transaction = {
  transaction_id: number,
  transaction_type: string,
  status: string,
  reference_number: string,
  product_id: number,
  product_name: string,
  quantity: number,
  unit_price: number | null,
  total_amount: number | null,
  source_location: string | null,
  destination_location: string | null,
  notes: string | null,
  created_by_name: string,
  created_at: string | Date,
  completed_at: string | Date | null
}
```

## User Interactions

### Create Transaction
```
Click "New Transaction"
  ↓
Show TransactionForm
  ↓
User selects type and fills details
  ↓
Submit
  ↓
POST /api/transactions
  ↓
Success: reload, show toast
```

### View Details
```
Click transaction row
  ↓
Show detail modal with full info
  ↓
Option to complete or fail transaction
```

### Filter Transactions
```
User sets filters (type, date range, etc)
  ↓
Call loadTransactions(1)
  ↓
Reload with filtered results
```

---

## Key Sub-components

### TransactionList - Table of transactions
### TransactionForm - Form for creating/editing
### TransactionDetailModal - Full transaction details
### FilterBar - Date range and type filters
### TransactionTimeline - Timeline of stock movements

---

## Dependencies
- `hooks/useTransactions.js`
- `handlers/transactionsHandlers.js`
- `components/TransactionList.jsx`
- `components/TransactionForm.jsx`
- `components/TransactionDetailModal.jsx`
