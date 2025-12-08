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
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) AS totalCount
      FROM transactions
      ${whereSql}
    `;

    // First get total count
    db.query(countSql, params, (err, countRows) => {
      if (err) return callback(err);

      const totalCount = countRows[0]?.totalCount || 0;

      // Then get page data
      db.query(dataSql, [...params, limit, offset], (err2, rows) => {
        if (err2) return callback(err2);
        callback(null, { rows, totalCount });
      });
    });
  }

};
