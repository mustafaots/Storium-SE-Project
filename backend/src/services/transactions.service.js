import { TransactionsModel } from '../models/transactions.model.js';
import db from '../config/database.js';

export const TransactionsService = {

  // Fetch transactions with filtering, searching, and pagination
  async getTransactions(filters = {}) {
    const { filterType, dateFilter, search, page = 1, pageSize = 10 } = filters;

    const whereClauses = [];
    const params = [];

    if (filterType === 'automatic') {
      whereClauses.push('t.is_automated = ?');
      params.push(1);
    } else if (filterType === 'manual') {
      whereClauses.push('t.is_automated = ?');
      params.push(0);
    }

    if (dateFilter === 'today') {
      whereClauses.push('DATE(t.timestamp) = CURDATE()');
    } else if (dateFilter === 'week') {
      whereClauses.push('t.timestamp >= NOW() - INTERVAL 7 DAY');
    } else if (dateFilter === 'month') {
      whereClauses.push(
        'YEAR(t.timestamp) = YEAR(CURDATE()) AND MONTH(t.timestamp) = MONTH(CURDATE())'
      );
    }

    if (search && search.trim() !== '') {
  const like = `%${search.trim()}%`;

  // because we now join products/clients/sources with aliases p, c, s
    whereClauses.push(
    '(t.notes LIKE ? OR t.reference_number LIKE ? OR p.name LIKE ? OR c.client_name LIKE ? OR s.source_name LIKE ?)'
  );

  params.push(like, like, like, like, like);
}

    const whereSql = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const limit = Number(pageSize) || 10;
    const offset = ((Number(page) || 1) - 1) * limit;

    return new Promise((resolve, reject) => {
      TransactionsModel.getPaginated(whereSql, params, { limit, offset }, (err, result) => {
        if (err) return reject(err);
        resolve(result); // { rows, totalCount }
      });
    });
  } ,

  //Create : manual inflow transaction
    async createManualInflow({ stockId, productId, toSlotId, sourceId, quantity, unitPrice, note }) {
    const qty = Number(quantity);
    const price = unitPrice != null ? Number(unitPrice) : 0;
    const connection = db.promise();

    await connection.beginTransaction();
    try {
        const [rows] = await connection.query(
        'SELECT quantity FROM stocks WHERE stock_id = ? FOR UPDATE',
        [stockId]
        );
        if (!rows || rows.length === 0) throw new Error('Stock not found');

        const qty_before = Number(rows[0].quantity);
        const qty_after = qty_before + qty;

        await connection.query(
        'UPDATE stocks SET quantity = ? WHERE stock_id = ?',
        [qty_after, stockId]
        );

        const total_value = qty * price;
        const [insertResult] = await connection.query(
        `INSERT INTO transactions (
            is_automated,
            routine_id,
            stock_id,
            product_id,
            from_slot_id,
            to_slot_id,
            txn_type,
            quantity,
            total_value,
            reference_number,
            notes,
            timestamp,
            source_id,
            client_id,
            stock_snapshot
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, JSON_OBJECT('qty_before', ?, 'qty_after', ?)
        )`,
        [
            0,                // is_automated
            null,             // routine_id
            stockId,
            productId,
            null,             // from_slot_id
            toSlotId,
            'inflow',
            qty,
            total_value,
            null,             // reference_number
            note || '',
            sourceId || null,
            null,             // client_id
            qty_before,
            qty_after
        ]
        );

        await connection.commit();
        return {
        txn_id: insertResult.insertId,
        stock_id: stockId,
        product_id: productId,
        source_id: sourceId,
        quantity: qty,
        total_value,
        notes: note,
        qty_before,
        qty_after
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    }
    },
    
 
  // Create : manual outflow transaction
    async createManualOutflow({stockId , productId, fromSlotId ,clientId , quantity ,unitPrice , note }) {
         const qty = Number(quantity) ; 
         const price = unitPrice != null ? Number (unitPrice) : 0 ;

         const connection = db.promise(); 

         // start transaction 
         await connection.beginTransaction();
            try {
                // 1) Lock and read current stock level
                const [rows] = await connection
                .query('SELECT quantity FROM stocks WHERE stock_id = ? FOR UPDATE', [stockId]);
                if (!rows || rows.length === 0) {
                    throw new Error('Stock not found');
                }
                const qty_before = Number(rows[0].quantity);
                const qty_after = qty_before - qty;
                if (qty_after < 0) {
                    throw new Error('Insufficient stock for outflow transaction');
                }

                // 2) Update stock
                await connection
                .query('UPDATE stocks SET quantity = ? WHERE stock_id = ?', [qty_after, stockId]);


                // 3) Insert transaction record
                const total_value = qty * price;
                const [insertResult] = await connection
                 .query(
                    `INSERT INTO transactions (
                        is_automated,
                        routine_id,
                        stock_id,
                        product_id,
                        from_slot_id,
                        to_slot_id,
                        txn_type,
                        quantity,
                        total_value,
                        reference_number,
                        notes,
                        timestamp,
                        source_id,
                        client_id,
                        stock_snapshot
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, JSON_OBJECT('qty_before', ?, 'qty_after', ?)
                    )`,
                    [
                        0,                // is_automated
                        null,             // routine_id
                        stockId,
                        productId,
                        fromSlotId,
                        null,             // to_slot_id
                        'outflow',
                        qty,
                        total_value,
                        null,             // reference_number (or generate one)
                        note || '',
                        null,             // source_id
                        clientId,
                        qty_before,
                        qty_after
                    ]
                    );

                // Commit transaction
                await connection.commit();
                return {
                    txn_id: insertResult.insertId,
                    stock_id: stockId,
                    product_id: productId,
                    client_id: clientId,
                    quantity: qty,
                    total_value,
                    notes: note,
                    qty_before,
                    qty_after
                };
            } catch (error) {
                await connection.rollback();
                throw error;
            }
    },


 // Create : transfer transaction
    async createTransfer({ productId, fromStockId, toStockId, fromSlotId, toSlotId, quantity, note }) {
  const qty = Number(quantity);
  const connection = db.promise();

  await connection.beginTransaction();
  try {
    // Source stock
    const [fromRows] = await connection.query(
      'SELECT quantity FROM stocks WHERE stock_id = ? FOR UPDATE',
      [fromStockId]
    );
    if (!fromRows || fromRows.length === 0) throw new Error('Source stock not found');
    const from_before = Number(fromRows[0].quantity);
    const from_after = from_before - qty;
    if (from_after < 0) throw new Error('Insufficient source stock for transfer');

    // Destination stock
    const [toRows] = await connection.query(
      'SELECT quantity FROM stocks WHERE stock_id = ? FOR UPDATE',
      [toStockId]
    );
    if (!toRows || toRows.length === 0) throw new Error('Destination stock not found');
    const to_before = Number(toRows[0].quantity);
    const to_after = to_before + qty;

    // Update both stocks
    await connection.query(
      'UPDATE stocks SET quantity = ? WHERE stock_id = ?',
      [from_after, fromStockId]
    );
    await connection.query(
      'UPDATE stocks SET quantity = ? WHERE stock_id = ?',
      [to_after, toStockId]
    );

    // Insert transfer transaction (use fromStockId as main stock_id reference)
    const [insertResult] = await connection.query(
      `INSERT INTO transactions (
        is_automated,
        routine_id,
        stock_id,
        product_id,
        from_slot_id,
        to_slot_id,
        txn_type,
        quantity,
        total_value,
        reference_number,
        notes,
        timestamp,
        source_id,
        client_id,
        stock_snapshot
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, 
        JSON_OBJECT(
          'from_qty_before', ?, 
          'from_qty_after', ?, 
          'to_qty_before', ?, 
          'to_qty_after', ?
        )
      )`,
      [
        0,
        null,
        fromStockId,
        productId,
        fromSlotId,
        toSlotId,
        'transfer',
        qty,
        0,          // internal move, no monetary change
        null,
        note || '',
        null,
        null,
        from_before,
        from_after,
        to_before,
        to_after
      ]
    );

    await connection.commit();
    return {
      txn_id: insertResult.insertId,
      product_id: productId,
      from_stock_id: fromStockId,
      to_stock_id: toStockId,
      quantity: qty,
      notes: note,
      from_before,
      from_after,
      to_before,
      to_after
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  }
    },
    

 // create adjustment transaction
    async createAdjustment({ stockId, productId, slotId, quantityDelta, unitPrice, note, isAutomated, routineId }) {
    const delta = Number(quantityDelta);
    const price = unitPrice != null ? Number(unitPrice) : 0;
    const connection = db.promise();

    await connection.beginTransaction();
    try {
        const [rows] = await connection.query(
        'SELECT quantity FROM stocks WHERE stock_id = ? FOR UPDATE',
        [stockId]
        );
        if (!rows || rows.length === 0) throw new Error('Stock not found');

        const qty_before = Number(rows[0].quantity);
        const qty_after = qty_before + delta;
        if (qty_after < 0) throw new Error('Adjustment would make stock negative');

        await connection.query(
        'UPDATE stocks SET quantity = ? WHERE stock_id = ?',
        [qty_after, stockId]
        );

        const total_value = delta * price;
        const [insertResult] = await connection.query(
        `INSERT INTO transactions (
            is_automated,
            routine_id,
            stock_id,
            product_id,
            from_slot_id,
            to_slot_id,
            txn_type,
            quantity,
            total_value,
            reference_number,
            notes,
            timestamp,
            source_id,
            client_id,
            stock_snapshot
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, JSON_OBJECT('qty_before', ?, 'qty_after', ?)
        )`,
        [
            isAutomated ? 1 : 0,
            routineId || null,
            stockId,
            productId,
            slotId,      // from_slot_id or slot_id where adjustment happened
            null,
            'adjustment',
            delta,
            total_value,
            null,
            note || '',
            null,
            null,
            qty_before,
            qty_after
        ]
        );

        await connection.commit();
        return {
        txn_id: insertResult.insertId,
        stock_id: stockId,
        product_id: productId,
        quantity_delta: delta,
        total_value,
        notes: note,
        qty_before,
        qty_after
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    }
    },


 // create automated (inflow/outflow) transaction (called from module later )
    async createAutomatedInflow({ stockId, productId, toSlotId, sourceId, routineId, quantity, unitPrice, note }) {
        return this.createManualInflow({
            stockId,
            productId,
            toSlotId,
            sourceId,
            quantity,
            unitPrice,
            note: note || `Automated inflow (routine ${routineId})`
            // and inside createManualInflow you can extend to accept is_automated/routine if you prefer
        });
        },

    async createAutomatedOutflow({ stockId, productId, fromSlotId, clientId, routineId, quantity, unitPrice, note }) {
        const qty = Number(quantity);
        const price = unitPrice != null ? Number(unitPrice) : 0;
        const connection = db.promise();

        await connection.beginTransaction();
        try {
            // 1) Lock and read current stock
            const [rows] = await connection.query(
            'SELECT quantity FROM stocks WHERE stock_id = ? FOR UPDATE',
            [stockId]
            );
            if (!rows || rows.length === 0) throw new Error('Stock not found');

            const qty_before = Number(rows[0].quantity);
            const qty_after = qty_before - qty;
            if (qty_after < 0) throw new Error('Insufficient stock for automated outflow');

            // 2) Update stock
            await connection.query(
            'UPDATE stocks SET quantity = ? WHERE stock_id = ?',
            [qty_after, stockId]
            );

            // 3) Insert transaction record
            const total_value = qty * price;
            const [insertResult] = await connection.query(
            `INSERT INTO transactions (
                is_automated,
                routine_id,
                stock_id,
                product_id,
                from_slot_id,
                to_slot_id,
                txn_type,
                quantity,
                total_value,
                reference_number,
                notes,
                timestamp,
                source_id,
                client_id,
                stock_snapshot
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, JSON_OBJECT('qty_before', ?, 'qty_after', ?)
            )`,
            [
                1,                 // is_automated (different from manual)
                routineId || null, // routine_id set for this automation
                stockId,
                productId,
                fromSlotId,
                null,              // to_slot_id
                'outflow',
                qty,
                total_value,
                null,              // reference_number
                note || `Automated outflow (routine ${routineId})`,
                null,              // source_id
                clientId || null,
                qty_before,
                qty_after
            ]
            );

            await connection.commit();
            return {
            txn_id: insertResult.insertId,
            stock_id: stockId,
            product_id: productId,
            client_id: clientId,
            routine_id: routineId,
            quantity: qty,
            total_value,
            notes: note,
            qty_before,
            qty_after
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        }
    }


};
