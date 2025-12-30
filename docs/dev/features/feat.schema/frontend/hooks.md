# Schema Hooks

## Purpose
State management for schema/location hierarchy.

## File Location
`frontend/src/hooks/useSchema.js`

## useSchema Hook

### State

```javascript
{
  locations: Location[],
  selectedLocation: Location | null,
  hierarchy: LocationHierarchy | null,
  rackUtilization: RackUtilization | null,
  
  loading: boolean,
  error: string | null,
  
  filters: {
    search: string,
    sortBy: string
  },
  
  pagination: {page, limit, total, pages},
  
  showLocationForm: boolean,
  showRackDetailModal: boolean,
  selectedRack: RackUtilization | null,
  
  // Methods
  loadLocations: (page?: number) => Promise<void>,
  loadHierarchy: (locationId: number) => Promise<void>,
  loadRackUtilization: (rackId: number) => Promise<void>,
  createLocation: (data) => Promise<void>,
  updateLocation: (id, data) => Promise<void>,
  deleteLocation: (id) => Promise<void>,
  rebalanceRacks: (rackId, strategy) => Promise<void>,
  setFilters: (filters) => void,
  handlePageChange: (newPage) => void
}
```

### Methods

**loadLocations(page)**
- GET /api/locations?page={page}&limit=10&search={search}
- Update locations state

**loadHierarchy(locationId)**
- GET /api/locations/{id}/hierarchy
- Update hierarchy state with full tree

**loadRackUtilization(rackId)**
- GET /api/racks/{id}/utilization
- Update rackUtilization state

**createLocation(formData)**
- POST /api/locations
- Reload locations list

**rebalanceRacks(rackId, strategy)**
- POST /api/racks/{id}/rebalance
- Reload hierarchy after rebalancing

---

## Type Definitions

```typescript
interface Location {
  location_id: number;
  name: string;
  code: string;
  type: 'location' | 'depot';
  parent_location_id: number | null;
  latitude: number | null;
  longitude: number | null;
  total_capacity: number;
  used_capacity: number;
  available_slots: number;
}

interface LocationHierarchy {
  location: Location;
  depots: Depot[];
}

interface Depot {
  depot_id: number;
  name: string;
  aisles: Aisle[];
}

interface Aisle {
  aisle_id: number;
  name: string;
  racks: Rack[];
}

interface Rack {
  rack_id: number;
  name: string;
  total_slots: number;
  occupied_slots: number;
  slots: RackSlot[];
}

interface RackSlot {
  slot_id: number;
  slot_number: number;
  product_id: number | null;
  quantity: number | null;
}

interface RackUtilization {
  rack_id: number;
  name: string;
  total_slots: number;
  occupied_slots: number;
  empty_slots: number;
  utilization_percent: number;
  products: { product_id: number; name: string; quantity: number }[];
}
```

---

## Dependencies
- `handlers/schemaHandlers.js`
- `react` hooks
