-- =====================
-- PHYSICAL STRUCTURE
-- =====================

-- Represents a physical site or campus of the organization
CREATE TABLE locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    address TEXT,
    coordinates VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Storage building or warehouse belonging to a location
CREATE TABLE depots (
    depot_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_location INT,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_location) REFERENCES locations(location_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Aisle or zone inside a warehouse
CREATE TABLE aisles (
    aisle_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_depot INT,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_depot) REFERENCES depots(depot_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Rack structure containing multiple bays, levels, and bins
CREATE TABLE racks (
    rack_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_aisle INT,
    rack_code VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_aisle) REFERENCES aisles(aisle_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Each physical slot identified by (bay, level, bin) coordinates
CREATE TABLE rack_slots (
    slot_id INT AUTO_INCREMENT PRIMARY KEY,
    rack_id INT,
    direction ENUM('right', 'left'),
    bay_no INT NOT NULL,
    level_no INT NOT NULL,
    bin_no INT NOT NULL,
    capacity INT,
    is_occupied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rack_id) REFERENCES racks(rack_id) ON DELETE CASCADE ON UPDATE CASCADE
);


-- =====================
-- PRODUCT HIERARCHY
-- =====================

-- Defines a product at the conceptual level (not tied to location)
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    image_url VARCHAR(500) COMMENT 'URL or path to product image',
    unit VARCHAR(50) COMMENT 'pcs, kg, liters, boxes, etc.',
    min_stock_level INT COMMENT 'Alert threshold for low stock',
    max_stock_level INT COMMENT 'Alert threshold for overstocking',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Physical stock of a given product stored in a particular slot
CREATE TABLE stocks (
    stock_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    slot_id INT,
    slot_coordinates VARCHAR(50),
    quantity INT NOT NULL,
    batch_no VARCHAR(100),
    expiry_date DATE,
    strategy ENUM('FIFO', 'LIFO', 'JIT') DEFAULT 'FIFO',
    product_type ENUM('raw', 'wip', 'to_ship', 'deadstock', 'discrepancy') NOT NULL,
    is_consumable BOOLEAN DEFAULT FALSE,
    sale_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES rack_slots(slot_id) ON DELETE CASCADE ON UPDATE CASCADE
);


-- =====================
-- SOURCES & CLIENTS
-- =====================

-- Suppliers, factories, or input sources of materials
CREATE TABLE sources (
    source_id INT AUTO_INCREMENT PRIMARY KEY,
    source_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    coordinates VARCHAR(255),
    rate FLOAT,
    rate_unit VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table: many products can have many sources
CREATE TABLE product_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    source_id INT,
    cost_price DECIMAL(10,2),
    lead_time_days INT,
    is_preferred_supplier BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (source_id) REFERENCES sources(source_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Buyers, departments, or external customers for stock outflows
CREATE TABLE clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================
-- AUTOMATION & HISTORY (CREATED BEFORE TRANSACTIONS)
-- =====================

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

-- User- or system-triggered operations for audit trail
CREATE TABLE action_history (
    action_id INT AUTO_INCREMENT PRIMARY KEY,
    action TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_automated BOOLEAN DEFAULT FALSE,
    actor_name VARCHAR(255) COMMENT 'Name of user or "System"',
    routine_id INT COMMENT 'If automated, which routine triggered it',
    FOREIGN KEY (routine_id) REFERENCES routines(routine_id) ON DELETE SET NULL ON UPDATE CASCADE
);


-- =====================
-- STOCK MOVEMENTS (CREATED AFTER ROUTINES)
-- =====================

-- Tracks all stock inflows, outflows, transfers, and consumptions
CREATE TABLE transactions (
    txn_id INT AUTO_INCREMENT PRIMARY KEY,
    is_automated BOOLEAN DEFAULT FALSE,
    routine_id INT,
    stock_id INT,
    product_id INT NOT NULL COMMENT 'Denormalized for historical integrity',
    from_slot_id INT COMMENT 'Denormalized slot reference for historical integrity',
    to_slot_id INT COMMENT 'Denormalized slot reference for historical integrity',
    txn_type ENUM('inflow', 'outflow', 'transfer', 'consumption', 'adjustment') NOT NULL,
    quantity INT NOT NULL,
    total_value DECIMAL(12,2),
    reference_number VARCHAR(255) COMMENT 'PO number, invoice ID, delivery note',
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_id INT COMMENT 'Supplier or origin source, if applicable',
    client_id INT COMMENT 'Client or consumer for outflows',
    stock_snapshot JSON COMMENT 'JSON snapshot of stock details at time of transaction',
    FOREIGN KEY (stock_id) REFERENCES stocks(stock_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (source_id) REFERENCES sources(source_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (routine_id) REFERENCES routines(routine_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (from_slot_id) REFERENCES rack_slots(slot_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (to_slot_id) REFERENCES rack_slots(slot_id) ON DELETE SET NULL ON UPDATE CASCADE
);


-- =====================
-- ALERTS
-- =====================

-- Overstocking, understocking, expiry, or supply warnings
CREATE TABLE alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    alert_type ENUM('low_stock', 'overstock', 'expiry', 'reorder') NOT NULL,
    severity ENUM('info', 'warning', 'critical') DEFAULT 'warning',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    content TEXT,
    linked_stock INT,
    linked_product INT,
    FOREIGN KEY (linked_stock) REFERENCES stocks(stock_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (linked_product) REFERENCES products(product_id) ON DELETE SET NULL ON UPDATE CASCADE
);


-- =====================
-- INDEXES for Performance
-- =====================

-- Stocks table indexes
CREATE INDEX idx_stocks_product_id ON stocks(product_id);
CREATE INDEX idx_stocks_slot_id ON stocks(slot_id);
CREATE INDEX idx_stocks_expiry_date ON stocks(expiry_date);

-- Transactions table indexes
CREATE INDEX idx_transactions_stock_id ON transactions(stock_id);
CREATE INDEX idx_transactions_product_id ON transactions(product_id);
CREATE INDEX idx_transactions_txn_type ON transactions(txn_type);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_transactions_reference_number ON transactions(reference_number);

-- Rack_slots table indexes
CREATE INDEX idx_rack_slots_rack_id ON rack_slots(rack_id);
CREATE INDEX idx_rack_slots_coordinates ON rack_slots(bay_no, level_no, bin_no);

-- Products table indexes
CREATE INDEX idx_products_category ON products(category);

-- Routines table indexes
CREATE INDEX idx_routines_is_active ON routines(is_active);
CREATE INDEX idx_routines_frequency ON routines(frequency);

-- Alerts table indexes
CREATE INDEX idx_alerts_linked_stock ON alerts(linked_stock);
CREATE INDEX idx_alerts_linked_product ON alerts(linked_product);
CREATE INDEX idx_alerts_sent_at ON alerts(sent_at);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);