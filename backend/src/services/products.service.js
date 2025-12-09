import { Product } from '../models/products.model.js';
import { constants } from '../utils/constants.js';

const productsService = {
  // Get all products (keep for backward compatibility)
  getAllProducts: () => Product.getAllPaginated(), // or implement a getAll if you want non-paginated

  // NEW: Get paginated products with total count
  getAllProductsPaginated: async (page = constants.PAGINATION.DEFAULT_PAGE, limit = constants.PAGINATION.DEFAULT_LIMIT, search = '') => {
    // Validate pagination parameters
    const validatedPage = Math.max(1, parseInt(page));
    const validatedLimit = Math.min(
      Math.max(1, parseInt(limit)),
      constants.PAGINATION.MAX_LIMIT
    );

    const [products, total] = await Promise.all([
      Product.getAllPaginated(validatedPage, validatedLimit, search),
      Product.getTotalCount(search)
    ]);

    return {
      products,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        pages: Math.ceil(total / validatedLimit)
      }
    };
  },

  // Single product by ID
  getProductById: (id) => Product.getById(id),

  // Create new product
  createProduct: (productData) => Product.create(productData),

  // Update existing product
  updateProduct: (id, productData) => Product.update(id, productData),

  // Delete product
  deleteProduct: (id) => Product.delete(id)
};

export default productsService;
