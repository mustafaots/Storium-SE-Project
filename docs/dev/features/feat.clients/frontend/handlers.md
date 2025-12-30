# Clients Frontend - Handlers

## Purpose
Business logic and validation for client operations.

## File Location
`frontend/src/handlers/clientsHandler.js`

## Handler Methods

### validateClientForm(formData)

Validates client form input.

**Validation Rules:**
```javascript
rules = {
  name: ['required', 'string', 'min:2', 'max:100'],
  email: ['required', 'email', 'unique:clients'],
  phone: ['required', 'string', 'regex:/^[+]?[0-9]{10,}/'],
  client_type: ['required', 'in:wholesaler,retailer,distributor'],
  address: ['required', 'string', 'min:5', 'max:255'],
  city: ['required', 'string', 'min:2', 'max:50'],
  state: ['required', 'string', 'min:2', 'max:50'],
  postal_code: ['required', 'string', 'regex:/^[0-9]{5,}/'],
  credit_limit: ['required', 'numeric', 'min:0', 'max:9999999.99']
}
```

**Returns:**
```javascript
{
  isValid: boolean,
  errors: {[field]: string[]}
}
```

---

### fetchClients(filters, pagination)

Fetch clients from API with error handling.

**Input:**
```javascript
filters = {
  search: string,
  type: string
}
pagination = {
  page: number,
  limit: number
}
```

**Processing:**
```
Validate pagination (page ≥ 1, limit ∈ [1, 100])
  ↓
Call clientsAPI.getClients(filters, pagination)
  ↓
Handle response data
  ↓
Update store
  ↓
Handle errors
```

**Returns:** 
```javascript
{
  clients: Client[],
  pagination: {...}
}
```

---

### fetchClientDetail(id)

Fetch single client with transactions.

**Processing:**
```
Validate ID (number, > 0)
  ↓
Call clientsAPI.getClientDetail(id)
  ↓
Transform response
  ↓
Return with nested transactions
```

**Returns:** ClientDetail

---

### saveClient(clientData, isEdit)

Save new or update existing client.

**Input:**
```javascript
clientData = {
  client_id?: number,
  name: string,
  email: string,
  phone: string,
  ...
}
isEdit = boolean
```

**Processing:**
```
Validate form data
  ↓
Transform data before sending
  ↓
Call API (POST or PUT)
  ↓
Handle response
  ↓
Return created/updated client
```

**Returns:** Client

---

### deleteClientHandler(id)

Delete client with confirmation.

**Processing:**
```
Confirm deletion
  ↓
Call API DELETE /clients/:id
  ↓
Handle success
  ↓
Return success status
```

---

### fetchClientTransactions(clientId, page)

Fetch client transaction history.

**Input:**
```javascript
{
  clientId: number,
  page: number
}
```

**Returns:** Transaction[]

---

## Type Definitions

```typescript
interface Client {
  client_id: number;
  name: string;
  email: string;
  phone: string;
  client_type: 'wholesaler' | 'retailer' | 'distributor';
  address: string;
  city: string;
  state: string;
  postal_code: string;
  credit_limit: number;
  outstanding_balance: number;
  total_transactions: number;
  last_transaction_date: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}
```

---

## Dependencies
- `../api/clientsAPI.js`
- `../utils/validators.js`
