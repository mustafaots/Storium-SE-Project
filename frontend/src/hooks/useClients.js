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

  // Load clients function
  const loadClients = useCallback(() => {
    clientsController.loadClients(setClients, setLoading, setError);
  }, []);

  // Delete client function
  const deleteClient = useCallback((id) => {
    clientsController.deleteClient(id, setClients, setLoading, setError, loadClients);
  }, [loadClients]);

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
    
    // Setters
    setClients,
    setLoading,
    setError,
    setShowForm,
    setIsEditing,
    setCurrentClient,
    
    // Actions
    loadClients,
    deleteClient
  };
};