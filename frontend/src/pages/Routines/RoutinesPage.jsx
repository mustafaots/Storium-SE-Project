import React, { useState, useEffect } from 'react';
import styles from './RoutinesPage.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';
import Header from '../../components/UI/Header/Header.jsx'; 
import Table from "../../components/Layout/Table/table.jsx"; 
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Icons
import { 
    FaChartLine, FaExclamationTriangle, FaClock, FaSearch, FaFilter, 
    FaPlus, FaBolt, FaTimes, FaPlay, FaPen, FaTrash, FaEnvelope, FaBoxOpen, FaBell 
} from 'react-icons/fa';

// API BASE URL
const API_URL = "http://localhost:3001/api/routines";

function RoutinesPage() {
    const activeItem = useActiveNavItem();

    // --- 1. DATA STATE ---
    const [routines, setRoutines] = useState([]);
    const [stats, setStats] = useState({ active_routines: 0, critical_errors: 0, executions_24h: 0 });
    
    // --- 2. FILTER STATE ---
    const [searchText, setSearchText] = useState("");
    const [freqFilter, setFreqFilter] = useState("All");

    // --- 3. MODAL STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // FORM DATA
    const [formData, setFormData] = useState({
        name: "", 
        frequency: "daily", 
        routineType: "low_stock",  
        actionType: "create_alert", 
        actionDetail: "warning"    
    });

    // Helper state for the UI (Transaction Strategy)
    const [txnStrategy, setTxnStrategy] = useState("fill_max"); // 'fill_max' or 'fixed'
    const [txnQty, setTxnQty] = useState(100); // Default number

    // --- 4. EXECUTION TRACKING STATE ---
    const [prevExecCount, setPrevExecCount] = useState(0);

    // =============================================
    // API INTEGRATION
    // =============================================
    const fetchAllData = async () => {
        try {
            const routinesRes = await fetch(API_URL);
            const routinesData = await routinesRes.json();
            setRoutines(routinesData);

            const statsRes = await fetch(`${API_URL}/stats`);
            const statsData = await statsRes.json();
            
            if (prevExecCount > 0 && statsData.executions_24h > prevExecCount) {
                toast.success(`🚀 Routine Executed Automatically!`, { position: "top-right", theme: "dark" });
            }
            
            setStats(statsData);
            setPrevExecCount(statsData.executions_24h); 
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchAllData();
        const interval = setInterval(fetchAllData, 5000); 
        return () => clearInterval(interval);
    }, [prevExecCount]);

    // =============================================
    // ACTIONS
    // =============================================

    const toggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            setRoutines(prev => prev.map(r => r.routine_id === id ? { ...r, is_active: newStatus } : r));
            await fetch(`${API_URL}/${id}/toggle`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: newStatus })
            });
            fetchAllData(); 
        } catch (error) {
            console.error("Error toggling status:", error);
            fetchAllData(); 
        }
    };

    const deleteRoutine = async (id) => {
        if(window.confirm("Delete this routine?")) {
            try {
                await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                setRoutines(prev => prev.filter(r => r.routine_id !== id));
                fetchAllData(); 
            } catch (error) {
                console.error("Error deleting:", error);
            }
        }
    };

    const executeRoutine = async (id, name) => {
        try {
            toast.info(`Executing Routine: ${name}...`);
            await fetch(`${API_URL}/${id}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ manual_trigger: true }) 
            });
            toast.success("Routine Executed Successfully!");
            fetchAllData(); 
        } catch (error) {
            console.error("Execution failed:", error);
            toast.error("Execution failed.");
        }
    }

    // --- SAVE ROUTINE ---
    const handleSaveRoutine = async () => {
        if (!formData.name) return toast.warning("Please enter a Routine Name");
        if (formData.actionType === 'send_email' && !formData.actionDetail.includes('@')) {
            return toast.warning("Please enter a valid email address");
        }
        
        try {
            // CONSTRUCT THE FINAL DETAIL STRING
            let finalDetail = formData.actionDetail;

            // If action is transaction, we build the string from our UI helpers
            if (formData.actionType === 'create_transaction') {
                if (txnStrategy === 'fill_max') {
                    finalDetail = 'fill_max';
                } else {
                    finalDetail = `fixed_${txnQty}`; // e.g., "fixed_500"
                }
            }

            // Combine Type and Detail: "create_alert:warning" or "create_transaction:fixed_500"
            const resolveString = `${formData.actionType}:${finalDetail}`;

            const payload = {
                name: formData.name,
                promise: formData.routineType, 
                resolve: resolveString, 
                frequency: formData.frequency.toLowerCase()
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setIsModalOpen(false);
                // Reset Form
                setFormData({ 
                    name: "", frequency: "daily", 
                    routineType: "low_stock", actionType: "create_alert", actionDetail: "warning" 
                });
                setTxnStrategy("fill_max");
                setTxnQty(100);
                
                fetchAllData(); 
                toast.success("Routine Saved Successfully!");
            } else {
                toast.error("Failed to save routine");
            }
        } catch (error) {
            console.error("Error creating routine:", error);
        }
    };

    // --- RENDER HELPERS ---
    const formatTriggerText = (type) => {
        switch(type) {
            case 'low_stock': return '📉 Low Stock Check';
            case 'overstock': return '📈 Overstock Check';
            case 'expiry': return '📅 Expiry Check';
            case 'dead_stock': return '💀 Dead Stock Check';
            default: return type;
        }
    };

    const formatActionText = (resolveStr) => {
        if(!resolveStr) return "No Action";
        const [type, detail] = resolveStr.split(':');
        
        if (type === 'create_alert') return <span className={styles.badgeWarning}><FaBell/> Alert ({detail})</span>;
        if (type === 'send_email') return <span className={styles.badgeInfo}><FaEnvelope/> Email</span>;
        
        if (type === 'create_transaction') {
            const label = detail === 'fill_max' ? 'Fill to Max' : `+${detail.replace('fixed_', '')} Units`;
            return <span className={styles.badgeSuccess}><FaBoxOpen/> Reorder: {label}</span>;
        }
        return resolveStr;
    };

    const routineColumns = [
        {
            key: 'name', label: 'ROUTINE NAME',
            render: (item) => <div className={styles.routineName}>{item.name}</div>
        },
        { 
            key: 'promise', label: 'MONITORING TYPE', 
            render: (item) => <span className={styles.triggerText}>{formatTriggerText(item.promise)}</span> 
        },
        { 
            key: 'resolve', label: 'ACTION', 
            render: (item) => formatActionText(item.resolve)
        },
        {
            key: 'frequency', label: 'FREQUENCY',
            render: (item) => <span className={`${styles.badge} ${item.frequency === 'always' ? styles.badgeEvent : styles.badgeRegular}`}>{item.frequency}</span>
        },
        {
            key: 'status', label: 'STATUS',
            render: (item) => (
                <div className={styles.statusCell}>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={!!item.is_active} onChange={() => toggleStatus(item.routine_id, !!item.is_active)} />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            )
        },
        {
            key: 'actions', label: 'ACTIONS',
            render: (item) => (
                <div className={styles.actionButtons}>
                    <button className={`${styles.iconBtn} ${styles.playBtn}`} onClick={() => executeRoutine(item.routine_id, item.name)}><FaPlay /></button>
                    <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => deleteRoutine(item.routine_id)}><FaTrash /></button>
                </div>
            )
        }
    ];

    const filteredData = routines.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(searchText.toLowerCase());
        const matchFreq = freqFilter === "All" || r.frequency === freqFilter.toLowerCase();
        return matchSearch && matchFreq;
    });

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.mainContent}>
                
                <Header title="ROUTINES" subtitle="Automated inventory health checks and alerts" icon={<FaBolt size={28}/>} />
                <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
                    <FaPlus /> New Routine
                </button>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div><span className={styles.statLabel}>ACTIVE ROUTINES</span><span className={styles.statValue}>{stats.active_routines}</span></div>
                        <div className={`${styles.statIcon} ${styles.greenIcon}`}><FaChartLine /></div>
                    </div>
                    <div className={styles.statCard}>
                        <div><span className={styles.statLabel}>CRITICAL ERRORS</span><span className={styles.statValue}>{stats.critical_errors}</span></div>
                        <div className={`${styles.statIcon} ${styles.redIcon}`}><FaExclamationTriangle /></div>
                    </div>
                    <div className={styles.statCard}>
                        <div><span className={styles.statLabel}>EXECUTIONS (24H)</span><span className={styles.statValue}>{stats.executions_24h}</span></div>
                        <div className={`${styles.statIcon} ${styles.blueIcon}`}><FaClock /></div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className={styles.filterBar}>
                    <div className={styles.searchWrapper}>
                        <FaSearch className={styles.searchIcon} />
                        <input type="text" placeholder="Search routines..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                    </div>
                    <div className={styles.filterActions}>
                        <FaFilter className={styles.filterIcon} />
                        <select value={freqFilter} onChange={(e) => setFreqFilter(e.target.value)}>
                            <option value="All">All Frequencies</option>
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="always">Real-time</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className={styles.tableContainer}>
                    <Table data={filteredData} columns={routineColumns} size="medium" />
                </div>
            </div>

            <NavBar activeItem={activeItem} />

            {/* MODAL */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2><FaBolt className={styles.accentText}/> Build New Routine</h2>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}><FaTimes /></button>
                        </div>
                        <p className={styles.modalSubtitle}>Configure system-wide automated checks</p>

                        <div className={styles.modalBody}>
                            {/* NAME & FREQUENCY */}
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>ROUTINE NAME</label>
                                    <input type="text" placeholder="e.g. Auto-Reorder Gloves" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>FREQUENCY</label>
                                    <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})}>
                                        <option value="daily">Daily (09:00 AM)</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="always">Real-time (Debug)</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* LOGIC CONTAINER */}
                            <div className={styles.logicContainer}>
                                
                                {/* LEFT: THE TRIGGER */}
                                <div className={styles.logicBox}>
                                    <div className={`${styles.logicHeader} ${styles.blueHeader}`}>THE TRIGGER (PROMISE)</div>
                                    <div className={styles.logicContent}>
                                        <div className={styles.formGroup}>
                                            <label>MONITORING TYPE</label>
                                            <select 
                                                className={styles.selectInput}
                                                value={formData.routineType}
                                                onChange={(e) => {
                                                    const newType = e.target.value;
                                                    setFormData({
                                                        ...formData, 
                                                        routineType: newType,
                                                        actionType: (newType !== 'low_stock' && formData.actionType === 'create_transaction') ? 'create_alert' : formData.actionType
                                                    });
                                                }}
                                            >
                                                <option value="low_stock">📉 Low Stock (Qty &lt; Min)</option>
                                                <option value="overstock">📈 Overstock (Qty &gt; Max)</option>
                                                <option value="expiry">📅 Expiry / Rotting Check</option>
                                                <option value="dead_stock">💀 Dead Stock (No movement 90d)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT: THE ACTION */}
                                <div className={styles.logicBox}>
                                    <div className={`${styles.logicHeader} ${styles.greenHeader}`}>THE OUTCOME (RESOLVE)</div>
                                    <div className={styles.logicContent}>
                                        <div className={styles.formGroup}>
                                            <label>ACTION TYPE</label>
                                            <select 
                                                className={styles.selectInput}
                                                value={formData.actionType}
                                                onChange={(e) => setFormData({...formData, actionType: e.target.value})}
                                            >
                                                <option value="create_alert">🔔 Create System Alert</option>
                                                <option value="send_email">📧 Send Email</option>
                                                
                                                {/* ONLY SHOW REORDER IF LOW STOCK IS SELECTED */}
                                                {formData.routineType === 'low_stock' && (
                                                    <option value="create_transaction">📦 Auto-Reorder (Transaction)</option>
                                                )}
                                            </select>
                                        </div>

                                        {/* DYNAMIC INPUTS */}
                                        <div className={styles.formGroup}>
                                            
                                            {/* 1. ALERT SEVERITY */}
                                            {formData.actionType === 'create_alert' && (
                                                <>
                                                    <label>SEVERITY LEVEL</label>
                                                    <select 
                                                        className={styles.selectInput}
                                                        value={formData.actionDetail} 
                                                        onChange={e => setFormData({...formData, actionDetail: e.target.value || "warning"})}
                                                    >
                                                        <option value="info">🔵 Info</option>
                                                        <option value="warning">🟡 Warning</option>
                                                        <option value="critical">🔴 Critical</option>
                                                    </select>
                                                </>
                                            )}

                                            {/* 2. EMAIL ADDRESS */}
                                            {formData.actionType === 'send_email' && (
                                                <>
                                                    <label>RECIPIENT EMAIL</label>
                                                    <input 
                                                        type="email" 
                                                        placeholder="manager@company.com" 
                                                        value={formData.actionDetail} 
                                                        onChange={e => setFormData({...formData, actionDetail: e.target.value})}
                                                    />
                                                </>
                                            )}

                                            {/* 3. TRANSACTION / REORDER (NEW LOGIC) */}
                                            {formData.actionType === 'create_transaction' && (
                                                <>
                                                    <label>REORDER MODE</label>
                                                    <select 
                                                        className={styles.selectInput}
                                                        value={txnStrategy} 
                                                        onChange={e => setTxnStrategy(e.target.value)}
                                                        style={{ marginBottom: '10px' }}
                                                    >
                                                        <option value="fill_max">Fill to Max Level (Auto)</option>
                                                        <option value="fixed">Specific Quantity (Manual)</option>
                                                    </select>

                                                    {/* SHOW NUMBER INPUT ONLY IF 'FIXED' IS SELECTED */}
                                                    {txnStrategy === 'fixed' && (
                                                        <div className={styles.animateFadeIn}>
                                                            <label>QUANTITY TO ORDER</label>
                                                            <input 
                                                                type="number" 
                                                                min="1"
                                                                placeholder="e.g. 500" 
                                                                value={txnQty} 
                                                                onChange={e => setTxnQty(e.target.value)}
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.summaryBar}>
                                <strong>Summary:</strong> If <strong>{formData.routineType}</strong> detected, then <strong>{formData.actionType.replace('_', ' ')}</strong>.
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.textBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className={styles.primaryBtn} onClick={handleSaveRoutine}>Save Routine</button>
                        </div>
                    </div>
                </div>
            )}
            
            <ToastContainer />
        </div>
    );
}

export default RoutinesPage;