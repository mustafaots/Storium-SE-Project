import styles from './TransactionsPage.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';
import Header from '../../components/UI/Header/Header.jsx';
import Table from '../../components/Layout/Table/table.jsx';  
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import ExportModal from '../../components/UI/Export/export.jsx';
import { exportToCSV, exportToPDF, prepareDataForExport } from '../../utils/export.js';
import { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
     // Mock data based on your screenshot
     const [transactions, setTransactions] = useState([
    {
        txn_id: 1,
        is_automated: true,
        stock_id: 145,
        txn_type: 'outflow',
        quantity: 20,
        total_value: 400.00,
        reference_number: 'ISS-001',
        notes: 'Issued to Department C for medical procedures',
        timestamp: '2025-11-27 10:26:05',
        client_id: 3,
        routine_id: 1,
        note: 'Issued 20 units of Product ID #145 (Thermometers) to Department C for usage.'
    },
    {
        txn_id: 2,
        is_automated: true,
        stock_id: 310,
        txn_type: 'transfer',
        quantity: 30,
        total_value: 750.00,
        reference_number: 'TRF-001',
        notes: 'Space optimization reorganization',
        timestamp: '2025-11-27 10:22:31',
        from_slot: 15,
        to_slot: 22,
        routine_id: 3,
        note: 'Transferred 30 units of Product ID #310 (IV Sets) from Aisle 1, Rack D → Aisle 2, Rack A due to space optimization.'
    },
    {
        txn_id: 3,
        is_automated: true,
        stock_id: 278,
        txn_type: 'inflow',
        quantity: 50,
        total_value: 1250.00,
        reference_number: 'PO-78451',
        notes: 'Regular monthly restocking',
        timestamp: '2025-11-27 09:15:42',
        source_id: 5,
        routine_id: 1,
        note: 'Restocked 50 units of Product ID #278 (Syringes) from Supplier MedEquip Inc.'
    },
    {
        txn_id: 4,
        is_automated: true,
        stock_id: 145,
        txn_type: 'adjustment',
        quantity: -5,
        total_value: -100.00,
        reference_number: 'AUD-001',
        notes: 'Discrepancy found during quarterly audit',
        timestamp: '2025-10-26 15:45:18',
        routine_id: 2,
        note: 'Adjusted inventory count for Product ID #145 (Thermometers) - discrepancy found during audit.'
    },
    {
        txn_id: 5,
        is_automated: false,
        stock_id: 189,
        txn_type: 'inflow',
        quantity: 100,
        total_value: 2500.00,
        reference_number: 'PO-78452',
        notes: 'Emergency order for upcoming surgery',
        timestamp: '2025-10-26 14:30:00',
        source_id: 2,
        note: 'Manual order: Received 100 units of Product ID #189 (Surgical Gloves) from HealthSupplies Co.'
    },
    {
        txn_id: 6,
        is_automated: false,
        stock_id: 422,
        txn_type: 'consumption',
        quantity: 15,
        total_value: 450.00,
        reference_number: 'CON-001',
        notes: 'Used in emergency room procedure',
        timestamp: '2025-10-26 11:20:15',
        client_id: 1,
        note: 'Consumed 15 units of Product ID #422 (Bandages) during emergency treatment'
    },
    {
        txn_id: 7,
        is_automated: true,
        stock_id: 310,
        txn_type: 'outflow',
        quantity: 10,
        total_value: 250.00,
        reference_number: 'ISS-002',
        notes: 'Routine issuance to pediatric ward',
        timestamp: '2025-10-25 16:10:33',
        client_id: 4,
        routine_id: 1,
        note: 'Automated issuance: 10 units of Product ID #310 (IV Sets) to Pediatric Ward'
    },
    {
        txn_id: 8,
        is_automated: false,
        stock_id: 278,
        txn_type: 'transfer',
        quantity: 25,
        total_value: 625.00,
        reference_number: 'TRF-002',
        notes: 'Moving to high-demand area',
        timestamp: '2025-10-25 13:45:22',
        from_slot: 8,
        to_slot: 12,
        note: 'Manual transfer: 25 units of Product ID #278 (Syringes) moved to ER storage'
    },
    {
        txn_id: 9,
        is_automated: true,
        stock_id: 533,
        txn_type: 'inflow',
        quantity: 75,
        total_value: 1875.00,
        reference_number: 'PO-78453',
        notes: 'Scheduled weekly delivery',
        timestamp: '2025-10-25 09:00:00',
        source_id: 3,
        routine_id: 4,
        note: 'Automated restock: 75 units of Product ID #533 (Alcohol Swabs) received from MedSupply Ltd.'
    },
    {
        txn_id: 10,
        is_automated: false,
        stock_id: 189,
        txn_type: 'adjustment',
        quantity: 12,
        total_value: 300.00,
        reference_number: 'ADJ-001',
        notes: 'Found extra boxes during inventory check',
        timestamp: '2025-10-24 17:30:45',
        note: 'Manual adjustment: Added 12 units of Product ID #189 (Surgical Gloves) found in overflow storage'
    },
    {
        txn_id: 11,
        is_automated: true,
        stock_id: 422,
        txn_type: 'consumption',
        quantity: 8,
        total_value: 240.00,
        reference_number: 'CON-002',
        notes: 'Daily ward consumption',
        timestamp: '2025-10-24 14:15:20',
        client_id: 2,
        routine_id: 5,
        note: 'Automated consumption: 8 units of Product ID #422 (Bandages) used in General Ward'
    },
    {
        txn_id: 12,
        is_automated: false,
        stock_id: 145,
        txn_type: 'outflow',
        quantity: 35,
        total_value: 700.00,
        reference_number: 'ISS-003',
        notes: 'Bulk issue to outpatient department',
        timestamp: '2025-10-24 10:05:10',
        client_id: 6,
        note: 'Manual issue: 35 units of Product ID #145 (Thermometers) to Outpatient Department'
    },
    {
        txn_id: 13,
        is_automated: true,
        stock_id: 310,
        txn_type: 'transfer',
        quantity: 20,
        total_value: 500.00,
        reference_number: 'TRF-003',
        notes: 'Optimizing storage locations',
        timestamp: '2025-10-23 15:40:18',
        from_slot: 22,
        to_slot: 18,
        routine_id: 3,
        note: 'Automated transfer: 20 units of Product ID #310 (IV Sets) relocated for better accessibility'
    },
    {
        txn_id: 14,
        is_automated: false,
        stock_id: 533,
        txn_type: 'inflow',
        quantity: 200,
        total_value: 5000.00,
        reference_number: 'PO-78454',
        notes: 'Bulk purchase for upcoming project',
        timestamp: '2025-10-23 11:25:30',
        source_id: 1,
        note: 'Manual bulk order: 200 units of Product ID #533 (Alcohol Swabs) from PrimeMedical Corp.'
    },
    {
        txn_id: 15,
        is_automated: true,
        stock_id: 278,
        txn_type: 'adjustment',
        quantity: -3,
        total_value: -75.00,
        reference_number: 'AUD-002',
        notes: 'Damaged items identified',
        timestamp: '2025-10-22 16:55:42',
        routine_id: 2,
        note: 'Automated adjustment: Removed 3 damaged units of Product ID #278 (Syringes) from inventory'
    },
    {
        txn_id: 16,
        is_automated: false,
        stock_id: 145,
        txn_type: 'outflow',
        quantity: 15,
        total_value: 300.00,
        reference_number: 'ISS-004',
        notes: 'Manual issue to Emergency Department',
        timestamp: '2025-11-27 14:30:22',
        client_id: 2,
        note: 'Manual issue: 15 units of Product ID #145 (Thermometers) to Emergency Department'
    },
    {
        txn_id: 17,
        is_automated: true,
        stock_id: 533,
        txn_type: 'inflow',
        quantity: 60,
        total_value: 1500.00,
        reference_number: 'PO-78455',
        notes: 'Routine delivery today',
        timestamp: '2025-11-25 08:45:33',
        source_id: 3,
        routine_id: 4,
        note: 'Automated restock: 60 units of Product ID #533 (Alcohol Swabs) received today'
    }
]);

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
                          size='medium'
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
                                    <Table 
                                        data={filteredTransactions}
                                        filterType={filterType}
                                    />
                    </div>
                {/* </div> */}
            </div>
            <NavBar activeItem={activeItem} />
        </div>
        // </div>
    );
}

export default TransactionsPage;
