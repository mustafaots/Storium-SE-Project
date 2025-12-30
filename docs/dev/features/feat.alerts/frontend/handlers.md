# Alerts Handlers

## Purpose
Business logic layer for alert operations.

## File Location
`frontend/src/handlers/alertsHandlers.js`

## Handler Methods

### fetchAlerts(params)

Retrieves alerts with filtering and pagination.

**Input:**
```javascript
params = {
  page: number = 1,
  limit: number = 10,
  status: string = '',
  severity: string = '',
  type: string = ''
}
```

**Validation:**
```javascript
const validPage = Math.max(1, parseInt(params.page) || 1)
const validLimit = Math.min(Math.max(1, parseInt(params.limit) || 10), 100)
const filters = {
  status: ['active', 'resolved', 'dismissed'].includes(params.status) ? params.status : '',
  severity: ['high', 'medium', 'low'].includes(params.severity) ? params.severity : '',
  type: params.type || ''
}
```

**API Call:**
```javascript
alertsAPI.getAll({
  page: validPage,
  limit: validLimit,
  ...filters
})
```

**Output:**
```javascript
{
  alerts: Alert[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

---

### fetchStats()

Retrieves alert statistics.

**API Call:**
```javascript
alertsAPI.getStats()
```

**Output:**
```javascript
{
  total_active: number,
  total_resolved: number,
  total_dismissed: number,
  by_severity: {high: number, medium: number, low: number},
  by_type: {...}
}
```

---

### fetchAlertDetails(id)

Retrieves full alert details.

**Input:**
```javascript
id: number
```

**API Call:**
```javascript
alertsAPI.getById(id)
```

**Output:**
```javascript
Alert  // With entity_details and actions
```

---

### updateAlert(id, updateData)

Updates alert status.

**Input:**
```javascript
id: number

updateData = {
  status: string,               // 'resolved', 'dismissed'
  notes: string | null,
  resolution_action: string | null
}
```

**Validation:**
```javascript
if (!['active', 'resolved', 'dismissed'].includes(updateData.status)) {
  throw new Error('Invalid status')
}
if (updateData.notes && updateData.notes.length > 500) {
  throw new Error('Notes cannot exceed 500 characters')
}
```

**API Call:**
```javascript
alertsAPI.update(id, updateData)
```

**Output:**
```javascript
{
  alert_id: number,
  status: string,
  resolved_at: Date | null,
  dismissed_at: Date | null
}
```

---

### deleteAlert(id)

Deletes an alert.

**Input:**
```javascript
id: number
```

**Validation:**
```javascript
if (!id || typeof id !== 'number') {
  throw new Error('Invalid alert ID')
}
```

**API Call:**
```javascript
alertsAPI.delete(id)
```

---

### bulkResolveAlerts(ids, notes)

Resolves multiple alerts at once.

**Input:**
```javascript
ids: number[],
notes: string | null
```

**Processing:**
```javascript
for (const id of ids) {
  await updateAlert(id, {
    status: 'resolved',
    notes: notes,
    resolution_action: 'bulk_resolve'
  })
}
```

---

### calculateSeverityColor(severity)

Maps severity to color.

**Input:**
```javascript
severity: string  // 'high', 'medium', 'low'
```

**Output:**
```javascript
{
  'high': '#d32f2f',      // Red
  'medium': '#ff9800',    // Orange
  'low': '#4caf50'        // Green
}[severity]
```

---

## Type Definitions

```typescript
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
}

interface AlertFilters {
  page: number;
  limit: number;
  status: string;
  severity: string;
  type: string;
}

interface UpdateAlertInput {
  status: string;
  notes: string | null;
  resolution_action: string | null;
}

interface AlertStats {
  total_active: number;
  total_resolved: number;
  total_dismissed: number;
  by_severity: Record<string, number>;
  by_type: Record<string, number>;
}
```

---

## Dependencies
- `utils/alertsAPI.js`
