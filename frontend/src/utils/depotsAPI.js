const API_BASE_URL = 'http://localhost:3001/api';

export const depotsAPI = {
  getAll: async (locationId, page = 1, limit = 10, search = '') => {
    const url = new URL(`${API_BASE_URL}/locations/${locationId}/depots`);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    if (search) url.searchParams.append('search', search);

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch depots');
    return await response.json();
  },

  getById: async (locationId, id) => {
    const response = await fetch(`${API_BASE_URL}/locations/${locationId}/depots/${id}`);
    if (!response.ok) throw new Error('Failed to fetch depot');
    return await response.json();
  },

  create: async (locationId, depotData) => {
    const response = await fetch(`${API_BASE_URL}/locations/${locationId}/depots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(depotData),
    });
    if (!response.ok) throw new Error('Failed to create depot');
    return await response.json();
  },

  update: async (locationId, id, depotData) => {
    const response = await fetch(`${API_BASE_URL}/locations/${locationId}/depots/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(depotData),
    });
    if (!response.ok) throw new Error('Failed to update depot');
    return await response.json();
  },

  delete: async (locationId, id) => {
    const response = await fetch(`${API_BASE_URL}/locations/${locationId}/depots/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete depot');
    return await response.json();
  },
};
