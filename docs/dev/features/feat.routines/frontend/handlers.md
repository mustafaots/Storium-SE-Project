# Routines Frontend - Handlers

## Purpose
Business logic and validation for routine operations.

## File Location
`frontend/src/handlers/routinesHandler.js`

## Handler Methods

### validateRoutineForm(formData)

Validates routine form input.

**Validation Rules:**
```javascript
rules = {
  name: ['required', 'string', 'min:2', 'max:100'],
  description: ['string', 'max:500'],
  schedule_type: ['required', 'in:daily,weekly,monthly,custom'],
  cron_pattern: ['required', 'string', 'regex:/^(.*)$/'],
  routine_type: ['required', 'in:stock_check,price_update,alert_check,backup,report']
}
```

**Cron Pattern Validation:**
- Must be valid cron syntax (6 or 5 fields)
- Examples: "0 9 * * *" (daily), "0 9 * * MON" (weekly)

**Returns:**
```javascript
{
  isValid: boolean,
  errors: {[field]: string[]}
}
```

---

### validateCronPattern(cronString)

Validates cron expression format.

**Processing:**
```
Parse cron string
  ↓
Check field count (5 or 6)
  ↓
Validate each field (minute, hour, day, month, dow, etc)
  ↓
Return valid boolean
```

**Returns:** {isValid: boolean, error?: string}

---

### fetchRoutines(filters, pagination)

Fetch routines from API with error handling.

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

**Processing:**
```
Validate pagination (page ≥ 1, limit ∈ [1, 100])
  ↓
Call routinesAPI.getRoutines(filters, pagination)
  ↓
Handle response data
  ↓
Calculate next execution countdown
  ↓
Update store
  ↓
Handle errors
```

**Returns:** 
```javascript
{
  routines: Routine[],
  pagination: {...}
}
```

---

### fetchRoutineDetail(id)

Fetch single routine with execution logs.

**Processing:**
```
Validate ID (number, > 0)
  ↓
Call routinesAPI.getRoutineDetail(id)
  ↓
Transform response
  ↓
Calculate success rate
  ↓
Return with nested logs
```

**Returns:** RoutineDetail

---

### saveRoutine(routineData, isEdit)

Save new or update existing routine.

**Input:**
```javascript
routineData = {
  routine_id?: number,
  name: string,
  description: string,
  schedule_type: string,
  cron_pattern: string,
  routine_type: string
}
isEdit = boolean
```

**Processing:**
```
Validate form data
  ↓
Validate cron pattern
  ↓
Transform data before sending
  ↓
Call API (POST or PUT)
  ↓
Handle response
  ↓
Return created/updated routine
```

**Returns:** Routine

---

### executeRoutineHandler(id)

Manually trigger routine execution.

**Processing:**
```
Confirm execution
  ↓
Call routinesAPI.executeRoutine(id)
  ↓
Show success toast
  ↓
Update next execution time
  ↓
Return execution result
```

**Returns:** ExecutionResult

---

### toggleRoutineStatusHandler(id, newStatus)

Activate or pause routine.

**Input:**
```javascript
{
  id: number,
  newStatus: 'active' | 'paused'
}
```

**Processing:**
```
Validate new status
  ↓
Call API to toggle status
  ↓
Update local state
  ↓
Return success
```

---

### deleteRoutineHandler(id)

Delete routine with confirmation.

**Processing:**
```
Confirm deletion
  ↓
Call API DELETE /routines/:id
  ↓
Handle success
  ↓
Return success status
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

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

interface ExecutionResult {
  execution_id: number;
  started_at: string;
  status: string;
}
```

---

## Dependencies
- `../api/routinesAPI.js`
- `../utils/validators.js`
- `../utils/cronValidator.js` (for cron validation)
