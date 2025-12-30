# Alerts Page

## Purpose
Main UI for alerts/notifications management. Displays alert list with filtering and action capabilities.

## File Location
`frontend/src/pages/Alerts/AlertsPage.jsx`

## Component State

```javascript
// Managed by useAlerts hook
{
  alerts: Alert[],              // Current page of alerts
  loading: boolean,
  error: string | null,
  stats: AlertStats | null,
  
  filters: {
    status: string,             // 'active', 'resolved', 'dismissed', ''
    severity: string,           // 'high', 'medium', 'low', ''
    type: string                // 'low_stock', 'overstock', etc, ''
  },
  
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  },
  
  selectedAlert: Alert | null,
  showDetailModal: boolean,
  showActionModal: boolean,
  
  // Functions
  setError: (error: string | null) => void,
  loadAlerts: (page?: number) => Promise<void>,
  loadStats: () => Promise<void>,
  updateAlert: (id: number, data: UpdateData) => Promise<void>,
  deleteAlert: (id: number) => Promise<void>,
  setFilters: (filters: FilterConfig) => void,
  handlePageChange: (newPage: number) => void
}

// Alert type
Alert = {
  alert_id: number,
  alert_type: string,           // 'low_stock', 'overstock', 'expiry', 'manual', 'system'
  severity: string,             // 'high', 'medium', 'low'
  title: string,
  description: string,
  status: string,               // 'active', 'resolved', 'dismissed'
  related_entity: string | null,
  entity_id: number | null,
  entity_name: string | null,
  created_at: string | Date,
  resolved_at: string | Date | null,
  dismissed_at: string | Date | null
}

// Statistics type
AlertStats = {
  total_active: number,
  total_resolved: number,
  total_dismissed: number,
  by_severity: { high: number, medium: number, low: number },
  by_type: { [type: string]: number }
}
```

## Layout

```
┌─────────────────────────────────────────────┐
│  Alerts Dashboard                           │
├─────────────────────────────────────────────┤
│                                             │
│  [Stats Cards]                              │
│  Active: 5  │  Resolved: 12  │  Dismissed: 3│
│  High: 2 │ Medium: 4 │ Low: 1              │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [Filter Bar]                               │
│  Status: [Active   ▼]  Type: [All    ▼]   │
│  Severity: [All    ▼]  [Search...      ]   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [Alert List/Table]                         │
│  ┌──────────────────────────────────────┐   │
│  │ ID │ Title │ Type │ Severity │ Actions│   │
│  ├──────────────────────────────────────┤   │
│  │ 1  │ Low... │ ... │ High │ View │Edit│   │
│  ├──────────────────────────────────────┤   │
│  │ 2  │ Overstk│ ... │ Med  │ View │Edit│   │
│  └──────────────────────────────────────┘   │
│                                             │
│  [Pagination]                               │
│  Page 1 of 5  [< 1 2 3 4 5 >]              │
│                                             │
└─────────────────────────────────────────────┘
```

## User Interactions

### Load Alerts with Filters

**Data Flow:**
```
Page mounts
  ↓
loadStats() → GET /api/alerts/stats/dashboard
  ↓
updateStats in UI
  ↓
loadAlerts(1) → GET /api/alerts?page=1&status=active
  ↓
Render alert list
```

### Filter by Status

```
User selects "Resolved"
  ↓
setFilters({status: 'resolved'})
  ↓
loadAlerts(1)
  ↓
API called with status param
  ↓
Re-render with filtered alerts
```

### Resolve Alert

```
Click alert row → showDetailModal = true
  ↓
Show AlertDetail modal
  ↓
Click "Resolve" button
  ↓
Show resolution form
  ↓
User enters notes and clicks "Confirm"
  ↓
updateAlert(alertId, {status: 'resolved', notes: '...'})
  ↓
PUT /api/alerts/{id}
  ↓
Success: reload alerts, show toast, close modal
```

### Dismiss Alert

```
Click "Dismiss" button
  ↓
Show confirmation dialog
  ↓
User confirms
  ↓
updateAlert(alertId, {status: 'dismissed'})
  ↓
PUT /api/alerts/{id}
  ↓
Alert removed from list or grayed out
```

### Delete Alert

```
Click "Delete" on detail modal
  ↓
Show confirmation: "Delete alert permanently?"
  ↓
User confirms
  ↓
deleteAlert(alertId)
  ↓
DELETE /api/alerts/{id}
  ↓
Remove from list
```

---

## Key Sub-components

### StatsCards
```javascript
<StatsCards
  stats={stats}
  totalByStatus={{active: 5, resolved: 12, dismissed: 3}}
/>
```

### FilterBar
```javascript
<FilterBar
  filters={filters}
  onFilterChange={setFilters}
/>
```

### AlertList
```javascript
<AlertList
  alerts={alerts}
  loading={loading}
  onSelectAlert={handleSelectAlert}
  onResolve={handleResolve}
  onDismiss={handleDismiss}
/>
```

### AlertDetailModal
```javascript
<AlertDetailModal
  alert={selectedAlert}
  isOpen={showDetailModal}
  onClose={() => setShowDetailModal(false)}
  onResolve={handleResolve}
  onDismiss={handleDismiss}
/>
```

---

## Hooks Used

### useAlerts()
```javascript
const {
  alerts,
  loading,
  error,
  stats,
  filters,
  pagination,
  selectedAlert,
  showDetailModal,
  setError,
  loadAlerts,
  loadStats,
  updateAlert,
  deleteAlert,
  setFilters,
  handlePageChange
} = useAlerts();
```

---

## Dependencies
- `hooks/useAlerts.js`
- `handlers/alertsHandlers.js`
- `components/AlertList.jsx`
- `components/AlertDetailModal.jsx`
- `components/FilterBar.jsx`
- `components/StatsCards.jsx`
