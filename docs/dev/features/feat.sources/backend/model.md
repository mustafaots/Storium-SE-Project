# Sources Model

## Purpose
Database operations for sources/suppliers table.

## File Location
`backend/src/models/sources.model.js`

## Database Schema

```sql
CREATE TABLE sources (
  source_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  contact_person VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  payment_terms VARCHAR(100),
  minimum_order_qty DECIMAL(12, 2) NOT NULL,
  lead_time_days INT NOT NULL,
  rating DECIMAL(3, 2) DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  
  KEY idx_name (name),
  KEY idx_email (email),
  KEY idx_status (status),
  KEY idx_rating (rating),
  KEY idx_created_at (created_at)
);

CREATE TABLE purchases (
  purchase_id INT PRIMARY KEY AUTO_INCREMENT,
  source_id INT NOT NULL,
  order_date DATETIME NOT NULL,
  received_date DATETIME NULL,
  amount DECIMAL(15, 2) NOT NULL,
  status ENUM('pending', 'received', 'rejected') DEFAULT 'pending',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  
  FOREIGN KEY (source_id) REFERENCES sources(source_id),
  KEY idx_source_id (source_id),
  KEY idx_status (status),
  KEY idx_order_date (order_date)
);
```

---

## Query Methods

### findAll(search, rating, page, limit)

**SQL:** (See service.md)

**Return:** Source[]

---

### findById(id)

**SQL:**
```sql
SELECT * FROM sources WHERE source_id = ? AND deleted_at IS NULL
```

**Return:** Source | null

---

### create(sourceData)

**SQL:** (See service.md)

**Return:** Source with generated ID

---

### update(id, updateData)

**SQL:** (See service.md)

**Return:** {affectedRows: number}

---

### delete(id)

**SQL:**
```sql
UPDATE sources SET deleted_at = NOW() WHERE source_id = ?
```

**Return:** {affectedRows: number}

---

### getPurchaseHistory(sourceId, status, page, limit)

**SQL:**
```sql
SELECT * FROM purchases 
WHERE source_id = ? 
  AND (? IS NULL OR status = ?)
  AND deleted_at IS NULL
ORDER BY order_date DESC
LIMIT ? OFFSET ?
```

**Return:** Purchase[]

---

### getPerformanceMetrics(sourceId, days)

**SQL:**
```sql
SELECT
  COUNT(*) as total_orders,
  SUM(CASE WHEN received_date <= DATE_ADD(order_date, INTERVAL lead_time_days DAY) THEN 1 ELSE 0 END) as on_time_orders
FROM purchases
WHERE source_id = ?
  AND order_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
```

**Return:** Performance metrics object

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
  updated_at: Date | null;
  deleted_at: Date | null;
}

interface Purchase {
  purchase_id: number;
  source_id: number;
  order_date: Date;
  received_date: Date | null;
  amount: number;
  status: 'pending' | 'received' | 'rejected';
  notes: string | null;
  created_at: Date;
}

interface SourceCreateInput {
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
}
```

---

## Dependencies
- `database.js` - Connection pool
- `mysql2/promise`
