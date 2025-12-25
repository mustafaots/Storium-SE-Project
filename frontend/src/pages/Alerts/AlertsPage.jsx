import React, { useState, useEffect } from 'react';
import styles from './AlertsPage.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';

// Components
import Header from '../../components/UI/Header/Header.jsx';
import Table from "../../components/Layout/Table/table.jsx";

// Icons
import { FaExclamationTriangle, FaInfoCircle, FaCheck, FaTrash, FaSortUp, FaBell } from 'react-icons/fa';

// API URL
const API_URL = "http://localhost:3001/api/alerts";

function AlertsPage() {
    const activeItem = useActiveNavItem();

    // --- STATE ---
    const [alerts, setAlerts] = useState([]);
    
    // --- FILTER STATE ---
    const [filterType, setFilterType] = useState('All Types');
    const [filterSeverity, setFilterSeverity] = useState('All Severities');
    const [showUnreadOnly, setShowUnreadOnly] = useState(true);

    // --- 1. FETCH DATA (API) ---
    const fetchAlerts = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setAlerts(data);
        } catch (error) {
            console.error("Error fetching alerts:", error);
        }
    };

    // Auto-refresh every 5 seconds to catch new alerts from the Scheduler
    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 5000);
        return () => clearInterval(interval);
    }, []);

    // --- 2. ACTIONS ---
    const handleMarkRead = async (id) => {
        try {
            // Optimistic update (update UI instantly)
            setAlerts(prev => prev.map(a => a.alert_id === id ? { ...a, is_read: 1 } : a));
            
            // Call API
            await fetch(`${API_URL}/${id}/read`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_read: 1 })
            });
        } catch (error) {
            console.error("Error marking read:", error);
            fetchAlerts(); // Revert on error
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Delete this alert?")) {
            try {
                setAlerts(prev => prev.filter(a => a.alert_id !== id));
                await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            } catch (error) {
                console.error("Error deleting:", error);
                fetchAlerts();
            }
        }
    };

    // --- 3. COLUMN DEFINITION ---
    const alertColumns = [
        {
            key: 'severity',
            label: 'SEVERITY',
            render: (item) => {
                // Normalize DB value (critical -> CRITICAL)
                const severityUpper = item.severity ? item.severity.toUpperCase() : 'INFO';
                
                let icon = <FaExclamationTriangle />;
                let styleClass = styles.sevWarning;

                if(severityUpper === 'CRITICAL') styleClass = styles.sevCritical;
                if(severityUpper === 'INFO') { icon = <FaInfoCircle />; styleClass = styles.sevInfo; }
                
                return (
                    <div className={`${styles.severityCell} ${styleClass}`}>
                        {icon} <span>{severityUpper}</span>
                    </div>
                );
            }
        },
        {
            key: 'sent_at', // Changed from timestamp
            label: <span className={styles.sortHeader}>Timestamp <FaSortUp /></span>,
            render: (item) => (
                <span className={styles.timestampText}>
                    {new Date(item.sent_at).toLocaleString('en-GB', { 
                        day: 'numeric', month: 'short', year: 'numeric', 
                        hour: '2-digit', minute: '2-digit' 
                    })}
                </span>
            )
        },
        {
            key: 'alert_type', // Changed from type
            label: 'TYPE',
            render: (item) => {
                // DB: 'low_stock' -> UI Class: 'lowstock'
                const rawType = item.alert_type || 'unknown';
                const badgeClass = rawType.replace('_', ''); 
                const displayText = rawType.replace('_', ' ').toUpperCase();

                return <span className={`${styles.badge} ${styles[badgeClass]}`}>{displayText}</span>;
            }
        },
        {
            key: 'content', // Changed from message
            label: 'MESSAGE',
            render: (item) => <span className={styles.messageText}>{item.content}</span>
        },
        {
            key: 'actions',
            label: 'ACTIONS',
            render: (item) => (
                <div className={styles.actionButtons}>
                    {/* Check if is_read is 0 (false) */}
                    {item.is_read === 0 && (
                        <button className={`${styles.iconBtn} ${styles.checkBtn}`} onClick={() => handleMarkRead(item.alert_id)} title="Mark Read">
                            <FaCheck />
                        </button>
                    )}
                    <button className={`${styles.iconBtn} ${styles.trashBtn}`} onClick={() => handleDelete(item.alert_id)} title="Delete">
                        <FaTrash />
                    </button>
                </div>
            )
        }
    ];

    // --- 4. FILTERING LOGIC ---
    const filteredData = alerts.filter(item => {
        // Handle Type Filter (Convert UI "Low Stock" to DB "low_stock")
        let dbTypeMatch = true;
        if (filterType !== 'All Types') {
            const requiredType = filterType.toLowerCase().replace(' ', '_');
            dbTypeMatch = item.alert_type === requiredType;
        }

        // Handle Severity Filter
        let sevMatch = true;
        if (filterSeverity !== 'All Severities') {
            sevMatch = item.severity === filterSeverity.toLowerCase();
        }

        // Handle Status (is_read: 0 means Unread)
        const statusMatch = showUnreadOnly ? item.is_read === 0 : true;

        return dbTypeMatch && sevMatch && statusMatch;
    });

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.mainContent}>
                
                <div className={styles.headerWrapper}>
                    <Header 
                        title="ALERTS" 
                        subtitle="Monitor and manage system alerts" 
                        icon={<FaBell size={28}/>}
                        size='medium'
                        align='left'
                    />
                </div>

                {/* Filter Controls */}
                <div className={styles.filterControls}>
                    <div className={styles.filterGroup}>
                        <label>TYPE</label>
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option>All Types</option>
                            <option>Low Stock</option>
                            <option>Overstock</option>
                            <option>Expiry</option>
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

                {/* Table */}
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