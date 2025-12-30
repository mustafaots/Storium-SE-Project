# Clients Routes

## Purpose
Defines HTTP endpoints for client/buyer management. Handles CRUD operations, search filtering, and client information management.

## File Location
`backend/src/routes/clients.routes.js`

## Route Definitions

### GET /api/clients
List all clients with pagination and search.

**Middleware Chain:**
1. `cors()` - CORS headers
2. `express.json()` - Parse JSON body
3. `requestLogger` - Log request
4. Route handler

**Query Parameters:**
```javascript
{
  page: string | number,      // Page number (default: 1)
  limit: string | number,     // Items per page (default: 10)
  search: string              // Search term (name, email, phone, address)
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: Client[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}

// Client Type
Client = {
  client_id: number,
  client_name: string,
  contact_email: string | null,
  contact_phone: string | null,
  address: string | null,
  created_at: string          // ISO 8601 timestamp
}
```

**Example Request:**
```
GET /api/clients?page=1&limit=10&search=acme
```

---

### GET /api/clients/:id
Get single client details.

**Path Parameters:**
```javascript
{
  id: number  // Client ID
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: Client
}
```

**Possible Errors:**
- `404 Not Found` - Client doesn't exist
- `500 Server Error` - Database error

---

### POST /api/clients
Create a new client.

**Middleware Chain:**
1. `validateClients` - Custom validator middleware
2. Route handler

**Request Content-Type:**
```
application/json
```

**Body Data Types:**
```javascript
{
  client_name: string,              // Required
  contact_email: string | null,     // Optional
  contact_phone: string | null,     // Optional
  address: string | null            // Optional
}
```

**Response (201 Created):**
```javascript
{
  success: boolean,
  message: string,
  data: {
    client_id: number,
    client_name: string,
    contact_email: string | null,
    contact_phone: string | null,
    address: string | null,
    created_at: string
  }
}
```

**Validation Rules (from validateClients middleware):**
```javascript
{
  client_name: {
    required: true,
    type: string,
    minLength: 2
  },
  contact_email: {
    required: false,
    type: string,
    pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"  // Email regex
  },
  contact_phone: {
    required: false,
    type: string,
    pattern: "^[0-9\\-\\+\\(\\)\\s]+$"  // Phone number pattern
  },
  address: {
    required: false,
    type: string
  }
}
```

**Possible Errors:**
- `400 Bad Request` - Validation error
- `500 Server Error` - Database error

**Example Request:**
```javascript
{
  "client_name": "Acme Corporation",
  "contact_email": "contact@acme.com",
  "contact_phone": "+1-555-0100",
  "address": "123 Business Ave, Commerce City, ST 45678"
}
```

---

### PUT /api/clients/:id
Update a client.

**Middleware Chain:**
1. `validateClients` - Custom validator
2. Route handler

**Path Parameters:**
```javascript
{
  id: number  // Client ID
}
```

**Body Data Types:**
```javascript
{
  client_name: string | undefined,
  contact_email: string | null | undefined,
  contact_phone: string | null | undefined,
  address: string | null | undefined
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: null
}
```

**Possible Errors:**
- `404 Not Found` - Client doesn't exist
- `400 Bad Request` - Validation error
- `500 Server Error` - Database error

---

### DELETE /api/clients/:id
Delete a client.

**Path Parameters:**
```javascript
{
  id: number  // Client ID
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: null
}
```

**Cascade Behavior:**
- Transactions referencing this client retain client_id but client record is deleted
- Foreign key: `client_id INT` with `ON DELETE SET NULL` constraint

**Possible Errors:**
- `404 Not Found` - Client doesn't exist
- `500 Server Error` - Database error

---

## Response Format

All endpoints return standardized response objects:

**Success Response:**
```javascript
{
  success: true,
  message: "Operation successful",
  data: {}  // Response data
}
```

**Error Response:**
```javascript
{
  success: false,
  message: "Error message",
  error: "Detailed error information"
}
```

**Pagination Response:**
```javascript
{
  success: true,
  message: "Data retrieved successfully",
  data: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 42,        // Total matching records
    pages: 5          // Total pages
  }
}
```
