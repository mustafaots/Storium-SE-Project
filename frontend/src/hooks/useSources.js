// src/hooks/useSources.js
import { useState, useCallback, useEffect } from 'react';
import { sourcesController } from '../controllers/sourcesController';

export const useSources = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSource, setCurrentSource] = useState(null);

  // Pagination state (defaults can be adjusted to match clients page if desired)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });

  /**
   * Load sources (delegates normalization + setSources to controller)
   * signature: loadSources(page = 1, pageSize = 10, search = '')
   */
  const loadSources = useCallback((page = 1, pageSize = 10, search = '') => {
    sourcesController.loadSources(
      setSources,    // controller will normalize and call this
      setLoading,
      setError,
      (pg) => {
        if (pg && typeof pg === 'object') {
          setPagination({
            currentPage: pg.currentPage ?? pg.page ?? page,
            pageSize: pg.pageSize ?? pg.limit ?? pageSize,
            totalCount: pg.totalCount ?? pg.total ?? 0,
            totalPages: pg.totalPages ?? pg.pages ?? 0
          });
        }
      },
      page,
      pageSize,
      search
    );
  }, []);

  /**
   * Change page (keeps search param so callers can pass debounced search)
   * signature: handlePageChange(newPage, search = '')
   */
  const handlePageChange = useCallback((newPage, search = '') => {
    loadSources(newPage, pagination.pageSize, search);
  }, [loadSources, pagination.pageSize]);

  /**
   * Change page size -> reset to page 1
   * signature: handlePageSizeChange(newSize, search = '')
   */
  const handlePageSizeChange = useCallback((newSize, search = '') => {
    loadSources(1, newSize, search);
  }, [loadSources]);

  /**
   * Delete source wrapper that uses controller's deleteSource signature:
   * deleteSource(id, setSources, setLoading, setError, onSuccess)
   * onSuccess should refresh current page (respecting optional search)
   *
   * signature: deleteSourceById(id, search = '')
   */
  const deleteSource = useCallback((id, search = '') => {
    sourcesController.deleteSource(
      id,
      setSources,
      setLoading,
      setError,
      () => loadSources(pagination.currentPage, pagination.pageSize, search)
    );
  }, [loadSources, pagination.currentPage, pagination.pageSize]);

  // Initial load on mount (use pageSize from state)
  useEffect(() => {
    loadSources(1, pagination.pageSize, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // State
    sources,
    loading,
    error,
    showForm,
    isEditing,
    currentSource,
    pagination,

    // Setters (exposed for handlers/forms)
    setSources,
    setLoading,
    setError,
    setShowForm,
    setIsEditing,
    setCurrentSource,

    // Actions
    loadSources,
    deleteSource,
    handlePageChange,
    handlePageSizeChange
  };
};

export default useSources;
