import cron from 'node-cron';
import db from '../config/database.js'; // Ensure this path is correct

export const startScheduler = () => {
    console.log('🕒 Scheduler started: Running checks every minute...');

    cron.schedule('* * * * *', () => {
        console.log('\n--- 🔄 STARTING ROUTINE CHECK: ' + new Date().toLocaleTimeString() + ' ---');
        
        // We call the functions directly to debug
        checkLowStock();
    });
};

const checkLowStock = () => {
    console.log("1️⃣  Step 1: Checking Stock Levels...");

    const query = `
        SELECT s.stock_id, p.product_id, p.name, s.quantity, p.min_stock_level 
        FROM stocks s 
        JOIN products p ON s.product_id = p.product_id 
        WHERE s.quantity <= p.min_stock_level
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ SQL ERROR Reading Stocks:", err.message);
            return;
        }

        console.log(`🔎 Found ${results.length} items with low stock.`);

        if (results.length === 0) {
            console.log("✅ No alerts needed. System healthy.");
        }

        results.forEach(item => {
            console.log(`   -> Attempting to alert for: ${item.name} (Qty: ${item.quantity})`);
            createAlert(
                'low_stock', 
                'warning', 
                `Low stock: ${item.name} is at ${item.quantity}`, 
                item.stock_id, 
                item.product_id
            );
        });
    });
};

const createAlert = (type, severity, content, stockId, productId) => {
    // ⚠️ DEBUG MODE: I REMOVED THE DUPLICATE CHECK
    // We strictly want to see if INSERT works.

    const insertQuery = `
        INSERT INTO alerts (alert_type, severity, content, linked_stock, linked_product, sent_at, is_read)
        VALUES (?, ?, ?, ?, ?, NOW(), 0)
    `;

    db.query(insertQuery, [type, severity, content, stockId, productId], (err, res) => {
        if (err) {
            // 🚨 THIS IS WHERE YOUR ERROR IS HIDING
            console.error("\n❌ ❌ ❌ INSERT FAILED ❌ ❌ ❌");
            console.error("SQL Message:", err.message);
            console.error("Attempted to insert:", { type, severity, content, stockId, productId });
            return;
        }
        
        console.log(`✅ SUCCESS! Alert inserted into DB. Insert ID: ${res.insertId}`);
    });
};