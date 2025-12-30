# Clients Frontend - API

## Purpose
HTTP API calls for client operations.

## File Location
`frontend/src/api/clientsAPI.js`

## API Methods

### getClients(filters, pagination)

Fetch all clients with pagination.

**HTTP Request:**
```
GET /api/clients?page=1&limit=10&search=john&type=wholesaler
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: [
    {
      client_id: 1,
      name: 'Acme Corp',
      email: 'contact@acme.com',
      phone: '+1-555-0001',
      client_type: 'wholesaler',
      address: '123 Business St',
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      credit_limit: 50000.00,
      outstanding_balance: 12500.00,
      total_transactions: 45,
      last_transaction_date: '2024-01-15T10:30:00Z',
      status: 'active',
      created_at: '2023-06-20T08:00:00Z'
    }
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 45,
    pages: 5
  }
}
```

---

### getClientDetail(id)

Get single client with transactions.

**HTTP Request:**
```
GET /api/clients/1
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: {
    ...client,
    transactions: [
      {
        transaction_id: 101,
        client_id: 1,
        type: 'purchase',
        amount: 2500.00,
        date: '2024-01-15T10:30:00Z'
      },
      {
        transaction_id: 102,
        client_id: 1,
        type: 'payment',
        amount: 1000.00,
        date: '2024-01-14T14:20:00Z'
      }
    ],
    payment_history: [...],
    credit_utilization: 25.0
  }
}
```

---

### createClient(clientData)

Create new client.

**HTTP Request:**
```
POST /api/clients
Content-Type: application/json

{
  name: 'New Company',
  email: 'newco@example.com',
  phone: '+1-555-9999',
  client_type: 'retailer',
  address: '456 Market Ave',
  city: 'Boston',
  state: 'MA',
  postal_code: '02101',
  credit_limit: 25000
}
```

**Response:** `201 Created`
```javascript
{
  success: boolean,
  data: {
    client_id: 42,
    ...sentData,
    status: 'active',
    created_at: '2024-01-16T09:00:00Z'
  }
}
```

**Error Response:** `400 Bad Request`
```javascript
{
  success: false,
  errors: {
    email: ['This email already exists'],
    credit_limit: ['Must be a valid number']
  }
}
```

---

### updateClient(id, updateData)

Update client information.

**HTTP Request:**
```
PUT /api/clients/1
Content-Type: application/json

{
  name: 'Updated Name',
  phone: '+1-555-0002',
  credit_limit: 75000
}
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: {
    client_id: 1,
    ...updatedData,
    updated_at: '2024-01-16T10:00:00Z'
  }
}
```

---

### deleteClient(id)

Soft delete client.

**HTTP Request:**
```
DELETE /api/clients/1
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  message: 'Client deleted successfully'
}
```

---

### getClientTransactions(id, page, limit)

Get client transaction history.

**HTTP Request:**
```
GET /api/clients/1/transactions?page=1&limit=20
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: [
    {
      transaction_id: 101,
      client_id: 1,
      type: 'purchase',
      amount: 2500.00,
      date: '2024-01-15T10:30:00Z'
    }
  ],
  pagination: {...}
}
```

---

## Axios Configuration

```javascript
import axios from 'axios';

const clientsAPI = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
clientsAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
clientsAPI.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error);
    throw error;
  }
);

export default clientsAPI;
```

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

interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface CreateClientInput {
  name: string;
  email: string;
  phone: string;
  client_type: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  credit_limit: number;
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200  | Success - GET, PUT, DELETE |
| 201  | Success - POST (Created) |
| 400  | Bad Request - Validation failed |
| 401  | Unauthorized - Missing/invalid token |
| 404  | Not Found - Client doesn't exist |
| 500  | Server Error |

---

## Dependencies
- `axios`
- `localStorage` for token persistence
