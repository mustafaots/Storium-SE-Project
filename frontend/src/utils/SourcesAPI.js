// src/utils/sourcesAPI.js
// Mock source data + simulated network delays for local testing
let mockSources = [
  {
    source_id: 1,
    source_name: 'Tech Solutions Inc.',
    contact_email: 'contact@techsolutions.com',
    contact_phone: '+1 (555) 123-4567',
    address: '123 Tech Street, Silicon Valley, CA 94025',
    coordinates: '37.3688° N, 122.0363° W',
    rating: 4.8,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    source_id: 2,
    source_name: 'Global Coffee Traders',
    contact_email: 'info@globalcoffee.com',
    contact_phone: '+1 (555) 234-5678',
    address: '456 Coffee Lane, Portland, OR 97201',
    coordinates: '45.5152° N, 122.6784° W',
    rating: 4.5,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    source_id: 3,
    source_name: 'FitGear Supplies',
    contact_email: 'sales@fitgear.com',
    contact_phone: '+1 (555) 345-6789',
    address: '789 Fitness Ave, Austin, TX 78701',
    coordinates: '30.2672° N, 97.7431° W',
    rating: 4.3,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    source_id: 4,
    source_name: 'Office Essentials Co.',
    contact_email: 'support@officeessentials.com',
    contact_phone: '+1 (555) 456-7890',
    address: '321 Business Blvd, New York, NY 10001',
    coordinates: '40.7128° N, 74.0060° W',
    rating: 4.6,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    source_id: 5,
    source_name: 'SportWear Distributors',
    contact_email: 'orders@sportwear.com',
    contact_phone: '+1 (555) 567-8901',
    address: '654 Athletic Road, Denver, CO 80202',
    coordinates: '39.7392° N, 104.9903° W',
    rating: 4.7,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    source_id: 6,
    source_name: 'Euro Imports Ltd.',
    contact_email: 'contact@euroimports.eu',
    contact_phone: '+44 20 7946 0958',
    address: '12 London Bridge Street, London, UK SE1 9SG',
    coordinates: '51.5074° N, 0.1278° W',
    rating: 4.2,
    is_active: false,
    created_at: new Date().toISOString()
  }
];

const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

export const sourcesAPI = {
  // GET /sources?page=..&limit=..&search=..
  getAll: async (page = 1, limit = 10, search = '') => {
    await delay(250);
    let data = mockSources.slice();

    if (search && String(search).trim()) {
      const term = String(search).toLowerCase();
      data = data.filter(s =>
        (s.source_name || '').toLowerCase().includes(term) ||
        (s.contact_email || '').toLowerCase().includes(term) ||
        (s.contact_phone || '').toLowerCase().includes(term) ||
        (s.address || '').toLowerCase().includes(term)
      );
    }

    const total = data.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const paginated = data.slice(start, start + limit);

    return {
      success: true,
      data: paginated,
      pagination: { page, limit, total, pages }
    };
  },

  // GET /sources/:id
  getById: async (id) => {
    await delay(150);
    const sid = Number(id);
    const source = mockSources.find(s => s.source_id === sid);
    if (!source) return { success: false, error: 'Source not found' };
    return { success: true, data: { ...source } };
  },

  // POST /sources
  create: async (sourceData) => {
    await delay(150);
    const nextId = mockSources.length ? mockSources[mockSources.length - 1].source_id + 1 : 1;
    const newSource = {
      source_id: nextId,
      is_active: sourceData.is_active ?? true,
      rating: sourceData.rating ? parseFloat(sourceData.rating) : 0,
      created_at: new Date().toISOString(),
      ...sourceData
    };
    mockSources.push(newSource);
    return { success: true, data: newSource };
  },

  // PUT /sources/:id
  update: async (id, sourceData) => {
    await delay(150);
    const sid = Number(id);
    const idx = mockSources.findIndex(s => s.source_id === sid);
    if (idx === -1) return { success: false, error: 'Source not found' };
    
    // Parse rating if provided
    if (sourceData.rating) {
      sourceData.rating = parseFloat(sourceData.rating);
    }
    
    mockSources[idx] = { ...mockSources[idx], ...sourceData };
    return { success: true, data: mockSources[idx] };
  },

  // DELETE /sources/:id
  delete: async (id) => {
    await delay(120);
    const sid = Number(id);
    const idx = mockSources.findIndex(s => s.source_id === sid);
    if (idx === -1) return { success: false, error: 'Source not found' };
    mockSources.splice(idx, 1);
    return { success: true };
  }
};

export default sourcesAPI;