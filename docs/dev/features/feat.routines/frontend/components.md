# Routines Frontend - Components

## Purpose
React components for routine management UI.

## File Location
`frontend/src/components/`

## Components

### RoutineList

Table component displaying all routines.

**Props:**
```typescript
interface RoutineListProps {
  routines: Routine[];
  loading: boolean;
  pagination: Pagination;
  onSelectRoutine: (routine: Routine) => void;
  onDeleteRoutine: (id: number) => void;
  onExecuteRoutine: (id: number) => void;
  onToggleStatus: (id: number, status: string) => void;
  onPageChange: (page: number) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

**Features:**
- Sortable columns (name, schedule_type, routine_type, status)
- Status badge (Active/Paused/Failed with icons)
- Schedule display (human-readable format)
- Next execution countdown timer
- Last execution time with status indicator
- Row selection with checkbox
- Actions column (View, Edit, Delete, Execute, View Logs)
- Pagination controls
- Loading skeleton
- Empty state message

**Styling:**
```css
.routine-list {
  width: 100%;
  border-collapse: collapse;
}

.routine-list tbody tr:hover {
  background-color: #f5f5f5;
}

.routine-list td {
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.schedule-display {
  font-family: monospace;
  font-size: 12px;
  padding: 2px 6px;
  background: #f5f5f5;
  border-radius: 3px;
}

.next-execution-timer {
  color: #1976d2;
  font-weight: 600;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-paused {
  background: #fff3e0;
  color: #e65100;
}

.status-failed {
  background: #ffebee;
  color: #c62828;
}
```

---

### RoutineForm

Form component for creating/editing routines.

**Props:**
```typescript
interface RoutineFormProps {
  routine?: Routine | null;
  onSubmit: (data: CreateRoutineInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

**Features:**
- Text inputs: name, description
- Select dropdown: schedule_type (daily, weekly, monthly, custom)
- Select dropdown: routine_type (stock_check, price_update, alert_check, backup, report)
- Cron pattern input with helper
- Cron expression validator
- Schedule preview (shows next 5 execution times)
- Form validation with inline error messages
- Submit/Cancel buttons
- Auto-population in edit mode

**Form Fields:**
```javascript
[
  { name: 'name', label: 'Routine Name', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: false },
  { name: 'schedule_type', label: 'Schedule Type', type: 'select',
    options: ['daily', 'weekly', 'monthly', 'custom'], required: true },
  { name: 'routine_type', label: 'Routine Type', type: 'select',
    options: ['stock_check', 'price_update', 'alert_check', 'backup', 'report'], required: true },
  { name: 'cron_pattern', label: 'Cron Pattern', type: 'text',
    placeholder: '0 9 * * *', required: true, help: 'Cron syntax' }
]
```

**Cron Helper Options:**
```
- Daily at time
- Weekly on day at time
- Monthly on date at time
- Custom expression input
```

---

### RoutineDetailModal

Modal component showing full routine details.

**Props:**
```typescript
interface RoutineDetailModalProps {
  routine: RoutineDetail | null;
  open: boolean;
  onClose: () => void;
  onEdit: (routine: Routine) => void;
  onDelete: (id: number) => void;
  onExecute: (id: number) => void;
  onToggleStatus: (id: number, status: string) => void;
}
```

**Features:**
- Routine information summary
- Schedule details (human-readable)
- Last execution info with duration
- Next execution countdown
- Execution logs table (last 10)
- Success rate percentage with progress bar
- Error count badge
- Tab navigation (Details, Logs, Statistics)
- Action buttons (Edit, Delete, Execute Now, Pause/Resume, View All Logs)

**Layout:**
```
┌──────────────────────────────────────┐
│ Routine - Midnight Stock Check  [X]  │
├──────────────────────────────────────┤
│ [Details] [Logs] [Statistics]        │
├──────────────────────────────────────┤
│ Schedule: Daily at 12:00 AM          │
│ Type: Stock Check                    │
│ Cron: 0 0 * * *                      │
│ Status: ✓ Active                     │
│                                      │
│ Last Execution: Jan 16, 00:00 (12s)  │
│ Next Execution: In 1 hour            │
│                                      │
│ Success Rate: 98.5% ▓▓▓▓▓░░        │
│ Errors: 1                            │
│                                      │
│ [Edit] [Execute] [Pause] [Delete]    │
└──────────────────────────────────────┘
```

---

### ExecutionLogsList

Table component for execution logs.

**Props:**
```typescript
interface ExecutionLogsListProps {
  logs: RoutineLog[];
  loading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
}
```

**Features:**
- Sortable columns (execution_time, status, duration)
- Status indicator (success/failed/running)
- Duration display in seconds/minutes
- Error message tooltip on failed executions
- Timestamp with relative time display
- Pagination controls

---

### SchedulePreview

Component showing next scheduled execution times.

**Props:**
```typescript
interface SchedulePreviewProps {
  cronPattern: string;
  limit?: number;
}
```

**Features:**
- Display next N execution times (default 5)
- Human-readable format
- "Today", "Tomorrow", "Next week" labels
- Highlight next immediate execution

---

### RoutineStatusToggle

Toggle button for activate/pause routine.

**Props:**
```typescript
interface RoutineStatusToggleProps {
  routineId: number;
  currentStatus: 'active' | 'paused' | 'failed';
  onToggle: (id: number, newStatus: string) => void;
  disabled?: boolean;
}
```

**Features:**
- One-click toggle (if not failed)
- Loading state during toggle
- Disabled if routine in failed state
- Confirmation dialog on toggle

---

## Dependencies
- `react`
- `axios` (for API calls)
- `react-toastify` (for notifications)
- `react-icons` (for icons)
- `node-cron` (for cron parsing - optional, for preview)
- `date-fns` (for time calculations)
