import db from './src/config/database.js';

console.log("🛠️  Setting up Test Data...");

// 1. Create a dummy product with a HIGH min_stock_level (e.g., 100)
// 2. Create a stock with LOW quantity (e.g., 5)
// This guarantees the scheduler will see it as "Low Stock" and generate an alert.

const createTestData = () => {
    const productSql = `INSERT INTO products (name, min_stock_level) VALUES ('Test Product Widget', 100)`;
    
    db.query(productSql, (err, result) => {
        if (err) { console.error(err); process.exit(1); }
        
        const productId = result.insertId;
        console.log(`1. Created Test Product (ID: ${productId}) with Min Stock Level 100`);

        // Now add stock that is TOO LOW (5 < 100)
        // We need a dummy rack_slot first strictly speaking, but if your FK allows nulls for testing:
        // Based on your schema: slot_id can be NULL if not strict, or we pick existing.
        // Let's assume you have at least 1 slot or we set slot_id to NULL for this test.
        
        const stockSql = `
            INSERT INTO stocks (product_id, quantity, product_type) 
            VALUES (?, 5, 'raw')
        `;

        db.query(stockSql, [productId], (err, res) => {
            if (err) console.error("Stock Insert Error:", err);
            else console.log(`2. Created Low Stock (ID: ${res.insertId}) with Quantity 5`);
            
            console.log("✅ Data Ready. Restart your server. Watch the console for '✅ Alert Created'.");
            process.exit();
        });
    });
};

createTestData();