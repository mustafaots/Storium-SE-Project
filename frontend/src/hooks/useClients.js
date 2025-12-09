// Custom hook to manage clients state and actions

import { useState, useEffect, useCallback } from 'react';
import { clientsController } from '../controllers/clientsController';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  
  // NEW: Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 0
  });

  // UPDATED: Load clients function with pagination and search
  // limit default changed to 9  [[[ THIS CONTROLS THE CURRENT]]]
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

  // NEW: Handle page change
  const handlePageChange = useCallback((newPage, search = '') => {
    loadClients(newPage, pagination.pageSize, search);
  }, [loadClients, pagination.pageSize]);

  // NEW: Handle page size change
  const handlePageSizeChange = useCallback((newSize, search = '') => {
    // Reset to page 1 when changing size
    loadClients(1, newSize, search);
  }, [loadClients]);

  // Delete client function
  const deleteClient = useCallback((id, search = '') => {
    clientsController.deleteClient(
      id, 
      setClients, 
      setLoading, 
      setError, 
      () => loadClients(pagination.currentPage, pagination.pageSize, search)
    );
  }, [loadClients, pagination.currentPage, pagination.pageSize]);

  // Initialize
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