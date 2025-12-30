# Clients Frontend - Hooks

## Purpose
React hooks for client management state and operations.

## File Location
`frontend/src/hooks/useClients.js`

## Hook State

```typescript
interface ClientsState {
  clients: Client[];
  selectedClient: Client | null;
  clientDetail: ClientDetail | null;
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
    type: 'wholesaler' | 'retailer' | 'distributor' | '';
  };
}

interface Client {
  client_id: number;
  name: string;
  email: string;
  phone: string;
  client_type: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  credit_limit: number;
  outstanding_balance: number;
  total_transactions: number;
  last_transaction_date: string | null;
  status: string;
  created_at: string;
}

interface ClientDetail extends Client {
  transactions: Transaction[];
  payment_history: Payment[];
  credit_utilization: number;
}

interface Transaction {
  transaction_id: number;
  date: string;
  type: 'purchase' | 'payment';
  amount: number;
}
```

## Hook Methods

```typescript
// Load all clients
loadClients(page: number = 1, limit: number = 10): Promise<void>

// Get single client with detail
getClientDetail(id: number): Promise<ClientDetail>

// Create new client
createClient(clientData: CreateClientInput): Promise<Client>

// Update client
updateClient(id: number, updates: Partial<Client>): Promise<Client>

// Delete client
deleteClient(id: number): Promise<void>

// Get client transactions
getClientTransactions(id: number, page: number): Promise<Transaction[]>

// Set search filter
setSearchFilter(search: string): void

// Set type filter
setTypeFilter(type: string): void

// Handle pagination
handlePageChange(page: number): void
```

## Usage Example

```javascript
import { useClients } from '../hooks/useClients';

function ClientsPage() {
  const { 
    clients, 
    selectedClient,
    loading, 
    pagination,
    filters,
    loadClients,
    getClientDetail,
    createClient,
    setSearchFilter,
    handlePageChange
  } = useClients();

  useEffect(() => {
    loadClients(pagination.page, pagination.limit);
  }, [pagination.page, filters]);

  return (
    // UI code
  );
}
```

---

## Type Definitions

```typescript
interface CreateClientInput {
  name: string;
  email: string;
  phone: string;
  client_type: 'wholesaler' | 'retailer' | 'distributor';
  address: string;
  city: string;
  state: string;
  postal_code: string;
  credit_limit: number;
}

interface Payment {
  payment_id: number;
  amount: number;
  date: string;
  method: string;
}
```

---

## Dependencies
- `../api/clientsAPI.js`
- `useState`, `useEffect`, `useCallback` from React
