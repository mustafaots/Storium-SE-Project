const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const transactionsAPI = {
  async getTransactions({ filterType, dateFilter, search } = {}) {
    const params = new URLSearchParams();

    if (filterType && filterType !== 'mixed') {
      params.set('filterType', filterType); // 'automatic' or 'manual'
    }
    if (dateFilter && dateFilter !== 'all') {
      params.set('dateFilter', dateFilter); // 'today' | 'week' | 'month'
    }
    if (search && search.trim() !== '') {
      params.set('search', search.trim());
    }

    const qs = params.toString();
    const url = `${API_BASE_URL}/transactions${qs ? `?${qs}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    const json = await response.json();
    return json.data || [];
  }
};
