// src/hooks/useProducts.js
import { useState, useEffect, useCallback } from 'react';
import { productsController } from '../controllers/productsController';
import { productsHelpers } from '../utils/productsHelpers';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });

  // Load products with pagination + search; controller receives setter callbacks
  const loadProducts = useCallback((page = 1, limit = 10, search = '') => {
    productsController.loadProducts(
      // rows -> normalize then set
      (rows) => {
        const normalized = (rows || []).map(r => productsHelpers.normalize(r));
        setProducts(normalized);
      },
      // loading setter
      setLoading,
      // error setter
      setError,
      // pagination setter
      setPagination,
      // params
      page,
      limit,
      search
    );
  }, []);

  // Page change forwards to loadProducts and accepts optional search
  const handlePageChange = useCallback((newPage, search = '') => {
    loadProducts(newPage, pagination.pageSize, search);
  }, [loadProducts, pagination.pageSize]);

  // On page size change, reset to first page
  const handlePageSizeChange = useCallback((newSize, search = '') => {
    loadProducts(1, newSize, search);
  }, [loadProducts]);

  // Delete then refresh current page respecting search term
  const deleteProduct = useCallback((id, search = '') => {
    productsController.deleteProduct(
      id,
      setProducts,
      setLoading,
      setError,
      () => loadProducts(pagination.currentPage, pagination.pageSize, search)
    );
  }, [loadProducts, pagination.currentPage, pagination.pageSize]);

  // Initial fetch on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    // State
    products,
    loading,
    error,
    showForm,
    isEditing,
    currentProduct,
    pagination,
    
    // Setters
    setProducts,
    setLoading,
    setError,
    setShowForm,
    setIsEditing,
    setCurrentProduct,
    
    // Actions
    loadProducts,
    deleteProduct,
    handlePageChange,
    handlePageSizeChange
  };
};

export default useProducts;
