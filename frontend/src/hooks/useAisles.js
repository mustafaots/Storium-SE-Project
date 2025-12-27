import { useState, useEffect, useCallback } from 'react';
import { aislesController } from '../controllers/aislesController';

export const useAisles = (locationId, depotId) => {
  const [aisles, setAisles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAisle, setCurrentAisle] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 0
  });

  const loadAisles = useCallback((page = 1, limit = 5, search = '') => {
    if (!locationId || !depotId) return;
    aislesController.loadAisles(
      locationId,
      depotId,
      setAisles,
      setLoading,
      setError,
      setPagination,
      page,
      limit,
      search
    );
  }, [locationId, depotId]);

  const handlePageChange = useCallback((newPage, search = '') => {
    loadAisles(newPage, pagination.pageSize, search);
  }, [loadAisles, pagination.pageSize]);

  const handlePageSizeChange = useCallback((newSize, search = '') => {
    loadAisles(1, newSize, search);
  }, [loadAisles]);

  const deleteAisle = useCallback((id, search = '') => {
    aislesController.deleteAisle(
      locationId,
      depotId,
      id,
      setAisles,
      setLoading,
      setError,
      () => loadAisles(pagination.currentPage, pagination.pageSize, search)
    );
  }, [locationId, depotId, loadAisles, pagination.currentPage, pagination.pageSize]);

  useEffect(() => {
    if (locationId && depotId) {
      loadAisles();
    }
  }, [locationId, depotId, loadAisles]);

  return {
    aisles,
    loading,
    error,
    showForm,
    isEditing,
    currentAisle,
    pagination,
    setAisles,
    setLoading,
    setError,
    setShowForm,
    setIsEditing,
    setCurrentAisle,
    loadAisles,
    deleteAisle,
    handlePageChange,
    handlePageSizeChange
  };
};

export default useAisles;
