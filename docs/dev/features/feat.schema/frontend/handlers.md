# Schema Handlers

## Purpose
Business logic for schema operations.

## File Location
`frontend/src/handlers/schemaHandlers.js`

## Handler Methods

### fetchLocations(page, limit, search, sortBy)

**Input:**
```javascript
page: number
limit: number
search: string
sortBy: string  // 'name', 'capacity', 'utilization'
```

**Validation:**
```javascript
- Validate page >= 1
- Validate limit between 1 and 100
- Trim search string
```

**API Call:**
```javascript
schemaAPI.getLocations({page, limit, search, sortBy})
```

**Output:**
```javascript
{
  locations: Location[],
  pagination: {page, limit, total, pages}
}
```

---

### fetchLocationHierarchy(locationId)

**Input:**
```javascript
locationId: number
```

**API Call:**
```javascript
schemaAPI.getLocationHierarchy(locationId)
```

**Output:** LocationHierarchy

---

### fetchRackUtilization(rackId)

**Input:**
```javascript
rackId: number
```

**API Call:**
```javascript
schemaAPI.getRackUtilization(rackId)
```

**Output:** RackUtilization

---

### createLocation(formData)

**Input:**
```javascript
{
  name: string,
  code: string,
  type: string,
  parent_location_id: number | null,
  latitude: number | null,
  longitude: number | null,
  total_capacity: number
}
```

**Validation:**
```javascript
- name length 2-100
- code length 2-20
- type must be 'location' or 'depot'
- capacity > 0
```

**API Call:**
```javascript
schemaAPI.createLocation(formData)
```

---

### rebalanceRacks(rackId, strategy)

**Input:**
```javascript
rackId: number
strategy: string  // 'optimize' or 'consolidate'
```

**API Call:**
```javascript
schemaAPI.rebalanceRacks(rackId, {strategy})
```

**Output:** List of moves executed

---

## Dependencies
- `utils/schemaAPI.js`
