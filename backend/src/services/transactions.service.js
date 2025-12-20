// backend/src/services/transactions.service.js
// Transaction service - stores transaction records in a file to prevent cascade delete loss

import db from '../config/database.js';
import { TransactionFileStore } from '../utils/transactionFileStore.js';

// Helper to fetch related names for a transaction (for display purposes)
async function enrichTransactionWithNames(txn) {
  const connection = db.promise();
  
  try {
    // Fetch product name if not already set
    if (txn.product_id && !txn.product_name) {
      const [products] = await connection.query(
        'SELECT name FROM products WHERE product_id = ?',
        [txn.product_id]
      );
      txn.product_name = products[0]?.name || null;
    }

    // Fetch client name if not already set
    if (txn.client_id && !txn.client_name) {
      const [clients] = await connection.query(
        'SELECT client_name FROM clients WHERE client_id = ?',
        [txn.client_id]
      );
      txn.client_name = clients[0]?.client_name || null;
    }

    // Fetch source name if not already set
    if (txn.source_id && !txn.source_name) {
      const [sources] = await connection.query(
        'SELECT source_name FROM sources WHERE source_id = ?',
        [txn.source_id]
      );
      txn.source_name = sources[0]?.source_name || null;
    }

    // Fetch from slot context (rack, depot, location)
    if (txn.from_slot_id) {
      const [fromSlot] = await connection.query(
        `SELECT r.rack_id, r.rack_code, d.depot_id, d.name AS depot_name, l.location_id, l.name AS location_name
         FROM rack_slots rs
         JOIN racks r ON rs.rack_id = r.rack_id
         JOIN aisles a ON r.parent_aisle = a.aisle_id
         JOIN depots d ON a.parent_depot = d.depot_id
         JOIN locations l ON d.parent_location = l.location_id
         WHERE rs.slot_id = ?`,
        [txn.from_slot_id]
      );
      if (fromSlot[0]) {
        txn.from_rack_id = fromSlot[0].rack_id;
        txn.from_rack_code = fromSlot[0].rack_code;
        txn.from_depot_id = fromSlot[0].depot_id;
        txn.from_depot_name = fromSlot[0].depot_name;
        txn.from_location_id = fromSlot[0].location_id;
        txn.from_location_name = fromSlot[0].location_name;
      }
    }

    // Fetch to slot context (rack, depot, location)
    if (txn.to_slot_id) {
      const [toSlot] = await connection.query(
        `SELECT r.rack_id, r.rack_code, d.depot_id, d.name AS depot_name, l.location_id, l.name AS location_name
         FROM rack_slots rs
         JOIN racks r ON rs.rack_id = r.rack_id
         JOIN aisles a ON r.parent_aisle = a.aisle_id
         JOIN depots d ON a.parent_depot = d.depot_id
         JOIN locations l ON d.parent_location = l.location_id
         WHERE rs.slot_id = ?`,
        [txn.to_slot_id]
      );
      if (toSlot[0]) {
        txn.to_rack_id = toSlot[0].rack_id;
        txn.to_rack_code = toSlot[0].rack_code;
        txn.to_depot_id = toSlot[0].depot_id;
        txn.to_depot_name = toSlot[0].depot_name;
        txn.to_location_id = toSlot[0].location_id;
        txn.to_location_name = toSlot[0].location_name;
      }
    }
  } catch (err) {
    console.error('Error enriching transaction with names:', err);
  }

  return txn;
}

// Enrich multiple transactions
async function enrichTransactionsWithNames(transactions) {
  return Promise.all(transactions.map(txn => enrichTransactionWithNames({ ...txn })));
}

export const TransactionsService = {

  // Fetch transactions with filtering, searching, and pagination
  async getTransactions(filters = {}) {
    const { rows, totalCount } = TransactionFileStore.getPaginated(filters);
    
    // Enrich with current names from database (if entities still exist)
    const enrichedRows = await enrichTransactionsWithNames(rows);
    
    return { rows: enrichedRows, totalCount };
  },

  // Create: manual inflow transaction
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

      // Fetch names for storage
      const [products] = await connection.query('SELECT name FROM products WHERE product_id = ?', [productId]);
      const [sources] = sourceId ? await connection.query('SELECT source_name FROM sources WHERE source_id = ?', [sourceId]) : [[]];

      // Create transaction record in file
      const txn = TransactionFileStore.create({
        is_automated: 0,
        routine_id: null,
        stock_id: stockId,
        product_id: productId,
        product_name: products[0]?.name || null,
        from_slot_id: null,
        to_slot_id: toSlotId,
        txn_type: 'inflow',
        quantity: qty,
        total_value,
        reference_number: null,
        notes: note || '',
        source_id: sourceId || null,
        source_name: sources[0]?.source_name || null,
        client_id: null,
        client_name: null,
        stock_snapshot: { qty_before, qty_after }
      });

      await connection.commit();
      return {
        txn_id: txn.txn_id,
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

  // Create: manual outflow transaction
  async createManualOutflow({ stockId, productId, fromSlotId, clientId, quantity, unitPrice, note }) {
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
      const qty_after = qty_before - qty;
      if (qty_after < 0) throw new Error('Insufficient stock for outflow transaction');

      await connection.query(
        'UPDATE stocks SET quantity = ? WHERE stock_id = ?',
        [qty_after, stockId]
      );

      const total_value = qty * price;

      // Fetch names for storage
      const [products] = await connection.query('SELECT name FROM products WHERE product_id = ?', [productId]);
      const [clients] = clientId ? await connection.query('SELECT client_name FROM clients WHERE client_id = ?', [clientId]) : [[]];

      // Create transaction record in file
      const txn = TransactionFileStore.create({
        is_automated: 0,
        routine_id: null,
        stock_id: stockId,
        product_id: productId,
        product_name: products[0]?.name || null,
        from_slot_id: fromSlotId,
        to_slot_id: null,
        txn_type: 'outflow',
        quantity: qty,
        total_value,
        reference_number: null,
        notes: note || '',
        source_id: null,
        source_name: null,
        client_id: clientId || null,
        client_name: clients[0]?.client_name || null,
        stock_snapshot: { qty_before, qty_after }
      });

      await connection.commit();
      return {
        txn_id: txn.txn_id,
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

  // Create: transfer transaction
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

      // Fetch product name
      const [products] = await connection.query('SELECT name FROM products WHERE product_id = ?', [productId]);

      // Create transaction record in file
      const txn = TransactionFileStore.create({
        is_automated: 0,
        routine_id: null,
        stock_id: fromStockId,
        product_id: productId,
        product_name: products[0]?.name || null,
        from_slot_id: fromSlotId,
        to_slot_id: toSlotId,
        txn_type: 'transfer',
        quantity: qty,
        total_value: 0,
        reference_number: null,
        notes: note || '',
        source_id: null,
        source_name: null,
        client_id: null,
        client_name: null,
        stock_snapshot: {
          from_qty_before: from_before,
          from_qty_after: from_after,
          to_qty_before: to_before,
          to_qty_after: to_after
        }
      });

      await connection.commit();
      return {
        txn_id: txn.txn_id,
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

  // Create: adjustment transaction
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

      // Fetch product name
      const [products] = await connection.query('SELECT name FROM products WHERE product_id = ?', [productId]);

      // Create transaction record in file
      const txn = TransactionFileStore.create({
        is_automated: isAutomated ? 1 : 0,
        routine_id: routineId || null,
        stock_id: stockId,
        product_id: productId,
        product_name: products[0]?.name || null,
        from_slot_id: slotId,
        to_slot_id: null,
        txn_type: 'adjustment',
        quantity: delta,
        total_value,
        reference_number: null,
        notes: note || '',
        source_id: null,
        source_name: null,
        client_id: null,
        client_name: null,
        stock_snapshot: { qty_before, qty_after }
      });

      await connection.commit();
      return {
        txn_id: txn.txn_id,
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

  // Create: relocation transaction (moving stock from one slot to another)
  async createRelocation({ stockId, productId, fromSlotId, toSlotId, quantity, note, txnType, dbConn }) {
    const qty = Number(quantity);
    const connection = dbConn || db.promise();
    const manageTransaction = !dbConn;

    if (manageTransaction) await connection.beginTransaction();
    try {
      let resolvedTxnType = txnType;
      if (!resolvedTxnType) {
        const [ctxRows] = await connection.query(
          `SELECT
            (
              SELECT d.depot_id
              FROM rack_slots rs
              JOIN racks r ON rs.rack_id = r.rack_id
              JOIN aisles a ON r.parent_aisle = a.aisle_id
              JOIN depots d ON a.parent_depot = d.depot_id
              WHERE rs.slot_id = ?
              LIMIT 1
            ) AS from_depot_id,
            (
              SELECT d.depot_id
              FROM rack_slots rs
              JOIN racks r ON rs.rack_id = r.rack_id
              JOIN aisles a ON r.parent_aisle = a.aisle_id
              JOIN depots d ON a.parent_depot = d.depot_id
              WHERE rs.slot_id = ?
              LIMIT 1
            ) AS to_depot_id`,
          [fromSlotId, toSlotId]
        );
        const fromDepotId = ctxRows?.[0]?.from_depot_id;
        const toDepotId = ctxRows?.[0]?.to_depot_id;
        resolvedTxnType = fromDepotId && toDepotId && `${fromDepotId}` !== `${toDepotId}` ? 'transfer' : 'adjustment';
      }

      if (resolvedTxnType !== 'adjustment' && resolvedTxnType !== 'transfer') {
        throw new Error(`Invalid relocation txnType: ${resolvedTxnType}`);
      }

      // Verify the stock exists
      const [rows] = await connection.query(
        'SELECT quantity FROM stocks WHERE stock_id = ? FOR UPDATE',
        [stockId]
      );
      if (!rows || rows.length === 0) throw new Error('Stock not found');

      const currentQty = Number(rows[0].quantity);

      // Fetch product name
      const [products] = await connection.query('SELECT name FROM products WHERE product_id = ?', [productId]);

      // Create transaction record in file
      const txn = TransactionFileStore.create({
        is_automated: 0,
        routine_id: null,
        stock_id: stockId,
        product_id: productId,
        product_name: products[0]?.name || null,
        from_slot_id: fromSlotId,
        to_slot_id: toSlotId,
        txn_type: resolvedTxnType,
        quantity: qty,
        total_value: 0,
        reference_number: null,
        notes: note || 'Stock relocated',
        source_id: null,
        source_name: null,
        client_id: null,
        client_name: null,
        stock_snapshot: { quantity: currentQty }
      });

      if (manageTransaction) await connection.commit();
      return {
        txn_id: txn.txn_id,
        stock_id: stockId,
        product_id: productId,
        from_slot_id: fromSlotId,
        to_slot_id: toSlotId,
        txn_type: resolvedTxnType,
        quantity: qty,
        notes: note
      };
    } catch (error) {
      if (manageTransaction) await connection.rollback();
      throw error;
    }
  },

  // Create: consumption transaction (consuming stock internally)
  async createConsumption({ stockId, productId, slotId, quantity, note }) {
    const qty = Number(quantity);
    const connection = db.promise();

    await connection.beginTransaction();
    try {
      const [rows] = await connection.query(
        'SELECT quantity FROM stocks WHERE stock_id = ? FOR UPDATE',
        [stockId]
      );
      if (!rows || rows.length === 0) throw new Error('Stock not found');

      const qty_before = Number(rows[0].quantity);
      const qty_after = qty_before - qty;
      if (qty_after < 0) throw new Error('Insufficient stock for consumption');

      if (qty_after === 0) {
        // Delete the stock when quantity reaches 0
        await connection.query(
          'DELETE FROM stocks WHERE stock_id = ?',
          [stockId]
        );
      } else {
        // Update stock quantity
        await connection.query(
          'UPDATE stocks SET quantity = ? WHERE stock_id = ?',
          [qty_after, stockId]
        );
      }

      // Fetch product name
      const [products] = await connection.query('SELECT name FROM products WHERE product_id = ?', [productId]);

      // Create transaction record in file
      const txn = TransactionFileStore.create({
        is_automated: 0,
        routine_id: null,
        stock_id: stockId,
        product_id: productId,
        product_name: products[0]?.name || null,
        from_slot_id: slotId,
        to_slot_id: null,
        txn_type: 'consumption',
        quantity: qty,
        total_value: 0,
        reference_number: null,
        notes: note || 'Stock consumed',
        source_id: null,
        source_name: null,
        client_id: null,
        client_name: null,
        stock_snapshot: { qty_before, qty_after }
      });

      await connection.commit();
      return {
        txn_id: txn.txn_id,
        stock_id: stockId,
        product_id: productId,
        quantity: qty,
        notes: note,
        qty_before,
        qty_after
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  },

  // Create: stock inflow transaction (for new stock creation)
  async createStockInflow({ stockId, productId, slotId, quantity, unitPrice, note }) {
    const qty = Number(quantity);
    const price = unitPrice != null ? Number(unitPrice) : 0;
    const connection = db.promise();

    await connection.beginTransaction();
    try {
      const total_value = qty * price;

      // Fetch product name
      const [products] = await connection.query('SELECT name FROM products WHERE product_id = ?', [productId]);

      // Create transaction record in file
      const txn = TransactionFileStore.create({
        is_automated: 0,
        routine_id: null,
        stock_id: stockId,
        product_id: productId,
        product_name: products[0]?.name || null,
        from_slot_id: null,
        to_slot_id: slotId,
        txn_type: 'inflow',
        quantity: qty,
        total_value,
        reference_number: null,
        notes: note || 'New stock added',
        source_id: null,
        source_name: null,
        client_id: null,
        client_name: null,
        stock_snapshot: { qty_before: 0, qty_after: qty }
      });

      await connection.commit();
      return {
        txn_id: txn.txn_id,
        stock_id: stockId,
        product_id: productId,
        quantity: qty,
        total_value,
        notes: note
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  },

  // Create: automated inflow transaction
  async createAutomatedInflow({ stockId, productId, toSlotId, sourceId, routineId, quantity, unitPrice, note }) {
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

      // Fetch names for storage
      const [products] = await connection.query('SELECT name FROM products WHERE product_id = ?', [productId]);
      const [sources] = sourceId ? await connection.query('SELECT source_name FROM sources WHERE source_id = ?', [sourceId]) : [[]];

      // Create transaction record in file
      const txn = TransactionFileStore.create({
        is_automated: 1,
        routine_id: routineId || null,
        stock_id: stockId,
        product_id: productId,
        product_name: products[0]?.name || null,
        from_slot_id: null,
        to_slot_id: toSlotId,
        txn_type: 'inflow',
        quantity: qty,
        total_value,
        reference_number: null,
        notes: note || `Automated inflow (routine ${routineId})`,
        source_id: sourceId || null,
        source_name: sources[0]?.source_name || null,
        client_id: null,
        client_name: null,
        stock_snapshot: { qty_before, qty_after }
      });

      await connection.commit();
      return {
        txn_id: txn.txn_id,
        stock_id: stockId,
        product_id: productId,
        source_id: sourceId,
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
  },

  // Create: automated outflow transaction
  async createAutomatedOutflow({ stockId, productId, fromSlotId, clientId, routineId, quantity, unitPrice, note }) {
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
      const qty_after = qty_before - qty;
      if (qty_after < 0) throw new Error('Insufficient stock for automated outflow');

      await connection.query(
        'UPDATE stocks SET quantity = ? WHERE stock_id = ?',
        [qty_after, stockId]
      );

      const total_value = qty * price;

      // Fetch names for storage
      const [products] = await connection.query('SELECT name FROM products WHERE product_id = ?', [productId]);
      const [clients] = clientId ? await connection.query('SELECT client_name FROM clients WHERE client_id = ?', [clientId]) : [[]];

      // Create transaction record in file
      const txn = TransactionFileStore.create({
        is_automated: 1,
        routine_id: routineId || null,
        stock_id: stockId,
        product_id: productId,
        product_name: products[0]?.name || null,
        from_slot_id: fromSlotId,
        to_slot_id: null,
        txn_type: 'outflow',
        quantity: qty,
        total_value,
        reference_number: null,
        notes: note || `Automated outflow (routine ${routineId})`,
        source_id: null,
        source_name: null,
        client_id: clientId || null,
        client_name: clients[0]?.client_name || null,
        stock_snapshot: { qty_before, qty_after }
      });

      await connection.commit();
      return {
        txn_id: txn.txn_id,
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
