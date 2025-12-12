import { useCallback, useState } from 'react';
import { racksController } from '../controllers/racksController';

export const useRackLayout = (locationId, depotId, aisleId, rackId) => {
  const [layoutData, setLayoutData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadLayout = useCallback(() => {
    racksController.loadLayout(locationId, depotId, aisleId, rackId, setLayoutData, setLoading, setError);
  }, [locationId, depotId, aisleId, rackId]);

  const createStock = useCallback((slotId, payload, onSuccess = () => {}) => {
    return racksController.createStock(locationId, depotId, aisleId, rackId, slotId, payload, onSuccess, setError);
  }, [locationId, depotId, aisleId, rackId]);

  const moveStock = useCallback((stockId, targetSlotId, onSuccess = () => {}) => {
    racksController.moveStock(locationId, depotId, aisleId, rackId, stockId, targetSlotId, onSuccess, setError);
  }, [locationId, depotId, aisleId, rackId]);

  return {
    layoutData,
    loading,
    error,
    setError,
    loadLayout,
    createStock,
    moveStock,
  };
};

export default useRackLayout;
