// backend/src/controllers/products.controller.js
import productsService from '../services/products.service.js';
import apiResponse from '../utils/apiResponse.js';
import { constants } from '../utils/constants.js';

const productsController = {
  // List products with pagination + search (server-side filtering)
  getAllProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || constants.PAGINATION.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit, 10) || constants.PAGINATION.DEFAULT_LIMIT;
      const search = (req.query.search || '').trim();

      // Call paginated service method
      const { products, pagination } = await productsService.getAllPaginated(page, limit, search);

    

      // If service returns nothing, respond with empty paginated shape
      if (!products || products.length === 0) {
        return res.json(apiResponse.paginatedResponse([], {
          page: page,
          limit: limit,
          total: 0,
          pages: 0
        }, search ? 'No matching products found' : 'No products available'));
      }

      // Normal response: map pagination into consistent shape
      return res.json(apiResponse.paginatedResponse(products, {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        pages: pagination.pages
      }));
    } catch (error) {
      console.error('❌ Controller getAllProducts error:', error);
      return res.status(500).json(apiResponse.errorResponse(error.message || 'Failed to load products'));
    }
  },

  // Get a single product by id
  getProductById: async (req, res) => {
    try {
      const product = await productsService.getById(req.params.id);

      if (!product) {
        return res.status(404).json(apiResponse.errorResponse('Product not found'));
      }

      

      return res.json(apiResponse.successResponse(product, 'Product retrieved successfully'));
    } catch (error) {
      console.error('❌ Controller getProductById error:', error);
      return res.status(500).json(apiResponse.errorResponse(error.message || 'Failed to retrieve product'));
    }
  },

  // Create product
  createProduct: async (req, res) => {
    try {
      const productData = req.body;
    

      const newProduct = await productsService.create(productData);
      

      return res.status(201).json(apiResponse.successResponse(newProduct, 'Product created successfully'));
    } catch (error) {
      console.error('❌ Controller createProduct error:', error);
      return res.status(400).json(apiResponse.errorResponse(error.message || 'Failed to create product'));
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    try {
      const productData = req.body;
      

      const result = await productsService.update(req.params.id, productData);

      if (!result || result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Product not found'));
      }

      

      return res.json(apiResponse.successResponse(null, 'Product updated successfully'));
    } catch (error) {
      console.error('❌ Controller updateProduct error:', error);
      return res.status(400).json(apiResponse.errorResponse(error.message || 'Failed to update product'));
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const result = await productsService.delete(req.params.id);

      if (!result || result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Product not found'));
      }

      return res.json(apiResponse.successResponse(null, 'Product deleted successfully'));
    } catch (error) {
      console.error('❌ Controller deleteProduct error:', error);
      return res.status(500).json(apiResponse.errorResponse(error.message || 'Failed to delete product'));
    }
  }
};

export default productsController;