import connection from '../config/database.js';

export const RackSlot = {
  ensureSlots: async (rackId, layout) => {
    const { directions, levels, bays, binsPerBay } = layout;

    // Map R/L to right/left for ENUM compatibility
    const dirMap = { R: 'right', L: 'left' };

    // First, check which slots already exist for this rack
    const existingSlots = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT direction, bay_no, level_no, bin_no FROM rack_slots WHERE rack_id = ?',
        [rackId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });

    // Build a set of existing slot keys for quick lookup
    const existingKeys = new Set();
    existingSlots.forEach((s) => {
      // Normalize direction to right/left
      let dir = s.direction;
      if (dir === 'R' || dir === 'r' || dir === '') dir = 'right';
      if (dir === 'L' || dir === 'l') dir = 'left';
      existingKeys.add(`${dir}-${s.bay_no}-${s.level_no}-${s.bin_no}`);
    });

    const values = [];
    directions.forEach((dir) => {
      const dbDir = dirMap[dir] || dir;
      for (let level = 1; level <= levels; level += 1) {
        for (let bay = 1; bay <= bays; bay += 1) {
          for (let bin = 1; bin <= binsPerBay; bin += 1) {
            const key = `${dbDir}-${bay}-${level}-${bin}`;
            if (!existingKeys.has(key)) {
              values.push([rackId, dbDir, bay, level, bin]);
            }
          }
        }
      }
    });

    if (!values.length) {
      console.log('ensureSlots: No new slots to create');
      return;
    }

    console.log(`ensureSlots: Creating ${values.length} new slots`);

    return new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO rack_slots (rack_id, direction, bay_no, level_no, bin_no) VALUES ?',
        [values],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  getSlotsWithStock: (rackId) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT rs.*, s.stock_id, s.product_id, s.quantity, s.batch_no, s.expiry_date, s.strategy, s.product_type, s.is_consumable, s.sale_price, s.cost_price, s.is_active
         FROM rack_slots rs
         LEFT JOIN stocks s ON s.slot_id = rs.slot_id AND s.is_active = 1
         WHERE rs.rack_id = ?
         ORDER BY rs.direction ASC, rs.level_no DESC, rs.bay_no ASC, rs.bin_no ASC`,
        [rackId],
        (err, results) => {
          if (err) reject(err);
          else {
            // Log slots that have stock
            const withStock = results.filter(r => r.stock_id);
            console.log(`getSlotsWithStock: Found ${results.length} slots, ${withStock.length} have stock:`, withStock.map(s => ({ slot_id: s.slot_id, stock_id: s.stock_id, direction: s.direction })));
            resolve(results);
          }
        }
      );
    });
  },

  getSlotById: (slotId) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM rack_slots WHERE slot_id = ?', [slotId], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }
};
