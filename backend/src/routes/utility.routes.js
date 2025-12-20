import express from 'express';
import connection from '../config/database.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Storium IMS API is running' });
});

// Get empty slots for a specific rack (for migration)
router.get('/racks/:rackId/empty-slots', (req, res) => {
  const rackId = req.params.rackId;
  connection.query(
    `SELECT rs.slot_id, rs.direction, rs.bay_no, rs.level_no, rs.bin_no, r.rack_code,
            CONCAT(r.rack_code, '-', UPPER(LEFT(rs.direction, 1)), '-B', rs.bay_no, '-L', rs.level_no, '-P', rs.bin_no) AS coordinate
     FROM rack_slots rs
     JOIN racks r ON r.rack_id = rs.rack_id
     LEFT JOIN stocks s ON s.slot_id = rs.slot_id
     WHERE rs.rack_id = ? AND s.stock_id IS NULL
     ORDER BY rs.direction, rs.level_no DESC, rs.bay_no, rs.bin_no`,
    [rackId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, data: results });
    }
  );
});

// Schema stats - counts for all entities
router.get('/schema/stats', (req, res) => {
  const queries = {
    locations: 'SELECT COUNT(*) as count FROM locations',
    depots: 'SELECT COUNT(*) as count FROM depots',
    aisles: 'SELECT COUNT(*) as count FROM aisles',
    racks: 'SELECT COUNT(*) as count FROM racks',
    slots: 'SELECT COUNT(*) as count FROM rack_slots',
    stocks: 'SELECT COUNT(*) as count FROM stocks',
    products: 'SELECT COUNT(*) as count FROM products'
  };

  const results = {};
  const keys = Object.keys(queries);
  let completed = 0;

  keys.forEach((key) => {
    connection.query(queries[key], (err, rows) => {
      if (err) {
        results[key] = 0;
      } else {
        results[key] = rows[0]?.count || 0;
      }
      completed++;
      if (completed === keys.length) {
        res.json({ success: true, data: results });
      }
    });
  });
});

// Export depot inventory as JSON or CSV
router.get('/depots/:depotId/export', (req, res) => {
  const { depotId } = req.params;
  const format = req.query.format || 'json';

  connection.query(
    `SELECT d.*, l.name as location_name 
     FROM depots d 
     JOIN locations l ON l.location_id = d.parent_location 
     WHERE d.depot_id = ?`,
    [depotId],
    (err, depotRows) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      if (!depotRows.length) return res.status(404).json({ success: false, error: 'Depot not found' });

      const depot = depotRows[0];

      connection.query(
        `SELECT 
           s.stock_id, s.quantity, s.batch_no, s.expiry_date, s.strategy, 
           s.product_type, s.is_consumable, s.sale_price, s.cost_price, s.slot_coordinates,
           p.name as product_name, p.category,
           r.rack_code,
           a.name as aisle_name,
           rs.direction, rs.bay_no, rs.level_no, rs.bin_no
         FROM stocks s
         JOIN rack_slots rs ON rs.slot_id = s.slot_id
         JOIN racks r ON r.rack_id = rs.rack_id
         JOIN aisles a ON a.aisle_id = r.parent_aisle
         JOIN depots d ON d.depot_id = a.parent_depot
         LEFT JOIN products p ON p.product_id = s.product_id
         WHERE d.depot_id = ?
         ORDER BY a.name, r.rack_code, rs.direction, rs.level_no DESC, rs.bay_no, rs.bin_no`,
        [depotId],
        (err2, stockRows) => {
          if (err2) return res.status(500).json({ success: false, error: err2.message });

          const exportData = {
            export_date: new Date().toISOString(),
            depot: {
              id: depot.depot_id,
              name: depot.name,
              location: depot.location_name
            },
            summary: {
              total_items: stockRows.length,
              total_quantity: stockRows.reduce((sum, s) => sum + (s.quantity || 0), 0),
              total_value: stockRows.reduce((sum, s) => sum + ((s.quantity || 0) * (s.sale_price || 0)), 0)
            },
            inventory: stockRows.map(s => ({
              product: s.product_name || 'Unknown',
              category: s.category || '',
              quantity: s.quantity,
              batch: s.batch_no || '',
              expiry: s.expiry_date || '',
              strategy: s.strategy,
              type: s.product_type,
              consumable: s.is_consumable ? 'Yes' : 'No',
              sale_price: s.sale_price || 0,
              cost_price: s.cost_price || 0,
              location: {
                aisle: s.aisle_name,
                rack_code: s.rack_code,
                coordinates: s.slot_coordinates,
                direction: s.direction,
                bay: s.bay_no,
                level: s.level_no,
                bin: s.bin_no
              }
            }))
          };

          if (format === 'csv') {
            const headers = ['Product', 'Category', 'Quantity', 'Batch', 'Expiry', 'Strategy', 'Type', 'Consumable', 'Sale Price', 'Cost Price', 'Aisle', 'Rack Code', 'Coordinates'];
            const csvRows = [headers.join(',')];

            exportData.inventory.forEach(item => {
              const row = [
                `"${item.product}"`,
                `"${item.category}"`,
                item.quantity,
                `"${item.batch}"`,
                `"${item.expiry}"`,
                item.strategy,
                item.type,
                item.consumable,
                item.sale_price,
                item.cost_price,
                `"${item.location.aisle}"`,
                `"${item.location.rack_code}"`,
                `"${item.location.coordinates}"`
              ];
              csvRows.push(row.join(','));
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${depot.name}_inventory_${new Date().toISOString().split('T')[0]}.csv"`);
            return res.send(csvRows.join('\n'));
          }

          res.setHeader('Content-Disposition', `attachment; filename="${depot.name}_inventory_${new Date().toISOString().split('T')[0]}.json"`);
          res.json(exportData);
        }
      );
    }
  );
});

export default router;
