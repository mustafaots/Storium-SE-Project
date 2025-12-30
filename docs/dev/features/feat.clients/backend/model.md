# Clients Model

## Purpose
Implements database access layer for clients. Executes SQL queries and returns raw database results. Manages connection pooling and error handling at database level.

## File Location
`backend/src/models/clients.model.js`

---

## Database Schema

```sql
CREATE TABLE clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY 
        COMMENT 'Unique client identifier',
    
    client_name VARCHAR(255) NOT NULL 
        COMMENT 'Client/company name (e.g., "Acme Corp", "Tech Solutions Inc")',
    
    contact_email VARCHAR(255) 
        COMMENT 'Primary contact email address',
    
    contact_phone VARCHAR(50) 
        COMMENT 'Primary contact phone number',
    
    address TEXT 
        COMMENT 'Physical address or billing address',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        COMMENT 'Record creation timestamp',
    
    -- Indexes for efficient queries
    INDEX idx_client_name (client_name),
    INDEX idx_contact_email (contact_email),
    INDEX idx_contact_phone (contact_phone)
);
```

**Column Specifications:**
- `client_id`: INT AUTO_INCREMENT - Auto-generated on insert
- `client_name`: VARCHAR(255) NOT NULL - Searchable field
- `contact_email`: VARCHAR(255) nullable - Standard email length
- `contact_phone`: VARCHAR(50) nullable - Supports international formats
- `address`: TEXT nullable - Can store long addresses
- `created_at`: TIMESTAMP - Auto-set to current time on insert

---

## Model Methods

### Client.getAllPaginated(page, limit, search)

Fetches paginated clients with optional search filtering.

**SQL Query:**
```sql
SELECT * FROM clients 
WHERE client_name LIKE ? 
   OR contact_email LIKE ? 
   OR contact_phone LIKE ? 
   OR address LIKE ?
ORDER BY created_at DESC 
LIMIT ? OFFSET ?;

-- Parameters: [
--   '%' + search + '%',      (client_name search)
--   '%' + search + '%',      (contact_email search)
--   '%' + search + '%',      (contact_phone search)
--   '%' + search + '%',      (address search)
--   limit,
--   (page - 1) * limit       (offset calculation)
-- ]
```

**Implementation:**
```javascript
getAllPaginated: (page = 1, limit = 10, search = '') => {
  return new Promise((resolve, reject) => {
    const { limit: queryLimit, offset } = buildPagination(page, limit);
    const params = [];

    let query = `
      SELECT *
      FROM clients
    `;

    if (search && String(search).trim()) {
      query += ' WHERE client_name LIKE ? OR contact_email LIKE ? OR contact_phone LIKE ? OR address LIKE ?';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(queryLimit, offset);

    connection.query(query, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}
```

**Return Data:**
```javascript
[
  {
    client_id: 1,
    client_name: "Acme Corporation",
    contact_email: "contact@acme.com",
    contact_phone: "+1-555-0100",
    address: "123 Business Ave, Commerce City, ST 45678",
    created_at: Date  // JavaScript Date object
  },
  {
    client_id: 2,
    client_name: "Tech Solutions Inc",
    contact_email: "sales@techsol.com",
    contact_phone: "+1-555-0200",
    address: "456 Innovation Blvd, Tech Park, ST 98765",
    created_at: Date
  },
  ...
]
```

---

### Client.getTotalCount(search)

Gets total count for pagination calculation.

**SQL Query:**
```sql
SELECT COUNT(*) as total FROM clients
WHERE client_name LIKE ? 
   OR contact_email LIKE ? 
   OR contact_phone LIKE ? 
   OR address LIKE ?;

-- Parameters: ['%search%', '%search%', '%search%', '%search%']
```

**Implementation:**
```javascript
getTotalCount: (search = '') => {
  return new Promise((resolve, reject) => {
    let query = 'SELECT COUNT(*) as total FROM clients';
    const params = [];

    if (search && String(search).trim()) {
      query += ' WHERE client_name LIKE ? OR contact_email LIKE ? OR contact_phone LIKE ? OR address LIKE ?';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    connection.query(query, params, (err, results) => {
      if (err) reject(err);
      else resolve(results[0].total);
    });
  });
}
```

**Return Data:**
```javascript
// Result is accessed as: results[0].total
{
  total: number  // e.g., 42
}
```

---

### Client.getById(id)

Fetches a single client by ID.

**SQL Query:**
```sql
SELECT * FROM clients WHERE client_id = ?;
-- Parameters: [id]
```

**Implementation:**
```javascript
getById: (id) => {
  return new Promise((resolve, reject) => {
    connection.query(
      'SELECT * FROM clients WHERE client_id = ?',
      [id],
      (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);  // undefined if no match
      }
    );
  });
}
```

**Return Data:**
```javascript
{
  client_id: number,
  client_name: string,
  contact_email: string | null,
  contact_phone: string | null,
  address: string | null,
  created_at: Date
}
// Returns undefined if not found
```

---

### Client.create(clientData)

Creates a new client record.

**SQL Query:**
```sql
INSERT INTO clients (client_name, contact_email, contact_phone, address) 
VALUES (?, ?, ?, ?);

-- Parameters: [client_name, contact_email, contact_phone, address]
-- Auto-generated: client_id (AUTO_INCREMENT), created_at (CURRENT_TIMESTAMP)
```

**Implementation:**
```javascript
create: (clientData) => {
  return new Promise((resolve, reject) => {
    const { client_name, contact_email, contact_phone, address } = clientData;

    connection.query(
      'INSERT INTO clients (client_name, contact_email, contact_phone, address) VALUES (?, ?, ?, ?)',
      [client_name, contact_email, contact_phone, address],
      (err, results) => {
        if (err) reject(err);
        else resolve({ client_id: results.insertId, ...clientData });
      }
    );
  });
}
```

**Input:**
```javascript
{
  client_name: "New Client LLC",
  contact_email: "info@newclient.com",
  contact_phone: "+1-555-0300",
  address: "789 Market St, Downtown, ST 55555"
}
```

**Return Data:**
```javascript
{
  affectedRows: 1,
  insertId: 123,        // New client_id
  warningCount: 0,
  
  // Plus all input data
  client_name: "New Client LLC",
  contact_email: "info@newclient.com",
  contact_phone: "+1-555-0300",
  address: "789 Market St, Downtown, ST 55555"
}
```

---

### Client.update(id, clientData)

Updates an existing client.

**SQL Query:**
```sql
UPDATE clients 
SET client_name = ?, contact_email = ?, contact_phone = ?, address = ? 
WHERE client_id = ?;

-- Parameters: [client_name, contact_email, contact_phone, address, id]
```

**Implementation:**
```javascript
update: (id, clientData) => {
  return new Promise((resolve, reject) => {
    const { client_name, contact_email, contact_phone, address } = clientData;

    connection.query(
      'UPDATE clients SET client_name = ?, contact_email = ?, contact_phone = ?, address = ? WHERE client_id = ?',
      [client_name, contact_email, contact_phone, address, id],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
}
```

**Input:**
```javascript
id: 5
clientData: {
  client_name: "Updated Client Name",
  contact_email: "newemail@client.com",
  contact_phone: "+1-555-0400",
  address: "999 New Street, New City, ST 99999"
}
```

**Return Data:**
```javascript
{
  affectedRows: 0 | 1,   // 1 if found and updated, 0 if not found
  changedRows: 0 | 1,    // 1 if data actually changed
  warningCount: 0
}
```

---

### Client.delete(id)

Deletes a client record.

**SQL Query:**
```sql
DELETE FROM clients WHERE client_id = ?;
-- Parameters: [id]
```

**Implementation:**
```javascript
delete: (id) => {
  return new Promise((resolve, reject) => {
    connection.query(
      'DELETE FROM clients WHERE client_id = ?',
      [id],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
}
```

**Cascade Behavior:**
```
DELETE FROM clients WHERE client_id = 5
  ↓
Transactions table has:
  FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE SET NULL
  
Result: Client record deleted, but transactions keep their data with client_id = NULL
```

**Return Data:**
```javascript
{
  affectedRows: number,  // Rows deleted (0 if not found, 1 if deleted)
  warningCount: 0
}
```

---

## Connection Management

### Connection Pool

```javascript
import connection from '../config/database.js';
// connection is a mysql pool from mysql library
```

**Pool Features:**
- Reuses connections for multiple queries
- Limits concurrent connections (configurable)
- Auto-reconnects on connection loss
- Queues queries during high load
- Connection timeout handling

---

## Error Handling

**Connection Errors:**
```javascript
(err, results) => {
  if (err) {
    console.error('Database error:', err.code, err.message);
    
    // Handle specific error codes
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      // Connection lost, pool will auto-reconnect
    }
    if (err.code === 'ER_DUP_ENTRY') {
      // Duplicate key (shouldn't happen with client_id as primary)
    }
    
    reject(err);
  }
}
```

---

## SQL Helper Functions

### buildPagination(page, limit)

Calculates LIMIT and OFFSET for pagination.

```javascript
// Input: page=2, limit=10
// Output: { limit: 10, offset: 10 }
// Skips first 10 records, returns next 10

// Formula: offset = (page - 1) * limit
```

### buildSearchConditions(fields, search)

Creates WHERE clause for multi-field search.

```javascript
// Input: fields=['client_name', 'contact_email'], search='acme'
// Output: {
//   conditions: "client_name LIKE ? OR contact_email LIKE ?",
//   params: ['%acme%', '%acme%']
// }
```

All models use these utilities for consistent query building.

---

## Query Performance

**Index Usage:**
- `idx_client_name`: Used for name searches
- `idx_contact_email`: Used for email lookups
- `idx_contact_phone`: Used for phone searches

**Search Query Execution:**
```
WHERE client_name LIKE '%term%' ...
  ↓
Uses idx_client_name if LIKE pattern doesn't start with %
  ↓
If starts with %, full table scan (acceptable for small tables)
```

---

## Data Integrity

**Foreign Key Constraint:**
```sql
-- In transactions table:
FOREIGN KEY (client_id) REFERENCES clients(client_id) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE

-- When client is deleted:
-- All referencing transaction records get client_id = NULL
-- When client_id is updated:
-- All referencing transactions update their client_id
```
