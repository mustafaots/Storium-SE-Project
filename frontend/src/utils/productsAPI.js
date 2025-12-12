const API_BASE_URL = 'http://localhost:3001/api';

// Thin fetch wrapper for products endpoints; keeps pages/hooks UI-only
export const productsAPI = {
  // Get all products with pagination
  getAll: async (page = 1, limit = 10, search = '') => {
    const url = new URL(`${API_BASE_URL}/products`);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    if (search) url.searchParams.append('search', search);

  

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
     
    }
    
    return data;
  },

  // Get product by ID
  getById: async (id) => {
    
    
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    
    const data = await response.json();
    
    
    return data;
  },

  // Create new product
  create: async (productData) => {
    
    
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API - Create failed:', error);
      throw new Error('Failed to create product');
    }
    
    const data = await response.json();
    
    
    return data;
  },

  // Update product
  update: async (id, productData) => {
    
    
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API - Update failed:', error);
      throw new Error('Failed to update product');
    }
    
    const data = await response.json();
    
    
    return data;
  },

  // Delete product
  delete: async (id) => {
    
    
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Failed to delete product');
    
    const data = await response.json();
    
    
    return data;
  },

  // Get all suppliers (sources) - Get only active sources
  getAllSuppliers: async () => {
  
    
    const response = await fetch(`${API_BASE_URL}/sources?limit=1000`); // Get all sources
    if (!response.ok) throw new Error('Failed to fetch suppliers');
    
    const data = await response.json();
    
   
    
    // Return only active sources
    if (data.success && data.data) {
      const activeSuppliers = data.data.filter(source => source.is_active);
      
      return {
        success: true,
        data: activeSuppliers
      };
    }
    return data;
  }
};