import cron from 'node-cron';
import db from '../config/database.js';

export const startScheduler = () => {
    console.log('🕒 Scheduler started: Listening to your Routines table...');
    cron.schedule('* * * * *', () => {
        processActiveRoutines();
    });
};

const processActiveRoutines = () => {
    db.query("SELECT * FROM routines WHERE is_active = 1", (err, routines) => {
        if (err || routines.length === 0) return;

        routines.forEach(routine => {
            if (shouldRunRoutine(routine)) {
                executeRoutineLogic(routine);
            }
        });
    });
};

// Check if it's time to run
const shouldRunRoutine = (routine) => {
    const freq = routine.frequency;
    const now = new Date();
    if (freq === 'always') return true;
    if (freq === 'daily') return now.getHours() === 9 && now.getMinutes() === 0;
    if (freq === 'weekly') return now.getDay() === 1 && now.getHours() === 9 && now.getMinutes() === 0;
    return false;
};

const executeRoutineLogic = (routine) => {
    // 1. PARSE PROMISE: "low_stock:all" OR "low_stock:15"
    const [triggerType, scope] = routine.promise.split(':');
    
    let baseQuery = "";
    
    // 2. BUILD BASE QUERY
    if (triggerType === 'low_stock') {
        baseQuery = `
            SELECT s.stock_id, p.product_id, p.name, s.quantity, p.min_stock_level, p.max_stock_level
            FROM stocks s JOIN products p ON s.product_id = p.product_id 
            WHERE s.quantity <= p.min_stock_level
        `;
    } 
    else if (triggerType === 'overstock') {
        baseQuery = `
            SELECT s.stock_id, p.product_id, p.name, s.quantity, p.max_stock_level
            FROM stocks s JOIN products p ON s.product_id = p.product_id 
            WHERE s.quantity >= p.max_stock_level
        `;
    }
    else if (triggerType === 'expiry') {
        baseQuery = `
            SELECT s.stock_id, p.product_id, p.name, s.expiry_date
            FROM stocks s JOIN products p ON s.product_id = p.product_id 
            WHERE s.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        `;
    }

    if (!baseQuery) return;

    // 3. APPLY SCOPE (Filter by Specific Product if needed)
    if (scope && scope !== 'all') {
        baseQuery += ` AND s.product_id = ${parseInt(scope)}`;
        console.log(`⚡ Running Specific Routine "${routine.name}" for Product ID ${scope}`);
    } else {
        console.log(`⚡ Running Global Routine "${routine.name}" for ALL products`);
    }

    // 4. EXECUTE SQL
    db.query(baseQuery, (err, results) => {
        if (err || results.length === 0) return;

        results.forEach(item => {
            performAction(routine, routine.resolve, item);
        });

        // Update Last Run
        db.query("UPDATE routines SET last_run = NOW() WHERE routine_id = ?", [routine.routine_id]);
    });
};

// ... performAction function stays the same as before ...
const performAction = (routine, resolveStr, item) => {
    const [actionType, actionDetail] = resolveStr.split(':');

    if (actionType === 'create_alert') {
        const severity = actionDetail || 'warning';
        // Check for duplicate unread alert
        db.query("SELECT alert_id FROM alerts WHERE linked_stock = ? AND alert_type = ? AND is_read = 0", 
        [item.stock_id, routine.promise.split(':')[0]], (err, res) => {
            if (res.length === 0) {
                const msg = `${item.name}: Condition met (Routine: ${routine.name})`;
                db.query(`INSERT INTO alerts (alert_type, severity, content, linked_stock, linked_product, sent_at) VALUES (?, ?, ?, ?, ?, NOW())`,
                    ['low_stock', severity, msg, item.stock_id, item.product_id]);
                console.log(`   -> Alert sent for ${item.name}`);
            }
        });
    }
    else if (actionType === 'create_transaction') {
        let qty = 0;
        if (actionDetail === 'fill_max') qty = (item.max_stock_level || 100) - item.quantity;
        else if (actionDetail.startsWith('fixed_')) qty = parseInt(actionDetail.split('_')[1]);

        if (qty > 0) {
            db.query(`INSERT INTO transactions (product_id, stock_id, txn_type, quantity, notes, is_automated, routine_id) VALUES (?, ?, 'inflow', ?, 'Auto-Reorder', 1, ?)`,
                [item.product_id, item.stock_id, qty, routine.routine_id]);
            db.query(`UPDATE stocks SET quantity = quantity + ? WHERE stock_id = ?`, [qty, item.stock_id]);
            console.log(`   -> Reordered ${qty} for ${item.name}`);
        }
    }
};