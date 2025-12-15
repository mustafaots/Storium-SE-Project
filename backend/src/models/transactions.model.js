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
      s.source_name
    FROM transactions t
    LEFT JOIN products p ON t.product_id = p.product_id
    LEFT JOIN clients  c ON t.client_id = c.client_id
    LEFT JOIN sources  s ON t.source_id = s.source_id
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
