# Alerts Controller

## Purpose
HTTP request handlers for alert operations.

## File Location
`backend/src/controllers/alerts.controller.js`

## Methods

### getAllAlerts(req, res)

Handles GET /api/alerts request.

**Input Data Types:**
```javascript
// From query string
{
  page: number = 1,
  limit: number = 10,
  status: string = '',
  type: string = '',
  priority: string = ''
}
```

**Processing:**
```
1. Extract and validate query parameters
2. Call alertsService.getAllAlerts(filters, pagination)
3. Transform response
4. Send 200 OK response
```

**Output Data Types:**
```javascript
Response.status(200).json({
  success: boolean = true,
  message: string = 'Alerts retrieved successfully',
  data: Alert[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
})
```

**Error Handling:**
```javascript
try {
  // Processing
} catch (err) {
  res.status(500).json({
    success: false,
    message: 'Failed to retrieve alerts',
    error: err.message
  })
}
```

---

### getAlertById(req, res)

Handles GET /api/alerts/:id request.

**Input Data Types:**
```javascript
// From URL path
{
  id: number | string  // Will be parseInt to number
}
```

**Processing:**
```
1. Extract alert ID from params
2. Call alertsService.getAlertById(id)
3. If not found, return 404
4. Return 200 with alert details
```

**Output Data Types:**
```javascript
{
  success: boolean,
  message: string,
  data: {
    alert_id: number,
    alert_type: string,
    severity: string,
    title: string,
    description: string,
    status: string,
    related_entity: string,
    entity_id: number | null,
    entity_name: string | null,
    entity_details: {
      product_id: number | null,
      location_id: number | null,
      current_value: number,
      threshold_value: number
    },
    created_at: string,
    resolved_at: string | null,
    dismissed_at: string | null,
    actions: string[]
  }
}
```

**Possible Errors:**
- `404 Not Found`
- `500 Internal Server Error`

---

### createAlert(req, res)

Handles POST /api/alerts request.

**Input Data Types:**
```javascript
// From request body
{
  alert_type: string,           // Required
  severity: string,             // Required: 'high', 'medium', 'low'
  title: string,                // Required, 3-200 chars
  description: string,          // Required, 3-1000 chars
  related_entity: string | null,
  entity_id: number | null
}
```

**Validation:**
```javascript
Rules = {
  alert_type: ['required', 'string', 'in:low_stock,overstock,expiry,manual,system'],
  severity: ['required', 'string', 'in:high,medium,low'],
  title: ['required', 'string', 'min:3', 'max:200'],
  description: ['required', 'string', 'min:3', 'max:1000'],
  related_entity: ['string', 'in:product,location,depot,system'],
  entity_id: ['integer', 'min:1', 'nullable']
}

// Errors if validation fails
if (errors.length > 0) {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: errors
  })
}
```

**Processing:**
```
1. Validate input
2. Create AlertData object
3. Call alertsService.createAlert(alertData)
4. Return 201 with new alert
```

**Output Data Types:**
```javascript
Response.status(201).json({
  success: boolean = true,
  message: string = 'Alert created successfully',
  data: {
    alert_id: number,
    alert_type: string,
    severity: string,
    title: string,
    description: string,
    status: string = 'active',
    created_at: string
  }
})
```

---

### updateAlert(req, res)

Handles PUT /api/alerts/:id request.

**Input Data Types:**
```javascript
// From URL
{
  id: number | string
}

// From body
{
  status: string,               // 'active', 'resolved', 'dismissed'
  notes: string | null,
  resolution_action: string | null
}
```

**Validation:**
```javascript
Rules = {
  status: ['required', 'in:active,resolved,dismissed'],
  notes: ['nullable', 'string', 'max:500'],
  resolution_action: ['nullable', 'string', 'max:100']
}
```

**Processing:**
```
1. Validate input
2. Check if alert exists (404 if not)
3. Check status transition validity
4. Call alertsService.updateAlert(id, updateData)
5. Return 200 with updated alert
```

**Output Data Types:**
```javascript
{
  success: boolean,
  message: string,
  data: {
    alert_id: number,
    status: string,
    resolved_at: string | null,
    dismissed_at: string | null,
    dismissed_by: number | null,
    notes: string | null
  }
}
```

---

### deleteAlert(req, res)

Handles DELETE /api/alerts/:id request.

**Input Data Types:**
```javascript
{
  id: number | string
}
```

**Processing:**
```
1. Check if alert exists (404 if not)
2. Call alertsService.deleteAlert(id)
3. Return 200 with deletion confirmation
```

**Output Data Types:**
```javascript
{
  success: boolean,
  message: string,
  data: {
    alert_id: number,
    deleted: boolean = true,
    deleted_at: string
  }
}
```

---

### getAlertStats(req, res)

Handles GET /api/alerts/stats/dashboard request.

**Input:** None

**Processing:**
```
1. Call alertsService.getStatistics()
2. Aggregate counts by severity and type
3. Get last 5 alerts
4. Return 200 with stats
```

**Output Data Types:**
```javascript
{
  success: boolean,
  data: {
    total_active: number,
    total_resolved: number,
    total_dismissed: number,
    by_severity: {
      high: number,
      medium: number,
      low: number
    },
    by_type: {
      low_stock: number,
      overstock: number,
      expiry: number,
      manual: number
    },
    most_recent: Alert[]
  }
}
```

---

## Middleware Chain Execution

```
Request arrives
  ↓
CORS middleware (checks origin)
  ↓
JSON Parser (parses request body)
  ↓
Logger middleware (logs request)
  ↓
Authentication middleware (checks auth token)
  ↓
Route-specific validator (validates params/body)
  ↓
Controller method executes
  ↓
Service calls database
  ↓
Controller formats response
  ↓
Response sent to client
  ↓
Logger logs response
```

---

## Type Definitions

```typescript
interface Alert {
  alert_id: number;
  alert_type: 'low_stock' | 'overstock' | 'expiry' | 'manual' | 'system';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  status: 'active' | 'resolved' | 'dismissed';
  related_entity: string | null;
  entity_id: number | null;
  entity_name: string | null;
  created_at: Date;
  resolved_at: Date | null;
  dismissed_at: Date | null;
  dismissed_by: number | null;
}

interface CreateAlertInput {
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  related_entity: string | null;
  entity_id: number | null;
}

interface UpdateAlertInput {
  status: string;
  notes: string | null;
  resolution_action: string | null;
}

interface AlertStats {
  total_active: number;
  total_resolved: number;
  total_dismissed: number;
  by_severity: Record<string, number>;
  by_type: Record<string, number>;
  most_recent: Alert[];
}
```

---

## Dependencies
- `alerts.service.js` - Business logic
- `general_validators.js` - Input validation
- `apiResponse.js` - Response formatting
