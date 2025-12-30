# Routines Routes

## Purpose
Defines HTTP endpoints for automation and scheduled routines. Handles CRUD operations for routines (stock checks, alerts, price updates), execution management, and history tracking.

## File Location
`backend/src/routes/routines.routes.js`

## Route Definitions

### GET /api/routines
List all routines with status and execution history.

**Query Parameters:**
```javascript
{
  page: string | number,      // Page number (default: 1)
  limit: string | number,     // Items per page (default: 10)
  search: string,             // Search in routine name/promise
  active_only: boolean        // Filter only active routines
}
```

**Response (200 OK):**
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

// Routine Type
Routine = {
  routine_id: number,
  name: string,
  promise: string,            // Condition/trigger description
  resolve: string,            // Action to take
  frequency: 'daily' | 'weekly' | 'monthly' | 'on_event' | 'always',
  is_active: boolean,
  last_run: string | null,    // ISO 8601 timestamp
  next_run: string | null,    // Calculated next run time
  execution_count: number,    // Total executions
  success_count: number,      // Successful executions
  failure_count: number,      // Failed executions
  created_at: string
}
```

---

### GET /api/routines/:id
Get single routine details with execution history.

**Path Parameters:**
```javascript
{
  id: number  // Routine ID
}
```

**Response (200 OK):**
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
    
    // Execution history
    recent_executions: Array<{
      action_id: number,
      action: string,
      executed_at: string,
      status: 'success' | 'failed',
      error_message: string | null
    }>,
    
    // Statistics
    stats: {
      total_executions: number,
      successful: number,
      failed: number,
      success_rate: number  // Percentage
    }
  }
}
```

---

### POST /api/routines
Create a new routine.

**Body Data Types:**
```javascript
{
  name: string,                 // Required, routine name
  promise: string,              // Required, trigger condition description
  resolve: string,              // Required, action to take
  frequency: string,            // Required, one of: daily, weekly, monthly, on_event, always
  cron_expression: string | null // Optional, CRON format for custom schedule
}
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

**Validation Rules:**
```javascript
{
  name: {
    required: true,
    type: string,
    minLength: 3,
    maxLength: 255
  },
  promise: {
    required: true,
    type: string,
    minLength: 10
  },
  resolve: {
    required: true,
    type: string,
    minLength: 10
  },
  frequency: {
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'on_event', 'always'],
    default: 'daily'
  },
  cron_expression: {
    pattern: "^(\\*|\\d{1,2}|\\*\\/\\d{1,2}) (\\*|\\d{1,2}|\\*\\/\\d{1,2}) (\\*|\\d{1,2}|\\*\\/\\d{1,2}) (\\*|\\d{1,2}|\\*\\/\\d{1,2}) (\\*|\\d{1,2}|\\*\\/\\d{1,2})$"
  }
}
```

---

### PUT /api/routines/:id
Update a routine configuration.

**Path Parameters:**
```javascript
{
  id: number  // Routine ID
}
```

**Body Data Types:**
```javascript
{
  name: string | undefined,
  promise: string | undefined,
  resolve: string | undefined,
  frequency: string | undefined,
  cron_expression: string | null | undefined
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: null
}
```

---

### DELETE /api/routines/:id
Delete a routine.

**Path Parameters:**
```javascript
{
  id: number  // Routine ID
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: null
}
```

**Cascade Behavior:**
- action_history records with this routine_id get routine_id = NULL
- Scheduler stops executing this routine immediately

---

## Routine Execution Control

### PATCH /api/routines/:id/toggle-status
Toggle routine active/inactive status.

**Body Data Types:**
```javascript
{
  is_active: boolean  // true to activate, false to deactivate
}
```

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: {
    routine_id: number,
    is_active: boolean,
    activated_at: string | null,
    deactivated_at: string | null
  }
}
```

---

### POST /api/routines/:id/execute-now
Manually trigger routine execution immediately.

**Body Data Types (optional):**
```javascript
{
  force: boolean  // true to ignore schedule and execute immediately
}
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

## Execution History

### GET /api/routines/:id/history
Get execution history for a routine.

**Query Parameters:**
```javascript
{
  page: number,
  limit: number,
  status: 'all' | 'success' | 'failed',
  from_date: string,          // ISO 8601 date
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
    duration_ms: number,       // Execution time in milliseconds
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
    success_rate: number,      // Percentage
    average_duration_ms: number
  }
}
```

---

### GET /api/routines/dashboard/stats
Get overall automation statistics.

**Response (200 OK):**
```javascript
{
  success: boolean,
  message: string,
  data: {
    total_routines: number,
    active_routines: number,
    inactive_routines: number,
    
    executions: {
      total_24h: number,       // Last 24 hours
      successful_24h: number,
      failed_24h: number,
      success_rate_24h: number
    },
    
    upcoming: Array<{
      routine_id: number,
      name: string,
      next_run: string
    }>,
    
    recent_failures: Array<{
      routine_id: number,
      name: string,
      failed_at: string,
      error: string
    }>
  }
}
```

---

## Routine Types and Examples

### Stock Level Check Routine

**Name:** "Daily Stock Check"

**Promise:** "Each product stock falls below min_stock_level"

**Resolve:** "Create low stock alert with CRITICAL severity"

**Frequency:** daily

---

### Expiry Alert Routine

**Name:** "Weekly Expiry Check"

**Promise:** "Any stock items expire within 30 days"

**Resolve:** "Generate expiry alert and notify warehouse manager"

**Frequency:** weekly

---

### Price Update Routine

**Name:** "Monthly Price Update"

**Promise:** "First day of each month"

**Resolve:** "Apply inflation adjustment to all product rates"

**Frequency:** monthly (or CRON: 0 0 1 * *)

---

### Automatic Reorder Routine

**Name:** "Automatic Reorder"

**Promise:** "Stock quantity reaches reorder point"

**Resolve:** "Create purchase transaction with preferred supplier"

**Frequency:** on_event (triggered by stock changes)

---

## Error Responses

**400 Bad Request:**
```javascript
{
  success: false,
  message: "Invalid request",
  error: "Frequency must be one of: daily, weekly, monthly, on_event, always"
}
```

**404 Not Found:**
```javascript
{
  success: false,
  message: "Routine not found",
  error: "No routine with ID 999"
}
```

**500 Internal Server Error:**
```javascript
{
  success: false,
  message: "Execution error",
  error: "Failed to execute routine"
}
```
