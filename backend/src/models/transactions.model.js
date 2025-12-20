// src/models/transactions.model.js
import db from '../config/database.js';

export const TransactionsModel = {
  getByFilter(whereSql, params, callback) {
    const sql = `
      SELECT 
        txn_id,
        is_automated,
        stock_id,
        txn_type,
        quantity,
        total_value,
        reference_number,
        notes,
        timestamp,
        source_id,
        client_id,
        routine_id,
        from_slot_id,
        to_slot_id,
        stock_snapshot
      FROM transactions
      ${whereSql}
      ORDER BY timestamp DESC, txn_id DESC
    `;

    db.query(sql, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  },

  getPaginated(whereSql, params, { limit, offset }, callback) {
  const dataSql = `
    SELECT 
      t.txn_id,
      t.is_automated,
      t.stock_id,
      t.product_id,
      t.txn_type,
      t.quantity,
      t.total_value,
      t.reference_number,
      t.notes,
      t.timestamp,
      t.source_id,
      t.client_id,
      t.routine_id,
      t.from_slot_id,
      t.to_slot_id,
      t.stock_snapshot,
      p.name AS product_name,
      c.client_name,
      s.source_name,
      r_from.rack_id AS from_rack_id,
      r_from.rack_code AS from_rack_code,
      d_from.depot_id AS from_depot_id,
      d_from.name AS from_depot_name,
      l_from.location_id AS from_location_id,
      l_from.name AS from_location_name,
      r_to.rack_id AS to_rack_id,
      r_to.rack_code AS to_rack_code,
      d_to.depot_id AS to_depot_id,
      d_to.name AS to_depot_name,
      l_to.location_id AS to_location_id,
      l_to.name AS to_location_name
    FROM transactions t
    LEFT JOIN products p ON t.product_id = p.product_id
    LEFT JOIN clients  c ON t.client_id = c.client_id
    LEFT JOIN sources  s ON t.source_id = s.source_id
    LEFT JOIN rack_slots rs_from ON t.from_slot_id = rs_from.slot_id
    LEFT JOIN racks r_from ON rs_from.rack_id = r_from.rack_id
    LEFT JOIN aisles a_from ON r_from.parent_aisle = a_from.aisle_id
    LEFT JOIN depots d_from ON a_from.parent_depot = d_from.depot_id
    LEFT JOIN locations l_from ON d_from.parent_location = l_from.location_id
    LEFT JOIN rack_slots rs_to ON t.to_slot_id = rs_to.slot_id
    LEFT JOIN racks r_to ON rs_to.rack_id = r_to.rack_id
    LEFT JOIN aisles a_to ON r_to.parent_aisle = a_to.aisle_id
    LEFT JOIN depots d_to ON a_to.parent_depot = d_to.depot_id
    LEFT JOIN locations l_to ON d_to.parent_location = l_to.location_id
    ${whereSql}
    ORDER BY t.timestamp DESC, t.txn_id DESC
    LIMIT ? OFFSET ?
  `;

  const countSql = `
    SELECT COUNT(*) AS totalCount
    FROM transactions t
    LEFT JOIN products p ON t.product_id = p.product_id
    LEFT JOIN clients  c ON t.client_id = c.client_id
    LEFT JOIN sources  s ON t.source_id = s.source_id
    ${whereSql}
  `;

  db.query(countSql, params, (err, countRows) => {
    if (err) return callback(err);

    const totalCount = countRows[0]?.totalCount || 0;

    db.query(dataSql, [...params, limit, offset], (err2, rows) => {
      if (err2) return callback(err2);
      callback(null, { rows, totalCount });
    });
  });
}
};
