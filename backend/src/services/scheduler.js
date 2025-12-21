import cron from 'node-cron';
import db from '../config/database.js';

export const startScheduler = () => {
    console.log('🚀 SCHEDULER STARTED: Debug Mode (Running every 20s)...');
    
    // Run every 20 seconds
    cron.schedule('*/20 * * * * *', () => {
        const now = new Date().toLocaleTimeString();
        console.log(`\n[${now}] ⏰ TICK: Scheduler Waking Up...`);
        processActiveRoutines();
    });
};

const processActiveRoutines = () => {
    db.query("SELECT * FROM routines WHERE is_active = 1", (err, routines) => {
        if (err) return console.error("❌ DB Error:", err);

        if (routines.length === 0) {
            console.log("   💤 No active routines found.");
            return;
        }

        console.log(`   🔎 Found ${routines.length} active routines.`);

        routines.forEach(routine => {
            // FORCE RUN FOR TEST
            executeSmartLogic(routine);
        });
    });
};

const executeSmartLogic = (routine) => {
    // 🛡️ SAFETY CHECK: If promise is empty, skip this routine
    if (!routine.promise) {
        console.log(`      ⚠️ Skipping Routine "${routine.name}" (No logic defined)`);
        return; 
    }

    const [triggerType, scope] = routine.promise.split(':');
    
    // Log what we are trying to do
    console.log(`   👉 Running Routine: "${routine.name}"`);
    console.log(`      Target: ${triggerType.toUpperCase()} | Scope: ${scope}`);

    let sqlQuery = "";
    
    // 1. BUILD SQL (Updated to fetch Max Level for Reordering)
    if (triggerType === 'low_stock') {
        sqlQuery = `
            SELECT s.stock_id, s.product_id, p.name, s.quantity, 
                   p.min_stock_level as limit_val, 
                   p.max_stock_level
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

    // 2. RUN QUERY & LOG RESULTS
    db.query(sqlQuery, (err, results) => {
        if (err) return console.error("      ❌ Query Error:", err);

        if (results.length === 0) {
            console.log(`      ✅ Check Complete: No issues found in DB.`);
            return;
        }

        console.log(`      ⚠️  FOUND ${results.length} ISSUES IN DATABASE:`);
        
        results.forEach(row => {
            if (triggerType === 'expiry') {
                const dateStr = new Date(row.expiry_date).toLocaleDateString();
                console.log(`         📦 Item: ${row.name} | Expiry: ${dateStr} | Days Diff: ${row.days_left}`);
            } else {
                console.log(`         📦 Item: ${row.name} | Qty: ${row.quantity} | Limit: ${row.limit_val}`);
            }
        });

        // 3. PERFORM ACTION (Alert OR Transaction)
        results.forEach(item => {
            performAction(routine, triggerType, item);
        });
    });
};

const performAction = (routine, triggerType, item) => {
    // Parse the resolve string: "create_alert:critical" OR "create_transaction:fill_max"
    // Safety check in case resolve is empty
    if (!routine.resolve) return;
    
    const [actionType, actionDetail] = routine.resolve.split(':');

    // ====================================================
    // 🅰️ LOGIC: CREATE TRANSACTION (Auto-Reorder)
    // ====================================================
    if (actionType === 'create_transaction') {
        console.log(`         ⚙️ STARTING AUTO-REORDER for: ${item.name}`);

        let amountToOrder = 0;
        let note = "";

        // Calculate Amount
        if (actionDetail === 'fill_max') {
            const maxLevel = item.max_stock_level || 100; // Default to 100 if null
            amountToOrder = maxLevel - item.quantity;
            note = `Auto-Reorder (Fill to Max: ${maxLevel})`;
        } 
        else if (actionDetail && actionDetail.startsWith('fixed_')) {
            // Example: fixed_100 -> 100
            amountToOrder = parseInt(actionDetail.split('_')[1]);
            note = `Auto-Reorder (Fixed Qty: ${amountToOrder})`;
        }
        else {
            // Fallback
            amountToOrder = 50;
            note = "Auto-Reorder (Default 50)";
        }

        if (amountToOrder <= 0) {
            console.log(`         ✋ No reorder needed (Qty sufficient).`);
            return;
        }

        // 1. DUPLICATE CHECK (Prevent spamming transactions)
        // Checks transactions from the last minute
        // FIX: Added backticks around `timestamp` and handled ERROR callback
        const dupSql = `
            SELECT txn_id FROM transactions 
            WHERE stock_id = ? AND is_automated = 1 AND \`timestamp\` > NOW() - INTERVAL 1 MINUTE
        `;

        db.query(dupSql, [item.stock_id], (err, txns) => {
            // 🛡️ CRITICAL FIX: Check for error first!
            if (err) {
                console.error("         ❌ DB Error during Duplicate Check:", err.message);
                return;
            }

            // Now it is safe to check length
            if (txns && txns.length === 0) {
                // 2. INSERT TRANSACTION
                const txnSql = `
                    INSERT INTO transactions 
                    (is_automated, routine_id, stock_id, product_id, txn_type, quantity, total_value, notes, \`timestamp\`)
                    VALUES (1, ?, ?, ?, 'inflow', ?, 0.00, ?, NOW())
                `;

                db.query(txnSql, [routine.routine_id, item.stock_id, item.product_id, amountToOrder, note], (tErr, res) => {
                    if (tErr) return console.error("            ❌ Txn Insert Failed:", tErr.message);
                    
                    console.log(`            ✅ TRANSACTION CREATED! Added +${amountToOrder} units.`);

                    // 3. UPDATE STOCK (Fix the problem)
                    const stockUpd = "UPDATE stocks SET quantity = quantity + ? WHERE stock_id = ?";
                    db.query(stockUpd, [amountToOrder, item.stock_id], (uErr) => {
                        if (uErr) console.error("            ❌ Stock Update Failed:", uErr.message);
                        else console.log(`            📈 Stock Updated. New Qty: ${item.quantity + amountToOrder}`);
                    });
                });
            } else {
                console.log(`         ✋ Skipped: Recently ordered (Wait 1 min).`);
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

        // Check Duplicate
        const checkSql = "SELECT alert_id FROM alerts WHERE linked_stock = ? AND alert_type = ? AND is_read = 0";
        
        db.query(checkSql, [item.stock_id, alertType], (err, existingAlerts) => {
            if (err) return console.error("         ❌ Alert Check Failed:", err.message);

            if (existingAlerts && existingAlerts.length === 0) {
                const insertSql = `
                    INSERT INTO alerts (alert_type, severity, content, linked_stock, linked_product, sent_at) 
                    VALUES (?, ?, ?, ?, ?, NOW())
                `;
                db.query(insertSql, [alertType, severity, message, item.stock_id, item.product_id], (insErr, res) => {
                    if (insErr) console.error("         ❌ Insert Alert Failed:", insErr.message);
                    else console.log(`         🔥 INSERTED ALERT: "${message}"`);
                });
            } else {
                console.log(`         ✋ Duplicate Skipped (Alert Active)`);
            }
        });
    }
};