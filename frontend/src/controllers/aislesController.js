import { aislesAPI } from '../utils/aislesAPI';

export const aislesController = {
  loadAisles: async (
    locationId,
    depotId,
    setAisles,
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

      const response = await aislesAPI.getAll(locationId, depotId, page, limit, search);

      if (response.success) {
        setAisles(response.data || []);
        if (response.pagination && setPagination) {
          setPagination({
            currentPage: response.pagination.page,
            pageSize: response.pagination.limit,
            totalCount: response.pagination.total,
            totalPages: response.pagination.pages
          });
        }
      } else {
        setError(response.error || 'Failed to load aisles');
      }
    } catch (error) {
      setError(error.message || 'Failed to load aisles');
    } finally {
      setLoading(false);
    }
  },

  deleteAisle: async (locationId, depotId, id, setAisles, setLoading, setError, onSuccess) => {
    try {
      setLoading(true);
      const response = await aislesAPI.delete(locationId, depotId, id);
      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Failed to delete aisle');
      }
    } catch (error) {
      setError(error.message || 'Failed to delete aisle');
    } finally {
      setLoading(false);
    }
  },

  createAisle: async (locationId, depotId, formData, onSuccess, onError, onFormSuccess) => {
    try {
      const response = await aislesAPI.create(locationId, depotId, formData);
      if (response.success) {
        onFormSuccess();
        onSuccess();
      } else {
        onError(response.error || 'Failed to create aisle');
      }
    } catch (error) {
      onError(error.message || 'Failed to create aisle');
    }
  },

  updateAisle: async (locationId, depotId, id, formData, onSuccess, onError, onFormSuccess) => {
    try {
      const response = await aislesAPI.update(locationId, depotId, id, formData);
      if (response.success) {
        onFormSuccess();
        onSuccess();
      } else {
        onError(response.error || 'Failed to update aisle');
      }
    } catch (error) {
      onError(error.message || 'Failed to update aisle');
    }
  }
};
