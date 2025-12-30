# Routines Frontend - API

## Purpose
HTTP API calls for routine operations.

## File Location
`frontend/src/api/routinesAPI.js`

## API Methods

### getRoutines(filters, pagination)

Fetch all routines with pagination.

**HTTP Request:**
```
GET /api/routines?page=1&limit=10&status=active
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: [
    {
      routine_id: 1,
      name: 'Midnight Stock Check',
      description: 'Check low stock levels daily',
      schedule_type: 'daily',
      cron_pattern: '0 0 * * *',
      routine_type: 'stock_check',
      status: 'active',
      last_execution_time: '2024-01-16T00:00:00Z',
      next_execution_time: '2024-01-17T00:00:00Z',
      last_execution_status: 'success',
      created_at: '2023-08-10T08:00:00Z'
    },
    {
      routine_id: 2,
      name: 'Weekly Report Generation',
      description: 'Generate weekly sales report',
      schedule_type: 'weekly',
      cron_pattern: '0 9 * * MON',
      routine_type: 'report',
      status: 'active',
      last_execution_time: '2024-01-15T09:00:00Z',
      next_execution_time: '2024-01-22T09:00:00Z',
      last_execution_status: 'success',
      created_at: '2023-08-12T08:00:00Z'
    }
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 8,
    pages: 1
  }
}
```

---

### getRoutineDetail(id)

Get single routine with execution logs.

**HTTP Request:**
```
GET /api/routines/1
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: {
    ...routine,
    execution_logs: [
      {
        log_id: 101,
        routine_id: 1,
        execution_time: '2024-01-16T00:00:00Z',
        status: 'success',
        duration_seconds: 12,
        error_message: null
      },
      {
        log_id: 100,
        routine_id: 1,
        execution_time: '2024-01-15T00:00:00Z',
        status: 'success',
        duration_seconds: 11,
        error_message: null
      }
    ],
    success_rate: 98.5,
    error_count: 1
  }
}
```

---

### createRoutine(routineData)

Create new routine.

**HTTP Request:**
```
POST /api/routines
Content-Type: application/json

{
  name: 'Hourly Alert Check',
  description: 'Check for alerts every hour',
  schedule_type: 'custom',
  cron_pattern: '0 * * * *',
  routine_type: 'alert_check'
}
```

**Response:** `201 Created`
```javascript
{
  success: boolean,
  data: {
    routine_id: 5,
    ...sentData,
    status: 'active',
    last_execution_time: null,
    next_execution_time: '2024-01-16T09:00:00Z',
    created_at: '2024-01-16T08:30:00Z'
  }
}
```

**Error Response:** `400 Bad Request`
```javascript
{
  success: false,
  errors: {
    cron_pattern: ['Invalid cron pattern format'],
    routine_type: ['Must be one of: stock_check, price_update, alert_check, backup, report']
  }
}
```

---

### updateRoutine(id, updateData)

Update routine configuration.

**HTTP Request:**
```
PUT /api/routines/1
Content-Type: application/json

{
  name: 'Updated Name',
  cron_pattern: '0 1 * * *',
  description: 'Updated description'
}
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: {
    routine_id: 1,
    ...updatedData,
    updated_at: '2024-01-16T10:00:00Z'
  }
}
```

---

### deleteRoutine(id)

Soft delete routine.

**HTTP Request:**
```
DELETE /api/routines/1
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  message: 'Routine deleted successfully'
}
```

---

### executeRoutine(id)

Manually trigger routine execution.

**HTTP Request:**
```
POST /api/routines/1/execute
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: {
    execution_id: 201,
    started_at: '2024-01-16T10:30:00Z',
    status: 'running'
  }
}
```

---

### toggleRoutineStatus(id, status)

Activate or pause routine.

**HTTP Request:**
```
POST /api/routines/1/toggle
Content-Type: application/json

{
  status: 'paused'
}
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: {
    routine_id: 1,
    status: 'paused',
    updated_at: '2024-01-16T10:35:00Z'
  }
}
```

---

### getRoutineLogs(id, page, limit, status)

Get execution logs for routine.

**HTTP Request:**
```
GET /api/routines/1/logs?page=1&limit=20&status=success
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: [
    {
      log_id: 101,
      routine_id: 1,
      execution_time: '2024-01-16T00:00:00Z',
      status: 'success',
      duration_seconds: 12,
      error_message: null
    }
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 67,
    pages: 4
  }
}
```

---

## Axios Configuration

```javascript
import axios from 'axios';

const routinesAPI = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
routinesAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
routinesAPI.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error);
    throw error;
  }
);

export default routinesAPI;
```

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
  last_execution_time: string | null;
  next_execution_time: string | null;
  last_execution_status: 'success' | 'failed' | null;
  created_at: string;
}

interface RoutineLog {
  log_id: number;
  execution_time: string;
  status: 'success' | 'failed' | 'running';
  duration_seconds: number | null;
  error_message: string | null;
}

interface CreateRoutineInput {
  name: string;
  description: string;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  cron_pattern: string;
  routine_type: string;
}

interface ExecutionResult {
  execution_id: number;
  started_at: string;
  status: string;
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200  | Success - GET, PUT, DELETE, POST (execute) |
| 201  | Success - POST (Created) |
| 400  | Bad Request - Validation failed, invalid cron |
| 401  | Unauthorized - Missing/invalid token |
| 404  | Not Found - Routine doesn't exist |
| 500  | Server Error |

---

## Cron Pattern Examples

```
0 0 * * *          = Daily at midnight
0 9 * * *          = Daily at 9 AM
0 9 * * MON        = Every Monday at 9 AM
0 */4 * * *        = Every 4 hours
0 0 1 * *          = First day of month
0 0 * * 0          = Every Sunday
*/15 * * * *       = Every 15 minutes
0 0 * * MON-FRI    = Every weekday at midnight
```

---

## Dependencies
- `axios`
- `localStorage` for token persistence
