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
