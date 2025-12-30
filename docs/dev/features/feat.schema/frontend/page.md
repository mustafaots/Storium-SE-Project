# Schema Frontend - Page, Hooks, Handlers, API, Components

## File Locations
- `frontend/src/pages/Schema/SchemaPage.jsx` - Main page component
- `frontend/src/hooks/useSchema.js` - State management hook
- `frontend/src/handlers/schemaHandlers.js` - Business logic
- `frontend/src/utils/schemaAPI.js` - HTTP client
- `frontend/src/components/Schema/` - Reusable components

---

## Page Component (SchemaPage.jsx)

### Purpose
Main UI component for schema management. Displays hierarchical schema structure with locations, depots, aisles, racks, and rack slots. Supports CRUD operations at all levels.

### Component State

```javascript
// Managed by useSchema hook
{
  // Current view level
  currentLocation: Location | null,
  currentDepot: Depot | null,
  currentAisle: Aisle | null,
  currentRack: Rack | null,
  
  // Data lists
  locations: Location[],
  depots: Depot[],
  aisles: Aisle[],
  racks: Rack[],
  slots: RackSlot[],
  
  // UI state
  loading: boolean,
  error: string | null,
  showForm: boolean,
  isEditing: boolean,
  currentEditingItem: any | null,
  activeTab: 'locations' | 'depots' | 'aisles' | 'racks' | 'slots',
  
  // Pagination
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  },
  
  // Filters
  search: string,
  filterOccupied: boolean | null,
  filterDirection: string | null,
  
  // Stats
  utilizationStats: {
    total_slots: number,
    occupied_slots: number,
    utilization_percentage: number
  }
}

// Type definitions
type Location = {
  location_id: number,
  name: string,
  address: string,
  coordinates: string,
  created_at: string
}

type Depot = {
  depot_id: number,
  parent_location: number,
  name: string,
  capacity_utilization: number | null,
  total_slots: number,
  occupied_slots: number,
  created_at: string
}

type Aisle = {
  aisle_id: number,
  parent_depot: number,
  name: string,
  total_racks: number,
  capacity_utilization: number | null,
  created_at: string
}

type Rack = {
  rack_id: number,
  parent_aisle: number,
  rack_code: string,
  total_slots: number,
  occupied_slots: number,
  empty_slots: number,
  capacity_utilization: number,
  created_at: string
}

type RackSlot = {
  slot_id: number,
  rack_id: number,
  direction: 'left' | 'right',
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

### Key Sub-components

```javascript
// Hierarchical navigation
<HierarchyBreadcrumb
  location={currentLocation}
  depot={currentDepot}
  aisle={currentAisle}
  rack={currentRack}
  onNavigate={handleNavigate}
/>

// Tab-based views
<SchemaTabs
  activeTab={activeTab}
  onTabChange={setActiveTab}
  stats={utilizationStats}
/>

// Data tables
<LocationsTable data={locations} onSelect={handleSelectLocation} />
<DepotsTable data={depots} onSelect={handleSelectDepot} />
<AislesTable data={aisles} onSelect={handleSelectAisle} />
<RacksTable data={racks} onSelect={handleSelectRack} />
<SlotsTable
  data={slots}
  filters={{ occupied: filterOccupied, direction: filterDirection }}
  onSelect={handleSelectSlot}
/>

// Forms
<LocationForm location={currentEditingItem} onSubmit={handleSubmit} />
<DepotForm depot={currentEditingItem} onSubmit={handleSubmit} />
<RackForm rack={currentEditingItem} onSubmit={handleSubmit} />

// Utilization visualization
<UtilizationChart location={currentLocation} />
<CapacityGauge utilization={utilizationStats.utilization_percentage} />
```

### User Interactions

**Navigate Schema Hierarchy:**
```
Click location
  ↓
setCurrentLocation()
  ↓
loadDepots(location_id)
  ↓
Fetch & display depots
  ↓
User clicks depot
  ↓
loadAisles(depot_id)
  ↓
Continue hierarchical navigation
```

**Create New Rack:**
```
Click "Add Rack"
  ↓
setShowForm(true)
  ↓
setActiveTab('racks')
  ↓
Show RackForm modal
  ↓
User fills form (rack_code, bays, levels, bins)
  ↓
Call schemaHandlers.createRack()
  ↓
POST /api/locations/:locationId/depots/:depotId/aisles/:aisleId/racks
  ↓
Success: reload racks, close form, show toast
```

**Filter Rack Slots:**
```
User selects filter: "Occupied only"
  ↓
setFilterOccupied(true)
  ↓
Call loadSlots(rackId, { occupied: true })
  ↓
API call with query params
  ↓
Display filtered slots
```

---

## Hooks (useSchema.js)

### Hook State Variables

```javascript
const [locations, setLocations] = useState<Location[]>([])
const [depots, setDepots] = useState<Depot[]>([])
const [aisles, setAisles] = useState<Aisle[]>([])
const [racks, setRacks] = useState<Rack[]>([])
const [slots, setSlots] = useState<RackSlot[]>([])

const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
const [currentDepot, setCurrentDepot] = useState<Depot | null>(null)
const [currentAisle, setCurrentAisle] = useState<Aisle | null>(null)
const [currentRack, setCurrentRack] = useState<Rack | null>(null)

const [loading, setLoading] = useState<boolean>(false)
const [error, setError] = useState<string | null>(null)
const [showForm, setShowForm] = useState<boolean>(false)
const [isEditing, setIsEditing] = useState<boolean>(false)
const [currentEditingItem, setCurrentEditingItem] = useState<any | null>(null)

const [pagination, setPagination] = useState<PaginationState>({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

const [utilizationStats, setUtilizationStats] = useState<UtilizationStats>({
  total_slots: 0,
  occupied_slots: 0,
  utilization_percentage: 0
})
```

### Returned Object

```javascript
return {
  // State
  locations, depots, aisles, racks, slots,
  currentLocation, currentDepot, currentAisle, currentRack,
  loading, error, showForm, isEditing, currentEditingItem,
  pagination, utilizationStats,
  
  // Setters
  setError, setShowForm, setIsEditing, setCurrentEditingItem,
  
  // Navigation methods
  loadLocations: (page?: number, limit?: number) => Promise<void>,
  selectLocation: (locationId: number) => Promise<void>,
  selectDepot: (depotId: number) => Promise<void>,
  selectAisle: (aisleId: number) => Promise<void>,
  selectRack: (rackId: number) => Promise<void>,
  
  // CRUD methods
  createLocation: (data: LocationData) => Promise<void>,
  updateLocation: (id: number, data: LocationData) => Promise<void>,
  deleteLocation: (id: number) => Promise<void>,
  
  // Racks
  createRack: (data: RackData) => Promise<void>,
  updateSlots: (slotIds: number[], capacity: number) => Promise<void>,
  
  // Stats
  loadUtilizationStats: (locationId: number) => Promise<void>,
  
  // Pagination
  handlePageChange: (newPage: number) => void,
  handlePageSizeChange: (newSize: number) => void
}
```

### Hook Methods

#### loadLocations(page, limit)

Fetches locations list.

**Input:**
```javascript
page: number | undefined = 1
limit: number | undefined = 10
```

**Process:**
```
setLoading(true)
  ↓
schemaHandlers.fetchLocations(page, limit)
  ↓
schemaAPI.getLocations(page, limit)
  ↓
GET /api/locations?page=1&limit=10
  ↓
setLocations(data)
setPagination(pagination)
setError(null)
  ↓
setLoading(false)
```

#### selectLocation(locationId)

Fetches location details and its depots.

**Input:**
```javascript
locationId: number
```

**Process:**
```
Call schemaAPI.getLocation(locationId)
  ↓
setCurrentLocation(data)
  ↓
loadDepots(locationId)
  ↓
loadUtilizationStats(locationId)
```

#### createRack(data)

Creates new rack with slot calculation.

**Input:**
```javascript
{
  rack_code: string,
  bays: number,
  levels: number,
  bins: number
}
```

**Process:**
```
Validate rack_code (not empty, unique)
  ↓
Calculate total_slots = bays × levels × bins
  ↓
Call schemaHandlers.createRack()
  ↓
POST with batch slot creation
  ↓
Reload racks list
  ↓
Show success message
```

---

## Handlers (schemaHandlers.js)

### fetchLocations(page, limit, search)

Fetches locations with validation.

**Input:**
```javascript
page: number
limit: number
search: string = ""
```

**Validation:**
```javascript
page = Math.max(1, page)
limit = Math.min(Math.max(1, limit), 100)
search = search.trim()
```

**API Call:**
```javascript
const response = await schemaAPI.getLocations(page, limit, search)
if (!response.success) throw new Error(response.message)
return response.data
```

### createRack(locationId, depotId, aisleId, data)

Creates new rack with validation and bulk slot creation.

**Input:**
```javascript
{
  rack_code: string,
  bays: number = 5,
  levels: number = 4,
  bins: number = 3
}
```

**Validation:**
```javascript
if (!rack_code || rack_code.trim().length === 0)
  throw new Error('Rack code required')

if (!Number.isInteger(bays) || bays < 1 || bays > 50)
  throw new Error('Bays must be 1-50')

if (!Number.isInteger(levels) || levels < 1 || levels > 50)
  throw new Error('Levels must be 1-50')

if (!Number.isInteger(bins) || bins < 1 || bins > 50)
  throw new Error('Bins must be 1-50')

const totalSlots = bays * levels * bins
if (totalSlots > 10000)
  throw new Error('Too many slots (max 10000)')
```

**Data Transformation:**
```javascript
// Build slot array for bulk creation
const slots = []
for (let bay = 1; bay <= bays; bay++) {
  for (let level = 1; level <= levels; level++) {
    for (let bin = 1; bin <= bins; bin++) {
      slots.push({
        direction: bay % 2 === 0 ? 'right' : 'left',
        bay_no: bay,
        level_no: level,
        bin_no: bin,
        capacity: 100
      })
    }
  }
}
```

**API Call:**
```javascript
const response = await schemaAPI.createRack(
  locationId, depotId, aisleId,
  { rack_code, slots }
)
```

### updateSlots(rackId, slotIds, updates)

Bulk updates multiple slots.

**Input:**
```javascript
slotIds: number[]  // Array of slot IDs
updates: {
  capacity: number | undefined,
  is_occupied: boolean | undefined
}
```

**Validation:**
```javascript
if (!Array.isArray(slotIds) || slotIds.length === 0)
  throw new Error('No slots selected')

if (slotIds.some(id => !Number.isInteger(id)))
  throw new Error('Invalid slot IDs')
```

**API Call:**
```javascript
const response = await schemaAPI.bulkUpdateSlots(
  rackId,
  { slot_ids: slotIds, ...updates }
)
```

---

## API Methods (schemaAPI.js)

### getLocations(page, limit, search)

Fetches locations.

**HTTP Request:**
```
GET /api/locations?page=1&limit=10&search=schema
```

**Response:**
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
```

### getLocation(id)

Fetches single location.

**HTTP Request:**
```
GET /api/locations/1
```

**Response:**
```javascript
{
  success: boolean,
  message: string,
  data: Location
}
```

### createRack(locationId, depotId, aisleId, data)

Creates rack with slots.

**HTTP Request:**
```
POST /api/locations/1/depots/1/aisles/1/racks

Content-Type: application/json

{
  "rack_code": "A1-R1",
  "bays": 5,
  "levels": 4,
  "bins": 3
}
```

**Request Headers:**
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer token'
}
```

**Response (201 Created):**
```javascript
{
  success: boolean,
  message: string,
  data: {
    rack_id: number,
    rack_code: string,
    total_slots: number,
    created_at: string
  }
}
```

### bulkUpdateSlots(rackId, data)

Updates multiple slots.

**HTTP Request:**
```
POST /api/locations/1/depots/1/aisles/1/racks/1/bulk-update

{
  "slot_ids": [1, 2, 3, 4, 5],
  "capacity": 150,
  "is_occupied": false
}
```

**Response:**
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

### getUtilization(locationId)

Gets schema utilization stats.

**HTTP Request:**
```
GET /api/locations/1/utilization
```

**Response:**
```javascript
{
  success: boolean,
  message: string,
  data: {
    location_id: number,
    location_name: string,
    total_slots: number,
    occupied_slots: number,
    utilization_percentage: number,
    depots: Depot[]
  }
}
```

---

## Components

### SchemaTabs Component

```javascript
interface SchemaTabsProps {
  activeTab: string,
  onTabChange: (tab: string) => void,
  stats: UtilizationStats
}

// Tabs: Locations, Depots, Aisles, Racks, Slots, Utilization
```

### SlotsTable Component

```javascript
interface SlotsTableProps {
  data: RackSlot[],
  loading: boolean,
  onSelect: (slot: RackSlot) => void,
  onEdit: (slot: RackSlot) => void,
  onDelete: (slotId: number) => void,
  filters?: {
    occupied: boolean | null,
    direction: string | null
  }
}
```

### RackForm Component

```javascript
interface RackFormProps {
  rack: Rack | null,
  locationId: number,
  depotId: number,
  aisleId: number,
  onSubmit: (data: RackData) => Promise<void>,
  isEditing: boolean
}

// Form fields: rack_code, bays, levels, bins
// Shows calculated total_slots
```

### UtilizationChart Component

```javascript
interface UtilizationChartProps {
  location: Location,
  stats: UtilizationStats
}

// Displays pie chart or bar chart of slot utilization
// Shows by-depot breakdown
```

---

## Data Types

```typescript
interface LocationData {
  name: string,
  address: string,
  coordinates: string
}

interface RackData {
  rack_code: string,
  bays: number,
  levels: number,
  bins: number
}

interface PaginationState {
  page: number,
  limit: number,
  total: number,
  pages: number
}

interface UtilizationStats {
  total_slots: number,
  occupied_slots: number,
  utilization_percentage: number
}
```
