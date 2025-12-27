// frontend/src/controllers/sourcesController.js
import { sourcesAPI } from "../utils/SourcesAPI.js";
import sourcesHelpers from "../utils/sourcesHelpers.js";

export const sourcesController = {
  // Load sources with pagination + search; updates both rows and pagination state
  loadSources: async (
    setSources,
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

      const response = await sourcesAPI.getAll(page, limit, search);

      if (response.success) {
        // Normalize before setting state so UI receives consistent shape
        const normalized = (response.data || []).map(s => sourcesHelpers.normalize(s));
        setSources(normalized);

        // Set pagination info if available
        if (response.pagination && setPagination) {
          setPagination({
            currentPage: response.pagination.page ?? response.pagination.currentPage ?? page,
            pageSize: response.pagination.limit ?? response.pagination.pageSize ?? limit,
            totalCount: response.pagination.total ?? response.pagination.totalCount ?? 0,
            totalPages: response.pagination.pages ?? response.pagination.totalPages ?? 0
          });
        }
      } else {
        setError(response.error || 'Failed to load sources');
        // keep callers able to reset pagination if they want
      }
    } catch (error) {
      console.error('sourcesController.loadSources error:', error);
      setError(error.message || 'Failed to load sources');
    } finally {
      setLoading(false);
    }
  },

  // Delete source then let caller decide how to refresh (same shape as clientsController.deleteClient)
  deleteSource: async (id, setSources, setLoading, setError, onSuccess) => {
    try {
      setLoading(true);
      const response = await sourcesAPI.delete(id);

      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Failed to delete source');
      }
    } catch (error) {
      setError(error.message || 'Failed to delete source');
    } finally {
      setLoading(false);
    }
  },

  // Create source and invoke caller callbacks (UI success + refresh)
  createSource: async (formData, onSuccess, onError, onFormSuccess) => {
    try {
      const response = await sourcesAPI.create(formData);

      if (response.success) {
        // onFormSuccess is intended to close the modal / reset form
        if (typeof onFormSuccess === 'function') onFormSuccess();
        if (typeof onSuccess === 'function') onSuccess(response.data);
      } else {
        if (typeof onError === 'function') onError(response.error || 'Failed to create source');
      }
    } catch (error) {
      if (typeof onError === 'function') onError(error.message || 'Failed to create source');
    }
  },

  // Update source and invoke caller callbacks (UI success + refresh)
  updateSource: async (id, formData, onSuccess, onError, onFormSuccess) => {
    try {
      const response = await sourcesAPI.update(id, formData);

      if (response.success) {
        if (typeof onFormSuccess === 'function') onFormSuccess();
        if (typeof onSuccess === 'function') onSuccess(response.data);
      } else {
        if (typeof onError === 'function') onError(response.error || 'Failed to update source');
      }
    } catch (error) {
      if (typeof onError === 'function') onError(error.message || 'Failed to update source');
    }
  }
};
