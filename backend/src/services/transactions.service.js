import { TransactionsModel } from '../models/transactions.model.js';

export const TransactionsService = {
  async getTransactions(filters = {}) {
    const { filterType, dateFilter, search } = filters;

    const whereClauses = [];
    const params = [];

    // Automatic / manual / mixed
    if (filterType === 'automatic') {
      whereClauses.push('is_automated = ?');
      params.push(1);
    } else if (filterType === 'manual') {
      whereClauses.push('is_automated = ?');
      params.push(0);
    }
    // 'mixed' or undefined → no is_automated condition

    // Date filter based on `timestamp`
    if (dateFilter === 'today') {
      whereClauses.push('DATE(`timestamp`) = CURDATE()');
    } else if (dateFilter === 'week') {
      // current ISO week
      whereClauses.push('YEARWEEK(`timestamp`, 1) = YEARWEEK(CURDATE(), 1)');
    } else if (dateFilter === 'month') {
      whereClauses.push('YEAR(`timestamp`) = YEAR(CURDATE()) AND MONTH(`timestamp`) = MONTH(CURDATE())');
    }
    // 'all' or undefined → no date condition

    // Search in notes or reference_number
    if (search && search.trim() !== '') {
      whereClauses.push('(notes LIKE ? OR reference_number LIKE ?)');
      const like = `%${search.trim()}%`;
      params.push(like, like);
    }

    const whereSql = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';

    return new Promise((resolve, reject) => {
      TransactionsModel.getByFilter(whereSql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
};
