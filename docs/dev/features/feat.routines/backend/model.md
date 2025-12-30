# Routines Model

## Purpose
Database operations for routines table.

## File Location
`backend/src/models/routines.model.js`

## Database Schema

```sql
CREATE TABLE routines (
  routine_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  schedule_type ENUM('daily', 'weekly', 'monthly', 'custom') NOT NULL,
  cron_pattern VARCHAR(100) NOT NULL,
  routine_type VARCHAR(50) NOT NULL,  -- 'stock_check', 'price_update', 'alert_check', 'backup', 'report'
  status ENUM('active', 'paused', 'failed') DEFAULT 'active',
  last_execution_time DATETIME NULL,
  next_execution_time DATETIME NULL,
  last_execution_status ENUM('success', 'failed') NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  
  KEY idx_status (status),
  KEY idx_routine_type (routine_type),
  KEY idx_next_execution (next_execution_time),
  KEY idx_created_at (created_at)
);

CREATE TABLE routine_logs (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  routine_id INT NOT NULL,
  execution_time DATETIME NOT NULL,
  status ENUM('success', 'failed', 'running') DEFAULT 'running',
  duration_seconds INT,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (routine_id) REFERENCES routines(routine_id),
  KEY idx_routine_id (routine_id),
  KEY idx_status (status),
  KEY idx_execution_time (execution_time)
);
```

---

## Query Methods

### findAll(status, page, limit)

**SQL:** (See service.md)

**Return:** Routine[]

---

### findById(id)

**SQL:**
```sql
SELECT * FROM routines WHERE routine_id = ? AND deleted_at IS NULL
```

**Return:** Routine | null

---

### create(routineData)

**SQL:** (See service.md)

**Return:** Routine with generated ID

---

### update(id, updateData)

**SQL:** (See service.md)

**Return:** {affectedRows: number}

---

### delete(id)

**SQL:**
```sql
UPDATE routines SET deleted_at = NOW() WHERE routine_id = ?
```

**Return:** {affectedRows: number}

---

### updateStatus(id, status)

**SQL:**
```sql
UPDATE routines SET status = ?, updated_at = NOW() WHERE routine_id = ?
```

**Return:** {affectedRows: number}

---

### updateExecutionTime(id, lastTime, nextTime, status)

**SQL:**
```sql
UPDATE routines SET
  last_execution_time = ?,
  next_execution_time = ?,
  last_execution_status = ?,
  updated_at = NOW()
WHERE routine_id = ?
```

---

### addExecutionLog(routine_id, status, duration, errorMessage)

**SQL:**
```sql
INSERT INTO routine_logs (
  routine_id, execution_time, status,
  duration_seconds, error_message
) VALUES (?, NOW(), ?, ?, ?)
```

**Return:** {insertId: number}

---

### getExecutionLogs(routine_id, status, page, limit)

**SQL:**
```sql
SELECT * FROM routine_logs
WHERE routine_id = ?
  AND (? IS NULL OR status = ?)
ORDER BY execution_time DESC
LIMIT ? OFFSET ?
```

**Return:** RoutineLog[]

---

## Type Definitions

```typescript
interface Routine {
  routine_id: number;
  name: string;
  description: string | null;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  cron_pattern: string;
  routine_type: string;
  status: 'active' | 'paused' | 'failed';
  last_execution_time: Date | null;
  next_execution_time: Date | null;
  last_execution_status: 'success' | 'failed' | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}

interface RoutineLog {
  log_id: number;
  routine_id: number;
  execution_time: Date;
  status: 'success' | 'failed' | 'running';
  duration_seconds: number | null;
  error_message: string | null;
  created_at: Date;
}

interface RoutineCreateInput {
  name: string;
  description: string;
  schedule_type: string;
  cron_pattern: string;
  routine_type: string;
}
```

---

## Dependencies
- `database.js` - Connection pool
- `mysql2/promise`
