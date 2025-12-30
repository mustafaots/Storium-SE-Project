# Alerts Hooks

## Purpose
Custom React hooks for state management and data operations for alerts.

## File Location
`frontend/src/hooks/useAlerts.js`

## useAlerts Hook

### State Variables

```javascript
const [alerts, setAlerts] = useState<Alert[]>([]);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);
const [stats, setStats] = useState<AlertStats | null>(null);
const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

const [filters, setFilters] = useState<FilterConfig>({
  status: 'active',
  severity: '',
  type: ''
});

const [pagination, setPagination] = useState<PaginationState>({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
});

// Types
type Alert = {
  alert_id: number,
  alert_type: string,
  severity: string,
  title: string,
  description: string,
  status: string,
  related_entity: string | null,
  entity_id: number | null,
  entity_name: string | null,
  created_at: string | Date,
  resolved_at: string | Date | null,
  dismissed_at: string | Date | null
}

type AlertStats = {
  total_active: number,
  total_resolved: number,
  total_dismissed: number,
  by_severity: { high: number, medium: number, low: number },
  by_type: { [type: string]: number }
}

type FilterConfig = {
  status: string,
  severity: string,
  type: string
}

type PaginationState = {
  page: number,
  limit: number,
  total: number,
  pages: number
}
```

### Returned Object

```javascript
return {
  // State
  alerts: Alert[],
  loading: boolean,
  error: string | null,
  stats: AlertStats | null,
  filters: FilterConfig,
  pagination: PaginationState,
  selectedAlert: Alert | null,
  showDetailModal: boolean,
  
  // Setters
  setError: (error: string | null) => void,
  setFilters: (filters: FilterConfig) => void,
  setSelectedAlert: (alert: Alert | null) => void,
  setShowDetailModal: (show: boolean) => void,
  
  // Methods
  loadAlerts: (page?: number) => Promise<void>,
  loadStats: () => Promise<void>,
  updateAlert: (id: number, data: UpdateData) => Promise<void>,
  deleteAlert: (id: number) => Promise<void>,
  handlePageChange: (newPage: number) => void
}
```

---

## Hook Methods

### loadAlerts(page)

Fetches alerts with current filters and pagination.

**Input:**
```javascript
page: number = 1
```

**Process Flow:**
```
setLoading(true)
  ↓
Build params from filters
  {status: filters.status, severity: filters.severity, type: filters.type, page, limit: 10}
  ↓
alertsHandlers.fetchAlerts(params)
  ↓
API Response:
{
  alerts: Alert[],
  pagination: { page, limit, total, pages }
}
  ↓
setAlerts(alerts)
setPagination(pagination)
setError(null)
  ↓
setLoading(false)
```

**Error Handling:**
```javascript
catch (err) {
  setError(err.message)
  setLoading(false)
}
```

---

### loadStats()

Fetches alert statistics.

**Process:**
```
alertsHandlers.fetchStats()
  ↓
GET /api/alerts/stats/dashboard
  ↓
Response:
{
  total_active: number,
  total_resolved: number,
  total_dismissed: number,
  by_severity: {...},
  by_type: {...}
}
  ↓
setStats(response)
```

---

### updateAlert(id, updateData)

Updates alert status or resolution.

**Input:**
```javascript
id: number

updateData = {
  status: string,           // 'active', 'resolved', 'dismissed'
  notes: string | null,
  resolution_action: string | null
}
```

**Process:**
```
alertsHandlers.updateAlert(id, updateData)
  ↓
PUT /api/alerts/{id}
  ↓
Response: Updated Alert
  ↓
Update alert in alerts array
  ↓
Update stats
  ↓
setShowDetailModal(false)
  ↓
showToast('Alert updated successfully')
```

---

### deleteAlert(id)

Deletes an alert.

**Input:**
```javascript
id: number
```

**Process:**
```
alertsHandlers.deleteAlert(id)
  ↓
DELETE /api/alerts/{id}
  ↓
Remove from alerts array
  ↓
Update pagination.total
  ↓
showToast('Alert deleted')
```

---

### handlePageChange(newPage)

Changes current page.

**Input:**
```javascript
newPage: number
```

**Process:**
```
loadAlerts(newPage)
```

---

## useEffect Hooks

### Initial Load
```javascript
useEffect(() => {
  loadStats();
  loadAlerts(1);
}, []);
```

### Reload on Filter Change
```javascript
useEffect(() => {
  loadAlerts(1);
}, [filters]);
```

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
  created_at: string | Date;
  resolved_at: string | Date | null;
  dismissed_at: string | Date | null;
}

interface AlertStats {
  total_active: number;
  total_resolved: number;
  total_dismissed: number;
  by_severity: Record<'high' | 'medium' | 'low', number>;
  by_type: Record<string, number>;
}

interface FilterConfig {
  status: string;
  severity: string;
  type: string;
}

interface UpdateAlertData {
  status: string;
  notes: string | null;
  resolution_action: string | null;
}
```

---

## Dependencies
- `handlers/alertsHandlers.js`
- `react` - Hooks: useState, useEffect, useRef
