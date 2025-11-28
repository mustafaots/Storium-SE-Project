// src/utils/productsAPI.js
// Mock product data + simulated network delays for local testing
let mockProducts = [
  {
    product_id: 1,
    name: 'Wireless Headphones',
    sku: 'SKU-0001',
    category: 'Electronics',
    unit: 'pcs',
    min_stock_level: 5,
    max_stock_level: 100,
    total: 45,
    description: 'Premium wireless headphones with noise cancellation',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    product_id: 2,
    name: 'Coffee Beans',
    sku: 'SKU-0002',
    category: 'Food & Beverage',
    unit: 'kg',
    min_stock_level: 10,
    max_stock_level: 200,
    total: 78,
    description: 'Premium Arabica coffee beans from Colombia',
    image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    product_id: 3,
    name: 'Yoga Mat',
    sku: 'SKU-0003',
    category: 'Sports & Fitness',
    unit: 'pcs',
    min_stock_level: 8,
    max_stock_level: 50,
    total: 23,
    description: 'Eco-friendly non-slip yoga mat',
    image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    product_id: 4,
    name: 'Desk Lamp',
    sku: 'SKU-0004',
    category: 'Home & Office',
    unit: 'pcs',
    min_stock_level: 5,
    max_stock_level: 60,
    total: 34,
    description: 'LED desk lamp with adjustable brightness',
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    product_id: 5,
    name: 'Running Shoes',
    sku: 'SKU-0005',
    category: 'Footwear',
    unit: 'pairs',
    min_stock_level: 15,
    max_stock_level: 100,
    total: 62,
    description: 'Comfortable running shoes with cushioned sole',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    created_at: new Date().toISOString()
  }
];

const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

export const productsAPI = {
  // GET /products?page=..&limit=..&search=..
  getAll: async (page = 1, limit = 10, search = '') => {
    await delay(250);
    let data = mockProducts.slice();

    if (search && String(search).trim()) {
      const term = String(search).toLowerCase();
      data = data.filter(p =>
        (p.name || '').toLowerCase().includes(term) ||
        (p.sku || '').toLowerCase().includes(term) ||
        (p.category || '').toLowerCase().includes(term)
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

  // GET /products/:id
  getById: async (id) => {
    await delay(150);
    const pid = Number(id);
    const product = mockProducts.find(p => p.product_id === pid);
    if (!product) return { success: false, error: 'Product not found' };
    return { success: true, data: { ...product } };
  },

  // POST /products
  create: async (productData) => {
    await delay(150);
    const nextId = mockProducts.length ? mockProducts[mockProducts.length - 1].product_id + 1 : 1;
    const sku = productData.sku || `SKU-${String(nextId).padStart(4, '0')}`;
    const newProduct = {
      product_id: nextId,
      sku,
      total: productData.total ?? 0,
      created_at: new Date().toISOString(),
      ...productData
    };
    mockProducts.push(newProduct);
    return { success: true, data: newProduct };
  },

  // PUT /products/:id
  update: async (id, productData) => {
    await delay(150);
    const pid = Number(id);
    const idx = mockProducts.findIndex(p => p.product_id === pid);
    if (idx === -1) return { success: false, error: 'Product not found' };
    mockProducts[idx] = { ...mockProducts[idx], ...productData };
    return { success: true, data: mockProducts[idx] };
  },

  // DELETE /products/:id
  delete: async (id) => {
    await delay(120);
    const pid = Number(id);
    const idx = mockProducts.findIndex(p => p.product_id === pid);
    if (idx === -1) return { success: false, error: 'Product not found' };
    mockProducts.splice(idx, 1);
    return { success: true };
  }
};

export default productsAPI;
