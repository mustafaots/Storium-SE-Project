// src/utils/sourcesAPI.js
const API_BASE_URL = 'http://localhost:3001/api';

// Thin fetch wrapper for sources endpoints; keeps pages/hooks UI-only
export const sourcesAPI = {
  // Get all sources with pagination
  getAll: async (page = 1, limit = 10, search = '') => {
    const url = new URL(`${API_BASE_URL}/sources`);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    if (search) url.searchParams.append('search', search);

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch sources');
    return await response.json();
  },

  // Get source by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/sources/${id}`);
    if (!response.ok) throw new Error('Failed to fetch source');
    return await response.json();
  },

  // Create new source
  create: async (sourceData) => {
    const response = await fetch(`${API_BASE_URL}/sources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sourceData),
    });
    if (!response.ok) throw new Error('Failed to create source');
    return await response.json();
  },

  // Update source
  update: async (id, sourceData) => {
    const response = await fetch(`${API_BASE_URL}/sources/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sourceData),
    });
    if (!response.ok) throw new Error('Failed to update source');
    return await response.json();
  },

  // Delete source
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/sources/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete source');
    return await response.json();
  },
};
