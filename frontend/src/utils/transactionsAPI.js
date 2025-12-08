// src/utils/transactionsAPI.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const transactionsAPI = {
  async getTransactions({ filterType, dateFilter, search, page, pageSize } = {}) {
    const params = new URLSearchParams();

    if (filterType && filterType !== 'mixed') params.set('filterType', filterType);
    if (dateFilter && dateFilter !== 'all') params.set('dateFilter', dateFilter);
    if (search && search.trim() !== '') params.set('search', search.trim());
    if (page) params.set('page', page);
    if (pageSize) params.set('pageSize', pageSize);

    const url = `${API_BASE_URL}/transactions${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return await response.json(); // { success, data, pagination }
  }
};
