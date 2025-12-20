// import styles from './TransactionsPage.module.css';
// import NavBar from '../../components/UI/NavBar/NavBar';
// import Header from '../../components/UI/Header/Header.jsx';
// import Table from '../../components/Layout/Table/table.jsx';  
// import { useActiveNavItem } from '../../hooks/useActiveNavItem';
// import ExportModal from '../../components/UI/Export/export.jsx';
// import { exportToCSV, exportToPDF, prepareDataForExport } from '../../utils/export.js';
// import { useState, useMemo , useEffect } from 'react';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { transactionsAPI } from '../../utils/transactionsAPI';
// import DataTable from '../../components/UI/DataTable/DataTable.jsx';
// import { transactionsConfig } from '../../config/transactionsConfig.jsx';
// import { 
//   FaSearch, 
//   FaFilter, 
//   FaExchangeAlt,
//   FaCalendarAlt, 
//   FaTimes as X, 
//   FaEdit, 
//   FaTrashAlt, 
//   FaEye, 
//   FaUser,
//   FaPlus, 
//   FaChevronDown, 
//   FaChevronUp ,
//   FaFileExport
// } from 'react-icons/fa';

// import { useTransactionsController } from '../../hooks/useTransactions';

// // testing :
// import {
//   makeManualOutflowPayload,
//   makeManualInflowPayload,
//   makeTransferPayload,
//   makeAdjustmentPayload
// } from '../../utils/transactionPayloads'; 

// function TransactionsPage() {
//     const activeItem = useActiveNavItem();
//     const [transactions, setTransactions] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [searchQuery, setSearchQuery] = useState("")
//     const [dateFilter, setDateFilter] = useState("all")
//     const [filterType, setFilterType] = useState('mixed'); // mixed, automatic, manual
//     const [searchTerm, setSearchTerm] = useState('');
//     const [showExportModal, setShowExportModal] = useState(false);
//     const [pagination, setPagination] = useState({
//     currentPage: 1,
//     pageSize: 10,
//     totalCount: 0,
//     totalPages: 1
//     });


//     useEffect(() => {
//         const fetchTransactions = async () => {
//             try {
//             setLoading(true);
//             setError(null);

//             const response = await transactionsAPI.getTransactions({
//                 filterType,
//                 dateFilter,
//                 search: searchTerm,
//                 page: pagination.currentPage,
//                 pageSize: pagination.pageSize
//             });
//             console.log('transactions response', response);

//             if (response.success) {
//                 setTransactions(response.data || []);

//                 if (response.pagination) {
//                 setPagination(prev => ({
//                     ...prev,
//                     currentPage: response.pagination.currentPage,
//                     pageSize: response.pagination.pageSize,
//                     totalCount: response.pagination.totalCount,
//                     totalPages: response.pagination.totalPages
//                 }));
//                 }
//             } else {
//                 setError(response.error || 'Failed to load transactions');
//             }
//             } catch (err) {
//             setError(err.message || 'Failed to load transactions');
//             } finally {
//             setLoading(false);
//             }
//         };

//         fetchTransactions();
//         }, [filterType, dateFilter, searchTerm, pagination.currentPage, pagination.pageSize]);

//         useEffect(() => {
//         console.log('pagination state', pagination);
//         }, [pagination]);

//     // handel Export CSV
//     const handleExportCSV = () => {
//         // Use the already filtered transactions (includes date, type, and search filters)
//         const dataToExport = filteredTransactions.map(item => ({
//             'Timestamp': item.timestamp,
//             ...(filterType === 'automatic' && { 'Routine': `R${item.routine_id}` }),
//             ...(filterType !== 'automatic' && { 'Type': item.is_automated ? `R${item.routine_id}` : 'Manual' }),
//             'Action': item.notes
//         }));
        
//         exportToCSV(dataToExport, 'transactions');
//         setShowExportModal(false);
//     };


//     // Handle PDF Export
//     const handleExportPDF = () => {
//         // Use the already filtered transactions (includes date, type, and search filters)
//         let columns = [];
//         if (filterType === 'automatic') {
//             columns = [
//                 { key: 'timestamp', label: 'Timestamp' },
//                 { key: 'routine_id', label: 'Routine' },
//                 { key: 'notes', label: 'Action' }
//             ];
//         } else if (filterType === 'manual') {
//             columns = [
//                 { key: 'timestamp', label: 'Timestamp' },
//                 { key: 'notes', label: 'Action' }
//             ];
//         } else {
//             // mixed
//             columns = [
//                 { key: 'timestamp', label: 'Timestamp' },
//                 { key: 'type', label: 'Type' },
//                 { key: 'notes', label: 'Action' }
//             ];
//         }

        

//         // Transform data for PDF export
//         const pdfData = filteredTransactions.map(item => ({
//             ...item,
//             type: item.is_automated ? `R${item.routine_id}` : 'Manual'
//         }));
        
//         exportToPDF(pdfData, columns, 'Transactions Report', 'transactions');
//         setShowExportModal(false);
//     };

//     const filteredTransactions = transactions;
//     const transactionColumns = transactionsConfig.columns(styles, filterType);

//     const handlePageChange = (newPage) => {
//     setPagination(prev => ({ ...prev, currentPage: newPage }));
//     };

//     const handlePageSizeChange = (newSize) => {
//     setPagination(prev => ({
//         ...prev,
//         pageSize: newSize,
//         currentPage: 1
//     }));
//     };


    
// // testing 
// // inside TransactionsPage component
// const handleTestManualOutflow = async () => {
//   try {
//     const payload = makeManualOutflowPayload({
//       stockId: 1,
//       productId: 1,
//       slotId: 1,
//       clientId: 1,
//       quantity: 5,
//       unitPrice: 10,
//       note: 'Manual outflow from UI test'
//     });

//     await transactionsAPI.manualOutflow(payload);
//     const response = await transactionsAPI.getTransactions({ /* same as before */ });
//     if (response.success) {
//       setTransactions(response.data || []);
//       if (response.pagination) setPagination(response.pagination);
//     }
//   } catch (err) {
//     setError(err.message || 'Failed to create manual outflow');
//   }
// };


// const handleTestManualInflow = async () => {
//   try {
//     await transactionsAPI.manualInflow({
//       stockId: 1,
//       productId: 1,
//       toSlotId: 1,
//       sourceId: 1,
//       quantity: 20,
//       unitPrice: 5,
//       note: 'Manual inflow from UI test'
//     });
//     // reload transactions
//     const response = await transactionsAPI.getTransactions({
//       filterType,
//       dateFilter,
//       search: searchTerm,
//       page: pagination.currentPage,
//       pageSize: pagination.pageSize
//     });
//     if (response.success) {
//       setTransactions(response.data || []);
//       if (response.pagination) setPagination(response.pagination);
//     }
//   } catch (err) {
//     console.error('manual inflow error', err);
//     setError(err.message || 'Failed to create manual inflow');
//   }
// };

// const handleTestTransfer = async () => {
//   try {
//     await transactionsAPI.transfer({
//       productId: 1,
//       fromStockId: 1,   // exists in stocks
//       toStockId: 4,     // must be 4, not 2
//       fromSlotId: 1,    // slot_id for stock_id 1
//       toSlotId: 2,      // slot_id for stock_id 4
//       quantity: 5,
//       note: 'Transfer from UI test'
//     });
//     const response = await transactionsAPI.getTransactions({
//       filterType,
//       dateFilter,
//       search: searchTerm,
//       page: pagination.currentPage,
//       pageSize: pagination.pageSize
//     });
//     if (response.success) {
//       setTransactions(response.data || []);
//       if (response.pagination) setPagination(response.pagination);
//     }
//   } catch (err) {
//     console.error('transfer error', err);
//     setError(err.message || 'Failed to create transfer');
//   }
// };


// const handleTestAdjustment = async () => {
//   try {
//     await transactionsAPI.adjustment({
//       stockId: 1,
//       productId: 1,
//       slotId: 1,
//       quantityDelta: 3,
//       unitPrice: 5,
//       note: 'Adjustment +3 from UI test',
//       isAutomated: false
//     });
//     const response = await transactionsAPI.getTransactions({
//       filterType,
//       dateFilter,
//       search: searchTerm,
//       page: pagination.currentPage,
//       pageSize: pagination.pageSize
//     });
//     if (response.success) {
//       setTransactions(response.data || []);
//       if (response.pagination) setPagination(response.pagination);
//     }
//   } catch (err) {
//     console.error('adjustment error', err);
//     setError(err.message || 'Failed to create adjustment');
//   }
// };


//     return (
//         <div className={styles.pageWrapper}>
//              {/* <div className={styles.mainContent}>  */}
//                 <div className={styles.comingSoon}>
//                   <div className={styles.content}>
//                         <Header 
//                           title="TRANSACTIONS" 
//                           subtitle="Manage and track all inventory transactions" 
//                           icon={<FaExchangeAlt size={30}/>}
//                           size='small'
//                           align='left'
//                         />

//                         {/* Filter Row - All in one line below the title */}
//                         <div className={styles.filterRow}>
                          
                            
//                                     {/* Filter Tabs */}
//                                     <div className={styles.filterTabs}>
//                                         <button 
//                                         className={`${styles.tab} ${filterType === 'automatic' ? styles.active : ''}`}
//                                         onClick={() => setFilterType('automatic')}
//                                         >
//                                         Automatic
//                                         </button>
//                                         <button 
//                                         className={`${styles.tab} ${filterType === 'manual' ? styles.active : ''}`}
//                                         onClick={() => setFilterType('manual')}
//                                         >
//                                         Manual
//                                         </button>
//                                         <button 
//                                         className={`${styles.tab} ${filterType === 'mixed' ? styles.active : ''}`}
//                                         onClick={() => setFilterType('mixed')}
//                                         >
//                                         Mixed
//                                         </button>
//                                    </div>
                        
//                                 {/* filter by time range */}
                            
//                                     <div className="flex gap-2">
//                                     <select
//                                         value={dateFilter}
//                                         onChange={(e) => setDateFilter(e.target.value)}
//                                     className={styles.customSelect}
//                                     >
//                                         <option value="today" className="bg-discord-gray-dark text-text-light">Today</option>
//                                         <option value="week" className="bg-discord-gray-dark text-text-light">This Week</option>
//                                         <option value="month" className="bg-discord-gray-dark text-text-light">This Month</option>
//                                         <option value="all" className="bg-discord-gray-dark text-text-light">All </option>
//                                     </select>
//                                     </div>
                            
//                                     <div className={styles.searchBox}>
//                                     <FaSearch className={styles.searchIcon} />
//                                     <input
//                                         type="text"
//                                         placeholder="Search transactions..."
//                                         value={searchTerm}
//                                         onChange={(e) => setSearchTerm(e.target.value)}
//                                         className={styles.searchInput}
//                                     />
//                                     </div>
                            
//                                     {/* Export Button */}
//                                     <button 
//                                         className={styles.exportBtn}
//                                         onClick={() => setShowExportModal(true)}
//                                     >
//                                         <FaFileExport className={styles.exportIcon} />
//                                         Export Table
//                                     </button>
                                    
//                                       {/* Export Modal */}
//                                     <ExportModal
//                                         isOpen={showExportModal}
//                                         onClose={() => setShowExportModal(false)}
//                                         onExportCSV={handleExportCSV}
//                                         onExportPDF={handleExportPDF}
//                                     />
//                             </div>
                      
//                            {/* Transactions Table */}
//                            {loading && <p>Loading transactions...</p>}
//                            {error && <p style={{ color: 'red' }}>{error}</p>}
//                                {!loading && !error && (
//                                     <DataTable
//                                         data={filteredTransactions}
//                                         columns={transactionColumns}
//                                         keyField="txn_id"
//                                         loading={loading}
//                                         emptyMessage="No transactions found"
//                                         className={styles.transactionsTable}
//                                         pagination={pagination}
//                                         onPageChange={handlePageChange}
//                                         onPageSizeChange={handlePageSizeChange}
//                                         showPagination={true}
//                                         showSearch={false}
//                                         />
//                                     )}
//                                    // testing 
//                                     <div className={styles.debugButtons}>
//                                     <button onClick={handleTestManualOutflow}>Test Manual Outflow</button>
//                                     <button onClick={handleTestManualInflow}>Test Manual Inflow</button>
//                                     <button onClick={handleTestTransfer}>Test Transfer</button>
//                                     <button onClick={handleTestAdjustment}>Test Adjustment</button>
//                                     </div>



//                     </div>
//                 {/* </div> */}
//             </div>
//             <NavBar activeItem={activeItem} />
//         </div>
//         // </div>
//     );
// }

// export default TransactionsPage;

import styles from './TransactionsPage.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';
import Header from '../../components/UI/Header/Header.jsx';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import ExportModal from '../../components/UI/Export/export.jsx';
import { exportToCSV, exportToPDF } from '../../utils/export.js';
import { useState } from 'react';
import DataTable from '../../components/UI/DataTable/DataTable.jsx';
import { transactionsConfig } from '../../config/transactionsConfig.jsx';
import { FaSearch, FaExchangeAlt, FaFileExport } from 'react-icons/fa';
import { useTransactions } from '../../hooks/useTransactions';
import Pagination from '../../components/UI/Pagination/Pagination.jsx'; 


function TransactionsPage() {
  const activeItem = useActiveNavItem();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const formatSlotContext = (txn, side) => {
    const isFrom = side === 'from';
    const locationName = isFrom ? txn?.from_location_name : txn?.to_location_name;
    const depotName = isFrom ? txn?.from_depot_name : txn?.to_depot_name;
    const rackCode = isFrom ? txn?.from_rack_code : txn?.to_rack_code;
    const slotId = isFrom ? txn?.from_slot_id : txn?.to_slot_id;

    const parts = [locationName, depotName, rackCode].filter(Boolean);
    if (slotId) parts.push(`Slot ${slotId}`);

    return parts.length ? parts.join(' · ') : '—';
  };

  const {
    transactions,
    loading,
    error,
    filterType,
    setFilterType,
    dateFilter,
    setDateFilter,
    searchTerm,
    setSearchTerm,
    pagination,
    setError,
    loadTransactions,
    handlePageChange,
    handlePageSizeChange
  } = useTransactions();

  const filteredTransactions = transactions;

   const handleShowDetails = (txn) => {
    setSelectedTransaction(txn);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedTransaction(null);
  };



  const transactionColumns = transactionsConfig.columns(styles, filterType, {
    onShowDetails: handleShowDetails
  });

  const handleExportCSV = () => {
    const dataToExport = filteredTransactions.map(item => ({
      'Transaction ID': item.txn_id,
      'Timestamp': item.timestamp,
      'Type': item.txn_type,
      'Automated': item.is_automated ? 'Yes' : 'No',
      'Routine': item.routine_id ? `R${item.routine_id}` : '',
      'Product': item.product_name || (item.product_id ? `ID ${item.product_id}` : ''),
      'Source': item.source_name || (item.source_id ? `ID ${item.source_id}` : ''),
      'Client': item.client_name || (item.client_id ? `ID ${item.client_id}` : ''),
      'Quantity': item.quantity,
      'Total Value': item.total_value,
      'From Slot ID': item.from_slot_id || '',
      'To Slot ID': item.to_slot_id || '',
      'Reference': item.reference_number || '',
      'Notes': item.notes || ''
    }));
    exportToCSV(dataToExport, 'transactions');
    setShowExportModal(false);
  };

  const handleExportPDF = () => {
    const columns = [
      { key: 'txn_id', label: 'ID' },
      { key: 'timestamp', label: 'Timestamp' },
      { key: 'txn_type', label: 'Type' },
      { key: 'automated', label: 'Auto' },
      { key: 'product', label: 'Product' },
      { key: 'source', label: 'Source' },
      { key: 'client', label: 'Client' },
      { key: 'quantity', label: 'Qty' },
      { key: 'total_value', label: 'Value' },
      { key: 'from_slot_id', label: 'From Slot' },
      { key: 'to_slot_id', label: 'To Slot' },
      { key: 'notes', label: 'Notes' }
    ];

    const pdfData = filteredTransactions.map(item => ({
      txn_id: item.txn_id,
      timestamp: item.timestamp,
      txn_type: item.txn_type,
      automated: item.is_automated ? 'Yes' : 'No',
      product: item.product_name || (item.product_id ? `ID ${item.product_id}` : '—'),
      source: item.source_name || (item.source_id ? `ID ${item.source_id}` : '—'),
      client: item.client_name || (item.client_id ? `ID ${item.client_id}` : '—'),
      quantity: item.quantity,
      total_value: item.total_value,
      from_slot_id: item.from_slot_id || '—',
      to_slot_id: item.to_slot_id || '—',
      notes: item.notes || '—'
    }));

    exportToPDF(pdfData, columns, 'Transactions Report', 'transactions');
    setShowExportModal(false);
  };

  

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContent}>
        <div className={styles.content}>
          <div className={styles.listContainer}>
            <Header
              title="TRANSACTIONS"
              subtitle="Manage and track all inventory transactions"
              icon={<FaExchangeAlt size={30} />}
              size="small"
              align="left"
            />

            {error && (
              <div className={styles.errorAlert}>
                <div className={styles.errorContent}>
                  <span className={styles.errorMessage}>{error}</span>
                  <button onClick={() => setError('')} className={styles.closeBtn}>
                    ×
                  </button>
                </div>
              </div>
            )}

            <div className={styles.filterRow}>
              <div className={styles.filterTabs}>
                <button
                  className={`${styles.tab} ${
                    filterType === 'automatic' ? styles.active : ''
                  }`}
                  onClick={() => setFilterType('automatic')}
                >
                  Automatic
                </button>
                <button
                  className={`${styles.tab} ${
                    filterType === 'manual' ? styles.active : ''
                  }`}
                  onClick={() => setFilterType('manual')}
                >
                  Manual
                </button>
                <button
                  className={`${styles.tab} ${
                    filterType === 'mixed' ? styles.active : ''
                  }`}
                  onClick={() => setFilterType('mixed')}
                >
                  Mixed
                </button>
              </div>

              <div className={styles.filtersWrapper}>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={styles.customSelect}
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All</option>
                </select>
              </div>

              <div className={styles.searchBox}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
   
              <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalCount}
                  pageSize={pagination.pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  className={styles.inlinePagination}
                />
              <button
                className={styles.exportBtn}
                onClick={() => setShowExportModal(true)}
              >
                <FaFileExport className={styles.exportIcon} />
                Export Table
              </button>

              <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onExportCSV={handleExportCSV}
                onExportPDF={handleExportPDF}
              />
            </div>

            {loading && filteredTransactions.length === 0 ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingContent}>
                  <h2>Loading Transactions...</h2>
                  <p>Please wait while we fetch your transaction data</p>
                </div>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyContent}>
                  <h2>No Transactions Found</h2>
                  <p>There are no transactions to display.</p>
                </div>
              </div>
            ) : (
              <>
                <DataTable
                  data={filteredTransactions}
                  columns={transactionColumns}
                  keyField="txn_id"
                  loading={loading}
                  emptyMessage="No transactions found"
                  className={styles.transactionsTable}
                  pagination={null}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  showPagination={false}
                  showSearch={false}
                />

                  {/* NEW: Separate container for pagination info */}
                  {pagination.totalCount > 0 && (
                      <div className={styles.paginationInfoContainer}>
                        <div className={styles.paginationInfo}>
                          <span className={styles.resultsText}>
                            Showing <strong>{(pagination.currentPage - 1) * pagination.pageSize + 1}</strong>
                            {' '}to <strong>{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)}</strong>
                            {' '}of <strong>{pagination.totalCount}</strong> transactions
                          </span>
                        </div>
                      </div>
                    )}


                 
                  <div className={styles.actionsContainer}>
                    <div className={styles.buttonGroup}>
                      {/* <button
                        className={styles.exportBtn}
                        onClick={() => setShowExportModal(true)}
                      >
                        <FaFileExport className={styles.exportIcon} />
                        Export Table
                      </button> */}
                    </div>
                  </div>
              </>
            )}

            {/* Details dialog */}
            {showDetails && selectedTransaction && (
              <div className={styles.detailsOverlay}>
                <div className={styles.detailsCard}>
                  <div className={styles.detailsHeader}>
                    <h3>Transaction details</h3>
                    <button
                      type="button"
                      className={styles.detailsClose}
                      onClick={handleCloseDetails}
                    >
                      ×
                    </button>
                  </div>

                  <div className={styles.detailsBody}>
                    <p><strong>Transaction ID:</strong> {selectedTransaction.txn_id}</p>
                    <p><strong>Timestamp:</strong> {selectedTransaction.timestamp}</p>
                    <p><strong>Type:</strong> {selectedTransaction.txn_type}</p>
                    <p><strong>Automated:</strong> {selectedTransaction.is_automated ? 'Yes' : 'No'}</p>
                    {selectedTransaction.routine_id && (
                      <p><strong>Routine:</strong> R{selectedTransaction.routine_id}</p>
                    )}

                    <hr />

                    <p>
                      <strong>Product:</strong>{' '}
                      {selectedTransaction.product_name ||
                        (selectedTransaction.product_id
                          ? `ID ${selectedTransaction.product_id}`
                          : '—')}
                    </p>
                    <p>
                      <strong>Source:</strong>{' '}
                      {selectedTransaction.source_name ||
                        (selectedTransaction.source_id
                          ? `ID ${selectedTransaction.source_id}`
                          : '—')}
                    </p>
                    <p>
                      <strong>Client:</strong>{' '}
                      {selectedTransaction.client_name ||
                        (selectedTransaction.client_id
                          ? `ID ${selectedTransaction.client_id}`
                          : '—')}
                    </p>

                    <hr />

                    <p><strong>Quantity:</strong> {selectedTransaction.quantity}</p>
                    <p><strong>Total value:</strong> {selectedTransaction.total_value}</p>
                    <p><strong>From:</strong> {formatSlotContext(selectedTransaction, 'from')}</p>
                    <p><strong>To:</strong> {formatSlotContext(selectedTransaction, 'to')}</p>

                    <hr />

                    <p><strong>Reference:</strong> {selectedTransaction.reference_number || '—'}</p>
                    <p><strong>Notes:</strong> {selectedTransaction.notes || '—'}</p>
                  </div>
                </div>
              </div>
            )}

                     
          
            
          </div>
        </div>
      </div>
      <NavBar activeItem={activeItem} />
    </div>
  );
}

export default TransactionsPage;
