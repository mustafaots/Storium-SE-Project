import { useState, useCallback } from 'react';
import { clientAPI } from '../utils/clientAPI';
import { withErrorHandling } from '../middleware/errorHandler';

// Create safe API client with error handling
const createSafeClient = () => {
  return {
    getClients: withErrorHandling(clientAPI.getClients),
    getClientById: withErrorHandling(clientAPI.getClientById),
    createClient: withErrorHandling(clientAPI.createClient),
    updateClient: withErrorHandling(clientAPI.updateClient),
    deleteClient: withErrorHandling(clientAPI.deleteClient),
    getClientList: withErrorHandling(clientAPI.getClientList),
  };
};

export const useClientController = () => {
  const [clients, setClients] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [currentClient, setCurrentClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const safeApiClient = createSafeClient();

  // Load all clients with pagination and search
  const loadClients = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await safeApiClient.getClients(params);
      setClients(data.data || []);
      setPagination(data.pagination || {
        page: params.page || 1,
        limit: params.limit || 10,
        total: 0,
        totalPages: 0
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load client list for dropdowns
  const loadClientList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await safeApiClient.getClientList();
      setClientList(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get client by ID
  const loadClient = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await safeApiClient.getClientById(id);
      setCurrentClient(data.data);
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new client
  const createClient = useCallback(async (clientData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await safeApiClient.createClient(clientData);
      // Refresh the clients list
      await loadClients({ page: pagination.page, limit: pagination.limit });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, loadClients]);

  // Update client
  const updateClient = useCallback(async (id, clientData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await safeApiClient.updateClient(id, clientData);
      // Update local state
      setClients(prev => prev.map(client => 
        client.client_id === id ? { ...client, ...clientData } : client
      ));
      if (currentClient?.client_id === id) {
        setCurrentClient(prev => ({ ...prev, ...clientData }));
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentClient]);

  // Delete client
  const deleteClient = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await safeApiClient.deleteClient(id);
      // Update local state
      setClients(prev => prev.filter(client => client.client_id !== id));
      if (currentClient?.client_id === id) {
        setCurrentClient(null);
      }
      // Reload clients to update pagination
      await loadClients({ page: pagination.page, limit: pagination.limit });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentClient, pagination.page, pagination.limit, loadClients]);

  // Clear current client
  const clearCurrentClient = useCallback(() => {
    setCurrentClient(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    clients,
    clientList,
    currentClient,
    loading,
    error,
    pagination,
    actions: {
      loadClients,
      loadClientList,
      loadClient,
      createClient,
      updateClient,
      deleteClient,
      clearCurrentClient,
      clearError,
    },
  };
};