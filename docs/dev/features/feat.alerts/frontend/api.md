# Alerts API

## Purpose
HTTP communication layer for alerts endpoints.

## File Location
`frontend/src/utils/alertsAPI.js`

## API Methods

### getAll(params)

Fetches alerts with filters and pagination.

**Input:**
```javascript
params = {
  page: number,
  limit: number,
  status: string,
  severity: string,
  type: string
}
```

**HTTP Request:**
```
GET /api/alerts?page=1&limit=10&status=active&severity=&type=
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
```

**Implementation:**
```javascript
export const alertsAPI = {
  getAll: async (params) => {
    const response = await api.get('/alerts', { params })
    return response.data
  }
}
```

---

### getById(id)

Fetches single alert details.

**HTTP Request:**
```
GET /api/alerts/5
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: Alert
}
```

---

### getStats()

Fetches alert statistics.

**HTTP Request:**
```
GET /api/alerts/stats/dashboard
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: {
    total_active: number,
    total_resolved: number,
    total_dismissed: number,
    by_severity: {high: number, medium: number, low: number},
    by_type: {low_stock: number, overstock: number, ...}
  }
}
```

---

### create(alertData)

Creates a new alert.

**HTTP Request:**
```
POST /api/alerts
Content-Type: application/json

{
  "alert_type": "manual",
  "severity": "high",
  "title": "Stock Alert",
  "description": "Manual alert triggered",
  "related_entity": "product",
  "entity_id": 5
}
```

**Response:** `201 Created`
```javascript
{
  success: boolean,
  data: Alert
}
```

---

### update(id, updateData)

Updates alert status.

**HTTP Request:**
```
PUT /api/alerts/5
Content-Type: application/json

{
  "status": "resolved",
  "notes": "Order placed",
  "resolution_action": "ordered"
}
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: {
    alert_id: number,
    status: string,
    resolved_at: string | null
  }
}
```

---

### delete(id)

Deletes an alert.

**HTTP Request:**
```
DELETE /api/alerts/5
```

**Response:** `200 OK`
```javascript
{
  success: boolean,
  data: {
    alert_id: number,
    deleted: boolean
  }
}
```

---

## Type Definitions

```typescript
interface Alert {
  alert_id: number;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  related_entity: string | null;
  entity_id: number | null;
  entity_name: string | null;
  created_at: string;
  resolved_at: string | null;
  dismissed_at: string | null;
}

interface AlertParams {
  page: number;
  limit: number;
  status: string;
  severity: string;
  type: string;
}

interface AlertStats {
  total_active: number;
  total_resolved: number;
  total_dismissed: number;
  by_severity: Record<string, number>;
  by_type: Record<string, number>;
}
```

---

## Dependencies
- `axios` - HTTP client
- `config/api.js` - Base API configuration
