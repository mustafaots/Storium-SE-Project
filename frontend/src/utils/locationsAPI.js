const API_BASE_URL = 'http://localhost:3001/api';

// Thin fetch wrapper for locations endpoints; keeps UI components lean
export const locationsAPI = {
  // Get all locations with pagination + optional search
  getAll: async (page = 1, limit = 10, search = '') => {
    const url = new URL(`${API_BASE_URL}/locations`);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    if (search) url.searchParams.append('search', search);

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch locations');
    return await response.json();
  },

  // Get location by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/locations/${id}`);
    if (!response.ok) throw new Error('Failed to fetch location');
    return await response.json();
  },

  // Create new location
  create: async (locationData) => {
    const response = await fetch(`${API_BASE_URL}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData),
    });
    if (!response.ok) throw new Error('Failed to create location');
    return await response.json();
  },

  // Update location
  update: async (id, locationData) => {
    const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData),
    });
    if (!response.ok) throw new Error('Failed to update location');
    return await response.json();
  },

  // Delete location
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete location');
    return await response.json();
  }
};
