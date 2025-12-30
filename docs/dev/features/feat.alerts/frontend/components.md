# Alerts Components

## Purpose
Reusable components for alerts feature UI.

## File Location
`frontend/src/components/Alerts/`

---

## AlertList Component

Displays alerts in a table format.

**File:** `AlertList.jsx`

### Props

```typescript
interface AlertListProps {
  alerts: Alert[];
  loading: boolean;
  onSelectAlert: (alert: Alert) => void;
  onResolve: (id: number) => void;
  onDismiss: (id: number) => void;
}

interface Alert {
  alert_id: number;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  related_entity: string | null;
  entity_name: string | null;
  created_at: string;
}
```

### Features
- Sortable columns (click header)
- Row highlighting by severity
- Click row to open detail modal
- Inline action buttons (resolve, dismiss, delete)
- Loading skeleton while fetching
- Empty state when no alerts

### Styling

```css
.alert-row {
  border-left: 4px solid;
}

.alert-row.high {
  border-left-color: #d32f2f;
  background: #ffebee;
}

.alert-row.medium {
  border-left-color: #ff9800;
  background: #fff3e0;
}

.alert-row.low {
  border-left-color: #4caf50;
  background: #f1f8e9;
}

.alert-row:hover {
  opacity: 0.8;
}
```

---

## AlertDetailModal Component

Shows full alert details with actions.

**File:** `AlertDetailModal.jsx`

### Props

```typescript
interface AlertDetailModalProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (id: number, notes: string) => void;
  onDismiss: (id: number) => void;
  onDelete: (id: number) => void;
}

interface Alert {
  alert_id: number;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  related_entity: string | null;
  entity_id: number | null;
  entity_name: string | null;
  created_at: string;
  resolved_at: string | null;
  dismissed_at: string | null;
  entity_details: {
    current_value: number;
    threshold_value: number;
  };
  actions: string[];
}
```

### Features
- Display full alert details
- Show related entity info
- Action buttons based on alert type
- Resolution notes field
- Suggested actions based on alert type
- Timeline of alert status changes

---

## FilterBar Component

Filters alerts by status, severity, type.

**File:** `FilterBar.jsx`

### Props

```typescript
interface FilterBarProps {
  filters: FilterConfig;
  onFilterChange: (filters: FilterConfig) => void;
}

interface FilterConfig {
  status: string;
  severity: string;
  type: string;
}
```

### Features
- Dropdown filters
- Search by title/description
- Clear all filters button
- Filter presets (e.g., "Critical Alerts")

---

## StatsCards Component

Displays alert statistics.

**File:** `StatsCards.jsx`

### Props

```typescript
interface StatsCardsProps {
  stats: AlertStats;
}

interface AlertStats {
  total_active: number;
  total_resolved: number;
  total_dismissed: number;
  by_severity: Record<string, number>;
}
```

### Features
- Card for each status type
- Color coding by severity
- Click to filter by status
- Animated number changes

---

## AlertBadge Component

Small badge showing alert count and level.

**File:** `AlertBadge.jsx`

### Props

```typescript
interface AlertBadgeProps {
  count: number;
  maxSeverity: 'high' | 'medium' | 'low' | null;
  onClick?: () => void;
}
```

### Features
- Show active alert count
- Highest severity level
- Color coded (red for high, etc)
- Notification dot/pulse animation for new alerts

---

## AlertTimeline Component

Shows alert status change history.

**File:** `AlertTimeline.jsx`

### Props

```typescript
interface AlertTimelineProps {
  alert: Alert;
}

interface Alert {
  created_at: string;
  resolved_at: string | null;
  dismissed_at: string | null;
  status: string;
}
```

### Events Shown
- Created
- Resolved (with date/time)
- Dismissed (with date/time)
- Notes added

---

## Type Definitions

```typescript
interface Alert {
  alert_id: number;
  alert_type: 'low_stock' | 'overstock' | 'expiry' | 'manual' | 'system';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  status: 'active' | 'resolved' | 'dismissed';
  related_entity: string | null;
  entity_id: number | null;
  entity_name: string | null;
  created_at: string;
  resolved_at: string | null;
  dismissed_at: string | null;
}

interface FilterConfig {
  status: string;
  severity: string;
  type: string;
}

interface AlertStats {
  total_active: number;
  total_resolved: number;
  total_dismissed: number;
  by_severity: Record<'high' | 'medium' | 'low', number>;
  by_type: Record<string, number>;
}
```

---

## Dependencies
- `react` - Core library
- `react-icons` - Icon components
- `react-toastify` - Notifications
