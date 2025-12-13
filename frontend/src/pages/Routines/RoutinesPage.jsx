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
    FaPlus, FaBolt, FaTimes, FaPlay, FaPen, FaTrash, FaRegClock 
} from 'react-icons/fa';

// API BASE URL
const API_URL = "http://localhost:3001/api/routines";

function RoutinesPage() {
    const activeItem = useActiveNavItem();

    // --- 1. DATA STATE ---
    const [routines, setRoutines] = useState([]);
    const [stats, setStats] = useState({ active_routines: 0, critical_errors: 0, executions_24h: 0 });
    const [productList, setProductList] = useState([]); // List of products for the dropdown

    // --- 2. FILTER STATE ---
    const [searchText, setSearchText] = useState("");
    const [freqFilter, setFreqFilter] = useState("All");

    // --- 3. MODAL STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form Data with separate Logic Fields
    const [formData, setFormData] = useState({
        name: "", 
        frequency: "daily", 
        trigger: "", // This is the final string sent to DB
        
        // Logic Builder Fields (For UI only)
        logicTarget: "",   
        logicOperator: "<", 
        logicValue: "",     
        
        actionType: "Create Alert", 
        actionDetails: ""
    });

    // --- 4. EXECUTION TRACKING STATE ---
    // Track previous executions count to detect changes for notifications
    const [prevExecCount, setPrevExecCount] = useState(0);

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
            
            // CHECK FOR NEW EXECUTIONS (For Notification)
            if (prevExecCount > 0 && statsData.executions_24h > prevExecCount) {
                toast.success(`🚀 Routine Executed Automatically!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                });
            }
            
            setStats(statsData);
            setPrevExecCount(statsData.executions_24h); // Update tracker

            // 3. Get Products (For Dropdown)
            const prodRes = await fetch(`${API_URL}/products`);
            const prodData = await prodRes.json();
            setProductList(prodData);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchAllData();
        // Check every 5 seconds for updates (Polling)
        const interval = setInterval(fetchAllData, 5000); 
        return () => clearInterval(interval);
    }, [prevExecCount]); // Re-run effect dependencies

    // =============================================
    // LOGIC BUILDER HELPER
    // =============================================
    const updateLogic = (field, value) => {
        // 1. Update the specific field (Target, Operator, or Value)
        const newData = { ...formData, [field]: value };
        
        // 2. Build the sentence automatically
        // Example: "Hydraulic Oil" + "<" + "10"
        const target = newData.logicTarget || "";
        const operator = newData.logicOperator;
        const val = newData.logicValue;

        const sentence = target ? `${target} ${operator} ${val}` : "";
        
        // 3. Save both the field and the final trigger string
        setFormData({ 
            ...newData, 
            trigger: sentence 
        });
    };

    // =============================================
    // ACTIONS
    // =============================================

    // 1. TOGGLE STATUS (PATCH)
    const toggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            // Optimistic Update
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

    // 2. DELETE ROUTINE (DELETE)
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

    // 3. EXECUTE ROUTINE (POST - The Play Button)
    const executeRoutine = async (id, name) => {
        try {
            toast.info(`Executing Routine: ${name}...`);
            const response = await fetch(`${API_URL}/${id}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ manual_trigger: true }) 
            });
            const data = await response.json();
            console.log("Packet Produced:", data);
            toast.success("Routine Executed Successfully!");
            fetchAllData(); 
        } catch (error) {
            console.error("Execution failed:", error);
            toast.error("Execution failed.");
        }
    }

    // 4. CREATE ROUTINE (POST)
    const handleSaveRoutine = async () => {
        // Validate
        if (!formData.name || !formData.trigger) return alert("Name and Logic required");
        
        try {
            const payload = {
                name: formData.name,
                promise: formData.trigger, // This is the string we built ("Oil < 10")
                resolve: `${formData.actionType}: ${formData.actionDetails}`,
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
                    name: "", frequency: "daily", trigger: "", 
                    logicTarget: "", logicOperator: "<", logicValue: "",
                    actionType: "Create Alert", actionDetails: "" 
                });
                fetchAllData(); 
                toast.success("Routine Saved!");
            } else {
                alert("Failed to save routine");
            }
        } catch (error) {
            console.error("Error creating routine:", error);
        }
    };

    // --- TABLE COLUMNS ---
    const formatDate = (dateString) => {
        if (!dateString) return "Never";
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

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
                    <button className={`${styles.iconBtn} ${styles.playBtn}`} title="Run Now" onClick={() => executeRoutine(item.routine_id, item.name)}>
                        <FaPlay />
                    </button>
                    <button className={`${styles.iconBtn} ${styles.editBtn}`} title="Edit">
                        <FaPen />
                    </button>
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

                {/* Stats Grid */}
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
                            
                            {/* LOGIC BUILDER SECTION */}
                            <div className={styles.logicContainer}>
                                <div className={styles.logicBox}>
                                    <div className={`${styles.logicHeader} ${styles.blueHeader}`}>THE PROMISE (TRIGGER)</div>
                                    <div className={styles.logicContent}>
                                        <div className={styles.formGroup}>
                                            <label>CONDITION BUILDER</label>
                                            
                                            {/* 3-Part Logic Builder */}
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                {/* 1. Target Product */}
                                                <select 
                                                    style={{ flex: 2, background: '#202225', color: 'white', padding: '10px', border: '1px solid #40444b', borderRadius: '4px', outline: 'none' }}
                                                    value={formData.logicTarget}
                                                    onChange={(e) => updateLogic("logicTarget", e.target.value)}
                                                >
                                                    <option value="">Select Product...</option>
                                                    {productList.map(prod => (
                                                        <option key={prod.product_id} value={prod.name}>
                                                            {prod.name}
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* 2. Operator */}
                                                <select 
                                                    style={{ width: '60px', background: '#202225', color: 'white', padding: '10px', border: '1px solid #40444b', borderRadius: '4px', textAlign: 'center', outline: 'none' }}
                                                    value={formData.logicOperator}
                                                    onChange={(e) => updateLogic("logicOperator", e.target.value)}
                                                >
                                                    <option value="<">&lt;</option>
                                                    <option value=">">&gt;</option>
                                                    <option value="=">=</option>
                                                </select>

                                                {/* 3. Value */}
                                                <input 
                                                    type="number" 
                                                    placeholder="Qty" 
                                                    style={{ width: '80px', background: '#202225', color: 'white', padding: '10px', border: '1px solid #40444b', borderRadius: '4px', outline: 'none' }}
                                                    value={formData.logicValue}
                                                    onChange={(e) => updateLogic("logicValue", e.target.value)}
                                                />
                                            </div>

                                            {/* Preview Text */}
                                            <div style={{ fontSize: '11px', color: '#72767d', marginTop: '8px', fontStyle: 'italic' }}>
                                                Generated Logic: <span style={{ color: '#fff' }}>{formData.trigger || "..."}</span>
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
            
            {/* Notification Container */}
            <ToastContainer />
        </div>
    );
}

export default RoutinesPage;