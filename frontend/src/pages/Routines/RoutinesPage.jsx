import { useState, useEffect } from 'react';
import styles from './RoutinesPage.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';
import Header from '../../components/UI/Header/Header.jsx'; 
import Table from "../../components/Layout/Table/table.jsx"; 
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Icons
import { 
    FaPlus, FaBolt, FaTimes, FaPlay, FaTrash, FaEnvelope, FaBoxOpen, FaBell 
} from 'react-icons/fa';

// API BASE URL
const API_URL = "http://localhost:3001/api/routines";

function RoutinesPage() {
    const activeItem = useActiveNavItem();

    // --- STATE ---
    const [routines, setRoutines] = useState([]);
    const [stats, setStats] = useState({ active_routines: 0, critical_errors: 0, executions_24h: 0 });
    
    // THIS IS THE FIX: We use the same state name and fetching logic as your original working code
    const [productList, setProductList] = useState([]); 
    
    // --- FILTER STATE ---
    const [searchText, setSearchText] = useState("");
    const [freqFilter, setFreqFilter] = useState("All");

    // --- MODAL STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // FORM DATA
    const [formData, setFormData] = useState({
        name: "", 
        frequency: "daily", 
        
        // TRIGGER
        routineType: "low_stock",  
        targetScope: "all",        // 'all' or 'specific'
        targetProductId: "",       // ID if specific
        
        // ACTION
        actionType: "create_alert", 
        actionDetail: "warning"    
    });

    // Transaction UI Helpers
    const [txnStrategy, setTxnStrategy] = useState("fill_max");
    const [txnQty, setTxnQty] = useState(100);

    const [prevExecCount, setPrevExecCount] = useState(0);

    // =============================================
    // FETCH DATA (Restored to your working logic)
    // =============================================
    const fetchAllData = async () => {
        try {
            // 1. Get List of Routines
            const routinesRes = await fetch(API_URL);
            const routinesData = await routinesRes.json();
            setRoutines(routinesData);

            // 2. Get Stats
            const statsRes = await fetch(`${API_URL}/stats`);
            const statsData = await statsRes.json();
            
            // Check for notifications
            if (prevExecCount > 0 && statsData.executions_24h > prevExecCount) {
                toast.success(`🚀 Routine Executed Automatically!`, { position: "top-right", theme: "dark" });
            }
            setStats(statsData);
            setPrevExecCount(statsData.executions_24h); 

            // 3. GET PRODUCTS (Restored: using the endpoint that worked for you)
            const prodRes = await fetch(`${API_URL}/products`);
            if (prodRes.ok) {
                const prodData = await prodRes.json();
                setProductList(prodData);
            } else {
                console.warn("Could not fetch products from /api/routines/products");
            }

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
        } catch (error) { console.error(error); }
    };

    const deleteRoutine = async (id) => {
        if(window.confirm("Delete this routine?")) {
            try {
                await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                setRoutines(prev => prev.filter(r => r.routine_id !== id));
                fetchAllData(); 
            } catch (error) { console.error(error); }
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
        } catch (error) { toast.error("Execution failed."); }
    }

    // --- SAVE ROUTINE ---
    const handleSaveRoutine = async () => {
        if (!formData.name) return toast.warning("Please enter a Routine Name");
        if (formData.targetScope === 'specific' && !formData.targetProductId) return toast.warning("Please select a product");

        try {
            // 1. CONSTRUCT PROMISE (Trigger)
            const scopeValue = formData.targetScope === 'all' ? 'all' : formData.targetProductId;
            const promiseString = `${formData.routineType}:${scopeValue}`;

            // 2. CONSTRUCT RESOLVE (Action)
            let finalDetail = formData.actionDetail;
            if (formData.actionType === 'create_transaction') {
                finalDetail = txnStrategy === 'fill_max' ? 'fill_max' : `fixed_${txnQty}`;
            }
            const resolveString = `${formData.actionType}:${finalDetail}`;

            const payload = {
                name: formData.name,
                promise: promiseString, 
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
                setFormData({ 
                    name: "", frequency: "daily", 
                    routineType: "low_stock", targetScope: "all", targetProductId: "",
                    actionType: "create_alert", actionDetail: "warning" 
                });
                fetchAllData(); 
                toast.success("Routine Saved!");
            } else {
                toast.error("Failed to save routine");
            }
        } catch (error) { console.error(error); }
    };

    // --- RENDER HELPERS ---
    const formatTriggerText = (promiseStr) => {
        if(!promiseStr) return "Unknown";
        const [type, scope] = promiseStr.split(':');
        
        let typeText = type;
        if(type === 'low_stock') typeText = '📉 Low Stock';
        if(type === 'overstock') typeText = '📈 Overstock';
        if(type === 'expiry') typeText = '📅 Expiry';
        if(type === 'dead_stock') typeText = '💀 Dead Stock';

        // Try to find product name from list, fallback to ID
        let scopeText = "(All Products)";
        if (scope && scope !== 'all') {
            const prod = productList.find(p => p.product_id === parseInt(scope));
            scopeText = prod ? `(${prod.name})` : `(Product #${scope})`;
        }
        
        return `${typeText} ${scopeText}`;
    };

    const formatActionText = (resolveStr) => {
        if(!resolveStr) return "No Action";
        const [type, detail] = resolveStr.split(':');
        
        if (type === 'create_alert') return <span className={styles.badgeWarning}><FaBell/> Alert ({detail})</span>;
        if (type === 'send_email') return <span className={styles.badgeInfo}><FaEnvelope/> Email</span>;
        if (type === 'create_transaction') return <span className={styles.badgeSuccess}><FaBoxOpen/> Reorder</span>;
        return resolveStr;
    };

    const routineColumns = [
        { key: 'name', label: 'ROUTINE NAME', render: (item) => <div className={styles.routineName}>{item.name}</div> },
        { key: 'promise', label: 'TRIGGER', render: (item) => <span className={styles.triggerText}>{formatTriggerText(item.promise)}</span> },
        { key: 'resolve', label: 'ACTION', render: (item) => formatActionText(item.resolve) },
        { key: 'frequency', label: 'FREQUENCY', render: (item) => <span className={`${styles.badge} ${item.frequency === 'always' ? styles.badgeEvent : styles.badgeRegular}`}>{item.frequency}</span> },
        { key: 'status', label: 'STATUS', render: (item) => (
            <div className={styles.statusCell}>
                <label className={styles.switch}>
                    <input type="checkbox" checked={!!item.is_active} onChange={() => toggleStatus(item.routine_id, !!item.is_active)} />
                    <span className={styles.slider}></span>
                </label>
            </div>
        )},
        { key: 'actions', label: 'ACTIONS', render: (item) => (
            <div className={styles.actionButtons}>
                <button className={`${styles.iconBtn} ${styles.playBtn}`} onClick={() => executeRoutine(item.routine_id, item.name)}><FaPlay /></button>
                <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => deleteRoutine(item.routine_id)}><FaTrash /></button>
            </div>
        )}
    ];

    const filteredData = routines.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(searchText.toLowerCase());
        const matchFreq = freqFilter === "All" || r.frequency === freqFilter.toLowerCase();
        return matchSearch && matchFreq;
    });

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.mainContent}>
                <Header title="ROUTINES" subtitle="Automated inventory health checks" icon={<FaBolt size={28}/>} />
                <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}><FaPlus /> New Routine</button>

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

                        <div className={styles.modalBody}>
                            {/* NAME & FREQUENCY */}
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>ROUTINE NAME</label>
                                    <input type="text" placeholder="e.g. Check Gloves Stock" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>FREQUENCY</label>
                                    <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})}>
                                        <option value="daily">Daily (09:00 AM)</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="always">Real-time (Debug)</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* LOGIC */}
                            <div className={styles.logicContainer}>
                                
                                {/* LEFT: THE TRIGGER */}
                                <div className={styles.logicBox}>
                                    <div className={`${styles.logicHeader} ${styles.blueHeader}`}>THE TRIGGER</div>
                                    <div className={styles.logicContent}>
                                        <div className={styles.formGroup}>
                                            <label>MONITORING TYPE</label>
                                            <select className={styles.selectInput} value={formData.routineType} onChange={(e) => setFormData({...formData, routineType: e.target.value})}>
                                                <option value="low_stock">📉 Low Stock</option>
                                                <option value="overstock">📈 Overstock</option>
                                                <option value="expiry">📅 Expiry</option>
                                            </select>
                                        </div>

                                        {/* SCOPE SELECTION */}
                                        <div className={styles.formGroup}>
                                            <label>SCOPE</label>
                                            <select className={styles.selectInput} value={formData.targetScope} onChange={(e) => setFormData({...formData, targetScope: e.target.value})}>
                                                <option value="all">🌐 All Products</option>
                                                <option value="specific">🎯 Specific Product</option>
                                            </select>
                                        </div>

                                        {/* PRODUCT DROPDOWN (Based on productList) */}
                                        {formData.targetScope === 'specific' && (
                                            <div className={styles.formGroup}>
                                                <label>SELECT PRODUCT</label>
                                                <select 
                                                    className={styles.selectInput}
                                                    value={formData.targetProductId}
                                                    onChange={(e) => setFormData({...formData, targetProductId: e.target.value})}
                                                >
                                                    <option value="">-- Choose Product --</option>
                                                    {productList.map(p => (
                                                        <option key={p.product_id} value={p.product_id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* RIGHT: THE ACTION */}
                                <div className={styles.logicBox}>
                                    <div className={`${styles.logicHeader} ${styles.greenHeader}`}>THE ACTION</div>
                                    <div className={styles.logicContent}>
                                        <div className={styles.formGroup}>
                                            <label>ACTION TYPE</label>
                                            <select className={styles.selectInput} value={formData.actionType} onChange={(e) => setFormData({...formData, actionType: e.target.value})}>
                                                <option value="create_alert">🔔 Create Alert</option>
                                                <option value="send_email">📧 Send Email</option>
                                                {formData.routineType === 'low_stock' && <option value="create_transaction">📦 Auto-Reorder</option>}
                                            </select>
                                        </div>
                                        
                                        {/* DETAILS INPUT */}
                                        <div className={styles.formGroup}>
                                            {formData.actionType === 'create_alert' && (
                                                <select className={styles.selectInput} value={formData.actionDetail} onChange={e => setFormData({...formData, actionDetail: e.target.value})}>
                                                    <option value="info">Info</option>
                                                    <option value="warning">Warning</option>
                                                    <option value="critical">Critical</option>
                                                </select>
                                            )}
                                            {formData.actionType === 'create_transaction' && (
                                                <select className={styles.selectInput} value={txnStrategy} onChange={e => setTxnStrategy(e.target.value)}>
                                                    <option value="fill_max">Fill to Max</option>
                                                    <option value="fixed">Fixed Qty</option>
                                                </select>
                                            )}
                                            {txnStrategy === 'fixed' && formData.actionType === 'create_transaction' && (
                                                <input type="number" value={txnQty} onChange={e => setTxnQty(e.target.value)} placeholder="Qty" />
                                            )}
                                            {formData.actionType === 'send_email' && (
                                                <input type="email" value={formData.actionDetail} onChange={e => setFormData({...formData, actionDetail: e.target.value})} placeholder="Email Address" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button className={styles.textBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button className={styles.primaryBtn} onClick={handleSaveRoutine}>Save Routine</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
}

export default RoutinesPage;