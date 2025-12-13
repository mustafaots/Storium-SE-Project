import React, { useState, useEffect } from 'react';
import styles from './RoutinesPage.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';
import Header from '../../components/UI/Header/Header.jsx'; 
import Table from "../../components/Layout/Table/table.jsx"; 
import { useActiveNavItem } from '../../hooks/useActiveNavItem';

// Icons
import { 
    FaChartLine, FaExclamationTriangle, FaClock, FaSearch, FaFilter, 
    FaPlus, FaBolt, FaTimes, FaPlay, FaPen, FaTrash 
} from 'react-icons/fa';
import { FaRegClock } from 'react-icons/fa';

// API BASE URL
const API_URL = "http://localhost:3001/api/routines";

function RoutinesPage() {
    const activeItem = useActiveNavItem();

    // --- 1. DATA STATE (Now starts empty) ---
    const [routines, setRoutines] = useState([]);
    const [stats, setStats] = useState({ active_routines: 0, critical_errors: 0, executions_24h: 0 });

    // --- 2. FILTER STATE ---
    const [searchText, setSearchText] = useState("");
    const [freqFilter, setFreqFilter] = useState("All");

    // --- 3. MODAL STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "", frequency: "daily", trigger: "", actionType: "Create Alert", actionDetails: ""
    });

    // =============================================
    // API INTEGRATION: FETCH DATA ON LOAD
    // =============================================
    const fetchAllData = async () => {
        try {
            // 1. Get List
            const routinesRes = await fetch(API_URL);
            const routinesData = await routinesRes.json();
            setRoutines(routinesData);

            // 2. Get Stats
            const statsRes = await fetch(`${API_URL}/stats`);
            const statsData = await statsRes.json();
            setStats(statsData);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchAllData();
        // Optional: Auto-refresh every 30 seconds to update stats/status
        const interval = setInterval(fetchAllData, 30000);
        return () => clearInterval(interval);
    }, []);


    // =============================================
    // ACTIONS (Connected to Backend)
    // =============================================

    // 1. TOGGLE STATUS (PATCH)
    const toggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            // Optimistic Update (Change UI immediately)
            setRoutines(prev => prev.map(r => r.routine_id === id ? { ...r, is_active: newStatus } : r));

            await fetch(`${API_URL}/${id}/toggle`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: newStatus })
            });
            
            // Refresh stats because "Active Routines" changed
            fetchAllData(); 
        } catch (error) {
            console.error("Error toggling status:", error);
            fetchAllData(); // Revert on error
        }
    };

    // 2. DELETE ROUTINE (DELETE)
    const deleteRoutine = async (id) => {
        if(window.confirm("Delete this routine?")) {
            try {
                await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                setRoutines(prev => prev.filter(r => r.routine_id !== id));
                fetchAllData(); // Refresh stats
            } catch (error) {
                console.error("Error deleting:", error);
            }
        }
    };

    // 3. EXECUTE ROUTINE (POST - The "Play" Button)
    const executeRoutine = async (id, name) => {
        try {
            alert(`Executing Routine: ${name}...`);
            const response = await fetch(`${API_URL}/${id}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ manual_trigger: true }) // Optional payload
            });
            const data = await response.json();
            console.log("Packet Produced:", data);
            alert("Routine Executed Successfully! (Check Console for JSON Packet)");
            fetchAllData(); // Refresh "Executions 24h" stat
        } catch (error) {
            console.error("Execution failed:", error);
            alert("Execution failed.");
        }
    }

    // 4. CREATE ROUTINE (POST)
    const handleSaveRoutine = async () => {
        if (!formData.name || !formData.trigger) return alert("Name and Trigger required");
        
        try {
            const payload = {
                name: formData.name,
                promise: formData.trigger,
                resolve: `${formData.actionType}: ${formData.actionDetails}`,
                frequency: formData.frequency.toLowerCase() // Backend expects lowercase
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setIsModalOpen(false);
                setFormData({ name: "", frequency: "daily", trigger: "", actionType: "Create Alert", actionDetails: "" });
                fetchAllData(); // Refresh list to show new item
            } else {
                alert("Failed to save routine");
            }
        } catch (error) {
            console.error("Error creating routine:", error);
        }
    };

    // --- HELPER: FORMAT DATE ---
    const formatDate = (dateString) => {
        if (!dateString) return "Never";
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // --- TABLE COLUMNS (Updated to match DB Keys) ---
    const routineColumns = [
        {
            key: 'name',
            label: 'ROUTINE NAME',
            render: (item) => (
                <div>
                    <div className={styles.routineName}>{item.name}</div>
                    <div className={styles.routineDesc}>{item.resolve || "No action defined"}</div>
                </div>
            )
        },
        { key: 'trigger', label: 'PROMISE / TRIGGER', render: (item) => <span className={styles.triggerText}>{item.promise}</span> },
        {
            key: 'frequency', label: 'FREQUENCY',
            render: (item) => {
                const badgeClass = item.frequency === 'on_event' ? styles.badgeEvent : styles.badgeRegular;
                return <span className={`${styles.badge} ${badgeClass}`}>{item.frequency}</span>;
            }
        },
        { key: 'lastRun', label: 'LAST RUN', render: (item) => <span className={styles.metaText}>{formatDate(item.last_run)}</span> },
        {
            key: 'status', label: 'STATUS',
            render: (item) => (
                <div className={styles.statusCell}>
                    <label className={styles.switch}>
                        {/* Note: item.is_active comes from DB as 1 or 0, so we check !!item.is_active */}
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
                    {/* Play Button - Connected to executeRoutine */}
                    <button className={`${styles.iconBtn} ${styles.playBtn}`} title="Run Now" onClick={() => executeRoutine(item.routine_id, item.name)}>
                        <FaPlay />
                    </button>
                    {/* Edit Button - Visual Only for now */}
                    <button className={`${styles.iconBtn} ${styles.editBtn}`} title="Edit">
                        <FaPen />
                    </button>
                    {/* Delete Button */}
                    <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => deleteRoutine(item.routine_id)}>
                        <FaTrash />
                    </button>
                </div>
            )
        }
    ];

    // Filter Logic
    const filteredData = routines.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(searchText.toLowerCase());
        const matchFreq = freqFilter === "All" || r.frequency === freqFilter.toLowerCase();
        return matchSearch && matchFreq;
    });

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.mainContent}>
                
                <Header 
                    title="ROUTINES" 
                    subtitle="Manage automation triggers, promises, and resolutions" 
                    icon={<FaBolt size={28}/>} 
                    size='medium'
                    align='left'
                />
                <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
                    <FaPlus /> New Routine
                </button>

                {/* Stats Grid (CONNECTED TO API) */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div><span className={styles.statLabel}>ACTIVE ROUTINES</span><span className={styles.statValue}>{stats.active_routines}</span></div>
                        <div className={`${styles.statIcon} ${styles.greenIcon}`}><FaChartLine /></div>
                    </div>
                    <div className={styles.statCard}>
                        <div><span className={styles.statLabel}>CRITICAL ERRORS</span><span className={styles.statValue}>{stats.critical_errors}</span><span className={styles.statSub}>Requires attention</span></div>
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
                            <option value="on_event">On Event</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className={styles.tableContainer}>
                    <Table data={filteredData} columns={routineColumns} size="medium" />
                </div>
            </div>

            <NavBar activeItem={activeItem} />

            {/* Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2><FaBolt className={styles.accentText}/> Build New Routine</h2>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}><FaTimes /></button>
                        </div>
                        <p className={styles.modalSubtitle}>Define the trigger (Promise) and the outcome (Resolve)</p>

                        <div className={styles.modalBody}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>ROUTINE NAME</label>
                                    <input type="text" placeholder="e.g. Low Stock Alert" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>FREQUENCY</label>
                                    <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})}>
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="on_event">On Event</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.logicContainer}>
                                <div className={styles.logicBox}>
                                    <div className={`${styles.logicHeader} ${styles.blueHeader}`}>THE PROMISE (TRIGGER)</div>
                                    <div className={styles.logicContent}>
                                        <div className={styles.formGroup}>
                                            <label>TIME / SCHEDULE / CONDITION</label>
                                            <div className={styles.inputIconWrapper}>
                                                <input type="text" placeholder="e.g. Stock < 10" value={formData.trigger} onChange={e => setFormData({...formData, trigger: e.target.value})} />
                                                <FaRegClock className={styles.inputIcon}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.logicBox}>
                                    <div className={`${styles.logicHeader} ${styles.greenHeader}`}>THE RESOLVE (ACTION)</div>
                                    <div className={styles.logicContent}>
                                        <div className={styles.formGroup}>
                                            <label>ACTION TYPE</label>
                                            <select value={formData.actionType} onChange={e => setFormData({...formData, actionType: e.target.value})}>
                                                <option>Create Alert</option>
                                                <option>Log Transaction</option>
                                                <option>Send Email</option>
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>DETAILS</label>
                                            <input type="text" placeholder="e.g. Critical" value={formData.actionDetails} onChange={e => setFormData({...formData, actionDetails: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.summaryBar}>
                                <strong>Summary:</strong> This routine will run <strong>{formData.frequency}</strong> to <strong>{formData.actionType}</strong>.
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.textBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className={styles.primaryBtn} onClick={handleSaveRoutine}>Save Routine</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RoutinesPage;