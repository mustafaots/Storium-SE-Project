const API_BASE_URL = 'http://localhost:3001/api';

export const racksAPI = {
  getAll: async (locationId, depotId, aisleId, page = 1, limit = 10, search = '') => {
    const url = new URL(`${API_BASE_URL}/locations/${locationId}/depots/${depotId}/aisles/${aisleId}/racks`);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    if (search) url.searchParams.append('search', search);

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch racks');
    return await response.json();
  },

  getById: async (locationId, depotId, aisleId, id) => {
    const response = await fetch(`${API_BASE_URL}/locations/${locationId}/depots/${depotId}/aisles/${aisleId}/racks/${id}`);
    if (!response.ok) throw new Error('Failed to fetch rack');
    return await response.json();
  },

  create: async (locationId, depotId, aisleId, rackData) => {
    const response = await fetch(`${API_BASE_URL}/locations/${locationId}/depots/${depotId}/aisles/${aisleId}/racks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rackData),
    });
    if (!response.ok) throw new Error('Failed to create rack');
    return await response.json();
  },

  update: async (locationId, depotId, aisleId, id, rackData) => {
    const response = await fetch(`${API_BASE_URL}/locations/${locationId}/depots/${depotId}/aisles/${aisleId}/racks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rackData),
    });
    if (!response.ok) throw new Error('Failed to update rack');
    return await response.json();
  },

  delete: async (locationId, depotId, aisleId, id) => {
    const response = await fetch(`${API_BASE_URL}/locations/${locationId}/depots/${depotId}/aisles/${aisleId}/racks/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete rack');
    return await response.json();
  },
};
