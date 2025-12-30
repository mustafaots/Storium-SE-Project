# Sources Frontend - Handlers

## Purpose
Business logic and validation for supplier operations.

## File Location
`frontend/src/handlers/sourcesHandler.js`

## Handler Methods

### validateSourceForm(formData)

Validates supplier form input.

**Validation Rules:**
```javascript
rules = {
  name: ['required', 'string', 'min:2', 'max:100', 'unique:sources'],
  contact_person: ['required', 'string', 'min:2', 'max:100'],
  email: ['required', 'email', 'unique:sources'],
  phone: ['required', 'string', 'regex:/^[+]?[0-9]{10,}/'],
  address: ['required', 'string', 'min:5', 'max:255'],
  city: ['required', 'string', 'min:2', 'max:50'],
  state: ['required', 'string', 'min:2', 'max:50'],
  postal_code: ['required', 'string', 'regex:/^[0-9]{5,}/'],
  payment_terms: ['required', 'string', 'min:3', 'max:100'],
  minimum_order_qty: ['required', 'numeric', 'min:0'],
  lead_time_days: ['required', 'integer', 'min:0', 'max:365']
}
```

**Returns:**
```javascript
{
  isValid: boolean,
  errors: {[field]: string[]}
}
```

---

### fetchSources(filters, pagination)

Fetch sources from API with error handling.

**Input:**
```javascript
filters = {
  search: string,
  minRating: number
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
Call sourcesAPI.getSources(filters, pagination)
  ↓
Handle response data
  ↓
Update store
  ↓
Handle errors
```

**Returns:** 
```javascript
{
  sources: Source[],
  pagination: {...}
}
```

---

### fetchSourceDetail(id)

Fetch single supplier with purchase history.

**Processing:**
```
Validate ID (number, > 0)
  ↓
Call sourcesAPI.getSourceDetail(id)
  ↓
Transform response
  ↓
Return with nested purchases
```

**Returns:** SourceDetail

---

### fetchSourcePerformance(id, days = 90)

Fetch performance metrics for supplier.

**Processing:**
```
Validate ID and days (1-365)
  ↓
Call sourcesAPI.getSourcePerformance(id, days)
  ↓
Calculate percentages
  ↓
Return metrics
```

**Returns:** PerformanceMetrics

---

### saveSource(sourceData, isEdit)

Save new or update existing supplier.

**Input:**
```javascript
sourceData = {
  source_id?: number,
  name: string,
  contact_person: string,
  ...
}
isEdit = boolean
```

**Processing:**
```
Validate form data
  ↓
Transform data before sending
  ↓
Call API (POST or PUT)
  ↓
Handle response
  ↓
Return created/updated source
```

**Returns:** Source

---

### deleteSourceHandler(id)

Delete supplier with confirmation.

**Processing:**
```
Confirm deletion
  ↓
Check active purchases
  ↓
Call API DELETE /sources/:id
  ↓
Handle success
  ↓
Return success status
```

---

### fetchSourcePurchaseHistory(sourceId, page)

Fetch supplier purchase history.

**Input:**
```javascript
{
  sourceId: number,
  page: number
}
```

**Returns:** Purchase[]

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
  created_at: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

interface PerformanceMetrics {
  total_orders: number;
  on_time_orders: number;
  on_time_percentage: number;
  avg_delivery_days: number;
  total_spent: number;
}
```

---

## Dependencies
- `../api/sourcesAPI.js`
- `../utils/validators.js`
