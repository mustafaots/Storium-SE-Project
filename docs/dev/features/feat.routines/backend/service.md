# Routines Service

## Purpose
Business logic for routine/scheduled task management.

## File Location
`backend/src/services/routines.service.js`

## Methods

### getAllRoutines(filters, pagination)

**Input:**
```javascript
filters = {
  status: string
}
pagination = {
  page: number,
  limit: number
}
```

**SQL:**
```sql
SELECT 
  r.*,
  COUNT(DISTINCT rl.log_id) as execution_count,
  SUM(CASE WHEN rl.status = 'success' THEN 1 ELSE 0 END) as success_count
FROM routines r
LEFT JOIN routine_logs rl ON r.routine_id = rl.routine_id
WHERE (? = '' OR r.status = ?)
  AND r.deleted_at IS NULL
GROUP BY r.routine_id
ORDER BY r.created_at DESC
LIMIT ? OFFSET ?
```

**Output:**
```javascript
{
  routines: Routine[],
  pagination: {page, limit, total, pages}
}
```

---

### getRoutineById(id)

**SQL:**
```sql
SELECT * FROM routines WHERE routine_id = ? AND deleted_at IS NULL
```

**Processing:**
```
1. Fetch routine
2. Get recent execution logs (last 20)
3. Calculate: success_rate = success_count / total_count * 100
4. Calculate: error_count = failed count
5. Return with nested logs and metrics
```

**Output:** RoutineDetail with execution_logs and metrics

---

### createRoutine(routineData)

**SQL:**
```sql
INSERT INTO routines (
  name, description, schedule_type,
  cron_pattern, routine_type,
  status, created_at
) VALUES (?, ?, ?, ?, ?, 'active', NOW())
```

**Processing:**
```
1. Validate routine configuration
2. Insert routine record
3. Schedule first execution
4. Return created routine
```

**Output:** Created Routine

---

### updateRoutine(id, updateData)

**SQL:**
```sql
UPDATE routines SET
  name = COALESCE(?, name),
  description = COALESCE(?, description),
  cron_pattern = COALESCE(?, cron_pattern),
  schedule_type = COALESCE(?, schedule_type),
  updated_at = NOW()
WHERE routine_id = ?
```

---

### executeRoutine(id)

**Processing:**
```
1. Fetch routine configuration
2. Calculate next execution time
3. Create execution log entry
4. Execute routine logic (based on type)
   - 'stock_check': Check low stock items
   - 'price_update': Update product prices
   - 'alert_check': Generate alerts
   - 'backup': Database backup
   - 'report': Generate reports
5. Update log with status/duration
6. Update next_execution_time
7. Return execution status
```

**Output:**
```javascript
{
  execution_id: number,
  started_at: Date,
  status: string,
  duration_seconds: number | null
}
```

---

### toggleRoutine(id, status)

**SQL:**
```sql
UPDATE routines SET
  status = ?,
  updated_at = NOW()
WHERE routine_id = ?
```

**Output:** Updated Routine

---

### getRoutineLogs(id, filters, pagination)

**SQL:**
```sql
SELECT * FROM routine_logs
WHERE routine_id = ?
  AND (? = '' OR status = ?)
  AND deleted_at IS NULL
ORDER BY execution_time DESC
LIMIT ? OFFSET ?
```

**Output:** RoutineLog[]

---

### calculateNextExecution(cronPattern)

**Processing:**
```
Parse cron pattern
  ↓
Calculate next execution time
  ↓
Return Date object
```

**Cron Format Examples:**
- "0 9 * * *" = Daily at 9 AM
- "0 9 * * MON" = Every Monday at 9 AM
- "0 */4 * * *" = Every 4 hours

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
  execution_count: number;
  created_at: Date;
}

interface RoutineLog {
  log_id: number;
  routine_id: number;
  execution_time: Date;
  status: 'success' | 'failed' | 'running';
  duration_seconds: number | null;
  error_message: string | null;
}

interface ExecutionResult {
  execution_id: number;
  started_at: Date;
  status: string;
  duration_seconds: number | null;
  error_message: string | null;
}
```

---

## Dependencies
- `routines.model.js`
- `database.js`
- `node-cron` (for scheduling)
