import connection from '../config/database.js';

export const Stock = {
  create: (slotId, payload) => {
    const {
      product_id,
      quantity,
      batch_no,
      expiry_date,
      strategy = 'FIFO',
      product_type,
      is_consumable = false,
      sale_price = null,
      cost_price = null,
      slot_coordinates = null
    } = payload;

    console.log('Stock.create payload:', { slotId, slot_coordinates, product_id, quantity, product_type });

    return new Promise((resolve, reject) => {
      connection.query(
        `INSERT INTO stocks (slot_id, slot_coordinates, product_id, quantity, batch_no, expiry_date, strategy, product_type, is_consumable, sale_price, cost_price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          slotId,
          slot_coordinates,
          product_id,
          quantity,
          batch_no,
          expiry_date || null,
          strategy,
          product_type,
          is_consumable ? 1 : 0,
          sale_price ?? null,
          cost_price ?? null
        ],
        (err, results) => {
          if (err) reject(err);
          else resolve({ stock_id: results.insertId, slot_id: slotId, slot_coordinates });
        }
      );
    });
  },

  moveToSlot: (stockId, targetSlotId) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE stocks SET slot_id = ?, last_updated = CURRENT_TIMESTAMP WHERE stock_id = ?',
        [targetSlotId, stockId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  getById: (stockId) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM stocks WHERE stock_id = ?', [stockId], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  },

  update: (stockId, payload) => {
    const fields = [];
    const params = [];
    const allowed = ['quantity', 'batch_no', 'expiry_date', 'strategy', 'product_type', 'is_consumable', 'sale_price', 'cost_price'];
    allowed.forEach((key) => {
      if (payload[key] !== undefined) {
        fields.push(`${key} = ?`);
        let value = payload[key];
        // Handle special cases
        if (key === 'is_consumable') {
          value = value ? 1 : 0;
        } else if (key === 'expiry_date' && (value === '' || value === null)) {
          // Allow empty expiry_date - convert empty string to null
          value = null;
        }
        params.push(value);
      }
    });
    if (!fields.length) return Promise.resolve({ affectedRows: 0 });
    fields.push('last_updated = CURRENT_TIMESTAMP');
    params.push(stockId);

    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE stocks SET ${fields.join(', ')} WHERE stock_id = ?`,
        params,
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  softDelete: (stockId) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'DELETE FROM stocks WHERE stock_id = ?',
        [stockId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  migrateToSlot: (stockId, targetSlotId, newCoordinates) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE stocks SET slot_id = ?, slot_coordinates = ?, last_updated = CURRENT_TIMESTAMP WHERE stock_id = ?',
        [targetSlotId, newCoordinates, stockId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  }
};
