const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const transactionsAPI = {
    async getTransactions() {
        const response = await fetch(`${API_BASE_URL}/transactions`); 
        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }
        const json = await response.json();
        return json.data || [];
    }
};go