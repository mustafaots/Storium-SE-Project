import { locationsAPI } from '../utils/locationsAPI.js';

export const locationsController = {
  loadLocations: async (
    setLocations,
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

      const response = await locationsAPI.getAll(page, limit, search);

      if (response.success) {
        setLocations(response.data || []);
        if (response.pagination && setPagination) {
          setPagination({
            currentPage: response.pagination.page,
            pageSize: response.pagination.limit,
            totalCount: response.pagination.total,
            totalPages: response.pagination.pages
          });
        }
      } else {
        setError(response.error || 'Failed to load locations');
      }
    } catch (error) {
      setError(error.message || 'Failed to load locations');
    } finally {
      setLoading(false);
    }
  },

  deleteLocation: async (id, setLocations, setLoading, setError, onSuccess) => {
    try {
      setLoading(true);
      const response = await locationsAPI.delete(id);

      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Failed to delete location');
      }
    } catch (error) {
      setError(error.message || 'Failed to delete location');
    } finally {
      setLoading(false);
    }
  },

  createLocation: async (formData, onSuccess, onError, onFormSuccess) => {
    try {
      const response = await locationsAPI.create(formData);
      if (response.success) {
        onFormSuccess();
        onSuccess();
      } else {
        onError(response.error || 'Failed to create location');
      }
    } catch (error) {
      onError(error.message || 'Failed to create location');
    }
  },

  updateLocation: async (id, formData, onSuccess, onError, onFormSuccess) => {
    try {
      const response = await locationsAPI.update(id, formData);
      if (response.success) {
        onFormSuccess();
        onSuccess();
      } else {
        onError(response.error || 'Failed to update location');
      }
    } catch (error) {
      onError(error.message || 'Failed to update location');
    }
  }
};
