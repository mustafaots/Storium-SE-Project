import { useState, useEffect, useCallback } from 'react';
import { locationsController } from '../controllers/locationsController';

// Custom hook to manage locations list + pagination + loading/error state
export const useLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 0
  });

  const loadLocations = useCallback((page = 1, limit = 5, search = '') => {
    locationsController.loadLocations(
      setLocations,
      setLoading,
      setError,
      setPagination,
      page,
      limit,
      search
    );
  }, []);

  const handlePageChange = useCallback((newPage, search = '') => {
    loadLocations(newPage, pagination.pageSize, search);
  }, [loadLocations, pagination.pageSize]);

  const handlePageSizeChange = useCallback((newSize, search = '') => {
    loadLocations(1, newSize, search);
  }, [loadLocations]);

  const deleteLocation = useCallback((id, search = '') => {
    locationsController.deleteLocation(
      id,
      setLocations,
      setLoading,
      setError,
      () => loadLocations(pagination.currentPage, pagination.pageSize, search)
    );
  }, [loadLocations, pagination.currentPage, pagination.pageSize]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  return {
    locations,
    loading,
    error,
    showForm,
    isEditing,
    currentLocation,
    pagination,
    setLocations,
    setLoading,
    setError,
    setShowForm,
    setIsEditing,
    setCurrentLocation,
    loadLocations,
    deleteLocation,
    handlePageChange,
    handlePageSizeChange
  };
};

export default useLocations;
