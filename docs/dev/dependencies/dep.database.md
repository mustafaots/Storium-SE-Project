# Database Dependencies - Storium IMS

## Overview
This document outlines the database architecture, dependencies, and configuration for the Storium Inventory Management System (IMS). The system uses MySQL as the primary relational database.

## Database Summary
- **Database System:** MySQL 5.7+
- **Database Name:** storium_ims
- **Character Set:** utf8mb4 (UTF-8 Unicode)
- **Collation:** utf8mb4_unicode_ci
- **Connection Driver:** mysql2/promise (Node.js)
- **Architecture Pattern:** Hierarchical physical structure with transactional tracking

---

## Database Configuration

### Connection Parameters
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=storium_ims
DB_PORT=3306
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0
DB_WAIT_FOR_CONNECTIONS=true
```

### Connection Pool Configuration (Node.js)
```javascript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: false,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

export default pool;
```

---

## Core Tables Structure

### 1. Physical Infrastructure Hierarchy

#### Locations Table
```sql
CREATE TABLE locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    coordinates VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose:** Represents physical sites or campuses of the organization  
**Key Fields:**
- `location_id` - Unique identifier
- `name` - Site name
- `address` - Physical address
- `coordinates` - GPS coordinates for mapping

---

#### Depots Table
```sql
CREATE TABLE depots (
    depot_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_location INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_location) REFERENCES locations(location_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);
```
**Purpose:** Storage buildings or warehouses belonging to a location  
**Key Fields:**
- `depot_id` - Unique identifier
- `parent_location` - Reference to parent location
- `name` - Depot name/code

---

#### Aisles Table
```sql
CREATE TABLE aisles (
    aisle_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_depot INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_depot) REFERENCES depots(depot_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);
```
**Purpose:** Aisles or zones inside a warehouse  
**Key Fields:**
- `aisle_id` - Unique identifier
- `parent_depot` - Reference to parent depot
- `name` - Aisle designation (e.g., "A1", "B2")

---

#### Racks Table
```sql
CREATE TABLE racks (
    rack_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_aisle INT NOT NULL,
    rack_code VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_aisle) REFERENCES aisles(aisle_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);
```
**Purpose:** Rack structures containing multiple bays, levels, and bins  
**Key Fields:**
- `rack_id` - Unique identifier
- `parent_aisle` - Reference to parent aisle
- `rack_code` - Rack identifier code

---

#### Rack Slots Table
```sql
CREATE TABLE rack_slots (
    slot_id INT AUTO_INCREMENT PRIMARY KEY,
    rack_id INT NOT NULL,
    direction ENUM('right', 'left') NOT NULL,
    bay_no INT NOT NULL,
    level_no INT NOT NULL,
    bin_no INT NOT NULL,
    capacity INT,
    is_occupied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rack_id) REFERENCES racks(rack_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unique_slot (rack_id, direction, bay_no, level_no, bin_no)
);
```
**Purpose:** Individual physical slots identified by (bay, level, bin) coordinates  
**Key Fields:**
- `slot_id` - Unique identifier
- `rack_id` - Reference to parent rack
- `direction` - Left or right side of rack
- `bay_no` - Bay number (horizontal position)
- `level_no` - Level number (vertical position)
- `bin_no` - Bin number (depth)
- `capacity` - Maximum items this slot can hold
- `is_occupied` - Current occupancy status

---

### 2. Product & Stock Management

#### Products Table
```sql
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_price DECIMAL(10, 2),
    reorder_level INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose:** Catalog of all products managed in the system  
**Key Fields:**
- `sku` - Stock Keeping Unit (unique identifier)
- `name` - Product name
- `category` - Product category for filtering
- `unit_price` - Cost per unit
- `reorder_level` - Minimum stock level before alert

---

#### Stocks Table
```sql
CREATE TABLE stocks (
    stock_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    slot_id INT,
    quantity INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES rack_slots(slot_id) 
        ON DELETE SET NULL ON UPDATE CASCADE
);
```
**Purpose:** Tracks product quantities in specific slots  
**Key Fields:**
- `product_id` - Reference to product
- `slot_id` - Reference to rack slot location
- `quantity` - Current stock quantity

---

### 3. Transaction Tracking

#### Transactions Table
```sql
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('in', 'out', 'transfer', 'adjustment') NOT NULL,
    product_id INT NOT NULL,
    source_slot_id INT,
    destination_slot_id INT,
    quantity INT NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (source_slot_id) REFERENCES rack_slots(slot_id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (destination_slot_id) REFERENCES rack_slots(slot_id) 
        ON DELETE SET NULL ON UPDATE CASCADE
);
```
**Purpose:** Audit trail of all inventory movements  
**Key Fields:**
- `type` - Transaction type (receipt, removal, movement, correction)
- `product_id` - Product involved
- `source_slot_id` - Origin slot (if applicable)
- `destination_slot_id` - Target slot (if applicable)
- `quantity` - Amount transferred
- `reference_number` - External reference (PO, SO, etc.)
- `created_by` - User who performed transaction

---

### 4. Client Management

#### Clients Table
```sql
CREATE TABLE clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose:** External clients/customers  
**Key Fields:**
- `name` - Client name
- `email` - Contact email
- `phone` - Contact phone
- `status` - Active or inactive status

---

### 5. Alert & Notification System

#### Alerts Table
```sql
CREATE TABLE alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('low_stock', 'expiry', 'capacity', 'anomaly') NOT NULL,
    product_id INT,
    slot_id INT,
    severity ENUM('info', 'warning', 'critical') DEFAULT 'warning',
    message TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES rack_slots(slot_id) 
        ON DELETE SET NULL ON UPDATE CASCADE
);
```
**Purpose:** System alerts for stock issues and anomalies  
**Key Fields:**
- `type` - Alert category
- `severity` - Alert priority level
- `message` - Alert description
- `is_resolved` - Resolution status

---

### 6. Source Tracking

#### Sources Table
```sql
CREATE TABLE sources (
    source_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('supplier', 'warehouse', 'vendor') NOT NULL,
    contact_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose:** Track sources of incoming inventory  
**Key Fields:**
- `name` - Source name
- `type` - Source category
- `contact_info` - Contact details

---

### 7. Routine Operations

#### Routines Table
```sql
CREATE TABLE routines (
    routine_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    schedule VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_executed TIMESTAMP NULL,
    next_execution TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose:** Scheduled operational tasks  
**Key Fields:**
- `name` - Routine name
- `schedule` - Cron expression or schedule pattern
- `is_active` - Enable/disable flag
- `last_executed` - Last execution timestamp

---

## Database Relationships (Entity Relationship)

```
Locations
    ├─── Depots (1:M)
    │       ├─── Aisles (1:M)
    │       │       └─── Racks (1:M)
    │       │               └─── Rack_Slots (1:M)
    │       │                       └─── Stocks (1:M)
    │       │
    │
Products (1:M)─────── Stocks
    │                    │
    ├─────────────────── Transactions
    │
    └─────────────────── Alerts

Sources ────────────────┐
                         │
Transactions ────────────┤── Transaction audit trail
                         │
Clients ────────────────┘

Routines (Scheduled tasks)
```

---

## Database Operations

### Common Queries

#### Get Full Hierarchy Path
```sql
SELECT 
    l.name as location,
    d.name as depot,
    a.name as aisle,
    r.rack_code as rack,
    CONCAT(rs.direction, '-', rs.bay_no, '-', rs.level_no, '-', rs.bin_no) as slot_position
FROM locations l
JOIN depots d ON l.location_id = d.parent_location
JOIN aisles a ON d.depot_id = a.parent_depot
JOIN racks r ON a.aisle_id = r.parent_aisle
JOIN rack_slots rs ON r.rack_id = rs.rack_id
WHERE rs.slot_id = ?;
```

#### Find Low Stock Products
```sql
SELECT p.*, SUM(s.quantity) as total_stock
FROM products p
LEFT JOIN stocks s ON p.product_id = s.product_id
GROUP BY p.product_id
HAVING total_stock < p.reorder_level
ORDER BY (total_stock / p.reorder_level) ASC;
```

#### Get Transaction History
```sql
SELECT 
    t.transaction_id,
    t.type,
    p.sku,
    p.name,
    t.quantity,
    t.created_by,
    t.created_at,
    t.reference_number
FROM transactions t
JOIN products p ON t.product_id = p.product_id
WHERE t.created_at BETWEEN ? AND ?
ORDER BY t.created_at DESC;
```

#### Rack Occupancy Report
```sql
SELECT 
    r.rack_code,
    COUNT(rs.slot_id) as total_slots,
    SUM(CASE WHEN rs.is_occupied = TRUE THEN 1 ELSE 0 END) as occupied_slots,
    ROUND(100 * SUM(CASE WHEN rs.is_occupied = TRUE THEN 1 ELSE 0 END) / COUNT(rs.slot_id), 2) as occupancy_percentage
FROM racks r
LEFT JOIN rack_slots rs ON r.rack_id = rs.rack_id
GROUP BY r.rack_id
ORDER BY occupancy_percentage DESC;
```

---

## Backup & Recovery

### Backup Procedures
```bash
# Full database backup
mysqldump -u root -p storium_ims > backup.sql

# Scheduled backup with timestamp
mysqldump -u root -p storium_ims > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup specific table
mysqldump -u root -p storium_ims transactions > transactions_backup.sql
```

### Restore Procedures
```bash
# Full database restore
mysql -u root -p storium_ims < backup.sql

# Restore specific table
mysql -u root -p storium_ims < transactions_backup.sql
```

### Backup Strategy
- **Frequency:** Daily automated backups
- **Retention:** Keep 30 days of backups
- **Storage:** Off-site or cloud backup
- **Testing:** Regular restore testing to verify backup integrity

---

## Indexing Strategy

### Recommended Indexes
```sql
-- Foreign key indexes (auto-created)
CREATE INDEX idx_depots_location ON depots(parent_location);
CREATE INDEX idx_aisles_depot ON aisles(parent_depot);
CREATE INDEX idx_racks_aisle ON racks(parent_aisle);
CREATE INDEX idx_slots_rack ON rack_slots(rack_id);
CREATE INDEX idx_stocks_product ON stocks(product_id);
CREATE INDEX idx_stocks_slot ON stocks(slot_id);

-- Performance indexes
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_alerts_resolved ON alerts(is_resolved);
CREATE INDEX idx_alerts_type ON alerts(type);

-- Search indexes
CREATE INDEX idx_locations_name ON locations(name);
CREATE INDEX idx_depots_name ON depots(name);
CREATE INDEX idx_aisles_name ON aisles(name);
CREATE INDEX idx_clients_email ON clients(email);
```

---

## Data Integrity & Constraints

### Foreign Key Constraints
- **Cascading Deletes:** Deletions cascade through hierarchy
- **Cascading Updates:** Updates cascade through all references
- **Referential Integrity:** All foreign keys enforced

### Unique Constraints
```sql
-- SKU must be unique per product
ALTER TABLE products ADD CONSTRAINT uk_sku UNIQUE (sku);

-- Slot coordinates must be unique per rack
ALTER TABLE rack_slots ADD CONSTRAINT uk_slot_coords 
UNIQUE (rack_id, direction, bay_no, level_no, bin_no);
```

### Check Constraints
```sql
-- Quantity cannot be negative
ALTER TABLE stocks ADD CONSTRAINT ck_stock_quantity CHECK (quantity >= 0);

-- Capacity must be positive
ALTER TABLE rack_slots ADD CONSTRAINT ck_slot_capacity CHECK (capacity > 0);
```

---

## Performance Optimization

### Query Optimization Tips
1. **Use JOINs wisely** - Prefer INNER/LEFT JOINs over subqueries
2. **Index frequently queried columns** - Product SKU, transaction dates
3. **Pagination** - Use LIMIT/OFFSET for large result sets
4. **Connection pooling** - Reuse connections via mysql2 pool
5. **Avoid N+1 queries** - Use joins instead of multiple queries

### Connection Pool Best Practices
```javascript
// Good: Reuse pooled connection
const [rows] = await pool.execute('SELECT * FROM products WHERE product_id = ?', [id]);

// Avoid: Creating new connections repeatedly
// Don't do this in loops or high-frequency operations
```

---

## Monitoring & Maintenance

### Regular Maintenance Tasks
```sql
-- Check table size
SELECT TABLE_NAME, ROUND(((data_length + index_length) / 1024 / 1024), 2) as 'Size (MB)'
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'storium_ims';

-- Optimize tables (reduces fragmentation)
OPTIMIZE TABLE products, stocks, transactions;

-- Check for duplicate indexes
SELECT * FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'storium_ims'
GROUP BY TABLE_NAME, SEQ_IN_INDEX, COLUMN_NAME
HAVING COUNT(*) > 1;
```

### Key Metrics to Monitor
- Query response times
- Connection pool utilization
- Disk space usage
- Transaction volume and patterns
- Alert generation rates

---

## Security Best Practices

1. **User Privileges:**
   ```sql
   -- Application user (limited privileges)
   CREATE USER 'storium_app'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT SELECT, INSERT, UPDATE, DELETE ON storium_ims.* TO 'storium_app'@'localhost';
   
   -- Admin user (full privileges)
   CREATE USER 'storium_admin'@'localhost' IDENTIFIED BY 'admin_password';
   GRANT ALL PRIVILEGES ON storium_ims.* TO 'storium_admin'@'localhost';
   ```

2. **Network Security:**
   - Restrict DB access to application servers only
   - Use SSL/TLS for remote connections
   - Change default MySQL port (3306)

3. **Data Protection:**
   - Encrypt sensitive data (passwords, payment info)
   - Use parameterized queries to prevent SQL injection
   - Regular security audits

---

## Tools & Utilities

### MySQL Client Tools
- **MySQL Workbench** - GUI database administration and design
- **phpMyAdmin** - Web-based MySQL management
- **MySQL Command Line** - Direct database access
- **Sequel Pro** (Mac) - Professional MySQL GUI

### Backup Tools
- **MySQL Utilities** - Built-in backup tools
- **Percona XtraBackup** - Advanced backup solution
- **Cloud backup services** - AWS RDS, Azure Database

---

## Migration & Version Management

### Version Control for Schema
```sql
-- Create migrations table
CREATE TABLE schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(100) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Track applied migrations
INSERT INTO schema_migrations (version) VALUES ('001_initial_schema');
INSERT INTO schema_migrations (version) VALUES ('002_add_alerts_table');
```