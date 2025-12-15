UPDATE rack_slots SET direction = 'right' WHERE direction = 'R';
UPDATE rack_slots SET direction = 'left' WHERE direction = 'L';

-- First, update empty direction slots to 'right' if they don't have stock
UPDATE rack_slots SET direction = 'right' WHERE direction = '' OR direction IS NULL;

-- Then remove duplicate slots (keeping the one with stock if any)
DELETE rs1 FROM rack_slots rs1
INNER JOIN rack_slots rs2 
ON rs1.rack_id = rs2.rack_id 
   AND rs1.direction = rs2.direction 
   AND rs1.bay_no = rs2.bay_no 
   AND rs1.level_no = rs2.level_no 
   AND rs1.bin_no = rs2.bin_no 
   AND rs1.slot_id > rs2.slot_id
WHERE NOT EXISTS (SELECT 1 FROM stocks s WHERE s.slot_id = rs1.slot_id AND s.is_active = 1);