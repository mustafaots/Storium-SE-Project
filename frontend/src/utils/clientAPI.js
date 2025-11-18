const API_BASE_URL = 'http://localhost:3001/api';

export const clientAPI = {
  // GET all clients with pagination and search
  async getClients(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/clients${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('API Error Response:', data);
      throw new Error(data.error || `HTTP ${response.status}: Failed to fetch clients`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch clients');
    }
    return data;
  },

  // GET client by ID
  async getClientById(id) {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: Failed to fetch client`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch client');
    }
    return data;
  },

  // POST new client
  async createClient(clientData) {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || `HTTP ${response.status}: Failed to create client`);
    }
    return data;
  },

  // PUT update client
  async updateClient(id, clientData) {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to update client');
    }
    return data;
  },

  // DELETE client
  async deleteClient(id) {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete client');
    }
    return data;
  },

  // GET client list for dropdowns
  async getClientList() {
    const response = await fetch(`${API_BASE_URL}/clients/list`);
    if (!response.ok) throw new Error('Failed to fetch client list');
    const data = await response.json();
    
    if (!data.success) throw new Error(data.error || 'Failed to fetch client list');
    return data;
  },
};