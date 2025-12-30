# Routines Feature

## Overview
The Routines feature manages scheduled operational tasks that run automatically at specified times or intervals, handling recurring inventory management operations and maintenance tasks.

## Feature Files Reference

### Frontend

#### Pages
- [src/pages/Routines/RoutinesPage.jsx](../../../frontend/src/pages/Routines/RoutinesPage.jsx)
  - Routine management interface
  - Schedule configuration
  - Execution history

#### Components
- [src/components/Layout/RoutineLayout/RoutineForm.jsx](../../../frontend/src/components/Layout/RoutineLayout/RoutineForm.jsx)
  - Routine creation/edit form
  - Schedule configuration (cron expressions)
  - Enable/disable toggle

#### Hooks
- [src/hooks/useRoutines.js](../../../frontend/src/hooks/useRoutines.js)
  - State management for routines
  - CRUD operations
  - Status tracking

#### Handlers
- [src/handlers/routinesHandlers.js](../../../frontend/src/handlers/routinesHandlers.js)
  - Business logic for routine operations
  - Schedule validation
  - Execution coordination

#### API
- [src/utils/routinesAPI.js](../../../frontend/src/utils/routinesAPI.js)
  - HTTP endpoints for routines
  - CRUD operations
  - Execution triggers

### Backend

#### Routes
- [src/routes/routines.routes.js](../../../backend/src/routes/routines.routes.js)
  - Routine endpoint definitions

#### Controllers
- [src/controllers/routines.controller.js](../../../backend/src/controllers/routines.controller.js)
  - HTTP request/response handling
  - Routine management

#### Services
- [src/services/routines.service.js](../../../backend/src/services/routines.service.js)
  - Business logic for routine operations
  - Schedule parsing and validation
  - Execution trigger logic

#### Scheduler Service
- [src/services/scheduler.service.js](../../../backend/src/services/scheduler.service.js)
  - Background task execution
  - Routine scheduling with node-cron
  - Execution monitoring
  - Error handling for failed tasks

#### Models
- [src/models/routines.model.js](../../../backend/src/models/routines.model.js)
  - Database query execution
  - CRUD operations
  - Execution history logging

### Database

#### Tables
- **routines** - Scheduled task definitions
  - routine_id (PK)
  - name
  - description
  - schedule (cron expression)
  - is_active
  - last_executed
  - next_execution
  - created_at

## Common Routines

1. **Inventory Reconciliation** - Verify stock counts
2. **Generate Reports** - Daily/weekly inventory reports
3. **Clean Old Transactions** - Archive historical data
4. **Check Low Stock** - Alert on reorder levels
5. **Database Optimization** - Vacuum/defragment tables
6. **Backup Operations** - Scheduled database backups

## API Endpoints

```
GET    /api/routines              - List all routines
GET    /api/routines/:id          - Get routine details
POST   /api/routines              - Create routine
PUT    /api/routines/:id          - Update routine
DELETE /api/routines/:id          - Delete routine
POST   /api/routines/:id/execute  - Manually trigger routine
```

## Cron Expression Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of Week (0-6, Sunday=0)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of Month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)

Examples:
* * * * *           - Every minute
0 * * * *           - Every hour
0 0 * * *           - Daily at midnight
0 0 * * 0           - Weekly on Sunday
0 2 * * *           - Daily at 2:00 AM
*/30 * * * *        - Every 30 minutes
```

## Key Operations

1. **Define Routines** - Create scheduled tasks with cron expressions
2. **Enable/Disable** - Activate or pause routines
3. **Execute Manually** - Trigger routine on demand
4. **Monitor Execution** - Track last execution and status
5. **Schedule Next** - Automatically schedule next run
6. **Handle Errors** - Retry and log failed executions

## Data Flow

```
Scheduler starts (on server boot)
  ↓
Load all routines where is_active = true
  ↓
Schedule each routine with node-cron
  ↓
At scheduled time:
  ├─ Execute routine service
  ├─ Log execution start
  ├─ Perform task logic
  ├─ Update last_executed
  ├─ Calculate next_execution
  └─ Log completion/errors

User can also:
  ├─ Create routine via RoutinesPage
  ├─ Set schedule via cron expression
  ├─ Enable/disable from UI
  └─ Trigger manually via /api/routines/:id/execute
```

## Scheduler Integration

The scheduler runs continuously in the background:

```javascript
// Pseudo-code from scheduler.service.js
startScheduler() {
  // Load all active routines
  const routines = await getActiveRoutines();
  
  // Schedule each one with cron
  routines.forEach(routine => {
    cron.schedule(routine.schedule, async () => {
      executeRoutine(routine.routine_id);
    });
  });
}
```
