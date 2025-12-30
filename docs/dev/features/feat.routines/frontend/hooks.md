# Routines Frontend - Hooks

## Purpose
React hooks for routine management state and operations.

## File Location
`frontend/src/hooks/useRoutines.js`

## Hook State

```typescript
interface RoutinesState {
  routines: Routine[];
  selectedRoutine: Routine | null;
  routineDetail: RoutineDetail | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    status: string;
  };
}

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

interface RoutineDetail extends Routine {
  execution_logs: RoutineLog[];
  success_rate: number;
  error_count: number;
}

interface RoutineLog {
  log_id: number;
  execution_time: string;
  status: 'success' | 'failed' | 'running';
  duration_seconds: number | null;
  error_message: string | null;
}
```

## Hook Methods

```typescript
// Load all routines
loadRoutines(page: number = 1, limit: number = 10): Promise<void>

// Get single routine with detail and logs
getRoutineDetail(id: number): Promise<RoutineDetail>

// Create new routine
createRoutine(routineData: CreateRoutineInput): Promise<Routine>

// Update routine
updateRoutine(id: number, updates: Partial<Routine>): Promise<Routine>

// Delete routine
deleteRoutine(id: number): Promise<void>

// Manually execute routine
executeRoutine(id: number): Promise<ExecutionResult>

// Toggle routine status (active/paused)
toggleRoutineStatus(id: number, status: string): Promise<Routine>

// Get execution logs
getRoutineLogs(id: number, page: number): Promise<RoutineLog[]>

// Set status filter
setStatusFilter(status: string): void

// Handle pagination
handlePageChange(page: number): void
```

## Usage Example

```javascript
import { useRoutines } from '../hooks/useRoutines';

function RoutinesPage() {
  const { 
    routines, 
    selectedRoutine,
    loading, 
    pagination,
    filters,
    loadRoutines,
    getRoutineDetail,
    createRoutine,
    executeRoutine,
    toggleRoutineStatus,
    setStatusFilter,
    handlePageChange
  } = useRoutines();

  useEffect(() => {
    loadRoutines(pagination.page, pagination.limit);
  }, [pagination.page, filters.status]);

  return (
    // UI code
  );
}
```

---

## Type Definitions

```typescript
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
  duration_seconds: number | null;
}
```

---

## Dependencies
- `../api/routinesAPI.js`
- `useState`, `useEffect`, `useCallback` from React
