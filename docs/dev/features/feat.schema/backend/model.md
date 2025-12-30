# Schema Model

## Purpose
Implements database access layer for schema structures. Executes SQL queries directly and returns raw database results. Manages connection pooling and error handling at database level.

## File Locations
- `backend/src/models/locations.model.js`
- `backend/src/models/depots.model.js`
- `backend/src/models/aisles.model.js`
- `backend/src/models/racks.model.js`
- `backend/src/models/rackSlots.model.js`

---

## DATABASE SCHEMAS

### Locations Table

```sql
CREATE TABLE locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique location identifier',
    name VARCHAR(255) NOT NULL COMMENT 'Location name (e.g., "Main Schema", "Regional DC")',
    address TEXT NOT NULL COMMENT 'Full physical address',
    coordinates VARCHAR(255) COMMENT 'GPS coordinates in "lat,lng" format',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    
    INDEX idx_name (name),
    INDEX idx_coordinates (coordinates),
    UNIQUE KEY uk_location_address (address(100))
);
```

**Column Specifications:**
- `location_id`: Auto-incrementing primary key (MySQL generates)
- `name`: VARCHAR(255) - Location display name
- `address`: TEXT - Full address (can be long, hence TEXT type)
- `coordinates`: VARCHAR(255) - Format: "-23.5505,-46.6333" (latitude,longitude)
- `created_at`: TIMESTAMP - Auto-set to current time on insert

---

### Depots Table

```sql
CREATE TABLE depots (
    depot_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique depot identifier',
    parent_location INT NOT NULL COMMENT 'Foreign key to locations table',
    name VARCHAR(255) NOT NULL COMMENT 'Depot name (e.g., "North Building", "Cold Storage")',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_location) REFERENCES locations(location_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE COMMENT 'Cascade delete: removing location deletes all depots',
    
    INDEX idx_parent_location (parent_location),
    INDEX idx_depot_name (name),
    UNIQUE KEY uk_depot_name_location (parent_location, name)
);
```

**Cascade Behavior:**
- ON DELETE CASCADE: Deleting a location automatically deletes all its depots
- ON UPDATE CASCADE: Updating location_id updates all child depots

---

### Aisles Table

```sql
CREATE TABLE aisles (
    aisle_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique aisle identifier',
    parent_depot INT NOT NULL COMMENT 'Foreign key to depots table',
    name VARCHAR(255) NOT NULL COMMENT 'Aisle name (e.g., "A1", "A2", "Electronics Aisle")',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_depot) REFERENCES depots(depot_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    INDEX idx_parent_depot (parent_depot),
    INDEX idx_aisle_name (name)
);
```

---

### Racks Table

```sql
CREATE TABLE racks (
    rack_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique rack identifier',
    parent_aisle INT NOT NULL COMMENT 'Foreign key to aisles table',
    rack_code VARCHAR(100) NOT NULL COMMENT 'Unique rack code (e.g., "A1-R1", "A1-R2")',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_aisle) REFERENCES aisles(aisle_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    INDEX idx_parent_aisle (parent_aisle),
    INDEX idx_rack_code (rack_code),
    UNIQUE KEY uk_rack_code (rack_code)
);
```

---

### Rack Slots Table

```sql
CREATE TABLE rack_slots (
    slot_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique slot identifier',
    rack_id INT NOT NULL COMMENT 'Foreign key to racks table',
    direction ENUM('left', 'right') NOT NULL DEFAULT 'left' COMMENT 'Directional orientation',
    bay_no INT NOT NULL COMMENT 'Bay number (1-based, horizontal position)',
    level_no INT NOT NULL COMMENT 'Level number (1-based, vertical position)',
    bin_no INT NOT NULL COMMENT 'Bin number (1-based, depth position)',
    capacity INT DEFAULT 100 COMMENT 'Maximum quantity this slot can hold',
    is_occupied BOOLEAN DEFAULT FALSE COMMENT 'Whether slot contains stock',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (rack_id) REFERENCES racks(rack_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    INDEX idx_rack_id (rack_id),
    INDEX idx_is_occupied (is_occupied),
    INDEX idx_direction (direction),
    UNIQUE KEY uk_slot_coordinates (rack_id, direction, bay_no, level_no, bin_no)
);
```

**Slot Coordinates Explanation:**
```
Unique combination of (bay_no, level_no, bin_no) per rack identifies exact position:
- bay_no:   Horizontal aisle position (1-5)
- level_no: Vertical shelf position (1-4)
- bin_no:   Depth position (1-3)
- direction: Left or right side of aisle (for two-sided racks)

Example: Bay 2, Level 3, Bin 1, Left = physical location "A1-R1-L2-3-1"
```

---

## LOCATIONS MODEL

### Location.getAllPaginated(page, limit, search)

Fetches paginated locations with optional search filtering.

**SQL Query:**
```sql
SELECT * FROM locations 
WHERE name LIKE ? 
   OR address LIKE ? 
   OR coordinates LIKE ?
ORDER BY created_at DESC 
LIMIT ? OFFSET ?;

-- Parameters: [
--   '%' + search + '%',  (name search)
--   '%' + search + '%',  (address search)
--   '%' + search + '%',  (coordinates search)
--   limit,
--   (page - 1) * limit
-- ]
```

**Implementation:**
```javascript
getAllPaginated: (page = 1, limit = 5, search = '') => {
  return new Promise((resolve, reject) => {
    const { limit: queryLimit, offset } = buildPagination(page, limit);
    const { conditions, params } = buildSearchConditions(
      ['name', 'address', 'coordinates'],
      search
    );
    
    const whereClause = conditions ? `WHERE ${conditions}` : '';
    const queryParams = [...params, queryLimit, offset];
    
    connection.query(
      `SELECT * FROM locations ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      queryParams,
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
}
```

**Return Data:**
```javascript
[
  {
    location_id: 1,
    name: "Main Schema",
    address: "123 Industrial Blvd, City, State 12345",
    coordinates: "-23.5505,-46.6333",
    created_at: Date  // JavaScript Date object
  },
  ...
]
```

---

### Location.getTotalCount(search)

Gets total count for pagination calculation.

**SQL Query:**
```sql
SELECT COUNT(*) as total FROM locations
WHERE name LIKE ? 
   OR address LIKE ? 
   OR coordinates LIKE ?;

-- Parameters: ['%search%', '%search%', '%search%']
```

**Return Data:**
```javascript
{
  total: number  // Total matching records
}
// Result accessed as results[0].total
```

---

### Location.getById(id)

Fetches a single location by ID.

**SQL Query:**
```sql
SELECT * FROM locations WHERE location_id = ?;
-- Parameters: [id]
```

**Return Data:**
```javascript
{
  location_id: number,
  name: string,
  address: string,
  coordinates: string,
  created_at: Date
}
// Returns undefined if not found
```

---

### Location.create(locationData)

Creates a new location record.

**SQL Query:**
```sql
INSERT INTO locations (name, address, coordinates) 
VALUES (?, ?, ?);

-- Parameters: [name, address, coordinates]
-- Auto-generated: location_id (AUTO_INCREMENT), created_at (CURRENT_TIMESTAMP)
```

**Input:**
```javascript
{
  name: "Regional Distribution Center",
  address: "456 Logistics Way, Metro City, ST 67890",
  coordinates: "34.0522,-118.2437"
}
```

**Return Data:**
```javascript
{
  affectedRows: 1,
  insertId: 123,        // New location_id
  warningCount: 0
}
```

---

### Location.update(id, locationData)

Updates an existing location.

**SQL Query:**
```sql
UPDATE locations 
SET name = ?, address = ?, coordinates = ? 
WHERE location_id = ?;

-- Parameters: [name, address, coordinates, id]
```

**Return Data:**
```javascript
{
  affectedRows: 0 | 1,  // 1 if updated, 0 if not found
  changedRows: 0 | 1,   // 1 if data actually changed
  warningCount: 0
}
```

---

### Location.delete(id)

Deletes a location (cascades to all children).

**SQL Query:**
```sql
DELETE FROM locations WHERE location_id = ?;

-- Parameters: [id]
```

**Cascade Effects:**
```
DELETE location (id=1)
  ↓ ON DELETE CASCADE
Depots WHERE parent_location = 1
  ↓ ON DELETE CASCADE
Aisles WHERE parent_depot IN (depot_ids)
  ↓ ON DELETE CASCADE
Racks WHERE parent_aisle IN (aisle_ids)
  ↓ ON DELETE CASCADE
RackSlots WHERE rack_id IN (rack_ids)
```

**Return Data:**
```javascript
{
  affectedRows: number,  // Rows deleted
  warningCount: 0
}
```

---

## DEPOTS MODEL

### Depot.getAllPaginated(page, limit, search)

Fetches depots for a specific location.

**SQL Query:**
```sql
SELECT 
  d.*,
  COUNT(DISTINCT rs.slot_id) as total_slots,
  SUM(CASE WHEN rs.is_occupied = 1 THEN 1 ELSE 0 END) as occupied_slots
FROM depots d
LEFT JOIN aisles a ON d.depot_id = a.parent_depot
LEFT JOIN racks r ON a.aisle_id = r.parent_aisle
LEFT JOIN rack_slots rs ON r.rack_id = rs.rack_id
WHERE d.parent_location = ?
  AND d.name LIKE ?
GROUP BY d.depot_id
ORDER BY d.created_at DESC
LIMIT ? OFFSET ?;

-- Parameters: [locationId, '%search%', limit, offset]
```

**Return Data:**
```javascript
[
  {
    depot_id: 1,
    parent_location: 1,
    name: "North Building",
    total_slots: 300,
    occupied_slots: 245,
    created_at: Date
  },
  ...
]
```

---

### Depot.create(locationId, depotData)

Creates a new depot.

**SQL Query:**
```sql
INSERT INTO depots (parent_location, name) 
VALUES (?, ?);

-- Parameters: [locationId, name]
```

**Return Data:**
```javascript
{
  affectedRows: 1,
  insertId: 5,  // New depot_id
  warningCount: 0
}
```

---

## AISLES MODEL

### Aisle.getAllPaginated(page, limit, search)

Fetches aisles for a specific depot with slot counts.

**SQL Query:**
```sql
SELECT 
  a.*,
  COUNT(DISTINCT r.rack_id) as total_racks,
  COUNT(DISTINCT rs.slot_id) as total_slots,
  SUM(CASE WHEN rs.is_occupied = 1 THEN 1 ELSE 0 END) as occupied_slots
FROM aisles a
LEFT JOIN racks r ON a.aisle_id = r.parent_aisle
LEFT JOIN rack_slots rs ON r.rack_id = rs.rack_id
WHERE a.parent_depot = ?
  AND a.name LIKE ?
GROUP BY a.aisle_id
ORDER BY a.created_at DESC
LIMIT ? OFFSET ?;

-- Parameters: [depotId, '%search%', limit, offset]
```

---

### Aisle.create(depotId, aisleData)

Creates a new aisle.

**SQL Query:**
```sql
INSERT INTO aisles (parent_depot, name) 
VALUES (?, ?);

-- Parameters: [depotId, name]
```

---

## RACKS MODEL

### Rack.getAllPaginated(page, limit, search)

Fetches racks with slot statistics.

**SQL Query:**
```sql
SELECT 
  r.*,
  COUNT(DISTINCT rs.slot_id) as total_slots,
  SUM(CASE WHEN rs.is_occupied = 1 THEN 1 ELSE 0 END) as occupied_slots,
  (COUNT(DISTINCT rs.slot_id) - SUM(CASE WHEN rs.is_occupied = 1 THEN 1 ELSE 0 END)) as empty_slots
FROM racks r
LEFT JOIN rack_slots rs ON r.rack_id = rs.rack_id
WHERE r.parent_aisle = ?
  AND r.rack_code LIKE ?
GROUP BY r.rack_id
ORDER BY r.rack_code ASC
LIMIT ? OFFSET ?;

-- Parameters: [aisleId, '%search%', limit, offset]
```

---

### Rack.create(aisleId, rackCode)

Creates a new rack.

**SQL Query:**
```sql
INSERT INTO racks (parent_aisle, rack_code) 
VALUES (?, ?);

-- Parameters: [aisleId, rackCode]
```

---

## RACK SLOTS MODEL

### RackSlot.createBatch(rackId, slots)

Creates multiple slots in a single transaction.

**SQL Query:**
```sql
INSERT INTO rack_slots (rack_id, direction, bay_no, level_no, bin_no, capacity) 
VALUES 
  (?, ?, ?, ?, ?, ?),
  (?, ?, ?, ?, ?, ?),
  ...;

-- Example for 5×4×3 = 60 slots
```

**Input:**
```javascript
[
  { direction: 'left', bay_no: 1, level_no: 1, bin_no: 1, capacity: 100 },
  { direction: 'left', bay_no: 1, level_no: 1, bin_no: 2, capacity: 100 },
  { direction: 'left', bay_no: 1, level_no: 1, bin_no: 3, capacity: 100 },
  { direction: 'right', bay_no: 1, level_no: 1, bin_no: 1, capacity: 100 },
  ...
]
```

---

### RackSlot.getAllByRack(rackId, page, limit, filters)

Fetches slots with join to stocks/products.

**SQL Query:**
```sql
SELECT 
  rs.slot_id,
  rs.rack_id,
  rs.direction,
  rs.bay_no,
  rs.level_no,
  rs.bin_no,
  rs.capacity,
  rs.is_occupied,
  s.quantity,
  s.stock_id,
  p.product_id,
  p.name as product_name
FROM rack_slots rs
LEFT JOIN stocks s ON rs.slot_id = s.slot_id
LEFT JOIN products p ON s.product_id = p.product_id
WHERE rs.rack_id = ?
  AND (? IS NULL OR rs.is_occupied = ?)
  AND (? IS NULL OR rs.direction = ?)
ORDER BY rs.bay_no, rs.level_no, rs.bin_no
LIMIT ? OFFSET ?;

-- Parameters: [rackId, filter_occupied, filter_occupied, filter_direction, filter_direction, limit, offset]
```

---

### RackSlot.updateBatch(slotIds, updates)

Updates multiple slots simultaneously.

**SQL Query:**
```sql
UPDATE rack_slots 
SET capacity = ?, is_occupied = ?
WHERE slot_id IN (?, ?, ?, ...);

-- Parameters: [newCapacity, newIsOccupied, ...slotIds]
```

---

## Connection Management

### Connection Pooling

```javascript
import connection from '../config/database.js';

// connection is a pool from mysql library
// Automatically handles connection reuse and error recovery
```

**Connection Pool Features:**
- Reuses connections for multiple queries
- Limits concurrent connections (default: 10)
- Auto-reconnects on connection loss
- Queues queries during high load

---

## Error Handling Patterns

**Connection Errors:**
```javascript
(err, results) => {
  if (err) {
    // Log error
    console.error('Database error:', err.code, err.message);
    
    // Handle specific errors
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      // Connection pool will auto-reconnect
    }
    if (err.code === 'ER_DUP_ENTRY') {
      // Duplicate key violation
      reject(new Error('Record already exists'));
    }
    
    // Reject promise
    reject(err);
  }
}
```

**Query Timeout:**
```javascript
// Connection pool timeout (default: 10 seconds)
// If query takes longer, connection is destroyed and recreated
```

---

## SQL Helper Functions

### buildPagination(page, limit)

Calculates LIMIT and OFFSET for pagination.

```javascript
// Input: page=2, limit=10
// Output: { limit: 10, offset: 10 }
// SQL: LIMIT 10 OFFSET 10  (skips first 10, gets next 10)
```

### buildSearchConditions(fields, search)

Creates WHERE clause for multi-field search.

```javascript
// Input: fields=['name', 'address'], search='schema'
// Output: {
//   conditions: "name LIKE ? OR address LIKE ?",
//   params: ['%schema%', '%schema%']
// }
```

All models use these utilities for consistent query building.
