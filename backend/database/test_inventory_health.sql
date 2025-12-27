-- SQL Script to seed data for Inventory Health Testing
-- Run this script to generate "Low Stock" and "Out of Stock" scenarios

-- 1. Create a dummy category if needed (optional context)
-- products table has 'category' column as string, so no need for category table

-- 2. Insert Test Products
-- 'min_stock_level' is key here
INSERT INTO products (name, category, description, min_stock_level, created_at) VALUES 
('Test - Low Stock Item', 'Test Scripts', 'Item with quantity below minimum', 50, NOW()),
('Test - Out of Stock Item (Zero)', 'Test Scripts', 'Item with 0 quantity record', 20, NOW()),
('Test - Out of Stock Item (No Record)', 'Test Scripts', 'Item with absolutely no stock', 10, NOW());

-- 3. Get the IDs of the newly inserted products
-- We use variables to capture the IDs for the stock insertion
SET @id_low = (SELECT product_id FROM products WHERE name = 'Test - Low Stock Item' LIMIT 1);
SET @id_zero = (SELECT product_id FROM products WHERE name = 'Test - Out of Stock Item (Zero)' LIMIT 1);

-- 4. Insert Stock Records

-- Scenario A: LOW STOCK
-- Min level is 50, we insert 5
INSERT INTO stocks (product_id, quantity, product_type, last_updated) 
VALUES (@id_low, 5, 'raw', NOW());

-- Scenario B: ZERO STOCK
-- Min level is 20, we insert 0 (simulating empty container/slot)
INSERT INTO stocks (product_id, quantity, product_type, last_updated) 
VALUES (@id_zero, 0, 'raw', NOW());

-- Scenario C: NO RECORD
-- We do NOT insert anything for 'Test - Out of Stock Item (No Record)'
-- This tests the LEFT JOIN logic (null stock)

-- 5. Verification Query
SELECT 'Low Stock Candidates' as type, p.name, p.min_stock_level, SUM(s.quantity) as current 
FROM products p JOIN stocks s ON p.product_id = s.product_id 
WHERE name LIKE 'Test - %' GROUP BY p.product_id
UNION ALL
SELECT 'Out of Stock Candidates', p.name, p.min_stock_level, 0
FROM products p 
WHERE name = 'Test - Out of Stock Item (No Record)';

