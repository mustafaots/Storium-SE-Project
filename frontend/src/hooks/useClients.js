// Custom hook to manage clients state (list, pagination, loading/errors) and actions

import { useState, useEffect, useCallback } from 'react';
import { clientsController } from '../controllers/clientsController';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  
  // Pagination state lives here so pages/components can stay lean
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 0
  });

  // Load clients with pagination + search; defaults match backend constants
  const loadClients = useCallback((page = 1, limit = 5, search = '') => {
    clientsController.loadClients(
      setClients, 
      setLoading, 
      setError, 
      setPagination,
      page, 
      limit,
      search
    );
  }, []);

  // Page change just forwards to loadClients with current page size
  const handlePageChange = useCallback((newPage, search = '') => {
    loadClients(newPage, pagination.pageSize, search);
  }, [loadClients, pagination.pageSize]);

  // On page size change, reset to first page to avoid empty gaps
  const handlePageSizeChange = useCallback((newSize, search = '') => {
    // Reset to page 1 when changing size
    loadClients(1, newSize, search);
  }, [loadClients]);

  // Delete then refresh current page respecting search term
  const deleteClient = useCallback((id, search = '') => {
    clientsController.deleteClient(
      id, 
      setClients, 
      setLoading, 
      setError, 
      () => loadClients(pagination.currentPage, pagination.pageSize, search)
    );
  }, [loadClients, pagination.currentPage, pagination.pageSize]);

  // Initial fetch on mount
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  return {
    // State
    clients,
    loading,
    error,
    showForm,
    isEditing,
    currentClient,
    pagination,
    
    // Setters
    setClients,
    setLoading,
    setError,
    setShowForm,
    setIsEditing,
    setCurrentClient,
    
    // Actions
    loadClients,
    deleteClient,
    handlePageChange,
    handlePageSizeChange
  };
};