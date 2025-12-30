# Clients Controller

## Purpose
Handles HTTP requests for client operations. Manages request validation, service orchestration, and response formatting for client CRUD operations.

## File Location
`backend/src/controllers/clients.controller.js`

## Middleware Chain Execution

```
Request
  ↓
[CORS Middleware]
  ↓
[Parse JSON]
  ↓
[Request Logger]
  ↓
[Validation Middleware] (for POST/PUT)
  ↓
[Controller Method]
  ↓
[Format Response]
  ↓
Response
```

---

## Methods

### getAllClients(req, res)
Fetches all clients with pagination and search support.

**Request Data Types:**
```javascript
req.query = {
  page: number,           // Page number (default: 1)
  limit: number,          // Items per page (default: 10, max: 100)
  search: string          // Search term for name, email, phone, address
}
```

**Processing Steps:**
```
1. Extract & validate pagination parameters
   validatedPage = Math.max(1, parseInt(page))
   validatedLimit = Math.min(Math.max(1, parseInt(limit)), 100)

2. Extract & trim search term
   search = (search || '').trim()

3. Call clientsService.getAllPaginated(page, limit, search)

4. Format data:
   - Phone: formatPhone() utility
   - Date: formatDate() utility (ISO 8601)

5. Return paginatedResponse with pagination object
```

**Response Data Types:**
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

// Individual Client type
Client = {
  client_id: number,
  client_name: string,
  contact_email: string | null,
  contact_phone: string,          // Formatted
  address: string | null,
  created_at: string              // Formatted ISO 8601
}
```

**HTTP Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Database error

---

### getClientById(req, res)
Fetches a single client by ID.

**Request Data Types:**
```javascript
req.params = {
  id: number  // Client ID (converted from string)
}
```

**Processing Steps:**
```
1. Extract client ID from params
2. Call clientsService.getById(id)
3. Check if client exists
4. Format phone and date
5. Return success or 404 error
```

**Response Data Types:**
```javascript
{
  success: boolean,
  message: string,
  data: Client
}
```

**HTTP Status Codes:**
- `200 OK` - Client found
- `404 Not Found` - Client doesn't exist
- `500 Internal Server Error` - Database error

---

### createClient(req, res)
Creates a new client.

**Request Data Types:**
```javascript
req.body = {
  client_name: string,              // Required
  contact_email: string | null,     // Optional
  contact_phone: string | null,     // Optional
  address: string | null            // Optional
}
```

**Validation (performed by middleware):**
```javascript
{
  client_name: {
    required: true,
    type: string,
    minLength: 2,
    maxLength: 255
  },
  contact_email: {
    required: false,
    type: string | null,
    pattern: "email"  // Basic email validation
  },
  contact_phone: {
    required: false,
    type: string | null,
    pattern: "phone"  // Phone pattern: digits, +, -, (), spaces
  },
  address: {
    required: false,
    type: string | null
  }
}
```

**Processing Steps:**
```
1. Validation middleware checks req.body
2. If validation fails, middleware returns 400
3. Extract client data from req.body
4. Call clientsService.create(clientData)
5. Generate client_id (auto-increment)
6. Set created_at (CURRENT_TIMESTAMP)
7. Return 201 Created with new client
```

**Response Data Types:**
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

**HTTP Status Codes:**
- `201 Created` - Client created successfully
- `400 Bad Request` - Validation error
- `500 Internal Server Error` - Database error

---

### updateClient(req, res)
Updates an existing client.

**Request Data Types:**
```javascript
req.params = {
  id: number  // Client ID
}

req.body = {
  client_name: string | undefined,
  contact_email: string | null | undefined,
  contact_phone: string | null | undefined,
  address: string | null | undefined
}
```

**Processing Steps:**
```
1. Extract client ID from params
2. Validation middleware checks req.body
3. If no changes, still returns success
4. Call clientsService.update(id, clientData)
5. Check if update affected rows (existence check)
6. Return success or 404 error
```

**Response Data Types:**
```javascript
{
  success: boolean,
  message: string,
  data: null
}
```

**HTTP Status Codes:**
- `200 OK` - Updated successfully
- `404 Not Found` - Client doesn't exist
- `400 Bad Request` - Validation error
- `500 Internal Server Error` - Database error

---

### deleteClient(req, res)
Deletes a client.

**Request Data Types:**
```javascript
req.params = {
  id: number  // Client ID
}
```

**Processing Steps:**
```
1. Extract client ID from params
2. Call clientsService.delete(id)
3. Check if delete affected rows
4. Return success or 404 error
```

**Cascade Behavior:**
```
DELETE client (id=5)
  ↓
Foreign keys in transactions table:
  client_id INT ... ON DELETE SET NULL
  
Result: Transactions keep their data but client_id becomes NULL
```

**Response Data Types:**
```javascript
{
  success: boolean,
  message: string,
  data: null
}
```

**HTTP Status Codes:**
- `200 OK` - Deleted successfully
- `404 Not Found` - Client doesn't exist
- `500 Internal Server Error` - Database error

---

## Error Handling

All errors are caught and formatted consistently:

**Validation Error (400):**
```javascript
{
  success: false,
  message: "Invalid request",
  error: "client_name is required"
}
```

**Not Found Error (404):**
```javascript
{
  success: false,
  message: "Client not found",
  error: "No client exists with ID 999"
}
```

**Database Error (500):**
```javascript
{
  success: false,
  message: "Database error",
  error: "Internal server error"
}
```

All controllers use the `apiResponse` utility for consistent response formatting.
