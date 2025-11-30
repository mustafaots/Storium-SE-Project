// src/controllers/productsController.js
export const productsController = {
  loadProducts: async (setData, setLoading, setError, setPagination, page, pageSize, search) => {
    setLoading(true);
    setError('');
    try {
      const mockData = [
        { 
          product_id: 1, 
          name: 'Wireless Headphones', 
          category: 'Electronics', 
          supplier: 'Tech Solutions Inc.',
          unit: 'pcs', 
          total_stock: 45, 
          min_stock_level: 5, 
          max_stock_level: 100,
          description: 'Premium wireless headphones with noise cancellation',
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'
        },
        { 
          product_id: 2, 
          name: 'Coffee Beans', 
          category: 'Food & Beverage', 
          supplier: 'Global Coffee Traders',
          unit: 'kg', 
          total_stock: 78, 
          min_stock_level: 10, 
          max_stock_level: 200,
          description: 'Premium Arabica coffee beans',
          image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop'
        },
        { 
          product_id: 3, 
          name: 'Yoga Mat', 
          category: 'Sports & Fitness', 
          supplier: 'FitGear Supplies',
          unit: 'pcs', 
          total_stock: 23, 
          min_stock_level: 8, 
          max_stock_level: 50,
          description: 'Eco-friendly non-slip yoga mat',
          image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop'
        },
        { 
          product_id: 4, 
          name: 'Desk Lamp', 
          category: 'Home & Office', 
          supplier: 'Office Essentials Co.',
          unit: 'pcs', 
          total_stock: 34, 
          min_stock_level: 5, 
          max_stock_level: 60,
          description: 'LED desk lamp with adjustable brightness',
          image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop'
        },
        { 
          product_id: 5, 
          name: 'Running Shoes', 
          category: 'Footwear', 
          supplier: 'SportWear Distributors',
          unit: 'pairs', 
          total_stock: 62, 
          min_stock_level: 15, 
          max_stock_level: 100,
          description: 'Comfortable running shoes',
          image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'
        }
      ];

      const filtered = search
        ? mockData.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.category || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.supplier || '').toLowerCase().includes(search.toLowerCase())
          )
        : mockData;

      setData(filtered);

      setPagination({
        currentPage: page,
        pageSize: pageSize,
        totalCount: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize)
      });

      return undefined;
      
    } catch (err) {
      setError('Failed to load products');
      console.error('Load products error:', err);
    } finally {
      setLoading(false);
    }
  },

  deleteProduct: async (id, onSuccess, onError) => {
    try {
      console.log('Deleted product id:', id);
      if (onSuccess) onSuccess();
    } catch (err) {
      if (onError) onError(err?.message);
    }
  }
};