// src/pages/SourcesPage.js
import { useEffect, useState } from 'react';
import NavBar from '../../components/UI/NavBar/NavBar';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import Header from '../../components/UI/Header/Header';
import Button from '../../components/UI/Button/Button';
import DataTable from '../../components/UI/DataTable/DataTable';
import SourceForm from '../../components/Layout/SourcesLayout/SourceForm';
import { FaTruck, FaFile, FaPlus } from 'react-icons/fa';
import { exportToCSV, exportToPDF } from '../../utils/export';


import { useSources } from '../../hooks/useSources';
import { sourcesHandlers } from '../../handlers/sourcesHandlers';
import { sourcesConfig } from '../../config/sourcesConfig';
import useTableSearch from '../../hooks/useTableSearch';
import { sourcesAPI } from '../../utils/sourcesAPI';
import { sourcesHelpers } from '../../utils/sourcesHelpers';
import styles from './SourcesPage.module.css';

function SourcesPage() {
  const activeItem = useActiveNavItem();

  const {
    sources,
    loading,
    error,
    showForm,
    isEditing,
    currentSource,
    pagination,
    setError,
    setShowForm,
    setIsEditing,
    setCurrentSource,
    loadSources,
    deleteSource,
    handlePageChange,
    handlePageSizeChange
  } = useSources();

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportScope, setExportScope] = useState('current');

  const search = useTableSearch('');

  useEffect(() => {
    loadSources(1, pagination.pageSize, '');
  }, []);

  useEffect(() => {
    loadSources(1, pagination.pageSize, search.debouncedSearch);
  }, [search.debouncedSearch, loadSources, pagination.pageSize]);

  const handlers = {
    onEdit: (source) => sourcesHandlers.handleEdit(
      source, setCurrentSource, setIsEditing, setShowForm, setError
    ),
    onNewSource: () => sourcesHandlers.handleNew(
      setCurrentSource, setIsEditing, setShowForm, setError
    ),
    onFormSuccess: () => sourcesHandlers.handleFormSuccess(
      setShowForm, setIsEditing, setCurrentSource,
      () => loadSources(pagination.currentPage, pagination.pageSize, search.debouncedSearch)
    ),
    onCancel: () => sourcesHandlers.handleCancel(
      setShowForm, setIsEditing, setCurrentSource, setError
    ),
    onDelete: (id) => sourcesHandlers.handleDelete(
  id, deleteSource, () => loadSources(pagination.currentPage, pagination.pageSize, search.debouncedSearch)
),


    onPageChange: (page) => handlePageChange(page, search.debouncedSearch),
    onPageSizeChange: (size) => handlePageSizeChange(size, search.debouncedSearch)
  };

  const sourceColumns = sourcesConfig.columns(styles, handlers);

  const exportHeaders = [
    { key: 'source_id', label: 'ID' },
    { key: 'source_name', label: 'Name' },
    { key: 'contact_email', label: 'Email' },
    { key: 'contact_phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    { key: 'created_at', label: 'Created' },
  ];

  const buildExportRows = (rows) => (rows || []).map((s) => ({
    source_id: s.source_id,
    source_name: s.source_name || '',
    contact_email: s.contact_email || '',
    contact_phone: sourcesHelpers.formatPhone?.(s.contact_phone) ?? s.contact_phone ?? '',
    address: s.address || '',
    created_at: sourcesHelpers.formatDate(s.created_at),
  }));

  const fetchAllSourcesForExport = async () => {
    try {
      const pageSize = 500;
      let page = 1;
      let all = [];
      let total = Infinity;

      while (all.length < total) {
        const response = await sourcesAPI.getAll(page, pageSize, '');
        if (!response.success) throw new Error(response.error || 'Failed to fetch sources');
        all = all.concat(response.data || []);
        total = response.pagination?.total ?? all.length;
        if (!response.data || response.data.length === 0) break;
        page += 1;
      }

      return buildExportRows(all);
    } catch (err) {
      setError(err.message || 'Failed to export sources');
      return [];
    }
  };

  const handleExportCSV = async () => {
    const rows = exportScope === 'current' ? buildExportRows(sources) : await fetchAllSourcesForExport();
    if (!rows.length) return;
    exportToCSV(rows, 'sources');
    setShowExportMenu(false);
  };

  const handleExportPDF = async () => {
    const rows = exportScope === 'current' ? buildExportRows(sources) : await fetchAllSourcesForExport();
    if (!rows.length) return;
    exportToPDF(rows, exportHeaders, 'Sources Report', 'sources');
    setShowExportMenu(false);
  };


  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContent}>
        <div className={styles.content}>
          {showForm ? (
            <SourceForm
              isEditing={isEditing}
              currentSource={currentSource}
              loading={loading}
              error={error}
              onSuccess={handlers.onFormSuccess}
              onCancel={handlers.onCancel}
              onError={setError}
            />
          ) : (
            <div className={styles.listContainer}>
              <Header
                title="SOURCE MANAGEMENT"
                subtitle="Manage your suppliers and source information"
                size="small"
                align="left"
                icon={<FaTruck size={30} />}
              />

              <ErrorAlert error={error} onClose={() => setError('')} />

              {loading && (!sources || sources.length === 0) ? (
                <LoadingState message="Loading Sources..." />
              ) : (
                <>
                  <DataTable
                    data={sources || []}
                    columns={sourceColumns}
                    keyField="source_id"
                    loading={loading}
                    emptyMessage={search.debouncedSearch ? 'No sources found for this search' : 'No sources found'}
                    pagination={pagination}
                    onPageChange={(page) => handlePageChange(page, search.debouncedSearch)}
                    onPageSizeChange={(size) => handlePageSizeChange(size, search.debouncedSearch)}
                    showPagination
                    showSearch
                    searchPlaceholder="Search sources..."
                    onSearchChange={search.setSearchTerm}
                    searchTerm={search.searchTerm}
                    rightControls={
                      <div className={styles.buttonGroupInline}>
                        <Button variant='secondary' leadingIcon={<FaPlus />} onClick={handlers.onNewSource}>
                          Add
                        </Button>

                        <select
                          className={styles.exportScopeSelect}
                          value={exportScope}
                          onChange={(e) => setExportScope(e.target.value)}
                        >
                          <option value="current">Current view</option>
                          <option value="all">All sources</option>
                        </select>

                        <div className={styles.exportWrapper}>
                          <Button
                            onClick={() => setShowExportMenu((prev) => !prev)}
                            variant="primary"
                            leadingIcon={<FaFile />}
                          >
                            Export
                          </Button>
                          {showExportMenu && (
                            <div className={styles.exportMenu}>
                              <button onClick={handleExportCSV}>Export CSV</button>
                              <button onClick={handleExportPDF}>Export PDF</button>
                            </div>
                          )}
                        </div>
                      </div>
                    }
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <NavBar activeItem={activeItem} />
    </div>
  );
}

// Sub-components
const ErrorAlert = ({ error, onClose }) => (
  error && (
    <div className={styles.errorAlert}>
      <div className={styles.errorContent}>
        <span className={styles.errorMessage}>{error}</span>
        <button onClick={onClose} className={styles.closeBtn}>×</button>
      </div>
    </div>
  )
);

const LoadingState = ({ message }) => (
  <div className={styles.loadingState}>
    <div className={styles.loadingContent}>
      <h2>{message}</h2>
      <p>Please wait while we fetch your source data</p>
    </div>
  </div>
);

export default SourcesPage;
