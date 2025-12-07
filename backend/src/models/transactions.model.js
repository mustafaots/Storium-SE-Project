import db from '../config/database.js';

export const TransactionsModel ={
   getAll(callback) {
        const sql =`    
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
        ORDER BY timestamp DESC , txn_id DESC
        `;

        db.query(sql, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null , results);
        });
    }
}