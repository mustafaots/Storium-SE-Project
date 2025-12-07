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

import { 
  FaSearch, 
  FaFilter, 
  FaExchangeAlt,
  FaCalendarAlt, 
  FaTimes as X, 
  FaEdit, 
  FaTrashAlt, 
  FaEye, 
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
    useEffect(() => {
        // Fetch transactions from the backend API
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await transactionsAPI.getTransactions();
                setTransactions(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch transactions');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const [activeTab, setActiveTab] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [dateFilter, setDateFilter] = useState("today")
    const [filterType, setFilterType] = useState('mixed'); // mixed, automatic, manual
    const [searchTerm, setSearchTerm] = useState('');
    const [showExportModal, setShowExportModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    
    const handleExportCSV = () => {
        // Use the already filtered transactions (includes date, type, and search filters)
        const dataToExport = filteredTransactions.map(item => ({
            'Timestamp': item.timestamp,
            ...(filterType === 'automatic' && { 'Routine': `R${item.routine_id}` }),
            ...(filterType !== 'automatic' && { 'Type': item.is_automated ? `R${item.routine_id}` : 'Manual' }),
            'Action': item.note
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
                { key: 'note', label: 'Action' }
            ];
        } else if (filterType === 'manual') {
            columns = [
                { key: 'timestamp', label: 'Timestamp' },
                { key: 'note', label: 'Action' }
            ];
        } else {
            // mixed
            columns = [
                { key: 'timestamp', label: 'Timestamp' },
                { key: 'type', label: 'Type' },
                { key: 'note', label: 'Action' }
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
    
    // Filter transactions based on is_automated field
    const getFilteredTransactions = () => {
        if (filterType === 'automatic') {
            return transactions.filter(t => t.is_automated === true);
        } else if (filterType === 'manual') {
            return transactions.filter(t => t.is_automated === false);
        } else {
            // mixed - return all
            return transactions;
        }
    };
    
    // Helper function to check if transaction is within date range
    const isWithinDateRange = (timestamp, dateFilter) => {
        const txnDate = new Date(timestamp);
        const today = new Date();
        
        // Reset time to midnight for accurate date comparison
        today.setHours(0, 0, 0, 0);
        txnDate.setHours(0, 0, 0, 0);
        
        if (dateFilter === 'today') {
            return txnDate.getTime() === today.getTime();
        } else if (dateFilter === 'week') {
            // Current week (Monday to Sunday)
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay()); // Get Monday
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // Get Sunday
            return txnDate >= startOfWeek && txnDate <= endOfWeek;
        } else if (dateFilter === 'month') {
            // Current month
            return txnDate.getMonth() === today.getMonth() && 
                   txnDate.getFullYear() === today.getFullYear();
        } else {
            // 'all' - include everything
            return true;
        }
    };

     const filteredTransactions = useMemo(() => {
         let filtered = getFilteredTransactions();
         
         // Apply date filter
         filtered = filtered.filter(transaction => 
             isWithinDateRange(transaction.timestamp, dateFilter)
         );
         
         // Apply search filter on note field
         if (searchTerm) {
             filtered = filtered.filter(transaction => 
                 transaction.note.toLowerCase().includes(searchTerm.toLowerCase())
             );
         }
         
         return filtered;
     }, [transactions, searchTerm, filterType, dateFilter]);

    

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
                                    <Table 
                                        data={filteredTransactions}
                                        filterType={filterType}
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
