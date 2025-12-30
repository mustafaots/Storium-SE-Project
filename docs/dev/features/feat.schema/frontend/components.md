# Schema Components

## Purpose
Reusable components for schema management UI.

## File Location
`frontend/src/components/Schema/`

---

## LocationTree

Hierarchical tree view of locations, depots, aisles, racks.

**Props:**
```typescript
interface LocationTreeProps {
  location: Location;
  hierarchy: LocationHierarchy;
  onRackClick: (rack: Rack) => void;
  onLocationClick: (location: Location) => void;
  expandedNodes: number[];
  onToggleNode: (nodeId: number) => void;
}
```

**Features:**
- Expandable/collapsible nodes
- Color-coded capacity indicators
- Click to select and view details
- Icons for different levels (location, depot, aisle, rack)

---

## LocationForm

Form for creating/editing locations.

**Props:**
```typescript
interface LocationFormProps {
  location: Location | null;
  onSubmit: (data: CreateInput) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}
```

**Fields:**
- Name (required)
- Code (required)
- Type (location/depot)
- Parent location (dropdown)
- Total capacity (number)
- Latitude/Longitude (optional)

---

## RackDetailModal

Shows rack details and product list with rebalance option.

**Props:**
```typescript
interface RackDetailModalProps {
  rack: RackUtilization | null;
  isOpen: boolean;
  onClose: () => void;
  onRebalance: (strategy: string) => void;
  isRebalancing: boolean;
}
```

**Displays:**
- Rack name and location
- Total/occupied/empty slots
- Product list with quantities
- Utilization gauge
- Rebalance buttons

---

## UtilizationBadge

Visual indicator of space utilization.

**Props:**
```typescript
interface UtilizationBadgeProps {
  utilized: number;
  total: number;
  showPercentage: boolean;
}
```

**Visual:**
- Colored bar (green < 70%, yellow 70-90%, red > 90%)
- Optional percentage text

---

## LocationMap

Optional map view of schema locations.

**Props:**
```typescript
interface LocationMapProps {
  locations: Location[];
  onLocationClick: (location: Location) => void;
}
```

**Uses:** Leaflet or Google Maps API

---

## Type Definitions

```typescript
interface Location {
  location_id: number;
  name: string;
  code: string;
  type: string;
  total_capacity: number;
}

interface RackUtilization {
  rack_id: number;
  name: string;
  total_slots: number;
  occupied_slots: number;
  utilization_percent: number;
  products: Array<{product_id: number; name: string; quantity: number}>;
}
```

---

## Dependencies
- `react` - Core library
- `react-icons` - Icons
- `react-toastify` - Notifications
