# Alerts Model

## Purpose
Database operations for alerts table.

## File Location
`backend/src/models/alerts.model.js`

## Database Schema

**Table:** `alerts`

```sql
CREATE TABLE alerts (
  alert_id INT PRIMARY KEY AUTO_INCREMENT,
  alert_type ENUM('low_stock', 'overstock', 'expiry', 'manual', 'system') NOT NULL,
  severity ENUM('high', 'medium', 'low') NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('active', 'resolved', 'dismissed') DEFAULT 'active',
  related_entity ENUM('product', 'location', 'depot', 'system') NULL,
  entity_id INT NULL,
  entity_name VARCHAR(200) NULL,
  resolution_notes TEXT NULL,
  resolution_action VARCHAR(100) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  dismissed_at DATETIME NULL,
  dismissed_by INT NULL,
  deleted_at DATETIME NULL,
  deleted BOOLEAN DEFAULT FALSE,
  
  KEY idx_status (status),
  KEY idx_alert_type (alert_type),
  KEY idx_severity (severity),
  KEY idx_created_at (created_at),
  KEY idx_entity (related_entity, entity_id),
  FOREIGN KEY (dismissed_by) REFERENCES users(user_id) ON DELETE SET NULL
);
```

---

## Methods

### findAll(filters, page, limit)

**Parameters:**
```javascript
filters = {
  status: string,
  alert_type: string,
  severity: string
}
page: number
limit: number
```

**SQL:**
```sql
SELECT * FROM alerts 
WHERE deleted_at IS NULL
  AND (? = '' OR status = ?)
  AND (? = '' OR alert_type = ?)
  AND (? = '' OR severity = ?)
ORDER BY created_at DESC
LIMIT ? OFFSET ?
```

**Parameters Array:**
```javascript
[
  filters.status, filters.status,
  filters.alert_type, filters.alert_type,
  filters.severity, filters.severity,
  limit,
  (page - 1) * limit
]
```

**Return Type:**
```javascript
Alert[]
```

---

### findById(id)

**Parameters:**
```javascript
id: number
```

**SQL:**
```sql
SELECT a.* FROM alerts a
WHERE a.alert_id = ? AND a.deleted_at IS NULL
```

**Return Type:**
```javascript
Alert | null
```

---

### create(alertData)

**Parameters:**
```javascript
alertData = {
  alert_type: string,
  severity: string,
  title: string,
  description: string,
  related_entity: string | null,
  entity_id: number | null,
  entity_name: string | null
}
```

**SQL:**
```sql
INSERT INTO alerts (
  alert_type, severity, title, description,
  status, related_entity, entity_id, entity_name,
  created_at
) VALUES (?, ?, ?, ?, 'active', ?, ?, ?, NOW())
```

**Parameters Array:**
```javascript
[
  alertData.alert_type,
  alertData.severity,
  alertData.title,
  alertData.description,
  alertData.related_entity || null,
  alertData.entity_id || null,
  alertData.entity_name || null
]
```

**Return Type:**
```javascript
{
  alert_id: number,
  ...alertData,
  status: 'active',
  created_at: Date
}
```

---

### update(id, updateData)

**Parameters:**
```javascript
id: number

updateData = {
  status: string,
  resolution_notes: string | null,
  resolution_action: string | null
}
```

**SQL:**
```sql
UPDATE alerts SET
  status = ?,
  resolution_notes = ?,
  resolution_action = ?,
  resolved_at = CASE WHEN ? = 'resolved' THEN NOW() ELSE NULL END,
  dismissed_at = CASE WHEN ? = 'dismissed' THEN NOW() ELSE NULL END
WHERE alert_id = ?
```

**Parameters Array:**
```javascript
[
  updateData.status,
  updateData.resolution_notes || null,
  updateData.resolution_action || null,
  updateData.status,
  updateData.status,
  id
]
```

**Return Type:**
```javascript
{ affectedRows: number }
```

---

### delete(id)

Soft delete.

**SQL:**
```sql
UPDATE alerts SET
  deleted_at = NOW(),
  deleted = 1
WHERE alert_id = ?
```

**Return Type:**
```javascript
{ affectedRows: number }
```

---

### getStatistics()

**SQL:**
```sql
SELECT 
  (SELECT COUNT(*) FROM alerts WHERE status = 'active' AND deleted_at IS NULL) as active,
  (SELECT COUNT(*) FROM alerts WHERE status = 'resolved' AND deleted_at IS NULL) as resolved,
  (SELECT COUNT(*) FROM alerts WHERE status = 'dismissed' AND deleted_at IS NULL) as dismissed
```

**Return Type:**
```javascript
{
  total_active: number,
  total_resolved: number,
  total_dismissed: number
}
```

---

### countByField(field, value)

Count alerts by severity, type, or status.

**SQL:**
```sql
SELECT COUNT(*) as count FROM alerts
WHERE [field] = ? AND deleted_at IS NULL
```

**Return Type:**
```javascript
number
```

---

## Error Codes

```javascript
{
  1062: 'Duplicate entry',
  1064: 'SQL syntax error',
  1216: 'Foreign key constraint violation',
  1451: 'Cannot delete or update parent row'
}
```

---

## Connection Pooling

```javascript
// All queries use connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 30000
});

// Queries
const [result] = await pool.promise().query(sql, params);
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
  resolution_notes: string | null;
  resolution_action: string | null;
  created_at: Date;
  resolved_at: Date | null;
  dismissed_at: Date | null;
  dismissed_by: number | null;
  deleted_at: Date | null;
  deleted: boolean;
}

interface AlertFilters {
  status: string;
  alert_type: string;
  severity: string;
}

interface AlertCreateInput {
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  related_entity: string | null;
  entity_id: number | null;
  entity_name: string | null;
}

interface AlertUpdateInput {
  status: string;
  resolution_notes: string | null;
  resolution_action: string | null;
}

interface AlertStats {
  total_active: number;
  total_resolved: number;
  total_dismissed: number;
}
```

---

## Dependencies
- `database.js` - Connection pool
- `mysql2/promise` - MySQL driver
