# Sources Frontend - API

## Purpose
HTTP API calls for supplier operations.

## File Location
`frontend/src/api/sourcesAPI.js`

## API Methods

### getSources(filters, pagination)

Fetch all suppliers with pagination.

**HTTP Request:**
```
GET /api/sources?page=1&limit=10&search=acme&minRating=3
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: [
    {
      source_id: 1,
      name: 'Acme Supplies',
      contact_person: 'John Smith',
      email: 'john@acme.com',
      phone: '+1-555-0100',
      address: '789 Supply Rd',
      city: 'Chicago',
      state: 'IL',
      postal_code: '60601',
      payment_terms: 'Net 30',
      minimum_order_qty: 100,
      lead_time_days: 5,
      rating: 4.5,
      status: 'active',
      created_at: '2023-06-15T08:00:00Z',
      total_purchases: 35,
      total_spent: 125000.00,
      last_purchase_date: '2024-01-10T14:30:00Z'
    }
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 12,
    pages: 2
  }
}
```

---

### getSourceDetail(id)

Get single supplier with purchase history.

**HTTP Request:**
```
GET /api/sources/1
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: {
    ...source,
    purchase_history: [
      {
        purchase_id: 501,
        order_date: '2024-01-10T10:00:00Z',
        received_date: '2024-01-15T14:30:00Z',
        amount: 15000.00,
        status: 'received'
      }
    ],
    performance_metrics: {
      total_orders: 35,
      on_time_orders: 34,
      on_time_percentage: 97.14,
      avg_delivery_days: 4.8,
      total_spent: 125000.00
    }
  }
}
```

---

### getSourcePerformance(id, days = 90)

Get supplier performance metrics.

**HTTP Request:**
```
GET /api/sources/1/performance?days=90
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: {
    total_orders: 12,
    on_time_orders: 11,
    on_time_percentage: 91.67,
    avg_delivery_days: 4.75,
    total_spent: 45000.00
  }
}
```

---

### createSource(sourceData)

Create new supplier.

**HTTP Request:**
```
POST /api/sources
Content-Type: application/json

{
  name: 'New Supplier Co',
  contact_person: 'Alice Johnson',
  email: 'alice@newsupply.com',
  phone: '+1-555-0200',
  address: '321 Commerce St',
  city: 'Los Angeles',
  state: 'CA',
  postal_code: '90001',
  payment_terms: 'Net 45',
  minimum_order_qty: 50,
  lead_time_days: 7
}
```

**Response:** `201 Created`
```javascript
{
  success: boolean,
  data: {
    source_id: 15,
    ...sentData,
    rating: 0,
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
    name: ['This name already exists'],
    email: ['Invalid email format']
  }
}
```

---

### updateSource(id, updateData)

Update supplier information.

**HTTP Request:**
```
PUT /api/sources/1
Content-Type: application/json

{
  contact_person: 'Jane Smith',
  phone: '+1-555-0101',
  lead_time_days: 6
}
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: {
    source_id: 1,
    ...updatedData,
    updated_at: '2024-01-16T10:00:00Z'
  }
}
```

---

### deleteSource(id)

Soft delete supplier.

**HTTP Request:**
```
DELETE /api/sources/1
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  message: 'Source deleted successfully'
}
```

---

### getSourcePurchaseHistory(id, page, limit)

Get supplier purchase history.

**HTTP Request:**
```
GET /api/sources/1/purchases?page=1&limit=20
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: [
    {
      purchase_id: 501,
      source_id: 1,
      order_date: '2024-01-10T10:00:00Z',
      received_date: '2024-01-15T14:30:00Z',
      amount: 15000.00,
      status: 'received'
    }
  ],
  pagination: {...}
}
```

---

## Axios Configuration

```javascript
import axios from 'axios';

const sourcesAPI = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
sourcesAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
sourcesAPI.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error);
    throw error;
  }
);

export default sourcesAPI;
```

---

## Type Definitions

```typescript
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
  status: 'active' | 'inactive';
  created_at: string;
}

interface PerformanceMetrics {
  total_orders: number;
  on_time_orders: number;
  on_time_percentage: number;
  avg_delivery_days: number;
  total_spent: number;
}

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

## Status Codes

| Code | Meaning |
|------|---------|
| 200  | Success - GET, PUT, DELETE |
| 201  | Success - POST (Created) |
| 400  | Bad Request - Validation failed |
| 401  | Unauthorized - Missing/invalid token |
| 404  | Not Found - Source doesn't exist |
| 500  | Server Error |

---

## Dependencies
- `axios`
- `localStorage` for token persistence
