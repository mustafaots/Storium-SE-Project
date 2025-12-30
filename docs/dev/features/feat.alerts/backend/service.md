# Alerts Service

## Purpose
Business logic for alert operations and management.

## File Location
`backend/src/services/alerts.service.js`

## Methods

### getAllAlerts(filters, pagination)

Retrieves paginated alerts with filtering.

**Input Data Types:**
```javascript
filters = {
  status: string = '',
  type: string = '',
  priority: string = ''
}

pagination = {
  page: number = 1,
  limit: number = 10
}
```

**Processing:**
```javascript
1. Build WHERE clause from filters
   - If status: WHERE status = ?
   - If type: WHERE alert_type = ?
   - If priority: WHERE severity = ?

2. Calculate OFFSET: (page - 1) * limit

3. Execute queries:
   - Count total: SELECT COUNT(*) FROM alerts WHERE [filters]
   - Fetch data: SELECT * FROM alerts WHERE [filters] 
                 ORDER BY created_at DESC 
                 LIMIT ? OFFSET ?

4. Transform results:
   - Parse dates: created_at, resolved_at, dismissed_at as Date objects
   - Rename fields if needed: severity → priority

5. Calculate pagination:
   - total = count result
   - pages = Math.ceil(total / limit)
```

**Output Data Types:**
```javascript
{
  alerts: Array<{
    alert_id: number,
    alert_type: string,
    severity: string,
    title: string,
    description: string,
    status: string,
    related_entity: string | null,
    entity_id: number | null,
    entity_name: string | null,
    created_at: Date,
    resolved_at: Date | null,
    dismissed_at: Date | null
  }>,
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

**Error Handling:**
```javascript
- Database connection error → throw new Error('Database error')
- Invalid filter values → filter invalid ones, proceed with valid ones
```

---

### getAlertById(id)

Fetches full alert details with related entity information.

**Input Data Types:**
```javascript
id: number
```

**SQL Query:**
```sql
SELECT 
  a.*,
  p.name as product_name,
  l.name as location_name,
  d.name as depot_name
FROM alerts a
LEFT JOIN products p ON a.entity_id = p.product_id AND a.related_entity = 'product'
LEFT JOIN locations l ON a.entity_id = l.location_id AND a.related_entity = 'location'
LEFT JOIN depots d ON a.entity_id = d.depot_id AND a.related_entity = 'depot'
WHERE a.alert_id = ?
```

**Output Data Types:**
```javascript
{
  alert_id: number,
  alert_type: string,
  severity: string,
  title: string,
  description: string,
  status: string,
  related_entity: string | null,
  entity_id: number | null,
  entity_name: string | null,
  entity_details: {
    product_id: number | null,
    location_id: number | null,
    current_value: number | null,
    threshold_value: number | null
  },
  created_at: Date,
  resolved_at: Date | null,
  dismissed_at: Date | null,
  actions: string[]  // Suggested actions based on type
}
```

**Error Handling:**
- Alert not found → throw new Error('Alert not found')

---

### createAlert(alertData)

Creates a new alert.

**Input Data Types:**
```javascript
alertData = {
  alert_type: string,           // 'low_stock', 'overstock', etc
  severity: string,             // 'high', 'medium', 'low'
  title: string,
  description: string,
  related_entity: string | null,
  entity_id: number | null
}
```

**SQL Query:**
```sql
INSERT INTO alerts (
  alert_type,
  severity,
  title,
  description,
  status,
  related_entity,
  entity_id,
  created_at
) VALUES (?, ?, ?, ?, 'active', ?, ?, NOW())
```

**Parameters:**
```javascript
[
  alertData.alert_type,
  alertData.severity,
  alertData.title,
  alertData.description,
  alertData.related_entity || null,
  alertData.entity_id || null
]
```

**Output Data Types:**
```javascript
{
  alert_id: number,
  alert_type: string,
  severity: string,
  title: string,
  description: string,
  status: string = 'active',
  created_at: Date
}
```

---

### updateAlert(id, updateData)

Updates alert status and resolution information.

**Input Data Types:**
```javascript
id: number

updateData = {
  status: string,               // 'active', 'resolved', 'dismissed'
  notes: string | null,
  resolution_action: string | null
}
```

**SQL Query (Status Update):**
```sql
UPDATE alerts SET
  status = ?,
  resolved_at = CASE WHEN ? = 'resolved' THEN NOW() ELSE NULL END,
  dismissed_at = CASE WHEN ? = 'dismissed' THEN NOW() ELSE NULL END,
  resolution_notes = ?,
  resolution_action = ?
WHERE alert_id = ?
```

**Parameters:**
```javascript
[
  updateData.status,
  updateData.status,
  updateData.status,
  updateData.notes || null,
  updateData.resolution_action || null,
  id
]
```

**Output Data Types:**
```javascript
{
  alert_id: number,
  status: string,
  resolved_at: Date | null,
  dismissed_at: Date | null,
  notes: string | null
}
```

---

### deleteAlert(id)

Soft deletes an alert (marks as archived).

**Input Data Types:**
```javascript
id: number
```

**SQL Query:**
```sql
UPDATE alerts SET 
  deleted_at = NOW(),
  deleted = 1
WHERE alert_id = ?
```

**Output Data Types:**
```javascript
{
  alert_id: number,
  deleted: boolean = true,
  deleted_at: Date
}
```

---

### getStatistics()

Retrieves alert statistics for dashboard.

**SQL Queries:**
```sql
-- Count by status
SELECT status, COUNT(*) as count FROM alerts WHERE deleted_at IS NULL GROUP BY status

-- Count by severity
SELECT severity, COUNT(*) as count FROM alerts WHERE deleted_at IS NULL GROUP BY severity

-- Count by type
SELECT alert_type, COUNT(*) as count FROM alerts WHERE deleted_at IS NULL GROUP BY alert_type

-- Recent alerts
SELECT * FROM alerts WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5
```

**Output Data Types:**
```javascript
{
  total_active: number,
  total_resolved: number,
  total_dismissed: number,
  by_severity: {
    high: number,
    medium: number,
    low: number
  },
  by_type: {
    low_stock: number,
    overstock: number,
    expiry: number,
    manual: number
  },
  most_recent: Alert[]
}
```

---

### checkAndCreateAlert(triggerType, entityType, entityId, values)

Internal method called by scheduler for automatic alerts.

**Input Data Types:**
```javascript
triggerType: string,      // 'low_stock', 'overstock', 'expiry'
entityType: string,       // 'product', 'location'
entityId: number,
values = {
  current: number,
  min_threshold: number,
  max_threshold: number
}
```

**Processing:**
```javascript
1. Check if alert already exists for this entity
2. Determine severity based on deviation
3. Generate title and description
4. Create alert if not exists
```

**Output:** Alert object or null if already exists

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
  created_at: Date;
  resolved_at: Date | null;
  dismissed_at: Date | null;
  resolution_notes: string | null;
  resolution_action: string | null;
}

interface AlertFilters {
  status: string;
  type: string;
  priority: string;
}

interface AlertPagination {
  page: number;
  limit: number;
}

interface AlertStats {
  total_active: number;
  total_resolved: number;
  total_dismissed: number;
  by_severity: Record<'high' | 'medium' | 'low', number>;
  by_type: Record<string, number>;
  most_recent: Alert[];
}
```

---

## Dependencies
- `alerts.model.js` - Database operations
- `database.js` - Database connection
