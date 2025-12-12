import { racksAPI } from '../utils/racksAPI';

export const racksController = {
  loadRacks: async (
    locationId,
    depotId,
    aisleId,
    setRacks,
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

      const response = await racksAPI.getAll(locationId, depotId, aisleId, page, limit, search);

      if (response.success) {
        setRacks(response.data || []);
        if (response.pagination && setPagination) {
          setPagination({
            currentPage: response.pagination.page,
            pageSize: response.pagination.limit,
            totalCount: response.pagination.total,
            totalPages: response.pagination.pages
          });
        }
      } else {
        setError(response.error || 'Failed to load racks');
      }
    } catch (error) {
      setError(error.message || 'Failed to load racks');
    } finally {
      setLoading(false);
    }
  },

  deleteRack: async (locationId, depotId, aisleId, id, setRacks, setLoading, setError, onSuccess) => {
    try {
      setLoading(true);
      const response = await racksAPI.delete(locationId, depotId, aisleId, id);
      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Failed to delete rack');
      }
    } catch (error) {
      setError(error.message || 'Failed to delete rack');
    } finally {
      setLoading(false);
    }
  },

  createRack: async (locationId, depotId, aisleId, formData, onSuccess, onError, onFormSuccess) => {
    try {
      const response = await racksAPI.create(locationId, depotId, aisleId, formData);
      if (response.success) {
        onFormSuccess();
        onSuccess();
      } else {
        onError(response.error || 'Failed to create rack');
      }
    } catch (error) {
      onError(error.message || 'Failed to create rack');
    }
  },

  updateRack: async (locationId, depotId, aisleId, id, formData, onSuccess, onError, onFormSuccess) => {
    try {
      const response = await racksAPI.update(locationId, depotId, aisleId, id, formData);
      if (response.success) {
        onFormSuccess();
        onSuccess();
      } else {
        onError(response.error || 'Failed to update rack');
      }
    } catch (error) {
      onError(error.message || 'Failed to update rack');
    }
  },

  loadLayout: async (locationId, depotId, aisleId, rackId, setState, setLoading, setError) => {
    try {
      setLoading(true);
      setError('');
      const response = await racksAPI.getLayout(locationId, depotId, aisleId, rackId);
      if (response.success) {
        setState(response.data);
      } else {
        setError(response.error || 'Failed to load rack layout');
      }
    } catch (error) {
      setError(error.message || 'Failed to load rack layout');
    } finally {
      setLoading(false);
    }
  },

  createStock: async (locationId, depotId, aisleId, rackId, slotId, payload, onSuccess, onError) => {
    try {
      const response = await racksAPI.createStock(locationId, depotId, aisleId, rackId, slotId, payload);
      console.log('createStock response:', response);
      if (response.success) {
        await onSuccess(response.data);
        return response;
      } else {
        const errMsg = response.error || response.message || 'Failed to create stock';
        console.error('createStock error:', errMsg);
        onError(errMsg);
        return response;
      }
    } catch (error) {
      console.error('createStock exception:', error);
      onError(error.message || 'Failed to create stock');
      return { success: false, error: error.message };
    }
  },

  moveStock: async (locationId, depotId, aisleId, rackId, stockId, targetSlotId, onSuccess, onError) => {
    try {
      const response = await racksAPI.moveStock(locationId, depotId, aisleId, rackId, stockId, targetSlotId);
      console.log('moveStock response:', response);
      if (response.success) {
        await onSuccess();
        return response;
      } else {
        const errMsg = response.error || response.message || 'Failed to move stock';
        console.error('moveStock error:', errMsg);
        onError(errMsg);
        return response;
      }
    } catch (error) {
      console.error('moveStock exception:', error);
      onError(error.message || 'Failed to move stock');
      return { success: false, error: error.message };
    }
  }
};
