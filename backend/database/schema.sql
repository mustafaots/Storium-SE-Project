-- =====================
-- PHYSICAL STRUCTURE
-- =====================

CREATE TABLE locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    coordinates VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT COMMENT 'Represents a physical site or campus of the organization'
);

CREATE TABLE depots (
    depot_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_location INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT COMMENT 'Storage building or warehouse belonging to a location',
    FOREIGN KEY (parent_location) REFERENCES locations(location_id) ON DELETE CASCADE
);

CREATE TABLE aisles (
    aisle_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_depot INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT COMMENT 'Aisle or zone inside a warehouse',
    FOREIGN KEY (parent_depot) REFERENCES depots(depot_id) ON DELETE CASCADE
);

CREATE TABLE racks (
    rack_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_aisle INT NOT NULL,
    rack_code VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT COMMENT 'Rack structure containing multiple bays, levels, and bins',
    FOREIGN KEY (parent_aisle) REFERENCES aisles(aisle_id) ON DELETE CASCADE
);

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
    note TEXT COMMENT 'Each physical slot identified by (bay, level, bin) coordinates',
    FOREIGN KEY (rack_id) REFERENCES racks(rack_id) ON DELETE CASCADE,
    UNIQUE KEY unique_slot_position (rack_id, bay_no, level_no, bin_no)
);


-- =====================
-- PRODUCT HIERARCHY
-- =====================

CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    unit VARCHAR(50) NOT NULL COMMENT 'pcs, kg, liters, boxes, etc.',
    min_stock_level INT COMMENT 'Alert threshold for low stock',
    max_stock_level INT COMMENT 'Alert threshold for overstocking',
    reorder_point INT COMMENT 'Trigger for automatic reorder',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT COMMENT 'Defines a product at the conceptual level (not tied to location)'
);

CREATE TABLE product_identifiers (
    ident_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    serial_number VARCHAR(100) UNIQUE,
    note TEXT COMMENT 'Unique reference codes identifying each product or unit',
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE TABLE stocks (
    stock_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    slot_id INT NOT NULL,
    quantity INT NOT NULL,
    batch_no VARCHAR(100),
    expiry_date DATE,
    strategy ENUM('FIFO', 'LIFO', 'JIT') DEFAULT 'FIFO',
    product_type ENUM('raw', 'wip', 'to_ship', 'deadstock', 'discrepancy') NOT NULL,
    is_consumable BOOLEAN DEFAULT FALSE,
    sale_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    note TEXT COMMENT 'Physical stock of a given product stored in a particular slot',
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES rack_slots(slot_id) ON DELETE CASCADE
);


-- =====================
-- SOURCES & CLIENTS
-- =====================

CREATE TABLE sources (
    source_id INT AUTO_INCREMENT PRIMARY KEY,
    source_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    coordinates VARCHAR(100),
    rating FLOAT COMMENT 'Supplier rating or reliability score',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT COMMENT 'Suppliers, factories, or input sources of materials'
);

CREATE TABLE product_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    source_id INT NOT NULL,
    cost_price DECIMAL(10,2),
    lead_time_days INT,
    is_preferred_supplier BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT COMMENT 'Junction table: many products can have many sources',
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (source_id) REFERENCES sources(source_id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_source (product_id, source_id)
);

CREATE TABLE clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT COMMENT 'Buyers, departments, or external customers for stock outflows'
);


-- =====================
-- STOCK MOVEMENTS
-- =====================

CREATE TABLE transactions (
    txn_id INT AUTO_INCREMENT PRIMARY KEY,
    is_automated BOOLEAN DEFAULT FALSE,
    stock_id INT NOT NULL,
    txn_type ENUM('inflow', 'outflow', 'transfer', 'consumption', 'adjustment') NOT NULL,
    quantity INT NOT NULL,
    total_value DECIMAL(12,2),
    reference_number VARCHAR(100) COMMENT 'PO number, invoice ID, delivery note',
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_id INT COMMENT 'Supplier or origin source, if applicable',
    from_slot INT COMMENT 'Slot moved from, for transfers',
    to_slot INT COMMENT 'Slot moved to, for transfers',
    client_id INT COMMENT 'Client or consumer for outflows',
    note TEXT COMMENT 'Tracks all stock inflows, outflows, transfers, and consumptions',
    FOREIGN KEY (stock_id) REFERENCES stocks(stock_id) ON DELETE CASCADE,
    FOREIGN KEY (source_id) REFERENCES sources(source_id) ON DELETE SET NULL,
    FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE SET NULL,
    FOREIGN KEY (from_slot) REFERENCES rack_slots(slot_id) ON DELETE SET NULL,
    FOREIGN KEY (to_slot) REFERENCES rack_slots(slot_id) ON DELETE SET NULL
);


-- =====================
-- AUTOMATION & HISTORY
-- =====================

-- Create routines first (without dependencies)
CREATE TABLE routines (
    routine_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    promise TEXT COMMENT 'Condition or schedule description',
    resolve TEXT COMMENT 'Action to take when triggered',
    frequency ENUM('daily', 'weekly', 'monthly', 'on_event'),
    is_active BOOLEAN DEFAULT TRUE,
    last_run TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Then create action_history with the foreign key
CREATE TABLE action_history (
    action_id INT AUTO_INCREMENT PRIMARY KEY,
    action TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_automated BOOLEAN DEFAULT FALSE,
    actor_name VARCHAR(255) NOT NULL COMMENT 'Name of user or "System"',
    routine_id INT COMMENT 'If automated, which routine triggered it',
    note TEXT COMMENT 'User- or system-triggered operations for audit trail',
    FOREIGN KEY (routine_id) REFERENCES routines(routine_id) ON DELETE SET NULL
);


-- =====================
-- ALERTS & RECORDS
-- =====================

CREATE TABLE alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    alert_type ENUM('low_stock', 'overstock', 'expiry', 'reorder') NOT NULL,
    severity ENUM('info', 'warning', 'critical') DEFAULT 'warning',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    content TEXT,
    linked_stock INT,
    linked_product INT,
    note TEXT COMMENT 'Overstocking, understocking, expiry, or supply warnings',
    FOREIGN KEY (linked_stock) REFERENCES stocks(stock_id) ON DELETE SET NULL,
    FOREIGN KEY (linked_product) REFERENCES products(product_id) ON DELETE SET NULL
);

CREATE TABLE inventory_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    record_type VARCHAR(100) NOT NULL COMMENT 'snapshot, report, audit, etc.',
    record_data JSON NOT NULL COMMENT 'Use JSON instead of BLOB for queryability',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT COMMENT 'Archived inventory snapshots or serialized reports'
);


-- =====================
-- SETTINGS
-- =====================

CREATE TABLE settings (
    setting_key VARCHAR(255) PRIMARY KEY,
    setting_value TEXT,
    description VARCHAR(500),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    note TEXT COMMENT 'System configuration like inventory_scope (small/industrial)'
);


-- =====================
-- INDEXES FOR PERFORMANCE
-- =====================

-- Physical structure indexes
CREATE INDEX idx_depots_location ON depots(parent_location);
CREATE INDEX idx_aisles_depot ON aisles(parent_depot);
CREATE INDEX idx_racks_aisle ON racks(parent_aisle);
CREATE INDEX idx_slots_rack ON rack_slots(rack_id);
CREATE INDEX idx_slots_position ON rack_slots(bay_no, level_no, bin_no);

-- Product indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_product_identifiers_sku ON product_identifiers(sku);
CREATE INDEX idx_product_identifiers_barcode ON product_identifiers(barcode);

-- Stock indexes
CREATE INDEX idx_stocks_product ON stocks(product_id);
CREATE INDEX idx_stocks_slot ON stocks(slot_id);
CREATE INDEX idx_stocks_expiry ON stocks(expiry_date);
CREATE INDEX idx_stocks_type ON stocks(product_type);

-- Transaction indexes
CREATE INDEX idx_transactions_stock ON transactions(stock_id);
CREATE INDEX idx_transactions_type ON transactions(txn_type);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_transactions_reference ON transactions(reference_number);

-- Alert indexes
CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_sent_at ON alerts(sent_at);
CREATE INDEX idx_alerts_read ON alerts(is_read);

-- Routine indexes
CREATE INDEX idx_routines_active ON routines(is_active);
CREATE INDEX idx_routines_frequency ON routines(frequency);

-- Action history indexes
CREATE INDEX idx_action_history_created ON action_history(created_at);
CREATE INDEX idx_action_history_automated ON action_history(is_automated);