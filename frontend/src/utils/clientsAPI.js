const API_BASE_URL = 'http://localhost:3001/api';

// Thin fetch wrapper for clients endpoints; keeps pages/hooks UI-only
export const clientsAPI = {
  // Get all clients with pagination
  getAll: async (page = 1, limit = 10, search = '') => {
    const url = new URL(`${API_BASE_URL}/clients`);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    if (search) url.searchParams.append('search', search);

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch clients');
    return await response.json();
  },

  // Get client by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`);
    if (!response.ok) throw new Error('Failed to fetch client');
    return await response.json();
  },

  // Create new client
  create: async (clientData) => {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    if (!response.ok) throw new Error('Failed to create client');
    return await response.json();
  },

  // Update client
  update: async (id, clientData) => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    if (!response.ok) throw new Error('Failed to update client');
    return await response.json();
  },

  // Delete client
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete client');
    return await response.json();
  }
};