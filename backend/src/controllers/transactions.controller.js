// src/controllers/transactions.controller.js
import { TransactionsService } from '../services/transactions.service.js';

export const getTransactions = async (req, res, next) => {
  try {
    const { filterType, dateFilter, search, page, pageSize } = req.query;

    const { rows, totalCount } = await TransactionsService.getTransactions({
      filterType,
      dateFilter,
      search,
      page,
      pageSize
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: Number(page) || 1,
        pageSize: Number(pageSize) || 10,
        totalCount,
        totalPages: Math.ceil(totalCount / (Number(pageSize) || 10))
      }
    });
  } catch (error) {
    next(error);
  }
};


export const createManualOutflow = async (req, res, next) => {
  try {
    const { stockId, productId, fromSlotId, clientId, quantity, unitPrice, note } = req.body;

    if (!stockId || !productId || !fromSlotId || !clientId || !quantity) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const txn = await TransactionsService.createManualOutflow({
      stockId,
      productId,
      fromSlotId,
      clientId,
      quantity,
      unitPrice,
      note
    });

    res.status(201).json({ success: true, data: txn });
  } catch (error) {
    next(error);
  };
};
// Manual INFLOW: from supplier to stock
export const createManualInflow = async (req, res, next) => {
  try {
    const { stockId, productId, toSlotId, sourceId, quantity, unitPrice, note } = req.body;

    if (!stockId || !productId || !toSlotId || !sourceId || !quantity) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const txn = await TransactionsService.createManualInflow({
      stockId,
      productId,
      toSlotId,
      sourceId,
      quantity,
      unitPrice,
      note
    });

    res.status(201).json({ success: true, data: txn });
  } catch (error) {
    next(error);
  }
};

// TRANSFER: move quantity between two stock rows / slots
export const createTransfer = async (req, res, next) => {
  try {
    const {
      productId,
      fromStockId,
      toStockId,
      fromSlotId,
      toSlotId,
      quantity,
      note
    } = req.body;

    if (!productId || !fromStockId || !toStockId || !fromSlotId || !toSlotId || !quantity) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const txn = await TransactionsService.createTransfer({
      productId,
      fromStockId,
      toStockId,
      fromSlotId,
      toSlotId,
      quantity,
      note
    });

    res.status(201).json({ success: true, data: txn });
  } catch (error) {
    next(error);
  }
};

// RELOCATION: move stock from one slot to another
export const createRelocation = async (req, res, next) => {
  try {
    const {
      stockId,
      productId,
      fromSlotId,
      toSlotId,
      quantity,
      note
    } = req.body;

    if (!stockId || !productId || !fromSlotId || !toSlotId || !quantity) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const txn = await TransactionsService.createRelocation({
      stockId,
      productId,
      fromSlotId,
      toSlotId,
      quantity,
      note
    });

    res.status(201).json({ success: true, data: txn });
  } catch (error) {
    next(error);
  }
};

// CONSUMPTION: internal stock consumption
export const createConsumption = async (req, res, next) => {
  try {
    const {
      stockId,
      productId,
      slotId,
      quantity,
      note
    } = req.body;

    if (!stockId || !productId || !slotId || !quantity) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const txn = await TransactionsService.createConsumption({
      stockId,
      productId,
      slotId,
      quantity,
      note
    });

    res.status(201).json({ success: true, data: txn });
  } catch (error) {
    next(error);
  }
};

// STOCK INFLOW: new stock added to inventory
export const createStockInflow = async (req, res, next) => {
  try {
    const {
      stockId,
      productId,
      slotId,
      quantity,
      unitPrice,
      note
    } = req.body;

    if (!stockId || !productId || !slotId || !quantity) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const txn = await TransactionsService.createStockInflow({
      stockId,
      productId,
      slotId,
      quantity,
      unitPrice,
      note
    });

    res.status(201).json({ success: true, data: txn });
  } catch (error) {
    next(error);
  }
};

// ADJUSTMENT: found/lost stock
export const createAdjustment = async (req, res, next) => {
  try {
    const {
      stockId,
      productId,
      slotId,
      quantityDelta,   // can be + or -
      unitPrice,
      note,
      isAutomated,
      routineId
    } = req.body;

    if (!stockId || !productId || !slotId || quantityDelta == null) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const txn = await TransactionsService.createAdjustment({
      stockId,
      productId,
      slotId,
      quantityDelta,
      unitPrice,
      note,
      isAutomated: !!isAutomated,
      routineId
    });

    res.status(201).json({ success: true, data: txn });
  } catch (error) {
    next(error);
  }
};



