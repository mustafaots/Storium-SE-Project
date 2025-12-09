import { productsAPI } from '../utils/productsAPI.js';

export const productsController = {
  loadProducts: async (
    setData,
    setLoading,
    setError,
    setPagination,
    page,
    pageSize,
    search
  ) => {
    setLoading(true);
    setError('');

    try {
      const response = await productsAPI.getAll(page, pageSize, search);

      if (response.success) {
        const products = response.data || [];

        // ✔ No results while searching
        if (products.length === 0 && search && search.trim() !== '') {
          setError('No matching products found.');
          setData([]);
          setPagination({ page: 1, limit: pageSize, total: 0, pages: 0 });
        } else {
          // ✔ Normal data
          setData(products);
          setPagination(response.pagination || {});
        }
      } else {
        setError(response.error || 'Failed to load products.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  },

  deleteProduct: async (id, onSuccess, onError) => {
    try {
      const response = await productsAPI.delete(id);
      if (response.success) {
        onSuccess && onSuccess();
      } else {
        onError && onError(response.error);
      }
    } catch (err) {
      onError && onError(err.message);
    }
  },

  createProduct: async (data, onSuccess, onError) => {
    try {
      const response = await productsAPI.create(data);
      if (response.success) {
        onSuccess && onSuccess(response.data);
      } else {
        onError && onError(response.error);
      }
    } catch (err) {
      onError && onError(err.message);
    }
  },

  updateProduct: async (id, data, onSuccess, onError) => {
    try {
      const response = await productsAPI.update(id, data);
      if (response.success) {
        onSuccess && onSuccess();
      } else {
        onError && onError(response.error);
      }
    } catch (err) {
      onError && onError(err.message);
    }
  }
};
