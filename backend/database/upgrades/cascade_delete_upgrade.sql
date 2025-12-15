-- =====================================================
-- CASCADE DELETE UPGRADE
-- Run this script to enable cascading deletes across
-- the entire location hierarchy
-- =====================================================
-- Hierarchy: locations → depots → aisles → racks → rack_slots → stocks

DELIMITER //

-- Helper procedure to safely drop foreign key if it exists
DROP PROCEDURE IF EXISTS drop_fk_if_exists//
CREATE PROCEDURE drop_fk_if_exists(IN tableName VARCHAR(64), IN fkName VARCHAR(64))
BEGIN
    DECLARE fk_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = tableName
      AND CONSTRAINT_NAME = fkName
      AND CONSTRAINT_TYPE = 'FOREIGN KEY';
    
    IF fk_count > 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', tableName, ' DROP FOREIGN KEY ', fkName);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END//

DELIMITER ;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- STOCKS TABLE - depends on rack_slots and products
-- =====================================================
CALL drop_fk_if_exists('stocks', 'stocks_ibfk_1');
CALL drop_fk_if_exists('stocks', 'stocks_ibfk_2');
CALL drop_fk_if_exists('stocks', 'fk_stocks_slot');
CALL drop_fk_if_exists('stocks', 'fk_stocks_product');

ALTER TABLE stocks
ADD CONSTRAINT fk_stocks_slot
    FOREIGN KEY (slot_id) REFERENCES rack_slots(slot_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE stocks
ADD CONSTRAINT fk_stocks_product
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- =====================================================
-- RACK_SLOTS TABLE - depends on racks
-- =====================================================
CALL drop_fk_if_exists('rack_slots', 'rack_slots_ibfk_1');
CALL drop_fk_if_exists('rack_slots', 'fk_rack_slots_rack');

ALTER TABLE rack_slots
ADD CONSTRAINT fk_rack_slots_rack
    FOREIGN KEY (rack_id) REFERENCES racks(rack_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- =====================================================
-- RACKS TABLE - depends on aisles (column: parent_aisle)
-- =====================================================
CALL drop_fk_if_exists('racks', 'racks_ibfk_1');
CALL drop_fk_if_exists('racks', 'fk_racks_aisle');

ALTER TABLE racks
ADD CONSTRAINT fk_racks_aisle
    FOREIGN KEY (parent_aisle) REFERENCES aisles(aisle_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- =====================================================
-- AISLES TABLE - depends on depots (column: parent_depot)
-- =====================================================
CALL drop_fk_if_exists('aisles', 'aisles_ibfk_1');
CALL drop_fk_if_exists('aisles', 'fk_aisles_depot');

ALTER TABLE aisles
ADD CONSTRAINT fk_aisles_depot
    FOREIGN KEY (parent_depot) REFERENCES depots(depot_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- =====================================================
-- DEPOTS TABLE - depends on locations (column: parent_location)
-- =====================================================
CALL drop_fk_if_exists('depots', 'depots_ibfk_1');
CALL drop_fk_if_exists('depots', 'fk_depots_location');

ALTER TABLE depots
ADD CONSTRAINT fk_depots_location
    FOREIGN KEY (parent_location) REFERENCES locations(location_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Clean up helper procedure
DROP PROCEDURE IF EXISTS drop_fk_if_exists;

-- =====================================================
-- VERIFICATION - Check constraints were applied
-- =====================================================
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    DELETE_RULE,
    UPDATE_RULE
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;

-- =====================================================
-- CASCADE DELETE BEHAVIOR SUMMARY:
-- =====================================================
-- DELETE location → deletes all depots, aisles, racks, slots, stocks
-- DELETE depot    → deletes all aisles, racks, slots, stocks
-- DELETE aisle    → deletes all racks, slots, stocks
-- DELETE rack     → deletes all slots, stocks
-- DELETE slot     → deletes all stocks in that slot
-- DELETE product  → sets product_id to NULL in stocks (preserves stock record)
-- =====================================================
