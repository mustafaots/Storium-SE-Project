# Routines Controller, Service, and Model

## Purpose
Implements complete routines/automation management layer. Controllers handle HTTP requests, services implement business logic with scheduler integration, and models manage database access.

## File Locations
- `backend/src/controllers/routines.controller.js`
- `backend/src/services/routines.service.js`
- `backend/src/models/routines.model.js`

---

## DATABASE SCHEMAS

```sql
-- Routines table
CREATE TABLE routines (
    routine_id INT AUTO_INCREMENT PRIMARY KEY 
        COMMENT 'Unique routine identifier',
    
    name VARCHAR(255) NOT NULL 
        COMMENT 'Routine name (e.g., "Daily Stock Check", "Weekly Expiry Alert")',
    
    promise TEXT NOT NULL 
        COMMENT 'Condition/trigger description',
    
    resolve TEXT NOT NULL 
        COMMENT 'Action to take when triggered',
    
    frequency ENUM('daily', 'weekly', 'monthly', 'on_event', 'always') 
        DEFAULT 'daily'
        COMMENT 'Execution frequency',
    
    cron_expression VARCHAR(50) 
        COMMENT 'Custom CRON expression for advanced scheduling',
    
    is_active BOOLEAN DEFAULT TRUE 
        COMMENT 'Is routine enabled',
    
    last_run TIMESTAMP NULL 
        COMMENT 'Last execution timestamp',
    
    next_run TIMESTAMP NULL 
        COMMENT 'Next scheduled execution',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_is_active (is_active),
    INDEX idx_frequency (frequency),
    INDEX idx_next_run (next_run)
);

-- Action history table
CREATE TABLE action_history (
    action_id INT AUTO_INCREMENT PRIMARY KEY 
        COMMENT 'Unique action identifier',
    
    action TEXT NOT NULL 
        COMMENT 'Action description',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        COMMENT 'Execution timestamp',
    
    is_automated BOOLEAN DEFAULT FALSE 
        COMMENT 'Was this triggered by automation',
    
    actor_name VARCHAR(255) 
        COMMENT 'User name or "System" for automated',
    
    routine_id INT 
        COMMENT 'Associated routine (if automated)',
    
    status ENUM('success', 'failed') DEFAULT 'success' 
        COMMENT 'Execution status',
    
    error_message TEXT 
        COMMENT 'Error details if failed',
    
    affected_records INT 
        COMMENT 'Number of records affected',
    
    FOREIGN KEY (routine_id) REFERENCES routines(routine_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    
    INDEX idx_routine_id (routine_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status)
);
```

---

## CONTROLLERS

### getAllRoutines(req, res)
Fetches all routines with status and statistics.

**Request Data Types:**
```javascript
req.query = {
  page: number,
  limit: number,
  search: string,
  active_only: boolean
}
```

**Processing Steps:**
```
1. Extract & validate pagination
2. Parse filters (search, active_only)
3. Call routinesService.getAllPaginated()
4. Enrich with execution statistics
5. Calculate next_run based on frequency
6. Return paginated response
```

**Response Data Types:**
```javascript
{
  success: boolean,
  message: string,
  data: Routine[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}

// Routine object with statistics
Routine = {
  routine_id: number,
  name: string,
  promise: string,
  resolve: string,
  frequency: string,
  is_active: boolean,
  last_run: string | null,
  next_run: string | null,      // Calculated
  execution_count: number,
  success_count: number,
  failure_count: number,
  created_at: string
}
```

---

### getRoutineById(req, res)
Fetches single routine with detailed history.

**Request Data Types:**
```javascript
req.params = {
  id: number
}
```

**Processing Steps:**
```
1. Fetch routine by ID
2. Check if exists
3. Fetch recent execution history (last 10)
4. Calculate statistics
5. Return with history
```

**Response Data Types:**
```javascript
{
  success: boolean,
  message: string,
  data: {
    routine_id: number,
    name: string,
    promise: string,
    resolve: string,
    frequency: string,
    is_active: boolean,
    last_run: string | null,
    next_run: string | null,
    created_at: string,
    
    recent_executions: Array<{
      action_id: number,
      action: string,
      executed_at: string,
      status: 'success' | 'failed',
      error_message: string | null,
      duration_ms: number
    }>,
    
    stats: {
      total_executions: number,
      successful: number,
      failed: number,
      success_rate: number
    }
  }
}
```

---

### createRoutine(req, res)
Creates a new routine.

**Request Data Types:**
```javascript
req.body = {
  name: string,
  promise: string,
  resolve: string,
  frequency: string,
  cron_expression: string | null
}
```

**Validation Rules:**
```javascript
{
  name: {
    required: true,
    minLength: 3,
    maxLength: 255
  },
  promise: {
    required: true,
    minLength: 10
  },
  resolve: {
    required: true,
    minLength: 10
  },
  frequency: {
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'on_event', 'always']
  },
  cron_expression: {
    // Validated if provided (CRON format)
  }
}
```

**Processing Steps:**
```
1. Validate all required fields
2. Normalize frequency (e.g., "real-time" → "always")
3. Validate CRON expression if provided
4. Call routinesService.create()
5. Schedule with scheduler
6. Return 201 Created
```

**Response (201 Created):**
```javascript
{
  success: boolean,
  message: string,
  data: {
    routine_id: number,
    name: string,
    promise: string,
    resolve: string,
    frequency: string,
    is_active: boolean,
    created_at: string
  }
}
```

---

### toggleRoutineStatus(req, res)
Toggle routine active/inactive status.

**Request Data Types:**
```javascript
req.params = {
  id: number
}

req.body = {
  is_active: boolean
}
```

**Processing Steps:**
```
1. Verify routine exists
2. Check current status
3. Call toggleStatus service
4. Update scheduler
5. Log action
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: {
    routine_id: number,
    is_active: boolean,
    updated_at: string
  }
}
```

---

### executeRoutineNow(req, res)
Manually trigger routine execution.

**Request Data Types:**
```javascript
req.params = {
  id: number
}

req.body = {
  force: boolean  // true to skip schedule checks
}
```

**Processing Steps:**
```
1. Verify routine exists
2. Queue execution in background
3. Return 202 Accepted
4. Process asynchronously
5. Update execution history
6. Trigger alert if fails
```

**Response (202 Accepted):**
```javascript
{
  success: boolean,
  message: string,
  data: {
    routine_id: number,
    name: string,
    status: 'queued',
    execution_id: string,
    estimated_completion: string
  }
}
```

---

### getRoutineHistory(req, res)
Fetch execution history for a routine.

**Request Data Types:**
```javascript
req.params = {
  id: number
}

req.query = {
  page: number,
  limit: number,
  status: 'all' | 'success' | 'failed',
  from_date: string,
  to_date: string
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: Array<{
    action_id: number,
    routine_id: number,
    action: string,
    created_at: string,
    is_automated: boolean,
    status: 'success' | 'failed',
    error_message: string | null,
    duration_ms: number,
    affected_records: number
  }>,
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  },
  summary: {
    total_runs: number,
    successful: number,
    failed: number,
    success_rate: number,
    average_duration_ms: number
  }
}
```

---

## SERVICES

### getAllPaginated(page, limit, search, activeOnly)
Fetches paginated routines with filters.

**Input Parameters:**
```javascript
page: number = 1
limit: number = 10
search: string = ""
activeOnly: boolean = false
```

**SQL Query:**
```sql
SELECT 
  r.*,
  COUNT(ah.action_id) as total_executions,
  SUM(CASE WHEN ah.status = 'success' THEN 1 ELSE 0 END) as success_count,
  SUM(CASE WHEN ah.status = 'failed' THEN 1 ELSE 0 END) as failure_count
FROM routines r
LEFT JOIN action_history ah ON r.routine_id = ah.routine_id
WHERE (? IS NULL OR r.name LIKE ?)
  AND (? IS NULL OR r.is_active = ?)
GROUP BY r.routine_id
ORDER BY r.created_at DESC
LIMIT ? OFFSET ?;
```

---

### getById(id)
Fetches single routine with stats.

**SQL Query:**
```sql
SELECT 
  r.*,
  COUNT(ah.action_id) as total_executions,
  SUM(CASE WHEN ah.status = 'success' THEN 1 ELSE 0 END) as success_count,
  SUM(CASE WHEN ah.status = 'failed' THEN 1 ELSE 0 END) as failure_count
FROM routines r
LEFT JOIN action_history ah ON r.routine_id = ah.routine_id
WHERE r.routine_id = ?
GROUP BY r.routine_id;
```

---

### create(routineData)
Creates new routine and schedules it.

**Validation Logic:**
```javascript
if (!routineData.name || routineData.name.trim().length < 3)
  throw new Error('Name must be at least 3 characters')

if (!routineData.promise || routineData.promise.length < 10)
  throw new Error('Promise must be at least 10 characters')

if (!routineData.resolve || routineData.resolve.length < 10)
  throw new Error('Resolve must be at least 10 characters')

// Normalize frequency
let frequency = routineData.frequency?.toLowerCase() || 'daily'
if (frequency === 'real-time') frequency = 'always'

const validFrequencies = ['daily', 'weekly', 'monthly', 'on_event', 'always']
if (!validFrequencies.includes(frequency))
  throw new Error('Invalid frequency')

// Validate CRON if provided
if (routineData.cron_expression) {
  const cronPattern = /^(\*|(\d+)(,(\d+))*) (\*|(\d+)(,(\d+))*)...$/
  if (!cronPattern.test(routineData.cron_expression))
    throw new Error('Invalid CRON expression')
}
```

**SQL Query:**
```sql
INSERT INTO routines (name, promise, resolve, frequency, cron_expression)
VALUES (?, ?, ?, ?, ?);
```

**Post-Insert Steps:**
```
1. Get new routine_id
2. Calculate next_run based on frequency
3. Register with scheduler
4. Return created routine
```

---

### toggleStatus(id, isActive)
Toggle routine status.

**SQL Query:**
```sql
UPDATE routines SET is_active = ? WHERE routine_id = ?;
```

**Scheduler Integration:**
```
If is_active = TRUE:
  - Register routine with scheduler
  - Calculate next run
  
If is_active = FALSE:
  - Remove from scheduler
  - Stop any pending executions
```

---

### executeManually(id)
Manually trigger execution.

**Process Flow:**
```
1. Verify routine exists and is enabled
2. Create execution queue entry
3. Return 202 Accepted immediately
4. Process in background:
   a. Call routine.resolve action
   b. Log execution
   c. Update last_run timestamp
   d. Calculate next_run
   e. If failed, create alert
```

**SQL Queries:**
```sql
-- Update last_run
UPDATE routines SET last_run = NOW() WHERE routine_id = ?;

-- Insert execution log
INSERT INTO action_history (
  routine_id, action, is_automated, status, error_message, affected_records
) VALUES (?, ?, TRUE, ?, ?, ?);
```

---

## MODELS

### Routine.findAll()

Fetches all routines.

**SQL Query:**
```sql
SELECT * FROM routines ORDER BY created_at DESC;
```

---

### Routine.findById(id)

Fetches single routine.

**SQL Query:**
```sql
SELECT * FROM routines WHERE routine_id = ?;
```

---

### Routine.create(data)

Creates new routine.

**SQL Query:**
```sql
INSERT INTO routines (name, promise, resolve, frequency, cron_expression)
VALUES (?, ?, ?, ?, ?);
```

---

### Routine.toggleStatus(id, isActive)

Updates active status.

**SQL Query:**
```sql
UPDATE routines SET is_active = ?, last_run = ? WHERE routine_id = ?;
```

---

### Routine.delete(id)

Deletes routine.

**SQL Query:**
```sql
DELETE FROM routines WHERE routine_id = ?;
```

---

### ActionHistory.logExecution(routineId, action, status, errorMsg, affectedRows)

Logs routine execution.

**SQL Query:**
```sql
INSERT INTO action_history (
  routine_id, action, is_automated, actor_name, status, error_message, affected_records
) VALUES (?, ?, TRUE, 'System', ?, ?, ?);
```

---

### ActionHistory.getByRoutine(routineId, limit, offset, status)

Fetches execution history.

**SQL Query:**
```sql
SELECT * FROM action_history
WHERE routine_id = ?
  AND (? IS NULL OR status = ?)
ORDER BY created_at DESC
LIMIT ? OFFSET ?;
```

---

## Scheduler Integration

### Next Run Calculation

```javascript
// Based on frequency
switch (frequency) {
  case 'daily':
    next_run = tomorrow at 00:00
    
  case 'weekly':
    next_run = next Monday at 00:00
    
  case 'monthly':
    next_run = first day of next month at 00:00
    
  case 'always':
    next_run = immediately (triggered on data change)
    
  case 'on_event':
    next_run = NULL (triggered by events)
    
  custom CRON:
    next_run = calculated by CRON parser
}
```

---

## Error Handling

**Validation Errors:**
```javascript
{
  success: false,
  message: "Validation error",
  error: "Name must be at least 3 characters"
}
```

**Execution Errors:**
```javascript
{
  success: false,
  message: "Execution failed",
  error: "Database error during stock update"
}
```

**Not Found Errors:**
```javascript
{
  success: false,
  message: "Routine not found",
  error: "No routine with ID 999"
}
```
