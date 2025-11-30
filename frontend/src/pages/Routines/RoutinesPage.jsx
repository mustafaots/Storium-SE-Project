import React, { useState } from 'react';
import styles from './RoutinesPage.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';
import Header from '../../components/UI/Header/Header.jsx'; 
import Table from "../../components/Layout/Table/table.jsx"; // Adjust path if needed
import { useActiveNavItem } from '../../hooks/useActiveNavItem';

// Icons
import { 
    FaChartLine, FaExclamationTriangle, FaClock, FaSearch, FaFilter, 
    FaPlus, FaBolt, FaTimes, FaPlay, FaPen, FaTrash 
} from 'react-icons/fa';
import { FaRegClock } from 'react-icons/fa';

function RoutinesPage() {
    const activeItem = useActiveNavItem();

    // --- 1. DATA STATE ---
    const [routines, setRoutines] = useState([
        { id: 1, name: 'Low Stock Monitor - Hydraulic Oil', description: 'Create Alert: Critical Severity Alert', trigger: 'Hydraulic Oil ISO 68 < 10', frequency: 'On Event', lastRun: '21 Nov 2025, 11:30', status: true, error: false },
        { id: 2, name: 'Daily Transaction Summary', description: 'Email Report: Send to Admin', trigger: 'Every Day at 08:00', frequency: 'Daily', lastRun: '21 Nov 2025, 08:00', status: true, error: false },
        { id: 3, name: 'Welding Rods Expiry Check', description: 'Create Alert: Warning Severity Alert', trigger: '< 30 Days Remaining', frequency: 'Weekly', lastRun: '15 Nov 2025, 09:00', status: false, error: false },
        { id: 4, name: 'Auto-Reorder Steel Bolts', description: 'Create PO: Vendor: Fasteners Inc.', trigger: 'M12x50mm Bolts < 50', frequency: 'On Event', lastRun: '20 Nov 2025, 17:20', status: false, error: true }
    ]);

    // --- 2. FILTER STATE ---
    const [searchText, setSearchText] = useState("");
    const [freqFilter, setFreqFilter] = useState("All");

    // --- 3. MODAL STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "", frequency: "Daily", trigger: "", actionType: "Create Alert", actionDetails: ""
    });

    // --- ACTIONS ---
    const toggleStatus = (id) => {
        setRoutines(prev => prev.map(r => r.id === id ? { ...r, status: !r.status } : r));
    };

    const deleteRoutine = (id) => {
        if(window.confirm("Delete this routine?")) {
            setRoutines(prev => prev.filter(r => r.id !== id));
        }
    };

    const handleSaveRoutine = () => {
        if (!formData.name || !formData.trigger) return alert("Name and Trigger required");
        
        const newRoutine = {
            id: Date.now(),
            name: formData.name,
            description: `${formData.actionType}: ${formData.actionDetails}`,
            trigger: formData.trigger,
            frequency: formData.frequency,
            lastRun: "Never",
            status: true,
            error: false
        };

        setRoutines([newRoutine, ...routines]);
        setIsModalOpen(false);
        setFormData({ name: "", frequency: "Daily", trigger: "", actionType: "Create Alert", actionDetails: "" });
    };

    // --- TABLE COLUMNS ---
    const routineColumns = [
        {
            key: 'name',
            label: 'ROUTINE NAME',
            render: (item) => (
                <div>
                    <div className={styles.routineName}>{item.name}</div>
                    <div className={styles.routineDesc}>{item.description}</div>
                </div>
            )
        },
        { key: 'trigger', label: 'PROMISE / TRIGGER', render: (item) => <span className={styles.triggerText}>{item.trigger}</span> },
        {
            key: 'frequency', label: 'FREQUENCY',
            render: (item) => {
                const badgeClass = item.frequency === 'On Event' ? styles.badgeEvent : styles.badgeRegular;
                return <span className={`${styles.badge} ${badgeClass}`}>{item.frequency}</span>;
            }
        },
        { key: 'lastRun', label: 'LAST RUN', render: (item) => <span className={styles.metaText}>{item.lastRun}</span> },
        {
            key: 'status', label: 'STATUS',
            render: (item) => (
                <div className={styles.statusCell}>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={item.status} onChange={() => toggleStatus(item.id)} />
                        <span className={styles.slider}></span>
                    </label>
                    {item.error && <FaExclamationTriangle className={styles.errorIcon} title="Last run failed"/>}
                </div>
            )
        },
        {
            key: 'actions', label: 'ACTIONS',
            render: (item) => (
                <div className={styles.actionButtons}>
                    {/* Play Button - Green Hover */}
                    <button className={`${styles.iconBtn} ${styles.playBtn}`} title="Run Now">
                        <FaPlay />
                    </button>
                    {/* Edit Button - Yellow Hover */}
                    <button className={`${styles.iconBtn} ${styles.editBtn}`} title="Edit">
                        <FaPen />
                    </button>
                    {/* Delete Button - Red Hover */}
                    <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => deleteRoutine(item.id)}>
                        <FaTrash />
                    </button>
                </div>
            )
        }
    ];

    // Filter Logic
    const filteredData = routines.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(searchText.toLowerCase());
        const matchFreq = freqFilter === "All" || r.frequency === freqFilter;
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
                        <div><span className={styles.statLabel}>ACTIVE ROUTINES</span><span className={styles.statValue}>{routines.filter(r => r.status).length}</span></div>
                        <div className={`${styles.statIcon} ${styles.greenIcon}`}><FaChartLine /></div>
                    </div>
                    <div className={styles.statCard}>
                        <div><span className={styles.statLabel}>CRITICAL ERRORS</span><span className={styles.statValue}>{routines.filter(r => r.error).length}</span><span className={styles.statSub}>Requires attention</span></div>
                        <div className={`${styles.statIcon} ${styles.redIcon}`}><FaExclamationTriangle /></div>
                    </div>
                    <div className={styles.statCard}>
                        <div><span className={styles.statLabel}>EXECUTIONS (24H)</span><span className={styles.statValue}>{routines.length * 2}</span></div>
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
                            <option value="On Event">On Event</option>
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
                                        <option value="On Event">On Event</option>
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
                                                <input type="text" placeholder="--:-- --" value={formData.trigger} onChange={e => setFormData({...formData, trigger: e.target.value})} />
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