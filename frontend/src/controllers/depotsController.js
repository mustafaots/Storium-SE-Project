import { depotsAPI } from '../utils/depotsAPI';

export const depotsController = {
  loadDepots: async (
    locationId,
    setDepots,
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

      const response = await depotsAPI.getAll(locationId, page, limit, search);

      if (response.success) {
        setDepots(response.data || []);
        if (response.pagination && setPagination) {
          setPagination({
            currentPage: response.pagination.page,
            pageSize: response.pagination.limit,
            totalCount: response.pagination.total,
            totalPages: response.pagination.pages
          });
        }
      } else {
        setError(response.error || 'Failed to load depots');
      }
    } catch (error) {
      setError(error.message || 'Failed to load depots');
    } finally {
      setLoading(false);
    }
  },

  deleteDepot: async (locationId, id, setDepots, setLoading, setError, onSuccess) => {
    try {
      setLoading(true);
      const response = await depotsAPI.delete(locationId, id);
      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Failed to delete depot');
      }
    } catch (error) {
      setError(error.message || 'Failed to delete depot');
    } finally {
      setLoading(false);
    }
  },

  createDepot: async (locationId, formData, onSuccess, onError, onFormSuccess) => {
    try {
      const response = await depotsAPI.create(locationId, formData);
      if (response.success) {
        onFormSuccess();
        onSuccess();
      } else {
        onError(response.error || 'Failed to create depot');
      }
    } catch (error) {
      onError(error.message || 'Failed to create depot');
    }
  },

  updateDepot: async (locationId, id, formData, onSuccess, onError, onFormSuccess) => {
    try {
      const response = await depotsAPI.update(locationId, id, formData);
      if (response.success) {
        onFormSuccess();
        onSuccess();
      } else {
        onError(response.error || 'Failed to update depot');
      }
    } catch (error) {
      onError(error.message || 'Failed to update depot');
    }
  }
};
