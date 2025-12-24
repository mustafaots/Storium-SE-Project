import { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaFileCsv, FaFilePdf, FaProjectDiagram } from 'react-icons/fa';
import { exportToPDF } from '../../../../utils/export';

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const AislesPage = () => {
  const { locationId, depotId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const activeItem = useActiveNavItem();

  const locationName = state?.locationName || state?.location?.name;
  const depotName = state?.depotName || state?.depot?.name;

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef(null);

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format) => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      if (format === 'csv') {
        // CSV export from backend
        const resp = await fetch(`${API_BASE_URL}/depots/${depotId}/export?format=csv`);
        if (!resp.ok) throw new Error('Export failed');
        const blob = await resp.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${depotName || 'depot'}_inventory_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        // PDF export (shared helper + autotable fallback)
        const resp = await fetch(`${API_BASE_URL}/depots/${depotId}/export?format=json`);
        if (!resp.ok) throw new Error('Export failed');
        const data = await resp.json();
        const inventory = data.inventory || [];

        const rows = inventory.map((item) => ({
          product: item.product || '-',
          category: item.category || '-',
          quantity: item.quantity ?? 0,
          aisle: item.location?.aisle || '-',
          rack: item.location?.rack_code || '-',
          expiry: item.expiry ? new Date(item.expiry).toLocaleDateString() : '-',
        }));

        const columns = [
          { key: 'product', label: 'Product' },
          { key: 'category', label: 'Category' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'aisle', label: 'Aisle' },
          { key: 'rack', label: 'Rack' },
          { key: 'expiry', label: 'Expiry' },
        ];

        const title = `Inventory Report: ${data.depot?.name || depotName || 'Depot'}`;
        const filename = `${depotName || 'depot'}_inventory`;
        const result = exportToPDF(rows, columns, title, filename);
        if (result && result.success === false) {
          throw result.error;
        }
      }
    } catch (err) {
      setError(err?.message || 'Failed to export inventory');
    } finally {
      setExporting(false);
    }
  };

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
      onEdit: handlers.onEdit,
      onDelete: handlers.onDelete
    }),
    [handlers]
  );

  const handleRowClick = (aisle) => {
    navigate(`/locations/${locationId}/depots/${depotId}/aisles/${aisle.aisle_id}/racks`, {
      state: {
        locationName,
        depotName,
        aisleName: aisle.name
      }
    });
  };

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
                icon={<FaProjectDiagram size={28} />}
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
                onRowClick={handleRowClick}
                rightControls={(
                  <div className={styles.rightControlsGroup}>
                    <div className={styles.exportWrapper} ref={exportRef}>
                      <Button 
                        variant="secondary" 
                        leadingIcon={<FaDownload />} 
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        disabled={exporting}
                      >
                        {exporting ? 'Exporting...' : 'Export'}
                      </Button>
                      {showExportMenu && (
                        <div className={styles.exportDropdown}>
                          <button className={styles.exportOption} onClick={() => handleExport('csv')}>
                            <FaFileCsv /> Export as CSV
                          </button>
                          <button className={styles.exportOption} onClick={() => handleExport('pdf')}>
                            <FaFilePdf /> Export as PDF
                          </button>
                        </div>
                      )}
                    </div>
                    <Button variant="secondary" leadingIcon={<FaProjectDiagram />} onClick={handlers.onNew}>
                      Add
                    </Button>
                  </div>
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
