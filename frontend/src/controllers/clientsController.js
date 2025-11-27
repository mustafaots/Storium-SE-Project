// to handle client-related operations (business logic)

import { clientsAPI } from '../utils/clientsAPI';

export const clientsController = {
  // Load all clients
  loadClients: async (setClients, setLoading, setError) => {
    try {
      setLoading(true);
      const data = await clientsAPI.getAll();
      setClients(data);
      setError('');
    } catch (err) {
      setError('Failed to load clients: ' + err.message);
    } finally {
      setLoading(false);
    }
  },

  // Delete client
  deleteClient: async (id, setClients, setLoading, setError, loadClients) => {
    try {
      await clientsAPI.delete(id);
      await loadClients();
      setError('');
    } catch (err) {
      setError('Failed to delete client: ' + err.message);
    }
  },

  // Create client
  createClient: async (formData, setLoading, setError, onSuccess) => {
    try {
      setLoading(true);
      await clientsAPI.create(formData);
      onSuccess();
    } catch (err) {
      setError('Failed to create client: ' + err.message);
    } finally {
      setLoading(false);
    }
  },

  // Update client
  updateClient: async (id, formData, setLoading, setError, onSuccess) => {
    try {
      setLoading(true);
      await clientsAPI.update(id, formData);
      onSuccess();
    } catch (err) {
      setError('Failed to update client: ' + err.message);
    } finally {
      setLoading(false);
    }
  }
};