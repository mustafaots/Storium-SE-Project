import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaBoxes } from 'react-icons/fa';

import NavBar from '../../../../components/UI/NavBar/NavBar';
import Header from '../../../../components/UI/Header/Header';
import Button from '../../../../components/UI/Button/Button';
import DataTable from '../../../../components/UI/DataTable/DataTable';
import RackForm from '../../../../components/Layout/RacksLayout/RackForm';
import useTableSearch from '../../../../hooks/useTableSearch';
import { useActiveNavItem } from '../../../../hooks/useActiveNavItem';
import { useRacks } from '../../../../hooks/useRacks';
import { racksConfig } from '../../../../config/racksConfig';
import { racksHandlers } from '../../../../handlers/racksHandlers';
import { racksController } from '../../../../controllers/racksController';

import styles from './RacksPage.module.css';

const RacksPage = () => {
  const { locationId, depotId, aisleId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const activeItem = useActiveNavItem();

  const locationName = state?.locationName || state?.location?.name;
  const depotName = state?.depotName || state?.depot?.name;
  const aisleName = state?.aisleName || state?.aisle?.name;

  const {
    racks,
    loading,
    error,
    showForm,
    isEditing,
    currentRack,
    pagination,
    setError,
    setShowForm,
    setIsEditing,
    setCurrentRack,
    loadRacks,
    deleteRack,
    handlePageChange,
    handlePageSizeChange
  } = useRacks(locationId, depotId, aisleId);

  const search = useTableSearch('');

  useEffect(() => {
    if (locationId && depotId && aisleId) {
      loadRacks(1, pagination.pageSize, search.debouncedSearch);
    }
  }, [locationId, depotId, aisleId, search.debouncedSearch, loadRacks, pagination.pageSize]);

  const reloadCurrent = useMemo(
    () => () => loadRacks(pagination.currentPage, pagination.pageSize, search.debouncedSearch),
    [loadRacks, pagination.currentPage, pagination.pageSize, search.debouncedSearch]
  );

  const onFormSuccess = useMemo(
    () => () => racksHandlers.onFormSuccess(
      setShowForm,
      setIsEditing,
      setCurrentRack,
      reloadCurrent
    ),
    [reloadCurrent, setCurrentRack, setIsEditing, setShowForm]
  );

  const handlers = useMemo(() => ({
    onEdit: (rack) => racksHandlers.onEdit(
      rack,
      setCurrentRack,
      setIsEditing,
      setShowForm,
      setError
    ),
    onNew: () => racksHandlers.onNew(
      setCurrentRack,
      setIsEditing,
      setShowForm,
      setError
    ),
    onFormSuccess,
    onCancel: () => racksHandlers.onCancel(
      setShowForm,
      setIsEditing,
      setCurrentRack,
      setError
    ),
    onDelete: (id) => racksHandlers.onDelete(
      id,
      (rackId) => deleteRack(rackId, search.debouncedSearch)
    ),
    onCreate: (formData) => racksController.createRack(
      locationId,
      depotId,
      aisleId,
      formData,
      () => {},
      setError,
      onFormSuccess
    ),
    onUpdate: (formData) => racksController.updateRack(
      locationId,
      depotId,
      aisleId,
      currentRack?.rack_id,
      formData,
      () => {},
      setError,
      onFormSuccess
    ),
  }), [locationId, depotId, aisleId, setCurrentRack, setIsEditing, setShowForm, setError, onFormSuccess, deleteRack, search.debouncedSearch, currentRack?.rack_id]);

  const columns = useMemo(
    () => racksConfig.columns(styles, {
      onEdit: handlers.onEdit,
      onDelete: handlers.onDelete
    }),
    [handlers]
  );

  const handleSubmit = (formData) => {
    if (isEditing) {
      return handlers.onUpdate(formData);
    }
    return handlers.onCreate(formData);
  };

  const handleRowClick = (rack) => {
    navigate(`/locations/${locationId}/depots/${depotId}/aisles/${aisleId}/racks/${rack.rack_id}`, {
      state: {
        locationName,
        depotName,
        aisleName,
        rackCode: rack.rack_code
      }
    });
  };

  const handleBack = () => {
    navigate(`/locations/${locationId}/depots/${depotId}/aisles`, {
      state: {
        locationName,
        depotName,
        aisleName
      }
    });
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContent}>
        <div className={styles.content}>
          {showForm ? (
            <RackForm
              isEditing={isEditing}
              currentRack={currentRack}
              loading={loading}
              error={error}
              onSubmit={handleSubmit}
              onCancel={handlers.onCancel}
              onError={setError}
            />
          ) : (
            <div className={styles.listContainer}>
              <div className={styles.headerRow}>
                <span className={styles.backLink} onClick={handleBack}>
                  <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Aisles
                </span>
                <div className={styles.buttonGroupInline}>
                  <div className={styles.badgeGroup}>
                    {locationName && (
                      <span className={styles.locationBadge}>Location: {locationName}</span>
                    )}
                    {depotName && (
                      <span className={styles.depotBadge}>Depot: {depotName}</span>
                    )}
                    {aisleName && (
                      <span className={styles.aisleBadge}>Aisle: {aisleName}</span>
                    )}
                  </div>
                </div>
              </div>

              <Header
                title="RACKS"
                subtitle="Manage racks within this aisle"
                size="small"
                align="left"
              />

              {error && (
                <div className={styles.errorAlert}>
                  <div className={styles.errorContent}>
                    <span className={styles.errorMessage}>{error}</span>
                    <button onClick={() => setError('')} className={styles.closeBtn}>×</button>
                  </div>
                </div>
              )}

              <DataTable
                data={racks}
                columns={columns}
                keyField="rack_id"
                loading={loading}
                emptyMessage={search.debouncedSearch ? 'No racks match this search' : 'No racks found'}
                className={styles.racksTable}
                pagination={pagination}
                onPageChange={(page) => handlePageChange(page, search.debouncedSearch)}
                onPageSizeChange={(size) => handlePageSizeChange(size, search.debouncedSearch)}
                showPagination={true}
                showSearch={true}
                searchPlaceholder="Search racks..."
                onSearchChange={search.setSearchTerm}
                searchTerm={search.searchTerm}
                onRowClick={handleRowClick}
                rightControls={(
                  <Button variant="secondary" leadingIcon={<FaBoxes />} onClick={handlers.onNew}>
                    Add
                  </Button>
                )}
              />
            </div>
          )}
        </div>
      </div>
      <NavBar activeItem={activeItem} />
    </div>
  );
};

export default RacksPage;
