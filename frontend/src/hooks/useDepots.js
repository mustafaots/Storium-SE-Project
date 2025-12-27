import { useState, useEffect, useCallback } from 'react';
import { depotsController } from '../controllers/depotsController';

export const useDepots = (locationId) => {
  const [depots, setDepots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDepot, setCurrentDepot] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 0
  });

  const loadDepots = useCallback((page = 1, limit = 5, search = '') => {
    depotsController.loadDepots(
      locationId,
      setDepots,
      setLoading,
      setError,
      setPagination,
      page,
      limit,
      search
    );
  }, [locationId]);

  const handlePageChange = useCallback((newPage, search = '') => {
    loadDepots(newPage, pagination.pageSize, search);
  }, [loadDepots, pagination.pageSize]);

  const handlePageSizeChange = useCallback((newSize, search = '') => {
    loadDepots(1, newSize, search);
  }, [loadDepots]);

  const deleteDepot = useCallback((id, search = '') => {
    depotsController.deleteDepot(
      locationId,
      id,
      setDepots,
      setLoading,
      setError,
      () => loadDepots(pagination.currentPage, pagination.pageSize, search)
    );
  }, [locationId, loadDepots, pagination.currentPage, pagination.pageSize]);

  useEffect(() => {
    if (locationId) {
      loadDepots();
    }
  }, [locationId, loadDepots]);

  return {
    depots,
    loading,
    error,
    showForm,
    isEditing,
    currentDepot,
    pagination,
    setDepots,
    setLoading,
    setError,
    setShowForm,
    setIsEditing,
    setCurrentDepot,
    loadDepots,
    deleteDepot,
    handlePageChange,
    handlePageSizeChange
  };
};

export default useDepots;
