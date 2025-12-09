import { clientsAPI } from '../utils/clientsAPI.js';

export const clientsController = {
  // UPDATED: Load clients with pagination using clientsAPI
  loadClients: async (
    setClients,
    setLoading,
    setError,
    setPagination,
    page = 1,
    limit = 10,
    search = ''
  ) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await clientsAPI.getAll(page, limit, search);
      
      if (response.success) {
        setClients(response.data);
        // Set pagination info if available
        if (response.pagination && setPagination) {
          setPagination({
            currentPage: response.pagination.page,
            pageSize: response.pagination.limit,
            totalCount: response.pagination.total,
            totalPages: response.pagination.pages
          });
        }
      } else {
        setError(response.error || 'Failed to load clients');
      }
    } catch (error) {
      setError(error.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  },

  // UPDATED: Delete client using clientsAPI
  deleteClient: async (id, setClients, setLoading, setError, onSuccess) => {
    try {
      setLoading(true);
      const response = await clientsAPI.delete(id);
      
      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Failed to delete client');
      }
    } catch (error) {
      setError(error.message || 'Failed to delete client');
    } finally {
      setLoading(false);
    }
  },

  // UPDATED: Create client using clientsAPI
  createClient: async (formData, onSuccess, onError, onFormSuccess) => {
    try {
      const response = await clientsAPI.create(formData);
      
      if (response.success) {
        onFormSuccess();
        onSuccess();
      } else {
        onError(response.error || 'Failed to create client');
      }
    } catch (error) {
      onError(error.message || 'Failed to create client');
    }
  },

  // UPDATED: Update client using clientsAPI
  updateClient: async (id, formData, onSuccess, onError, onFormSuccess) => {
    try {
      const response = await clientsAPI.update(id, formData);
      
      if (response.success) {
        onFormSuccess();
        onSuccess();
      } else {
        onError(response.error || 'Failed to update client');
      }
    } catch (error) {
      onError(error.message || 'Failed to update client');
    }
  }
};