# Sources Service

## Purpose
Business logic for supplier/source management.

## File Location
`backend/src/services/sources.service.js`

## Methods

### getAllSources(filters, pagination)

**Input:**
```javascript
filters = {
  search: string,
  rating: number
}
pagination = {
  page: number,
  limit: number
}
```

**SQL:**
```sql
SELECT 
  s.*,
  COUNT(DISTINCT p.purchase_id) as total_purchases,
  SUM(p.amount) as total_spent,
  AVG(DATEDIFF(p.received_date, p.order_date)) as avg_delivery_days,
  MAX(p.order_date) as last_purchase_date
FROM sources s
LEFT JOIN purchases p ON s.source_id = p.source_id
WHERE (? = '' OR s.name LIKE ? OR s.contact_person LIKE ?)
  AND (? IS NULL OR s.rating >= ?)
  AND s.deleted_at IS NULL
GROUP BY s.source_id
ORDER BY s.created_at DESC
LIMIT ? OFFSET ?
```

**Output:**
```javascript
{
  sources: Source[],
  pagination: {page, limit, total, pages}
}
```

---

### getSourceById(id)

**SQL:**
```sql
SELECT * FROM sources WHERE source_id = ? AND deleted_at IS NULL
```

**Processing:**
```
1. Fetch source
2. Get purchase history (last 20)
3. Get performance metrics (on-time delivery %, quality rating)
4. Calculate: avg_delivery_days, total_orders, total_spent
5. Return with nested data
```

**Output:** SourceDetail with purchase history and metrics

---

### createSource(sourceData)

**SQL:**
```sql
INSERT INTO sources (
  name, contact_person, email, phone,
  address, city, state, postal_code,
  payment_terms, minimum_order_qty, lead_time_days,
  rating, status, created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
```

**Output:** Created Source

---

### updateSource(id, updateData)

**SQL:**
```sql
UPDATE sources SET
  name = COALESCE(?, name),
  email = COALESCE(?, email),
  phone = COALESCE(?, phone),
  rating = COALESCE(?, rating),
  lead_time_days = COALESCE(?, lead_time_days),
  updated_at = NOW()
WHERE source_id = ?
```

---

### getSourcePurchaseHistory(id, filters, pagination)

**SQL:**
```sql
SELECT p.* FROM purchases p
WHERE p.source_id = ?
  AND (? = '' OR p.status = ?)
  AND p.deleted_at IS NULL
ORDER BY p.order_date DESC
LIMIT ? OFFSET ?
```

**Output:** Purchase[]

---

### getSourcePerformance(id, days = 90)

**SQL:**
```sql
SELECT
  COUNT(*) as total_orders,
  SUM(CASE WHEN received_date <= DATE_ADD(order_date, INTERVAL lead_time_days DAY) THEN 1 ELSE 0 END) as on_time_orders,
  AVG(DATEDIFF(received_date, order_date)) as avg_delivery_days,
  SUM(amount) as total_spent
FROM purchases
WHERE source_id = ?
  AND order_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
```

**Output:**
```javascript
{
  total_orders: number,
  on_time_orders: number,
  on_time_percentage: number,
  avg_delivery_days: number,
  total_spent: Decimal
}
```

---

## Type Definitions

```typescript
interface Source {
  source_id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  payment_terms: string;
  minimum_order_qty: number;
  lead_time_days: number;
  rating: number;
  status: 'active' | 'inactive';
  created_at: Date;
}

interface Purchase {
  purchase_id: number;
  source_id: number;
  order_date: Date;
  received_date: Date | null;
  amount: number;
  status: 'pending' | 'received' | 'rejected';
}

interface Performance {
  total_orders: number;
  on_time_orders: number;
  on_time_percentage: number;
  avg_delivery_days: number;
  total_spent: number;
}
```

---

## Dependencies
- `sources.model.js`
- `database.js`
