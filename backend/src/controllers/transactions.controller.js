// src/controllers/transactions.controller.js
import { TransactionsService } from '../services/transactions.service.js';

export const getTransactions = async (req, res, next) => {
  try {
    const { filterType, dateFilter, search } = req.query;

    const transactions = await TransactionsService.getTransactions({
      filterType,   // 'automatic' | 'manual' | 'mixed' | undefined
      dateFilter,   // 'today' | 'week' | 'month' | 'all' | undefined
      search        // string or undefined
    });

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};
