# Schema Routes

## Purpose
Defines HTTP endpoints for schema management including locations, depots, aisles, racks, and rack slots. Implements hierarchical schema structure with nested routes for managing the complete physical inventory infrastructure.

## File Locations
- `backend/src/routes/locations.routes.js`
- `backend/src/routes/depots.routes.js`
- `backend/src/routes/aisles.routes.js`
- `backend/src/routes/racks.routes.js`

## Hierarchical Route Structure

The schema routes follow a parent-child relationship: Location → Depot → Aisle → Rack → RackSlot

```
/api/locations
├── GET /api/locations                          (list all)
├── GET /api/locations/:id                      (get one)
├── POST /api/locations                         (create)
├── PUT /api/locations/:id                      (update)
├── DELETE /api/locations/:id                   (delete)
└── /api/locations/:locationId/depots           (nested)
    ├── GET /api/locations/:locationId/depots
    ├── GET /api/locations/:locationId/depots/:id
    ├── POST /api/locations/:locationId/depots
    ├── PUT /api/locations/:locationId/depots/:id
    ├── DELETE /api/locations/:locationId/depots/:id
    └── /api/locations/:locationId/depots/:depotId/aisles
        ├── GET /api/locations/:locationId/depots/:depotId/aisles
        ├── GET /api/locations/:locationId/depots/:depotId/aisles/:id
        ├── POST /api/locations/:locationId/depots/:depotId/aisles
        ├── PUT /api/locations/:locationId/depots/:depotId/aisles/:id
        ├── DELETE /api/locations/:locationId/depots/:depotId/aisles/:id
        └── /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks
            ├── GET /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks
            ├── GET /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks/:id
            ├── POST /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks
            ├── PUT /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks/:id
            ├── DELETE /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks/:id
            └── /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks/:rackId/slots
                ├── GET /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks/:rackId/slots
                ├── GET /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks/:rackId/slots/:id
                ├── POST /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks/:rackId/slots
                ├── PUT /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks/:rackId/slots/:id
                └── DELETE /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks/:rackId/slots/:id
```

---

## LOCATIONS ROUTES

### GET /api/locations
List all locations with pagination and search.

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
  search: string              // Search in name, address, coordinates
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: Location[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}

// Location Type
Location = {
  location_id: number,
  name: string,
  address: string,
  coordinates: string,        // Format: "lat,lng"
  created_at: string          // ISO 8601 timestamp
}
```

**Example Request:**
```
GET /api/locations?page=1&limit=10&search=schema
```

---

### GET /api/locations/:id
Get single location details.

**Path Parameters:**
```javascript
{
  id: number  // Location ID
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: Location
}
```

**Possible Errors:**
- `404 Not Found` - Location doesn't exist
- `500 Server Error` - Database error

---

### POST /api/locations
Create a new location.

**Request Content-Type:**
```
application/json
```

**Body Data Types:**
```javascript
{
  name: string,              // Required, location name
  address: string,           // Required, full address
  coordinates: string        // Required, format: "latitude,longitude"
}
```

**Response (201 Created):**
```javascript
{
  success: boolean,
  message: string,
  data: {
    location_id: number,
    name: string,
    address: string,
    coordinates: string,
    created_at: string
  }
}
```

**Validation Rules:**
```javascript
{
  name: { required: true, type: string, minLength: 1 },
  address: { required: true, type: string, minLength: 5 },
  coordinates: { required: true, type: string, pattern: "^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$" }
}
```

**Possible Errors:**
- `400 Bad Request` - Missing or invalid fields
- `500 Server Error` - Database error

---

### PUT /api/locations/:id
Update a location.

**Path Parameters:**
```javascript
{
  id: number  // Location ID
}
```

**Body Data Types:**
```javascript
{
  name: string | undefined,
  address: string | undefined,
  coordinates: string | undefined
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
- `404 Not Found` - Location doesn't exist
- `400 Bad Request` - Invalid data
- `500 Server Error` - Database error

---

### DELETE /api/locations/:id
Delete a location (cascades to depots, aisles, racks).

**Path Parameters:**
```javascript
{
  id: number  // Location ID
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

---

## DEPOTS ROUTES (Nested under locations)

### GET /api/locations/:locationId/depots
List all depots in a location.

**Path Parameters:**
```javascript
{
  locationId: number  // Parent location ID
}
```

**Query Parameters:**
```javascript
{
  page: string | number,
  limit: string | number,
  search: string
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: Depot[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}

// Depot Type
Depot = {
  depot_id: number,
  parent_location: number,
  name: string,
  capacity_utilization: number | null,  // Percentage (0-100)
  total_slots: number,
  occupied_slots: number,
  created_at: string
}
```

---

### POST /api/locations/:locationId/depots
Create depot in a location.

**Body Data Types:**
```javascript
{
  name: string  // Required, depot name
}
```

**Response (201 Created):**
```javascript
{
  success: boolean,
  message: string,
  data: {
    depot_id: number,
    parent_location: number,
    name: string,
    created_at: string
  }
}
```

---

## AISLES ROUTES (Nested under depots)

### GET /api/locations/:locationId/depots/:depotId/aisles
List all aisles in a depot.

**Path Parameters:**
```javascript
{
  locationId: number,
  depotId: number  // Parent depot ID
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: Aisle[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}

// Aisle Type
Aisle = {
  aisle_id: number,
  parent_depot: number,
  name: string,
  total_racks: number,
  capacity_utilization: number | null,
  created_at: string
}
```

---

### POST /api/locations/:locationId/depots/:depotId/aisles
Create aisle in a depot.

**Body Data Types:**
```javascript
{
  name: string  // Required, aisle name (e.g., "A1", "A2")
}
```

---

## RACKS ROUTES (Nested under aisles)

### GET /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks
List all racks in an aisle.

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: Rack[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}

// Rack Type
Rack = {
  rack_id: number,
  parent_aisle: number,
  rack_code: string,
  total_slots: number,
  occupied_slots: number,
  capacity_utilization: number,
  empty_slots: number,
  created_at: string
}
```

---

### POST /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks
Create rack in an aisle.

**Body Data Types:**
```javascript
{
  rack_code: string,  // Required, unique code (e.g., "A1-R1")
  bays: number,       // Number of bays (default: 5)
  levels: number,     // Number of levels (default: 4)
  bins: number        // Bins per level (default: 3)
}
```

**Calculation:**
```
total_slots = bays × levels × bins
```

---

## RACK SLOTS ROUTES (Nested under racks)

### GET /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks/:rackId/slots
List all slots in a rack.

**Query Parameters:**
```javascript
{
  page: string | number,
  limit: string | number,
  occupied: boolean,  // Filter by occupancy (true/false)
  direction: string   // Filter by direction ("left" or "right")
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: RackSlot[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}

// RackSlot Type
RackSlot = {
  slot_id: number,
  rack_id: number,
  direction: "left" | "right",
  bay_no: number,
  level_no: number,
  bin_no: number,
  capacity: number,
  is_occupied: boolean,
  occupancy_percentage: number,
  stock_id: number | null,
  product_name: string | null,
  quantity: number | null,
  created_at: string
}
```

---

### POST /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks/:rackId/slots
Create slots in a rack (bulk creation).

**Body Data Types:**
```javascript
{
  slots: Array<{
    direction: "left" | "right",
    bay_no: number,
    level_no: number,
    bin_no: number,
    capacity: number
  }>
}
```

**Response (201 Created):**
```javascript
{
  success: boolean,
  message: string,
  data: {
    created_count: number,
    slots: RackSlot[]
  }
}
```

---

### PUT /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks/:rackId/slots/:slotId
Update slot capacity and occupancy.

**Body Data Types:**
```javascript
{
  capacity: number,
  is_occupied: boolean
}
```

---

## Schema Utilization Endpoints

### GET /api/locations/:locationId/utilization
Get detailed utilization metrics for a location.

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: {
    location_id: number,
    location_name: string,
    total_depots: number,
    total_aisles: number,
    total_racks: number,
    total_slots: number,
    occupied_slots: number,
    empty_slots: number,
    utilization_percentage: number,
    depots: Array<{
      depot_id: number,
      name: string,
      utilization_percentage: number,
      aisles_count: number
    }>
  }
}
```

---

## Bulk Operations

### POST /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks/:rackId/bulk-update
Bulk update multiple slots.

**Body Data Types:**
```javascript
{
  slot_ids: number[],
  capacity: number | undefined,
  direction: string | undefined,
  is_occupied: boolean | undefined
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: {
    updated_count: number,
    updated_slots: RackSlot[]
  }
}
```

---

## Error Responses

**400 Bad Request:**
```javascript
{
  success: false,
  message: "Invalid request parameters",
  error: "Location ID must be a positive integer"
}
```

**404 Not Found:**
```javascript
{
  success: false,
  message: "Resource not found",
  error: "Location with ID 999 does not exist"
}
```

**500 Internal Server Error:**
```javascript
{
  success: false,
  message: "Database error",
  error: "Internal server error"
}
```
