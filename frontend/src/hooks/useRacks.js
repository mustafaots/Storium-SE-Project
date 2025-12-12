import { useState, useEffect, useCallback } from 'react';
import { racksController } from '../controllers/racksController';

export const useRacks = (locationId, depotId, aisleId) => {
  const [racks, setRacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRack, setCurrentRack] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 0
  });

  const loadRacks = useCallback((page = 1, limit = 5, search = '') => {
    if (!locationId || !depotId || !aisleId) return;
    racksController.loadRacks(
      locationId,
      depotId,
      aisleId,
      setRacks,
      setLoading,
      setError,
      setPagination,
      page,
      limit,
      search
    );
  }, [locationId, depotId, aisleId]);

  const handlePageChange = useCallback((newPage, search = '') => {
    loadRacks(newPage, pagination.pageSize, search);
  }, [loadRacks, pagination.pageSize]);

  const handlePageSizeChange = useCallback((newSize, search = '') => {
    loadRacks(1, newSize, search);
  }, [loadRacks]);

  const deleteRack = useCallback((id, search = '') => {
    racksController.deleteRack(
      locationId,
      depotId,
      aisleId,
      id,
      setRacks,
      setLoading,
      setError,
      () => loadRacks(pagination.currentPage, pagination.pageSize, search)
    );
  }, [locationId, depotId, aisleId, loadRacks, pagination.currentPage, pagination.pageSize]);

  useEffect(() => {
    if (locationId && depotId && aisleId) {
      loadRacks();
    }
  }, [locationId, depotId, aisleId, loadRacks]);

  return {
    racks,
    loading,
    error,
    showForm,
    isEditing,
    currentRack,
    pagination,
    setRacks,
    setLoading,
    setError,
    setShowForm,
    setIsEditing,
    setCurrentRack,
    loadRacks,
    deleteRack,
    handlePageChange,
    handlePageSizeChange
  };
};

export default useRacks;
