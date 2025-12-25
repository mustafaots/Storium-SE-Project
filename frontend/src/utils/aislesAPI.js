const API_BASE_URL = 'http://localhost:3001/api';

export const aislesAPI = {
  getAll: async (locationId, depotId, page = 1, limit = 10, search = '') => {
    const url = new URL(`${API_BASE_URL}/locations/${locationId}/depots/${depotId}/aisles`);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    if (search) url.searchParams.append('search', search);

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch aisles');
    return await response.json();
  },

  getById: async (locationId, depotId, id) => {
    const response = await fetch(`${API_BASE_URL}/locations/${locationId}/depots/${depotId}/aisles/${id}`);
    if (!response.ok) throw new Error('Failed to fetch aisle');
    return await response.json();
  },

  create: async (locationId, depotId, aisleData) => {
    const response = await fetch(`${API_BASE_URL}/locations/${locationId}/depots/${depotId}/aisles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aisleData),
    });
    if (!response.ok) throw new Error('Failed to create aisle');
    return await response.json();
  },

  update: async (locationId, depotId, id, aisleData) => {
    const response = await fetch(`${API_BASE_URL}/locations/${locationId}/depots/${depotId}/aisles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aisleData),
    });
    if (!response.ok) throw new Error('Failed to update aisle');
    return await response.json();
  },

  delete: async (locationId, depotId, id) => {
    const response = await fetch(`${API_BASE_URL}/locations/${locationId}/depots/${depotId}/aisles/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete aisle');
    return await response.json();
  },
};
