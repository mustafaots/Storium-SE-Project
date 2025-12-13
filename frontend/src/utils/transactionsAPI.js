// src/utils/transactionsAPI.js
const API_BASE_URL ='http://localhost:3001/api';

export const transactionsAPI = {
  async getTransactions({ page = 1, pageSize = 10, filterType, dateFilter, search }) {
    const url = new URL(`${API_BASE_URL}/transactions`);
    url.searchParams.append('page', page);
    url.searchParams.append('pageSize', pageSize);       
    if (filterType) url.searchParams.append('filterType', filterType);
    if (dateFilter) url.searchParams.append('dateFilter', dateFilter);
    if (search) url.searchParams.append('search', search);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return await res.json();
  },

  async manualOutflow(payload) {
    const res = await fetch(`${API_BASE_URL}/transactions/manual-outflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.error || 'Failed to create manual outflow');
    }
    return json.data;
  },

 async manualInflow(payload) {
    const res = await fetch(`${API_BASE_URL}/transactions/manual-inflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.error || 'Failed to create manual inflow');
    }
    return json.data;
  },

    async transfer(payload) {
    const res = await fetch(`${API_BASE_URL}/transactions/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.error || 'Failed to create transfer');
    }
    return json.data;
  },


  async adjustment(payload) {
    const res = await fetch(`${API_BASE_URL}/transactions/adjustment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.error || 'Failed to create adjustment');
    }
    return json.data;
  }

};
