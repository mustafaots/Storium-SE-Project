import cron from 'node-cron';
import db from '../config/database.js';

export const startScheduler = () => {
    console.log('🚀 SCHEDULER STARTED: Checking routines every 20s...');
    
    // The "Heartbeat" - Wakes up every 20 seconds to check if anything needs to run
    cron.schedule('*/20 * * * * *', () => {
        // Optional: Log tick only if you want to see it alive
        // console.log(`[${new Date().toLocaleTimeString()}] ⏰ TICK`);
        processActiveRoutines();
    });
};

const processActiveRoutines = () => {
    db.query("SELECT * FROM routines WHERE is_active = 1", (err, routines) => {
        if (err) return console.error("❌ DB Error:", err);
        if (routines.length === 0) return;

        routines.forEach(routine => {
            // 🛑 CRITICAL CHANGE: Check Time Frequency before executing
            if (shouldRunRoutine(routine)) {
                console.log(`   👉 Time Match! Running Routine: "${routine.name}" (${routine.frequency})`);
                executeSmartLogic(routine);
            }
        });
    });
};

// ==========================================
// 🕒 FREQUENCY CHECKER HELPER
// ==========================================
const shouldRunRoutine = (routine) => {
    const freq = routine.frequency ? routine.frequency.toLowerCase() : 'daily';
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // 1. REAL-TIME / ALWAYS (Runs every 20 seconds)
    if (freq === 'always' || freq === 'real-time') {
        return true;
    }

    // 2. DAILY (Runs only at 09:00 AM)
    if (freq === 'daily') {
        // Checks if it is 9 AM AND the minute is 0 (09:00:00 to 09:00:59)
        return currentHour === 9 && currentMinute === 0;
    }

    // 3. WEEKLY (Runs only on Monday at 09:00 AM)
    if (freq === 'weekly') {
        return currentDay === 1 && currentHour === 9 && currentMinute === 0;
    }

    return false;
};

const executeSmartLogic = (routine) => {
    // 🛡️ SAFETY CHECK
    if (!routine.promise) return;

    const [triggerType, scope] = routine.promise.split(':');
    let sqlQuery = "";
    
    // 1. BUILD SQL
    if (triggerType === 'low_stock') {
        sqlQuery = `
            SELECT s.stock_id, s.product_id, p.name, s.quantity, 
                   p.min_stock_level as limit_val, p.max_stock_level
            FROM stocks s JOIN products p ON s.product_id = p.product_id 
            WHERE s.quantity <= p.min_stock_level
        `;
    } 
    else if (triggerType === 'overstock') {
        sqlQuery = `
            SELECT s.stock_id, s.product_id, p.name, s.quantity, p.max_stock_level as limit_val
            FROM stocks s JOIN products p ON s.product_id = p.product_id 
            WHERE s.quantity >= p.max_stock_level
        `;
    } 
    else if (triggerType === 'expiry') {
        sqlQuery = `
            SELECT s.stock_id, s.product_id, p.name, s.expiry_date, 
            DATEDIFF(s.expiry_date, CURDATE()) as days_left
            FROM stocks s JOIN products p ON s.product_id = p.product_id 
            WHERE s.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) 
            AND s.expiry_date IS NOT NULL
        `;
    }

    // Apply Scope
    if (scope && scope !== 'all' && !isNaN(parseInt(scope))) {
        sqlQuery += ` AND s.product_id = ${parseInt(scope)}`;
    }

    // 2. RUN QUERY
    db.query(sqlQuery, (err, results) => {
        if (err) return console.error("      ❌ Query Error:", err);

        if (results.length > 0) {
            results.forEach(item => {
                performAction(routine, triggerType, item);
            });
            // Update Last Run
            db.query("UPDATE routines SET last_run = NOW() WHERE routine_id = ?", [routine.routine_id]);
        }
    });
};

const performAction = (routine, triggerType, item) => {
    if (!routine.resolve) return;
    const [actionType, actionDetail] = routine.resolve.split(':');

    // ====================================================
    // 🅰️ LOGIC: CREATE TRANSACTION (Auto-Reorder)
    // ====================================================
    if (actionType === 'create_transaction') {
        console.log(`         ⚙️ STARTING AUTO-REORDER for: ${item.name}`);

        let amountToOrder = 0;
        let note = "";

        if (actionDetail === 'fill_max') {
            const maxLevel = item.max_stock_level || 100;
            amountToOrder = maxLevel - item.quantity;
            note = `Auto-Reorder (Fill to Max: ${maxLevel})`;
        } 
        else if (actionDetail && actionDetail.startsWith('fixed_')) {
            amountToOrder = parseInt(actionDetail.split('_')[1]);
            note = `Auto-Reorder (Fixed Qty: ${amountToOrder})`;
        }
        else {
            amountToOrder = 50;
            note = "Auto-Reorder (Default 50)";
        }

        if (amountToOrder <= 0) return;

        // Duplicate Check
        const dupSql = `
            SELECT txn_id FROM transactions 
            WHERE stock_id = ? AND is_automated = 1 AND \`timestamp\` > NOW() - INTERVAL 1 MINUTE
        `;

        db.query(dupSql, [item.stock_id], (err, txns) => {
            if (err) return console.error("         ❌ DB Error:", err.message);

            if (txns && txns.length === 0) {
                const txnSql = `
                    INSERT INTO transactions 
                    (is_automated, routine_id, stock_id, product_id, txn_type, quantity, total_value, notes, \`timestamp\`)
                    VALUES (1, ?, ?, ?, 'inflow', ?, 0.00, ?, NOW())
                `;

                db.query(txnSql, [routine.routine_id, item.stock_id, item.product_id, amountToOrder, note], (tErr) => {
                    if (tErr) return console.error("            ❌ Txn Failed:", tErr.message);
                    
                    console.log(`            ✅ REORDER SUCCESS: +${amountToOrder} units.`);

                    const stockUpd = "UPDATE stocks SET quantity = quantity + ? WHERE stock_id = ?";
                    db.query(stockUpd, [amountToOrder, item.stock_id]);
                });
            } else {
                console.log(`         ✋ Skipped: Recently ordered.`);
            }
        });
    }

    // ====================================================
    // 🅱️ LOGIC: CREATE ALERT (Notification)
    // ====================================================
    else if (actionType === 'create_alert') {
        let severity = actionDetail || 'warning';
        let alertType = triggerType; 
        let message = "";

        if (triggerType === 'low_stock') {
            message = `${item.name}: Low Stock! Qty is ${item.quantity} (Min: ${item.limit_val})`;
            if (severity === 'info') alertType = 'reorder';
        } 
        else if (triggerType === 'overstock') {
            message = `${item.name}: Overstocked! Qty is ${item.quantity} (Max: ${item.limit_val})`;
        } 
        else if (triggerType === 'expiry') {
            if (item.days_left < 0) {
                message = `${item.name}: EXPIRED ${Math.abs(item.days_left)} days ago!`;
                severity = 'critical';
            } else {
                message = `${item.name}: Expiring in ${item.days_left} days.`;
            }
        }

        const checkSql = "SELECT alert_id FROM alerts WHERE linked_stock = ? AND alert_type = ? AND is_read = 0";
        
        db.query(checkSql, [item.stock_id, alertType], (err, existingAlerts) => {
            if (err) return;

            if (existingAlerts && existingAlerts.length === 0) {
                const insertSql = `
                    INSERT INTO alerts (alert_type, severity, content, linked_stock, linked_product, sent_at) 
                    VALUES (?, ?, ?, ?, ?, NOW())
                `;
                db.query(insertSql, [alertType, severity, message, item.stock_id, item.product_id], (insErr) => {
                    if (!insErr) console.log(`         🔥 ALERT CREATED: "${message}"`);
                });
            }
        });
    }
};