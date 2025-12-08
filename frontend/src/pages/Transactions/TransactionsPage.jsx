import styles from './TransactionsPage.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';
import Header from '../../components/UI/Header/Header.jsx';
import Table from '../../components/Layout/Table/table.jsx';  
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import ExportModal from '../../components/UI/Export/export.jsx';
import { exportToCSV, exportToPDF, prepareDataForExport } from '../../utils/export.js';
import { useState, useMemo , useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { transactionsAPI } from '../../utils/transactionsAPI';
import DataTable from '../../components/UI/DataTable/DataTable.jsx';
import { transactionsConfig } from '../../config/transactionsConfig.jsx';
import { 
  FaSearch, 
  FaFilter, 
  FaExchangeAlt,
  FaCalendarAlt, 
  FaTimes as X, 
  FaEdit, 
  FaTrashAlt, 
  FaEye, 
  FaUser,
  FaPlus, 
  FaChevronDown, 
  FaChevronUp ,
  FaFileExport
} from 'react-icons/fa';

function TransactionsPage() {
    const activeItem = useActiveNavItem();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("")
    const [dateFilter, setDateFilter] = useState("all")
    const [filterType, setFilterType] = useState('mixed'); // mixed, automatic, manual
    const [searchTerm, setSearchTerm] = useState('');
    const [showExportModal, setShowExportModal] = useState(false);
    const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1
    });


    useEffect(() => {
        const fetchTransactions = async () => {
            try {
            setLoading(true);
            setError(null);

            const response = await transactionsAPI.getTransactions({
                filterType,
                dateFilter,
                search: searchTerm,
                page: pagination.currentPage,
                pageSize: pagination.pageSize
            });
            console.log('transactions response', response);

            if (response.success) {
                setTransactions(response.data || []);

                if (response.pagination) {
                setPagination(prev => ({
                    ...prev,
                    currentPage: response.pagination.currentPage,
                    pageSize: response.pagination.pageSize,
                    totalCount: response.pagination.totalCount,
                    totalPages: response.pagination.totalPages
                }));
                }
            } else {
                setError(response.error || 'Failed to load transactions');
            }
            } catch (err) {
            setError(err.message || 'Failed to load transactions');
            } finally {
            setLoading(false);
            }
        };

        fetchTransactions();
        }, [filterType, dateFilter, searchTerm, pagination.currentPage, pagination.pageSize]);

        useEffect(() => {
        console.log('pagination state', pagination);
        }, [pagination]);

    // handel Export CSV
    const handleExportCSV = () => {
        // Use the already filtered transactions (includes date, type, and search filters)
        const dataToExport = filteredTransactions.map(item => ({
            'Timestamp': item.timestamp,
            ...(filterType === 'automatic' && { 'Routine': `R${item.routine_id}` }),
            ...(filterType !== 'automatic' && { 'Type': item.is_automated ? `R${item.routine_id}` : 'Manual' }),
            'Action': item.notes
        }));
        
        exportToCSV(dataToExport, 'transactions');
        setShowExportModal(false);
    };


    // Handle PDF Export
    const handleExportPDF = () => {
        // Use the already filtered transactions (includes date, type, and search filters)
        let columns = [];
        if (filterType === 'automatic') {
            columns = [
                { key: 'timestamp', label: 'Timestamp' },
                { key: 'routine_id', label: 'Routine' },
                { key: 'notes', label: 'Action' }
            ];
        } else if (filterType === 'manual') {
            columns = [
                { key: 'timestamp', label: 'Timestamp' },
                { key: 'notes', label: 'Action' }
            ];
        } else {
            // mixed
            columns = [
                { key: 'timestamp', label: 'Timestamp' },
                { key: 'type', label: 'Type' },
                { key: 'notes', label: 'Action' }
            ];
        }

        

        // Transform data for PDF export
        const pdfData = filteredTransactions.map(item => ({
            ...item,
            type: item.is_automated ? `R${item.routine_id}` : 'Manual'
        }));
        
        exportToPDF(pdfData, columns, 'Transactions Report', 'transactions');
        setShowExportModal(false);
    };

    const filteredTransactions = transactions;
    const transactionColumns = transactionsConfig.columns(styles, filterType);

    const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    const handlePageSizeChange = (newSize) => {
    setPagination(prev => ({
        ...prev,
        pageSize: newSize,
        currentPage: 1
    }));
    };

    return (
        <div className={styles.pageWrapper}>
             {/* <div className={styles.mainContent}>  */}
                <div className={styles.comingSoon}>
                  <div className={styles.content}>
                        <Header 
                          title="TRANSACTIONS" 
                          subtitle="Manage and track all inventory transactions" 
                          icon={<FaExchangeAlt size={30}/>}
                          size='small'
                          align='left'
                        />

                        {/* Filter Row - All in one line below the title */}
                        <div className={styles.filterRow}>
                          
                            
                                    {/* Filter Tabs */}
                                    <div className={styles.filterTabs}>
                                        <button 
                                        className={`${styles.tab} ${filterType === 'automatic' ? styles.active : ''}`}
                                        onClick={() => setFilterType('automatic')}
                                        >
                                        Automatic
                                        </button>
                                        <button 
                                        className={`${styles.tab} ${filterType === 'manual' ? styles.active : ''}`}
                                        onClick={() => setFilterType('manual')}
                                        >
                                        Manual
                                        </button>
                                        <button 
                                        className={`${styles.tab} ${filterType === 'mixed' ? styles.active : ''}`}
                                        onClick={() => setFilterType('mixed')}
                                        >
                                        Mixed
                                        </button>
                                   </div>
                        
                                {/* filter by time range */}
                            
                                    <div className="flex gap-2">
                                    <select
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                    className={styles.customSelect}
                                    >
                                        <option value="today" className="bg-discord-gray-dark text-text-light">Today</option>
                                        <option value="week" className="bg-discord-gray-dark text-text-light">This Week</option>
                                        <option value="month" className="bg-discord-gray-dark text-text-light">This Month</option>
                                        <option value="all" className="bg-discord-gray-dark text-text-light">All </option>
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
                            
                                    {/* Export Button */}
                                    <button 
                                        className={styles.exportBtn}
                                        onClick={() => setShowExportModal(true)}
                                    >
                                        <FaFileExport className={styles.exportIcon} />
                                        Export Table
                                    </button>
                                    
                                      {/* Export Modal */}
                                    <ExportModal
                                        isOpen={showExportModal}
                                        onClose={() => setShowExportModal(false)}
                                        onExportCSV={handleExportCSV}
                                        onExportPDF={handleExportPDF}
                                    />
                            </div>
                      
                           {/* Transactions Table */}
                           {loading && <p>Loading transactions...</p>}
                           {error && <p style={{ color: 'red' }}>{error}</p>}
                               {!loading && !error && (
                                    <DataTable
                                        data={filteredTransactions}
                                        columns={transactionColumns}
                                        keyField="txn_id"
                                        loading={loading}
                                        emptyMessage="No transactions found"
                                        className={styles.transactionsTable}
                                        pagination={pagination}
                                        onPageChange={handlePageChange}
                                        onPageSizeChange={handlePageSizeChange}
                                        showPagination={true}
                                        showSearch={false}
                                        />
                                    )}

                    </div>
                {/* </div> */}
            </div>
            <NavBar activeItem={activeItem} />
        </div>
        // </div>
    );
}

export default TransactionsPage;
