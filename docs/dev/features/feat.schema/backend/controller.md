# Schema Controller

## Purpose
Handles HTTP requests and responses for schema operations. Acts as the entry point for all location, depot, aisle, rack, and rack slot API calls. Manages request validation, service orchestration, and response formatting.

## File Locations
- `backend/src/controllers/locations.controller.js`
- `backend/src/controllers/depots.controller.js`
- `backend/src/controllers/aisles.controller.js`
- `backend/src/controllers/racks.controller.js`

## Middleware Chain Execution

Each request passes through this chain:

```
Request
  ↓
[CORS Middleware] → Allow cross-origin requests
  ↓
[Parse JSON] → Parse request body
  ↓
[Request Logger] → Log request details
  ↓
[Route Handler] → Controller method
  ↓
[Response Formatter] → Format response with apiResponse utility
  ↓
[Error Handler] → Catch and format errors
  ↓
Response
```

---

## LOCATIONS CONTROLLER

### getAll(req, res)
Fetches all locations with pagination and search support.

**Request Data Types:**
```javascript
req.query = {
  page: number,           // Page number (default: 1)
  limit: number,          // Items per page (default: 10, max: 100)
  search: string          // Search term for name, address, coordinates
}
```

**Processing Steps:**
```
1. Extract & validate pagination parameters
2. Extract & trim search term
3. Call locationsService.getAllPaginated(page, limit, search)
4. Format dates (ISO 8601)
5. Return paginated response with pagination object
```

**Response Data Types:**
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

// Individual Location type
Location = {
  location_id: number,
  name: string,
  address: string,
  coordinates: string,    // Format: "latitude,longitude"
  created_at: string      // ISO 8601 formatted
}
```

**HTTP Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid pagination parameters
- `500 Internal Server Error` - Database error

---

### getById(req, res)
Fetches a single location by ID.

**Request Data Types:**
```javascript
req.params = {
  id: number  // Location ID (converted from string)
}
```

**Processing Steps:**
```
1. Extract location ID from params
2. Call locationsService.getById(id)
3. Check if location exists
4. Format date
5. Return success or 404 error
```

**Response Data Types:**
```javascript
{
  success: boolean,
  message: string,
  data: Location
}
```

**HTTP Status Codes:**
- `200 OK` - Location found
- `404 Not Found` - Location doesn't exist
- `500 Internal Server Error` - Database error

---

### create(req, res)
Creates a new location.

**Request Data Types:**
```javascript
req.body = {
  name: string,              // Location name (required)
  address: string,           // Full address (required)
  coordinates: string        // Lat,lng format (required)
}
```

**Validation Rules:**
```javascript
{
  name: {
    required: true,
    type: string,
    minLength: 1
  },
  address: {
    required: true,
    type: string,
    minLength: 5
  },
  coordinates: {
    required: true,
    type: string,
    pattern: "lat,lng"      // Regex: ^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$
  }
}
```

**Processing Steps:**
```
1. Validate request body structure
2. Call locationsService.create(data)
3. Generate location_id (auto-increment)
4. Set created_at timestamp (CURRENT_TIMESTAMP)
5. Return 201 Created with new location
```

**Response Data Types:**
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

**HTTP Status Codes:**
- `201 Created` - Location created successfully
- `400 Bad Request` - Validation error
- `500 Internal Server Error` - Database error

---

### update(req, res)
Updates an existing location.

**Request Data Types:**
```javascript
req.params = {
  id: number  // Location ID
}

req.body = {
  name: string | undefined,
  address: string | undefined,
  coordinates: string | undefined
}
```

**Processing Steps:**
```
1. Extract location ID
2. Validate request body (partial updates allowed)
3. Call locationsService.update(id, data)
4. Check if update affected any rows (existence check)
5. Return success or 404 error
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
- `404 Not Found` - Location doesn't exist
- `400 Bad Request` - Validation error
- `500 Internal Server Error` - Database error

---

### delete(req, res)
Deletes a location and cascades to child records.

**Request Data Types:**
```javascript
req.params = {
  id: number  // Location ID
}
```

**Cascade Behavior:**
```
DELETE location
  ↓
ON DELETE CASCADE
  ├── DELETE all associated depots
  ├── DELETE all aisles in those depots
  ├── DELETE all racks in those aisles
  ├── DELETE all slots in those racks
  └── DELETE all stocks in those slots
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
- `404 Not Found` - Location doesn't exist
- `500 Internal Server Error` - Database error

---

## DEPOTS CONTROLLER

### getAllDepots(req, res)
Fetches all depots in a location.

**Request Data Types:**
```javascript
req.params = {
  locationId: number  // Parent location ID
}

req.query = {
  page: number,
  limit: number,
  search: string
}
```

**Response Data Types:**
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

// Individual Depot type
Depot = {
  depot_id: number,
  parent_location: number,
  name: string,
  capacity_utilization: number | null,  // Percentage 0-100
  total_slots: number,
  occupied_slots: number,
  created_at: string
}
```

---

### createDepot(req, res)
Creates a new depot in a location.

**Request Data Types:**
```javascript
req.params = {
  locationId: number
}

req.body = {
  name: string  // Depot name (required)
}
```

**Processing Steps:**
```
1. Verify parent location exists
2. Validate depot name (not empty)
3. Call depotsService.create({ name, parent_location: locationId })
4. Return 201 Created with new depot
```

**Response Data Types:**
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

## AISLES CONTROLLER

### getAllAisles(req, res)
Fetches all aisles in a depot.

**Request Data Types:**
```javascript
req.params = {
  locationId: number,
  depotId: number  // Parent depot ID
}

req.query = {
  page: number,
  limit: number,
  search: string
}
```

**Response Data Types:**
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

// Individual Aisle type
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

### createAisle(req, res)
Creates a new aisle in a depot.

**Request Data Types:**
```javascript
req.params = {
  locationId: number,
  depotId: number
}

req.body = {
  name: string  // Aisle name (e.g., "A1", "A2")
}
```

**Response Data Types:**
```javascript
{
  success: boolean,
  message: string,
  data: {
    aisle_id: number,
    parent_depot: number,
    name: string,
    created_at: string
  }
}
```

---

## RACKS CONTROLLER

### getAllRacks(req, res)
Fetches all racks in an aisle.

**Request Data Types:**
```javascript
req.params = {
  locationId: number,
  depotId: number,
  aisleId: number
}

req.query = {
  page: number,
  limit: number,
  search: string
}
```

**Response Data Types:**
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

// Individual Rack type
Rack = {
  rack_id: number,
  parent_aisle: number,
  rack_code: string,
  total_slots: number,
  occupied_slots: number,
  empty_slots: number,
  capacity_utilization: number,  // Percentage
  created_at: string
}
```

---

### createRack(req, res)
Creates a new rack with calculated slots.

**Request Data Types:**
```javascript
req.params = {
  locationId: number,
  depotId: number,
  aisleId: number
}

req.body = {
  rack_code: string,  // Unique code (e.g., "A1-R1")
  bays: number,       // Number of bays (default: 5)
  levels: number,     // Number of levels (default: 4)
  bins: number        // Bins per level (default: 3)
}
```

**Slot Calculation:**
```javascript
total_slots = bays × levels × bins

// Example:
5 bays × 4 levels × 3 bins = 60 total slots per rack
```

**Processing Steps:**
```
1. Verify parent aisle exists
2. Validate rack code (unique, not empty)
3. Validate dimensions (bays, levels, bins are positive numbers)
4. Calculate total_slots
5. Call racksService.create({ rack_code, parent_aisle, bays, levels, bins })
6. Create individual slot records in bulk
7. Return 201 Created with new rack and slot count
```

**Response Data Types:**
```javascript
{
  success: boolean,
  message: string,
  data: {
    rack_id: number,
    parent_aisle: number,
    rack_code: string,
    total_slots: number,
    slots_created: number,
    created_at: string
  }
}
```

---

## RACK SLOTS CONTROLLER

### getAllSlots(req, res)
Fetches all slots in a rack with optional filters.

**Request Data Types:**
```javascript
req.params = {
  locationId: number,
  depotId: number,
  aisleId: number,
  rackId: number
}

req.query = {
  page: number,
  limit: number,
  occupied: boolean,        // true/false to filter by occupancy
  direction: string,        // "left" or "right"
  capacity_min: number      // Minimum capacity
}
```

**Processing Steps:**
```
1. Extract filters
2. Build WHERE clause based on filters
3. Call rackSlotsService.getAllPaginated(rackId, filters)
4. Enrich with stock/product information if occupied
5. Calculate occupancy percentage
6. Return paginated response
```

**Response Data Types:**
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

// Individual RackSlot type
RackSlot = {
  slot_id: number,
  rack_id: number,
  direction: "left" | "right",
  bay_no: number,
  level_no: number,
  bin_no: number,
  capacity: number,
  is_occupied: boolean,
  occupancy_percentage: number,  // Calculated: (stock_quantity / capacity) * 100
  stock_id: number | null,       // If occupied
  product_name: string | null,   // If occupied
  product_id: number | null,
  quantity: number | null,       // Current quantity
  created_at: string
}
```

---

### updateSlot(req, res)
Updates a slot's capacity and occupancy metadata.

**Request Data Types:**
```javascript
req.params = {
  locationId: number,
  depotId: number,
  aisleId: number,
  rackId: number,
  slotId: number
}

req.body = {
  capacity: number | undefined,
  is_occupied: boolean | undefined
}
```

**Processing Steps:**
```
1. Verify slot exists
2. Validate new capacity (positive number)
3. Call rackSlotsService.update(slotId, data)
4. Return success message
```

**Response Data Types:**
```javascript
{
  success: boolean,
  message: string,
  data: null
}
```

---

## BULK OPERATIONS CONTROLLER

### bulkUpdateSlots(req, res)
Updates multiple slots in a rack simultaneously.

**Request Data Types:**
```javascript
req.params = {
  locationId: number,
  depotId: number,
  aisleId: number,
  rackId: number
}

req.body = {
  slot_ids: number[],           // Array of slot IDs
  capacity: number | undefined,
  direction: string | undefined, // "left" or "right"
  is_occupied: boolean | undefined
}
```

**Processing Steps:**
```
1. Validate slot_ids array (not empty, all positive integers)
2. Validate update fields (at least one provided)
3. Verify all slots belong to same rack
4. Build UPDATE query with WHERE slot_id IN (...)
5. Execute bulk update
6. Fetch updated records
7. Return updated count and records
```

**Response Data Types:**
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

## SCHEMA UTILIZATION CONTROLLER

### getSchemaUtilization(req, res)
Gets detailed utilization metrics for an entire location.

**Request Data Types:**
```javascript
req.params = {
  locationId: number
}
```

**Calculation Logic:**
```javascript
// Query all depots in location
FOR EACH depot:
  FOR EACH aisle in depot:
    FOR EACH rack in aisle:
      total_slots += COUNT(slots)
      occupied_slots += COUNT(slots WHERE is_occupied = true)

utilization_percentage = (occupied_slots / total_slots) * 100
```

**Response Data Types:**
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
      aisles_count: number,
      total_slots: number,
      occupied_slots: number
    }>
  }
}
```

---

## Error Handling

All errors follow this format:

**400 Bad Request:**
```javascript
{
  success: false,
  message: "Invalid request",
  error: "Rack code must be a string"
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

All controllers utilize the `apiResponse` utility for consistent response formatting across the application.
