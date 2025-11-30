import React, { useState } from 'react';
import styles from './AlertsPage.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';

// 1. Import your EXISTING Table component
import Table from "../../components/Layout/Table/table.jsx";

// 2. Import Icons
import { FaExclamationTriangle, FaInfoCircle, FaCheck, FaTrash, FaSortUp } from 'react-icons/fa';

function AlertsPage() {
    const activeItem = useActiveNavItem();

    // --- MOCK DATA ---
    const [alerts, setAlerts] = useState([
        { id: 1, severity: 'CRITICAL', timestamp: '21 Nov 2025, 11:30', type: 'LOW STOCK', message: 'Critical stock level for Hydraulic Oil ISO 68. Current quantity: 8 units.', isRead: false },
        { id: 2, severity: 'WARNING', timestamp: '21 Nov 2025, 10:15', type: 'EXPIRY', message: 'Welding Electrodes E6013 expiring in 3 months.', isRead: false },
        { id: 3, severity: 'INFO', timestamp: '21 Nov 2025, 09:45', type: 'OVERSTOCK', message: 'LED Work Light 500W has exceeded optimal stock levels.', isRead: true },
        { id: 4, severity: 'WARNING', timestamp: '20 Nov 2025, 17:20', type: 'REORDER', message: 'Steel Bolts M12x50mm has reached reorder point.', isRead: false },
        { id: 5, severity: 'WARNING', timestamp: '20 Nov 2025, 15:00', type: 'LOW STOCK', message: 'Industrial Safety Gloves inventory below optimal levels.', isRead: false },
    ]);

    // --- FILTER STATE ---
    const [filterType, setFilterType] = useState('All Types');
    const [filterSeverity, setFilterSeverity] = useState('All Severities');
    const [showUnreadOnly, setShowUnreadOnly] = useState(true);

    // --- ACTIONS ---
    const handleMarkRead = (id) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
    };

    const handleDelete = (id) => {
        if(window.confirm("Delete this alert?")) {
            setAlerts(prev => prev.filter(a => a.id !== id));
        }
    };

    // --- COLUMN DEFINITION (The Core of Modularity) ---
    // We pass this to your Table component to tell it how to render specific cells
    const alertColumns = [
        {
            key: 'severity',
            label: 'SEVERITY',
            render: (item) => {
                let icon = <FaExclamationTriangle />;
                let styleClass = styles.sevWarning;
                if(item.severity === 'CRITICAL') styleClass = styles.sevCritical;
                if(item.severity === 'INFO') { icon = <FaInfoCircle />; styleClass = styles.sevInfo; }
                
                return (
                    <div className={`${styles.severityCell} ${styleClass}`}>
                        {icon} <span>{item.severity}</span>
                    </div>
                );
            }
        },
        {
            key: 'timestamp', // Matches your Table's internal key for width (200px)
            label: <span className={styles.sortHeader}>Timestamp <FaSortUp /></span>,
            render: (item) => <span className={styles.timestampText}>{item.timestamp}</span>
        },
        {
            key: 'type', // Matches your Table's internal key for width (120px)
            label: 'TYPE',
            render: (item) => {
                // Dynamic class for badge color
                const badgeType = item.type.toLowerCase().replace(' ', '');
                return <span className={`${styles.badge} ${styles[badgeType]}`}>{item.type}</span>;
            }
        },
        {
            key: 'message',
            label: 'MESSAGE',
            render: (item) => <span className={styles.messageText}>{item.message}</span>
        },
        {
            key: 'actions',
            label: 'ACTIONS',
            render: (item) => (
                <div className={styles.actionButtons}>
                    {!item.isRead && (
                        <button className={`${styles.iconBtn} ${styles.checkBtn}`} onClick={() => handleMarkRead(item.id)}>
                            <FaCheck />
                        </button>
                    )}
                    <button className={`${styles.iconBtn} ${styles.trashBtn}`} onClick={() => handleDelete(item.id)}>
                        <FaTrash />
                    </button>
                </div>
            )
        }
    ];

    // --- FILTERING LOGIC ---
    const filteredData = alerts.filter(item => {
        const typeMatch = filterType === 'All Types' || item.type === filterType.toUpperCase();
        const sevMatch = filterSeverity === 'All Severities' || item.severity === filterSeverity.toUpperCase();
        const statusMatch = showUnreadOnly ? !item.isRead : true;
        return typeMatch && sevMatch && statusMatch;
    });

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.mainContent}>
                
                {/* 1. Header */}
                <header className={styles.dashboardHeader}>
                    <h1 className={styles.title}>ALERTS</h1>
                    <p className={styles.subtitle}>Monitor and manage system alerts</p>
                </header>

                {/* 2. Filter Controls */}
                <div className={styles.filterControls}>
                    <div className={styles.filterGroup}>
                        <label>TYPE</label>
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option>All Types</option>
                            <option>Low Stock</option>
                            <option>Overstock</option>
                            <option>Expiry</option>
                            <option>Reorder</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>SEVERITY</label>
                        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
                            <option>All Severities</option>
                            <option>Critical</option>
                            <option>Warning</option>
                            <option>Info</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>STATUS</label>
                        <div className={styles.statusGroup}>
                            <button 
                                className={`${styles.statusBtn} ${showUnreadOnly ? styles.active : ''}`}
                                onClick={() => setShowUnreadOnly(true)}
                            >
                                Unread Only
                            </button>
                            <button 
                                className={`${styles.statusBtn} ${!showUnreadOnly ? styles.active : ''}`}
                                onClick={() => setShowUnreadOnly(false)}
                            >
                                Show All
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. The Table Component */}
                <div className={styles.tableContainer}>
                    <Table 
                        data={filteredData}
                        columns={alertColumns}
                        size="medium"
                    />
                </div>

            </div>
            <NavBar activeItem={activeItem} />
        </div>
    );
}

export default AlertsPage;