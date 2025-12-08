import { TransactionsModel } from '../models/transactions.model.js';

export const TransactionsService = {
  async getTransactions(filters = {}) {
    const { filterType, dateFilter, search, page = 1, pageSize = 10 } = filters;

    const whereClauses = [];
    const params = [];

    if (filterType === 'automatic') {
      whereClauses.push('is_automated = ?');
      params.push(1);
    } else if (filterType === 'manual') {
      whereClauses.push('is_automated = ?');
      params.push(0);
    }

    if (dateFilter === 'today') {
      whereClauses.push('DATE(`timestamp`) = CURDATE()');
    } else if (dateFilter === 'week') {
      whereClauses.push('`timestamp` >= NOW() - INTERVAL 7 DAY');
    } else if (dateFilter === 'month') {
      whereClauses.push('YEAR(`timestamp`) = YEAR(CURDATE()) AND MONTH(`timestamp`) = MONTH(CURDATE())');
    }

    if (search && search.trim() !== '') {
      whereClauses.push('(notes LIKE ? OR reference_number LIKE ?)');
      const like = `%${search.trim()}%`;
      params.push(like, like);
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
  }
};
