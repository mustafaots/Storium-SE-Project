// src/hooks/useProducts.js
import { useState, useCallback } from 'react';
import { productsController } from '../controllers/productsController';
import { productsHelpers } from '../utils/productsHelpers';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });

  const loadProducts = useCallback(async (page = 1, pageSize = 10, search = '') => {
    try {
      setLoading(true);
      setError('');

      await productsController.loadProducts(
        (rows) => {
          const normalized = (rows || []).map(r => productsHelpers.normalize(r));
          setProducts(normalized);
        },
        setLoading,
        setError,
        (pg) => {
          if (pg && typeof pg === 'object') {
            setPagination({
              currentPage: pg.currentPage ?? pg.page ?? page,
              pageSize: pg.pageSize ?? pg.limit ?? pageSize,
              totalCount: pg.totalCount ?? pg.total ?? 0,
              totalPages: pg.totalPages ?? pg.pages ?? 0
            });
          }
        },
        page,
        pageSize,
        search
      );
    } catch (err) {
      setError(err?.message || String(err));
    }
  }, []);

  const handlePageChange = useCallback((newPage) => {
    loadProducts(newPage, pagination.pageSize);
  }, [loadProducts, pagination.pageSize]);

  const handlePageSizeChange = useCallback((newSize) => {
    loadProducts(1, newSize);
  }, [loadProducts]);

  const deleteProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      setError('');
      await productsController.deleteProduct(
        id,
        () => loadProducts(pagination.currentPage, pagination.pageSize),
        (errMsg) => setError(errMsg || 'Failed to delete product')
      );
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [loadProducts, pagination.currentPage, pagination.pageSize]);

  return {
    products,
    loading,
    error,
    showForm,
    isEditing,
    currentProduct,
    pagination,
    setProducts,
    setLoading,
    setError,
    setShowForm,
    setIsEditing,
    setCurrentProduct,
    loadProducts,
    deleteProduct,
    handlePageChange,
    handlePageSizeChange
  };
};

export default useProducts;