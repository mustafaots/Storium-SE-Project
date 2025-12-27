import { useState, useEffect, useCallback } from 'react';
import { transactionsAPI } from '../utils/transactionsAPI';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [filterType, setFilterType] = useState('mixed'); // mixed, automatic, manual
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });

//   const loadTransactions = useCallback(
//     (page = 1, pageSize = 10, search = '') => {
//       setLoading(true);
//       setError('');
//       transactionsAPI
//         .getTransactions({
//           page,
//           pageSize,
//           filterType,
//           dateFilter,
//           search
//         })
//         .then((response) => {
//           console.log('TXN response', response);
//           if (response.success) {
//             setTransactions(response.data || []);
//             if (response.pagination) {
//               setPagination({
//                 currentPage: response.pagination.currentPage,
//                 pageSize: response.pagination.pageSize,
//                 totalCount: response.pagination.totalCount,
//                 totalPages: response.pagination.totalPages
//               });
//             }
//           } else {
//             setError(response.error || 'Failed to load transactions');
//           }
//         })
//         .catch((err) => {
//           setError(err.message || 'Failed to load transactions');
//         })
//         .finally(() => {
//           setLoading(false);
//         });
//     },
//     [filterType, dateFilter]
//   );

const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await transactionsAPI.getTransactions({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        filterType,
        dateFilter,
        search: searchTerm
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to load transactions');
      }

      setTransactions(response.data || []);

      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          totalCount: response.pagination.totalCount,
          totalPages: response.pagination.totalPages
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [
    pagination.currentPage,
    pagination.pageSize,
    filterType,
    dateFilter,
    searchTerm
  ]);

  const reloadFirstPage = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await transactionsAPI.getTransactions({
        page: 1,
        pageSize: pagination.pageSize,
        filterType,
        dateFilter,
        search: searchTerm
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to load transactions');
      }

      setTransactions(response.data || []);
      setPagination(prev => ({
        ...prev,
        currentPage: 1,
        totalCount: response.pagination?.totalCount ?? 0,
        totalPages: response.pagination?.totalPages ?? 0
      }));
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize, filterType, dateFilter, searchTerm]);

  const clearTransactions = useCallback(async () => {
    await transactionsAPI.clearTransactions();
    await reloadFirstPage();
  }, [reloadFirstPage]);


   /**
   * Reset page ONLY when filters/search change
   */
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  }, [searchTerm, filterType, dateFilter]);

  /**
   * Load data when pagination or filters change
   */
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);



//   const handlePageChange = useCallback(
//     (newPage) => {
//       loadTransactions(newPage, pagination.pageSize, searchTerm);
//     },
//     [loadTransactions, pagination.pageSize, searchTerm]
//   );
const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  }, []);

//   const handlePageSizeChange = useCallback(
//     (newSize) => {
//       loadTransactions(1, newSize, searchTerm);
//     },
//     [loadTransactions, searchTerm]
//   );

const handlePageSizeChange = useCallback((newSize) => {
    setPagination(prev => ({
      ...prev,
      pageSize: newSize,
      currentPage: 1
    }));
  }, []);

//   useEffect(() => {
//     loadTransactions(1, pagination.pageSize, searchTerm);
//   }, [loadTransactions, pagination.pageSize, searchTerm]);

  return {
    // data 
    
    transactions,
    loading,
    error,

    // filters
    filterType,
    setFilterType,
    dateFilter,
    setDateFilter,
    searchTerm,
    setSearchTerm,

    // pagination
    pagination,

    //handlers
    loadTransactions,
    reloadFirstPage,
    clearTransactions,
    handlePageChange,
    handlePageSizeChange,
    
    //misc 
    setError
  };
};
