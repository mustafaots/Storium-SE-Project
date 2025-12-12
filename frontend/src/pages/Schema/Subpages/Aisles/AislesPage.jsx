import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaStream } from 'react-icons/fa';

import NavBar from '../../../../components/UI/NavBar/NavBar';
import Header from '../../../../components/UI/Header/Header';
import Button from '../../../../components/UI/Button/Button';
import DataTable from '../../../../components/UI/DataTable/DataTable';
import AisleForm from '../../../../components/Layout/AislesLayout/AisleForm';
import useTableSearch from '../../../../hooks/useTableSearch';
import { useActiveNavItem } from '../../../../hooks/useActiveNavItem';
import { useAisles } from '../../../../hooks/useAisles';
import { aislesConfig } from '../../../../config/aislesConfig';
import { aislesHandlers } from '../../../../handlers/aislesHandlers';
import { aislesController } from '../../../../controllers/aislesController';

import styles from './AislesPage.module.css';

export const AislesPage = () => {
  const { locationId, depotId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const activeItem = useActiveNavItem();

  const locationName = state?.locationName || state?.location?.name;
  const depotName = state?.depotName || state?.depot?.name;

  const {
    aisles,
    loading,
    error,
    showForm,
    isEditing,
    currentAisle,
    pagination,
    setError,
    setShowForm,
    setIsEditing,
    setCurrentAisle,
    loadAisles,
    deleteAisle,
    handlePageChange,
    handlePageSizeChange
  } = useAisles(locationId, depotId);

  const search = useTableSearch('');

  useEffect(() => {
    if (locationId && depotId) {
      loadAisles(1, pagination.pageSize, search.debouncedSearch);
    }
  }, [locationId, depotId, search.debouncedSearch, loadAisles, pagination.pageSize]);

  const reloadCurrent = useMemo(
    () => () => loadAisles(pagination.currentPage, pagination.pageSize, search.debouncedSearch),
    [loadAisles, pagination.currentPage, pagination.pageSize, search.debouncedSearch]
  );

  const onFormSuccess = useMemo(
    () => () => aislesHandlers.onFormSuccess(
      setShowForm,
      setIsEditing,
      setCurrentAisle,
      reloadCurrent
    ),
    [reloadCurrent, setCurrentAisle, setIsEditing, setShowForm]
  );

  const handlers = useMemo(() => ({
    onViewRacks: (aisle) => navigate(`/locations/${locationId}/depots/${depotId}/aisles/${aisle.aisle_id}/racks`, {
      state: {
        locationName,
        depotName,
        aisleName: aisle.name
      }
    }),
    onEdit: (aisle) => aislesHandlers.onEdit(
      aisle,
      setCurrentAisle,
      setIsEditing,
      setShowForm,
      setError
    ),
    onNew: () => aislesHandlers.onNew(
      setCurrentAisle,
      setIsEditing,
      setShowForm,
      setError
    ),
    onFormSuccess,
    onCancel: () => aislesHandlers.onCancel(
      setShowForm,
      setIsEditing,
      setCurrentAisle,
      setError
    ),
    onDelete: (id) => aislesHandlers.onDelete(
      id,
      (aisleId) => deleteAisle(aisleId, search.debouncedSearch)
    ),
    onCreate: (formData) => aislesController.createAisle(
      locationId,
      depotId,
      formData,
      () => {},
      setError,
      onFormSuccess
    ),
    onUpdate: (formData) => aislesController.updateAisle(
      locationId,
      depotId,
      currentAisle?.aisle_id,
      formData,
      () => {},
      setError,
      onFormSuccess
    ),
  }), [navigate, locationId, depotId, locationName, depotName, setCurrentAisle, setIsEditing, setShowForm, setError, onFormSuccess, deleteAisle, search.debouncedSearch, currentAisle?.aisle_id]);

  const columns = useMemo(
    () => aislesConfig.columns(styles, {
      onViewRacks: handlers.onViewRacks,
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

  const handleBack = () => {
    navigate(`/locations/${locationId}/depots`, {
      state: { locationName }
    });
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContent}>
        <div className={styles.content}>
          {showForm ? (
            <AisleForm
              isEditing={isEditing}
              currentAisle={currentAisle}
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
                  <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Depots
                </span>
                <div className={styles.buttonGroupInline}>
                  {locationName && (
                    <span className={styles.locationBadge}>Location: {locationName}</span>
                  )}
                  {depotName && (
                    <span className={styles.depotBadge}>Depot: {depotName}</span>
                  )}
                </div>
              </div>

              <Header
                title="AISLES"
                subtitle="Manage aisles within this depot"
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
                data={aisles}
                columns={columns}
                keyField="aisle_id"
                loading={loading}
                emptyMessage={search.debouncedSearch ? 'No aisles match this search' : 'No aisles found'}
                className={styles.aislesTable}
                pagination={pagination}
                onPageChange={(page) => handlePageChange(page, search.debouncedSearch)}
                onPageSizeChange={(size) => handlePageSizeChange(size, search.debouncedSearch)}
                showPagination={true}
                showSearch={true}
                searchPlaceholder="Search aisles..."
                onSearchChange={search.setSearchTerm}
                searchTerm={search.searchTerm}
                rightControls={(
                  <Button variant="secondary" leadingIcon={<FaStream />} onClick={handlers.onNew}>
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

export default AislesPage;
