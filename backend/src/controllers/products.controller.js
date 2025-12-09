import productsService from '../services/products.service.js';
import apiResponse from '../utils/apiResponse.js';
import { constants } from '../utils/constants.js';

const productsController = {
  // GET all products with pagination
  getAllProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || constants.PAGINATION.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || constants.PAGINATION.DEFAULT_LIMIT;
      const search = req.query.search || '';

      const { products, pagination } = await productsService.getAllProductsPaginated(page, limit, search);

      if (products.length === 0) {
        const message = search ? 'No matching products found' : 'No products available';
        return res.json(apiResponse.successResponse([], message));
      }

      res.json(apiResponse.paginatedResponse(products, pagination));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  // GET product by ID
  getProductById: async (req, res) => {
    try {
      const product = await productsService.getProductById(req.params.id);

      if (!product) {
        return res.status(404).json(apiResponse.errorResponse('Product not found'));
      }

      res.json(apiResponse.successResponse(product, 'Product retrieved successfully'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  },

  // CREATE new product
  createProduct: async (req, res) => {
    try {
      const productData = req.body;
      const newProduct = await productsService.createProduct(productData);

      res.status(201).json(apiResponse.successResponse(newProduct, 'Product created successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  // UPDATE existing product
  updateProduct: async (req, res) => {
    try {
      const productData = req.body;
      const result = await productsService.updateProduct(req.params.id, productData);

      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Product not found'));
      }

      res.json(apiResponse.successResponse(null, 'Product updated successfully'));
    } catch (error) {
      res.status(400).json(apiResponse.errorResponse(error.message));
    }
  },

  // DELETE product
  deleteProduct: async (req, res) => {
    try {
      const result = await productsService.deleteProduct(req.params.id);

      if (result.affectedRows === 0) {
        return res.status(404).json(apiResponse.errorResponse('Product not found'));
      }

      res.json(apiResponse.successResponse(null, 'Product deleted successfully'));
    } catch (error) {
      res.status(500).json(apiResponse.errorResponse(error.message));
    }
  }
};

export default productsController;
