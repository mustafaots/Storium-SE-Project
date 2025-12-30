# Alerts Routes

## Purpose
HTTP endpoints for managing system alerts and notifications.

## File Location
`backend/src/routes/alerts.routes.js`

## Endpoints

### GET /api/alerts

Retrieves all alerts with pagination and filtering.

**Middleware Chain:**
```
CORS → JSON Parser → Logger → Authenticate → Validator → Controller
```

**Query Parameters:**
```javascript
{
  page: number = 1,
  limit: number = 10,
  status: string = '',           // 'active', 'resolved', 'dismissed'
  type: string = '',             // 'low_stock', 'overstock', 'expiry', etc
  priority: string = ''          // 'high', 'medium', 'low'
}
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  message: string,
  data: Alert[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}

// Alert type
Alert = {
  alert_id: number,
  alert_type: string,           // 'low_stock', 'overstock', 'expiry'
  severity: string,             // 'high', 'medium', 'low'
  title: string,
  description: string,
  status: string,               // 'active', 'resolved', 'dismissed'
  related_entity: string,       // 'product', 'location', 'depot'
  entity_id: number,
  entity_name: string,
  created_at: string,
  resolved_at: string | null,
  dismissed_at: string | null,
  dismissed_by: number | null
}
```

---

### GET /api/alerts/:id

Retrieves a specific alert with full details.

**URL Parameters:**
```javascript
{
  id: number  // Alert ID
}
```

**Response:** `200 OK`
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
    entity_id: number,
    entity_name: string,
    entity_details: {
      // Details of related product/location/etc
      product_id: number | null,
      location_id: number | null,
      current_value: number,       // Current stock level
      threshold_value: number       // Min/max level
    },
    created_at: string,
    resolved_at: string | null,
    dismissed_at: string | null,
    actions: string[]              // Suggested actions: 'order', 'review', 'investigate'
  }
}
```

**Errors:**
- `404 Not Found` - Alert doesn't exist
- `500 Internal Server Error`

---

### POST /api/alerts

Creates a manual alert (typically from automated scheduler or user).

**Middleware:** Multer (not needed), Validator

**Request Body:**
```javascript
{
  alert_type: string,           // Required
  severity: string,             // Required: 'high', 'medium', 'low'
  title: string,                // Required, 3-200 chars
  description: string,          // Required, 3-1000 chars
  related_entity: string,       // 'product', 'location', 'depot', 'system'
  entity_id: number | null      // null for system-wide alerts
}
```

**Validation:**
```javascript
{
  alert_type: ['required', 'string', 'in:low_stock,overstock,expiry,manual,system'],
  severity: ['required', 'string', 'in:high,medium,low'],
  title: ['required', 'string', 'min:3', 'max:200'],
  description: ['required', 'string', 'min:3', 'max:1000'],
  related_entity: ['string', 'in:product,location,depot,system'],
  entity_id: ['nullable', 'integer', 'min:1']
}
```

**Response:** `201 Created`
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
    created_at: string
  }
}
```

**Errors:**
- `400 Bad Request` - Validation error
- `500 Internal Server Error`

---

### PUT /api/alerts/:id

Updates alert status (resolve or dismiss).

**URL Parameters:**
```javascript
{
  id: number
}
```

**Request Body:**
```javascript
{
  status: string,               // 'active', 'resolved', 'dismissed'
  notes: string | null,         // Optional resolution notes
  resolution_action: string | null  // 'ordered', 'reviewed', 'acknowledged'
}
```

**Validation:**
```javascript
{
  status: ['required', 'string', 'in:active,resolved,dismissed'],
  notes: ['nullable', 'string', 'max:500'],
  resolution_action: ['nullable', 'string', 'max:100']
}
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  message: string,
  data: {
    alert_id: number,
    status: string,
    resolved_at: string | null,
    dismissed_at: string | null,
    dismissed_by: number | null
  }
}
```

**Errors:**
- `404 Not Found` - Alert doesn't exist
- `400 Bad Request` - Invalid status
- `500 Internal Server Error`

---

### DELETE /api/alerts/:id

Deletes an alert (soft delete, marks as archived).

**URL Parameters:**
```javascript
{
  id: number
}
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  message: string,
  data: {
    alert_id: number,
    deleted: boolean,
    deleted_at: string
  }
}
```

**Errors:**
- `404 Not Found`
- `500 Internal Server Error`

---

### GET /api/alerts/stats/dashboard

Retrieves alert statistics for dashboard.

**Response:** `200 OK`
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
    most_recent: Alert[]  // Last 5 alerts
  }
}
```

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |

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
  related_entity: 'product' | 'location' | 'depot' | 'system' | null;
  entity_id: number | null;
  entity_name: string | null;
  created_at: Date;
  resolved_at: Date | null;
  dismissed_at: Date | null;
  dismissed_by: number | null;
}

interface AlertQuery {
  page: number;
  limit: number;
  status: string;
  type: string;
  priority: string;
}

interface AlertStats {
  total_active: number;
  total_resolved: number;
  total_dismissed: number;
  by_severity: Record<'high' | 'medium' | 'low', number>;
  by_type: Record<string, number>;
  most_recent: Alert[];
}
```

---

## Dependencies
- `alerts.controller.js` - Route handlers
- `general_validators.js` - Input validation
- `logger.js` - Logging middleware
- `errorHandler.js` - Error handling
