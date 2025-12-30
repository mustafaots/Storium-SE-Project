# Schema API

## Purpose
HTTP communication for schema endpoints.

## File Location
`frontend/src/utils/schemaAPI.js`

## API Methods

### getLocations(params)

**HTTP Request:**
```
GET /api/locations?page=1&limit=10&search=&sortBy=name
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: Location[],
  pagination: {page, limit, total, pages}
}
```

---

### getLocationHierarchy(id)

**HTTP Request:**
```
GET /api/locations/5/hierarchy
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: LocationHierarchy
}
```

---

### getRackUtilization(rackId)

**HTTP Request:**
```
GET /api/racks/12/utilization
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: RackUtilization
}
```

---

### createLocation(locationData)

**HTTP Request:**
```
POST /api/locations
Content-Type: application/json

{
  "name": "Main Schema",
  "code": "MW-001",
  "type": "location",
  "total_capacity": 1000,
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:** `201 Created`
```javascript
{
  success: boolean,
  data: Location
}
```

---

### updateLocation(id, locationData)

**HTTP Request:**
```
PUT /api/locations/5
Content-Type: application/json
```

**Response:** `200 OK`

---

### deleteLocation(id)

**HTTP Request:**
```
DELETE /api/locations/5
```

**Response:** `200 OK`

---

### rebalanceRacks(rackId, strategy)

**HTTP Request:**
```
POST /api/racks/12/rebalance
Content-Type: application/json

{
  "strategy": "optimize"
}
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  changes: [{from_rack, to_rack, product_id, quantity}]
}
```

---

## Type Definitions

```typescript
interface Location {
  location_id: number;
  name: string;
  code: string;
  type: 'location' | 'depot';
  parent_location_id: number | null;
  total_capacity: number;
  used_capacity: number;
  available_slots: number;
}

interface LocationHierarchy {
  location: Location;
  depots: Depot[];
}

interface RackUtilization {
  rack_id: number;
  name: string;
  total_slots: number;
  occupied_slots: number;
  utilization_percent: number;
}
```

---

## Dependencies
- `axios` - HTTP client
