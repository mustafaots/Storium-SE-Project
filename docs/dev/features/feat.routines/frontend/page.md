# Routines Frontend - Page

## Purpose
Main component for routine management interface.

## File Location
`frontend/src/pages/RoutinesPage.jsx`

## Component State

```typescript
interface RoutinesPageState {
  routines: Routine[];
  selectedRoutine: Routine | null;
  routineDetail: RoutineDetail | null;
  showForm: boolean;
  isEditMode: boolean;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  filters: {
    status: string;
  };
}
```

## Layout Structure

```
┌──────────────────────────────────────────────────────┐
│  Routines Management                      [+ New]    │
├──────────────────────────────────────────────────────┤
│ Filter: [Status▼] [Search...]  [Clear]               │
├──────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐  │
│ │ Routine Name  │ Type   │ Schedule  │ Status     │  │
│ ├─────────────────────────────────────────────────┤  │
│ │ Midnight Stock │ Check  │ Daily 12:00 AM │ ✓ Active   │  │
│ │ Weekly Report  │ Report │ Weekly Monday  │ ⏸ Paused   │  │
│ │ Price Sync     │ Update │ Every 4 hours  │ ✗ Failed   │  │
│ └─────────────────────────────────────────────────┘  │
│                                                       │
│ Pagination: [< Previous] Page 1 of 5 [Next >]       │
└──────────────────────────────────────────────────────┘
```

## User Interactions

```
User click on routine row
  ↓
Open RoutineDetailModal
  ↓
Show: name, schedule, last execution, logs
  ↓
Actions: Edit, Delete, Execute Now, View Logs
```

## Component Features

**Routine List Table:**
- Name (clickable)
- Type (stock_check, price_update, alert_check, backup, report)
- Schedule Display (Daily, Weekly, Monthly, Custom with cron)
- Status Badge (Active/Paused/Failed with icons)
- Last Execution Time
- Next Execution Time (countdown)
- Actions Column (Edit, Delete, Execute, View Logs)

**Action Buttons:**
- New Routine: Opens form modal
- Execute Now: Trigger manual execution
- Edit: Opens edit modal
- Delete: Soft delete with confirmation
- View Logs: Shows execution history

---

## Hook Usage

```javascript
const {
  routines,
  selectedRoutine,
  pagination,
  filters,
  loading,
  loadRoutines,
  getRoutineDetail,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  executeRoutine,
  toggleRoutineStatus,
  setStatusFilter,
  handlePageChange
} = useRoutines();

useEffect(() => {
  loadRoutines(pagination.page, pagination.limit);
}, [pagination.page, filters.status]);
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

---

## Dependencies
- `useRoutines` hook
- `RoutineList` component
- `RoutineDetailModal` component
- `RoutineForm` component
