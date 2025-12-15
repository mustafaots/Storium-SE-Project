// src/controllers/productsController.js
import { productsAPI } from '../utils/productsAPI.js';

export const productsController = {
  // Load products with pagination + search; updates rows and pagination state
  loadProducts: async (
    setProducts,
    setLoading,
    setError,
    setPagination,
    page = 1,
    limit = 10,
    search = ''
  ) => {
    try {
      setLoading(true);
      setError('');

      const response = await productsAPI.getAll(page, limit, search);

      if (response.success) {
        setProducts(response.data || []);

        // Map pagination to consistent shape expected by UI
        if (response.pagination && setPagination) {
          setPagination({
            currentPage: response.pagination.page,
            pageSize: response.pagination.limit,
            totalCount: response.pagination.total,
            totalPages: response.pagination.pages
          });
        }
      } else {
        setError(response.error || 'Failed to load products');
      }
    } catch (error) {
      setError(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  },

  // Delete product then let caller decide how to refresh
  deleteProduct: async (id, setProducts, setLoading, setError, onSuccess) => {
    try {
      setLoading(true);
      const response = await productsAPI.delete(id);

      if (response.success) {
        onSuccess && onSuccess();
      } else {
        setError(response.error || 'Failed to delete product');
      }
    } catch (error) {
      setError(error.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  },

  // Create product and invoke caller callbacks (UI success + refresh)
  createProduct: async (formData, onSuccess, onError, onFormSuccess) => {
    try {
      const response = await productsAPI.create(formData);

      if (response.success) {
        // close form first, then run success refresh callback
        onFormSuccess && onFormSuccess();
        onSuccess && onSuccess(response.data);
      } else {
        onError && onError(response.error || 'Failed to create product');
      }
    } catch (error) {
      onError && onError(error.message || 'Failed to create product');
    }
  },

  // Update product and invoke caller callbacks (UI success + refresh)
  updateProduct: async (id, formData, onSuccess, onError, onFormSuccess) => {
    try {
      const response = await productsAPI.update(id, formData);

      if (response.success) {
        onFormSuccess && onFormSuccess();
        onSuccess && onSuccess();
      } else {
        onError && onError(response.error || 'Failed to update product');
      }
    } catch (error) {
      onError && onError(error.message || 'Failed to update product');
    }
  }
};

export default productsController;
