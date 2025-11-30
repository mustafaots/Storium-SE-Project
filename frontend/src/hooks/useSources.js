// src/hooks/useSources.js
import { useState, useCallback } from 'react';
import { sourcesController } from '../controllers/sourcesController';
import { sourcesHelpers } from '../utils/sourcesHelpers';

export const useSources = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSource, setCurrentSource] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });

  const loadSources = useCallback(async (page = 1, pageSize = 10, search = '') => {
    try {
      setLoading(true);
      setError('');

      await sourcesController.loadSources(
        (rows) => {
          const normalized = (rows || []).map(r => sourcesHelpers.normalize(r));
          setSources(normalized);
        },
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
    } catch (err) {
      setError(err?.message || String(err));
    }
  }, []);

  const handlePageChange = useCallback((newPage) => {
    loadSources(newPage, pagination.pageSize);
  }, [loadSources, pagination.pageSize]);

  const handlePageSizeChange = useCallback((newSize) => {
    loadSources(1, newSize);
  }, [loadSources]);

  const deleteSource = useCallback(async (id) => {
    try {
      setLoading(true);
      setError('');
      await sourcesController.deleteSource(
        id,
        () => loadSources(pagination.currentPage, pagination.pageSize),
        (errMsg) => setError(errMsg || 'Failed to delete source')
      );
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [loadSources, pagination.currentPage, pagination.pageSize]);

  return {
    sources,
    loading,
    error,
    showForm,
    isEditing,
    currentSource,
    pagination,
    setSources,
    setLoading,
    setError,
    setShowForm,
    setIsEditing,
    setCurrentSource,
    loadSources,
    deleteSource,
    handlePageChange,
    handlePageSizeChange
  };
};

export default useSources;