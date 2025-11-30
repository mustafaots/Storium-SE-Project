import { useEffect, useRef } from 'react';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import NavBar from '../../components/UI/NavBar/NavBar';
import Header from '../../components/UI/Header/Header';
import Button from '../../components/UI/Button/Button';
import DataTable from '../../components/UI/DataTable/DataTable';
import SourceForm from '../../components/Layout/SourcesLayout/SourceForm';
import { FaTruck, FaFile, FaPlus } from 'react-icons/fa';

import { useSources } from '../../hooks/useSources';
import { sourcesHandlers } from '../../handlers/sourcesHandlers';
import { sourcesConfig } from '../../config/sourcesConfig';
import useTableSearch from '../../hooks/useTableSearch';
import styles from './SourcesPage.module.css';

function SourcesPage() {
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

  const search = useTableSearch('');
  const activeItem = useActiveNavItem();
  const hasInitialLoaded = useRef(false);

  // Initial load ONLY
  useEffect(() => {
    if (!hasInitialLoaded.current) {
      hasInitialLoaded.current = true;
      loadSources(1, 10, '');
    }
  }, []);

  // Search changes (skip first render)
  useEffect(() => {
    if (hasInitialLoaded.current) {
      loadSources(1, pagination.pageSize, search.debouncedSearch);
    }
  }, [search.debouncedSearch]);

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
    onDelete: (id, sourceName) => sourcesHandlers.handleDelete(id, deleteSource, sourceName),
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange
  };

  const sourceColumns = sourcesConfig.columns(styles, handlers);

  // DEBUG: watch important state
  useEffect(() => {
    console.debug('[SourcesPage] state', { loading, error, showForm, sourcesLength: sources?.length ?? 0, pagination });
  }, [loading, error, showForm, sources, pagination]);

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
              ) : (!sources || sources.length === 0) ? (
                <EmptyState onAddSource={handlers.onNewSource} />
              ) : (
                <>
                  <DataTable
                    data={sources || []}
                    columns={sourceColumns}
                    keyField="source_id"
                    loading={loading}
                    emptyMessage="No sources found"
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    showPagination
                    showSearch
                    searchPlaceholder="Search sources..."
                    onSearchChange={search.setSearchTerm}
                    searchTerm={search.searchTerm}
                  />

                  {pagination.totalCount > 0 && (
                    <div className={styles.paginationInfoContainer}>
                      <div className={styles.paginationInfo}>
                        <span className={styles.resultsText}>
                          Showing <strong>{(pagination.currentPage - 1) * pagination.pageSize + 1}</strong> to <strong>{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)}</strong> of <strong>{pagination.totalCount}</strong> sources
                        </span>
                        {search.debouncedSearch && (
                          <span className={styles.searchInfo}>
                            matching "<strong>{search.debouncedSearch}</strong>"
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className={styles.actionsContainer}>
                    <div className={styles.buttonGroup}>
                      <Button variant="secondary" leadingIcon={<FaPlus />} onClick={handlers.onNewSource}>
                        Add
                      </Button>
                      <Button variant="primary" leadingIcon={<FaFile />} onClick={() => {}}>
                        Export
                      </Button>
                    </div>
                  </div>
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

const EmptyState = ({ onAddSource }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyContent}>
      <h2>No Sources Found</h2>
      <p>Create your first source to get started</p>
      <button onClick={onAddSource} className={styles.primaryButton}>
        Add Your First Source
      </button>
    </div>
  </div>
);

export default SourcesPage;
