// Visualization Model - Database queries for visualization data
// Path: backend/src/models/visualise.model.js

/**
 * Helper to build filtering WHERE clauses
 */
const buildFilterWhere = (filters = {}, prefix = 's') => {
  const conditions = [];
  const params = [];

  if (filters.productId) {
    conditions.push(`${prefix}.product_id = ?`);
    params.push(filters.productId);
  }

  if (filters.stockType && filters.stockType !== 'all') {
    conditions.push(`${prefix}.product_type = ?`);
    params.push(filters.stockType);
  }

  // Location filtering requires joining through the hierarchy
  // This logic assumes the main table is linked to stocks (s) or transactions (t)
  if (filters.locationId) {
    // If filtering by location, we need to ensure the main query joins stocks -> rack_slots -> racks -> aisles -> depots
    // This helper returns the condition, but the main query must support the join
    conditions.push(`EXISTS (
      SELECT 1 FROM rack_slots rs
      JOIN racks r ON rs.rack_id = r.rack_id
      JOIN aisles a ON r.parent_aisle = a.aisle_id
      JOIN depots d ON a.parent_depot = d.depot_id
      WHERE rs.slot_id = ${prefix}.slot_id AND d.parent_location = ?
    )`);
    params.push(filters.locationId);
  }

  return {
    whereClause: conditions.length > 0 ? ' AND ' + conditions.join(' AND ') : '',
    params
  };
};

/**
 * Get total stock value from all stocks
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<number>} Total stock value
 */
export const getTotalStockValue = async (db, filters = {}) => {
  const { whereClause, params } = buildFilterWhere(filters, 's');

  const [rows] = await db.execute(`
    SELECT COALESCE(SUM(s.quantity * COALESCE(s.sale_price, s.cost_price, p.rate, 0)), 0) as total_value
    FROM stocks s
    LEFT JOIN products p ON p.product_id = s.product_id
    WHERE 1=1 ${whereClause}
  `, params);
  return parseFloat(rows[0]?.total_value) || 0;
};

/**
 * Get count of transactions from today
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<number>} Number of movements today
 */
export const getMovementsToday = async (db, filters = {}) => {
  // Transaction filtering is slightly different for location
  const txnConditions = [];
  const txnParams = [];

  if (filters.productId) {
    txnConditions.push('t.product_id = ?');
    txnParams.push(filters.productId);
  }

  // Determine filtering base query
  let query = `
    SELECT COUNT(*) as count
    FROM transactions t
    WHERE DATE(t.timestamp) = CURDATE()
  `;

  if (txnConditions.length > 0) {
    query += ' AND ' + txnConditions.join(' AND ');
  }

  const [rows] = await db.execute(query, txnParams);
  return parseInt(rows[0]?.count) || 0;
};

/**
 * Get count of products below minimum stock level
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<number>} Number of products below min level
 */
export const getProductsBelowMinLevel = async (db, filters = {}) => {
  const { whereClause, params } = buildFilterWhere(filters, 's');

  // Note: If filtering by location, we only count stock in that location against the global min level?
  // Or do we treat min_level as a global threshold and see if filtered stock < min_level?
  // For simplicity, we compare aggregated filtered stock against global min_level.

  const productFilter = filters.productId ? `AND p.product_id = ${filters.productId}` : '';

  const [rows] = await db.execute(`
    SELECT COUNT(*) as count FROM (
      SELECT p.product_id
      FROM products p
      LEFT JOIN stocks s ON p.product_id = s.product_id
      WHERE p.min_stock_level IS NOT NULL
      ${productFilter}
      GROUP BY p.product_id, p.min_stock_level
      HAVING COALESCE(SUM(CASE WHEN 1=1 ${whereClause} THEN s.quantity ELSE 0 END), 0) < p.min_stock_level
    ) as below_min
  `, params);
  return rows.length || 0;
};

/**
 * Get warehouse occupancy percentage
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<number>} Occupancy percentage (0-100)
 */
export const getWarehouseOccupancy = async (db, filters = {}) => {
  let locationJoin = '';
  let locationWhere = '';
  const params = [];

  if (filters.locationId) {
    locationJoin = `
      JOIN racks r ON rs.rack_id = r.rack_id
      JOIN aisles a ON r.parent_aisle = a.aisle_id
      JOIN depots d ON a.parent_depot = d.depot_id
    `;
    locationWhere = 'AND d.parent_location = ?';
    params.push(filters.locationId);
  }

  // Product filtering for occupancy is tricky because a slot is occupied regardless of product.
  // Visualizing "occupancy by product" is different.
  // Standard occupancy ignores product filter usually, but if requested:
  // We count slots containing the specific product vs total slots? That's utilization, not occupancy.
  // Let's implement location filtering only for occupancy base metric.

  // IMPORTANT:
  // Do not rely on rack_slots.is_occupied being maintained.
  // Derive occupancy from actual stock presence to avoid always-0 occupancy.
  const [rows] = await db.execute(`
    SELECT 
      COUNT(DISTINCT rs.slot_id) as total_slots,
      COUNT(DISTINCT CASE WHEN s.stock_id IS NOT NULL AND COALESCE(s.quantity, 0) > 0 THEN rs.slot_id END) as occupied_slots
    FROM rack_slots rs
    LEFT JOIN stocks s ON s.slot_id = rs.slot_id
    ${locationJoin}
    WHERE 1=1 ${locationWhere}
  `, params);

  const total = parseInt(rows[0]?.total_slots) || 0;
  const occupied = parseInt(rows[0]?.occupied_slots) || 0;

  if (total === 0) return 0;
  return Math.round((occupied / total) * 100);
};

/**
 * Get stock trends for a given number of days
 * @param {Object} db - Database connection pool
 * @param {number} days - Number of days to look back
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Array of daily stock values
 */
export const getStockTrends = async (db, days = 30, filters = {}) => {
  const conditions = ['t.timestamp >= DATE_SUB(CURDATE(), INTERVAL ? DAY)'];
  const params = [days];

  if (filters.productId) {
    conditions.push('t.product_id = ?');
    params.push(filters.productId);
  }

  // Location filtering for transactions would require denormalized location data or complex joins
  // Assuming transactions don't strictly track "location" historically without snapshot parsing.
  // We'll skip location filtering for trends v1 to keep performance high, or join if needed.

  const [rows] = await db.execute(`
    SELECT 
      DATE(t.timestamp) as date,
      SUM(CASE 
        WHEN t.txn_type = 'inflow' THEN t.total_value
        WHEN t.txn_type = 'outflow' THEN -t.total_value
        ELSE 0
      END) as daily_change
    FROM transactions t
    WHERE ${conditions.join(' AND ')}
    GROUP BY DATE(t.timestamp)
    ORDER BY date ASC
  `, params);

  return rows;
};

/**
 * Get current stock value snapshot
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<number>} Current total stock value
 */
export const getCurrentStockValue = async (db, filters = {}) => {
  const { whereClause, params } = buildFilterWhere(filters, 's');

  const [rows] = await db.execute(`
    SELECT COALESCE(SUM(s.quantity * COALESCE(s.sale_price, s.cost_price, p.rate, 0)), 0) as value
    FROM stocks s
    LEFT JOIN products p ON p.product_id = s.product_id
    WHERE 1=1 ${whereClause}
  `, params);
  return parseFloat(rows[0]?.value) || 0;
};

/**
 * Get warehouse zones with slot occupancy data
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Array of zones with their slots
 */
export const getWarehouseZones = async (db, filters = {}) => {
  const params = [];
  let depotWhere = '';

  if (filters.locationId) {
    depotWhere = 'WHERE d.parent_location = ?';
    params.push(filters.locationId);
  }

  const [depots] = await db.execute(`
    SELECT 
      d.depot_id,
      d.name as depot_name,
      l.name as location_name
    FROM depots d
    LEFT JOIN locations l ON d.parent_location = l.location_id
    ${depotWhere}
    ORDER BY d.depot_id
  `, params);

  const zones = [];

  for (const depot of depots) {
    // For product filtering, we want to highlight slots containing the product
    // or only show slots with that product? 
    // Showing only slots can break the layout (rows/cols). 
    // Best approach: Fetch all slots for layout, but filter content.

    let productJoin = '';
    let productWhere = '';
    const slotParams = [depot.depot_id];

    if (filters.productId) {
      productWhere += ' AND (s.product_id = ? OR s.product_id IS NULL)';
      slotParams.push(filters.productId);
    }

    if (filters.stockType && filters.stockType !== 'all') {
      productWhere += ' AND (s.product_type = ? OR s.product_type IS NULL)';
      slotParams.push(filters.stockType);
    }

    const [slots] = await db.execute(`
      SELECT 
        rs.slot_id,
        rs.bay_no,
        rs.level_no,
        rs.bin_no,
        CASE WHEN s.stock_id IS NOT NULL AND COALESCE(s.quantity, 0) > 0 THEN TRUE ELSE FALSE END as is_occupied,
        rs.capacity,
        COALESCE(s.quantity, 0) as quantity,
        s.product_type,
        p.name as product_name,
        p.product_id
      FROM rack_slots rs
      LEFT JOIN racks r ON rs.rack_id = r.rack_id
      LEFT JOIN aisles a ON r.parent_aisle = a.aisle_id
      LEFT JOIN stocks s ON rs.slot_id = s.slot_id
      LEFT JOIN products p ON s.product_id = p.product_id
      WHERE a.parent_depot = ?
      ${productWhere}
      ORDER BY rs.bay_no, rs.level_no, rs.bin_no
    `, slotParams);

    // Refined mapping for occupancy visualization
    const zoneSlots = slots.map(slot => {
      let occupancy = 'empty';
      let match = true;

      // Filter verification
      if (filters.productId && Number(slot.product_id) !== Number(filters.productId) && slot.is_occupied) match = false;
      if (filters.stockType && filters.stockType !== 'all' && String(slot.product_type) !== String(filters.stockType) && slot.is_occupied) match = false;

      if (slot.is_occupied && match) {
        const fillPercentage = slot.capacity ? (Number(slot.quantity) / Number(slot.capacity)) * 100 : 50;
        if (fillPercentage >= 80) occupancy = 'high';
        else if (fillPercentage >= 40) occupancy = 'medium';
        else occupancy = 'low';
      } else if (slot.is_occupied && !match) {
        occupancy = 'other'; // Or keep as is_occupied but greyed out
      }

      // If strict filter, maybe hide non-matching items? 
      // Current logic: Show visualization of WHERE the product is.

      return {
        id: `slot-${slot.slot_id}`,
        label: `${slot.bay_no}-${slot.level_no}-${slot.bin_no}`,
        occupancy: match ? occupancy : 'empty', // Visually empty if not matching product
        product: match ? (slot.product_name || null) : null,
        quantity: match ? (slot.quantity || 0) : 0,
        capacity: slot.capacity || 0
      };
    });

    zones.push({
      id: `zone-${depot.depot_id}`,
      name: depot.depot_name || `Zone ${depot.depot_id}`,
      location: depot.location_name,
      slots: zoneSlots
    });
  }

  return zones;
};

/**
 * Get all locations for filter dropdown
 * @param {Object} db - Database connection pool
 * @returns {Promise<Array>} Array of locations
 */
export const getLocations = async (db) => {
  const [rows] = await db.execute(`
    SELECT location_id, name, address
    FROM locations
    ORDER BY name
  `);
  return rows;
};

/**
 * Get all products for filter dropdown
 * @param {Object} db - Database connection pool
 * @returns {Promise<Array>} Array of products
 */
export const getProducts = async (db) => {
  const [rows] = await db.execute(`
    SELECT product_id, name, category
    FROM products
    ORDER BY name
  `);
  return rows;
};

/**
 * Get stock value distribution by category
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Array of categories with their total values
 */
export const getCategoryDistribution = async (db, filters = {}) => {
  const { whereClause, params } = buildFilterWhere(filters, 's');

  const [rows] = await db.execute(`
    SELECT 
      p.category,
      SUM(s.quantity * COALESCE(s.sale_price, s.cost_price, p.rate, 0)) as value
    FROM products p
    JOIN stocks s ON p.product_id = s.product_id
    WHERE 1=1 ${whereClause}
    GROUP BY p.category
    ORDER BY value DESC
  `, params);
  return rows.map(row => ({
    name: row.category || 'Uncategorized',
    value: parseFloat(row.value) || 0
  }));
};

/**
 * Get stocks reaching expiry in the next 90 days
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Array of upcoming expiries
 */
export const getExpirySchedule = async (db, filters = {}) => {
  const { whereClause, params } = buildFilterWhere(filters, 's'); // using s for stocks

  const [rows] = await db.execute(`
    SELECT 
      DATE(s.expiry_date) as date,
      COUNT(*) as item_count,
      SUM(s.quantity) as total_quantity
    FROM stocks s
    WHERE s.expiry_date IS NOT NULL 
      AND s.expiry_date >= CURDATE()
      AND s.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY)
      ${whereClause}
    GROUP BY DATE(s.expiry_date)
    ORDER BY total_quantity DESC 
  `, params); // Note: Grouping by date needs to match selects, added DATE() wrapper for consistency
  return rows;
};

/**
 * Get supply chain performance metrics
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Array of supplier performance data
 */
export const getSupplyChainMetrics = async (db, filters = {}) => {
  // Filters apply to products or potential sources for those products
  const params = [];
  let where = '';

  if (filters.productId) {
    where = 'WHERE ps.product_id = ?';
    params.push(filters.productId);
  }

  const [rows] = await db.execute(`
    SELECT 
      src.source_name as name,
      COALESCE(AVG(ps.lead_time_days), 0) as avg_lead_time,
      COUNT(DISTINCT ps.product_id) as product_count,
      COALESCE(AVG(ps.cost_price), 0) as avg_cost
    FROM sources src
    JOIN product_sources ps ON src.source_id = ps.source_id
    ${where}
    GROUP BY src.source_id
    ORDER BY avg_lead_time ASC
  `, params);
  return rows;
};

/**
 * Get transaction patterns (inflow vs outflow)
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Transaction pattern data
 */
export const getTransactionAnalytics = async (db, filters = {}) => {
  const conditions = ['timestamp >= DATE_SUB(CURDATE(), INTERVAL ? DAY)'];
  const params = [filters.dateRange || 30];

  if (filters.productId) {
    conditions.push('product_id = ?');
    params.push(filters.productId);
  }

  const [rows] = await db.execute(`
    SELECT 
      DATE(timestamp) as date,
      txn_type,
      COUNT(*) as count,
      SUM(total_value) as total_value
    FROM transactions
    WHERE ${conditions.join(' AND ')}
    GROUP BY DATE(timestamp), txn_type
    ORDER BY date ASC
  `, params);
  return rows;
};

/**
 * Get top performing and slow moving products
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} Performance data
 */
export const getProductPerformance = async (db, filters = {}) => {
  // Top moving based on transactions
  const txnParams = [];
  let txnWhere = "WHERE t.txn_type = 'outflow'";

  if (filters.productId) {
    txnWhere += " AND t.product_id = ?";
    txnParams.push(filters.productId);
  }

  // For top moving, if we filter by product, it just returns that one product...
  // Usually this chart is "Top 5 products", so filtering by 1 product makes it a single bar.
  // Location filtering for transactions is hard, ignoring for now.

  const [topMoving] = await db.execute(`
    SELECT p.name, SUM(t.quantity) as total_quantity
    FROM transactions t
    JOIN products p ON t.product_id = p.product_id
    ${txnWhere}
    GROUP BY p.product_id
    ORDER BY total_quantity DESC
    LIMIT 5
  `, txnParams);

  // Slow moving based on stocks
  const { whereClause, params } = buildFilterWhere(filters, 's');

  const [slowMoving] = await db.execute(`
    SELECT p.name, COALESCE(SUM(s.quantity), 0) as current_stock
    FROM products p
    LEFT JOIN stocks s ON p.product_id = s.product_id
    LEFT JOIN transactions t ON p.product_id = t.product_id AND t.timestamp >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
    WHERE t.txn_id IS NULL
    ${whereClause}
    GROUP BY p.product_id
    HAVING current_stock > 0
    ORDER BY current_stock DESC
    LIMIT 5
  `, params);

  return { topMoving, slowMoving };
};

/**
 * Get inventory health metrics (low stock, out of stock)
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} Inventory health stats
 */
export const getInventoryHealth = async (db, filters = {}) => {
  const { whereClause, params } = buildFilterWhere(filters, 's');

  const productFilter = filters.productId ? `AND p.product_id = ${filters.productId}` : '';

  const [lowStock] = await db.execute(`
    SELECT p.product_id, p.name, p.min_stock_level, COALESCE(SUM(s.quantity), 0) as current_stock
    FROM products p
    LEFT JOIN stocks s ON p.product_id = s.product_id
    WHERE p.min_stock_level IS NOT NULL
    ${productFilter}
    GROUP BY p.product_id
    HAVING current_stock < p.min_stock_level AND current_stock > 0 AND (
       -- Ensure we filtered the sum correctly logic-wise
       -- Complex SQL: check if the SUM of filtered stocks is the one violating rule
       -- Simplified: Check total stock for product
       COALESCE(SUM(CASE WHEN 1=1 ${whereClause} THEN s.quantity ELSE 0 END), 0) < p.min_stock_level
    )
    ORDER BY current_stock ASC
    LIMIT 10
  `, params);

  const [outOfStock] = await db.execute(`
    SELECT p.product_id, p.name, p.min_stock_level
    FROM products p
    LEFT JOIN stocks s ON p.product_id = s.product_id
    WHERE 1=1 ${productFilter}
    GROUP BY p.product_id
    HAVING COALESCE(SUM(s.quantity), 0) = 0
    LIMIT 10
  `);

  return { lowStock, outOfStock };
};

/**
 * Get stock value distributed by depot/location
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Depot stock distribution
 */
export const getDepotStock = async (db, filters = {}) => {
  const params = [];
  const conditions = [];

  if (filters.locationId) {
    conditions.push('d.parent_location = ?');
    params.push(filters.locationId);
  }

  if (filters.productId) {
    conditions.push('s.product_id = ?');
    params.push(filters.productId);
  }

  if (filters.stockType && filters.stockType !== 'all') {
    conditions.push('s.product_type = ?');
    params.push(filters.stockType);
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  const [rows] = await db.execute(`
    SELECT 
      d.name as depot_name,
      l.name as location_name,
      COALESCE(SUM(s.quantity * COALESCE(s.sale_price, s.cost_price, p.rate, 0)), 0) as total_value
    FROM depots d
    JOIN locations l ON d.parent_location = l.location_id
    LEFT JOIN aisles a ON a.parent_depot = d.depot_id
    LEFT JOIN racks r ON r.parent_aisle = a.aisle_id
    LEFT JOIN rack_slots rs ON rs.rack_id = r.rack_id
    LEFT JOIN stocks s ON s.slot_id = rs.slot_id
    LEFT JOIN products p ON p.product_id = s.product_id
    ${where}
    GROUP BY d.depot_id
    ORDER BY total_value DESC
  `, params);
  return rows.map(r => ({
    ...r,
    total_value: parseFloat(r.total_value) || 0
  }));
};

/**
 * Get active alerts
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Active alerts
 */
export const getActiveAlerts = async (db, filters = {}) => {
  const conditions = ['is_read = FALSE'];
  const params = [];

  if (filters.productId) {
    conditions.push('(linked_product = ? OR linked_product IS NULL)');
    params.push(filters.productId);
  }

  // Location filtering for alerts:
  // Requires joining linked_stock -> stocks -> ... -> location
  // Complex, skipping for v1 unless requested explicitly.

  const [rows] = await db.execute(`
    SELECT 
      alert_id, 
      alert_type, 
      severity, 
      content, 
      sent_at,
      is_read
    FROM alerts
    WHERE ${conditions.join(' AND ')}
    ORDER BY CASE severity 
      WHEN 'critical' THEN 1 
      WHEN 'warning' THEN 2 
      ELSE 3 END, 
      sent_at DESC
    LIMIT 20
  `, params);
  return rows;
};

/**
 * Get routine execution status
 * @param {Object} db - Database connection pool
 * @returns {Promise<Object>} Routine stats
 */
export const getRoutineStatus = async (db) => {
  // Routines generally global. Filter ignored for now.
  const [overdue] = await db.execute(`
    SELECT routine_id, name, frequency, last_run
    FROM routines
    WHERE is_active = TRUE 
      AND (
        (frequency = 'daily' AND last_run < DATE_SUB(NOW(), INTERVAL 1 DAY)) OR
        (frequency = 'weekly' AND last_run < DATE_SUB(NOW(), INTERVAL 1 WEEK)) OR
        (frequency = 'monthly' AND last_run < DATE_SUB(NOW(), INTERVAL 1 MONTH))
      )
  `);

  const [upcoming] = await db.execute(`
    SELECT routine_id, name, frequency, last_run
    FROM routines
    WHERE is_active = TRUE
    ORDER BY last_run DESC
    LIMIT 5
  `);

  return { overdue, upcoming };
};

/**
 * Get product placements for search
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Product shelf locations
 */
export const getProductPlacement = async (db, filters = {}) => {
  const conditions = [];
  const params = [];

  if (filters.productId) {
    conditions.push('p.product_id = ?');
    params.push(filters.productId);
  }

  if (filters.locationId) {
    conditions.push('d.parent_location = ?');
    params.push(filters.locationId);
  }

  if (filters.stockType && filters.stockType !== 'all') {
    conditions.push('s.product_type = ?');
    params.push(filters.stockType);
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  const [rows] = await db.execute(`
    SELECT 
      p.name as product,
      d.name as depot,
      r.rack_code,
      rs.bay_no, rs.level_no, rs.bin_no,
      SUM(s.quantity) as quantity
    FROM stocks s
    JOIN products p ON s.product_id = p.product_id
    JOIN rack_slots rs ON s.slot_id = rs.slot_id
    JOIN racks r ON rs.rack_id = r.rack_id
    JOIN aisles a ON r.parent_aisle = a.aisle_id
    JOIN depots d ON a.parent_depot = d.depot_id
    ${where}
    GROUP BY p.product_id, rs.slot_id
    LIMIT 100
  `, params);
  return rows;
};

/**
 * Get stock quantity aggregated by depot (for Stock Levels view)
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Stock by depot data
 */
export const getStockByDepot = async (db, filters = {}) => {
  const conditions = [];
  const params = [];

  if (filters.productId) {
    conditions.push('s.product_id = ?');
    params.push(filters.productId);
  }

  if (filters.stockType && filters.stockType !== 'all') {
    conditions.push('s.product_type = ?');
    params.push(filters.stockType);
  }

  if (filters.locationId) {
    conditions.push('d.parent_location = ?');
    params.push(filters.locationId);
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  const [rows] = await db.execute(`
    SELECT 
      d.depot_id as depotId,
      d.name as depotName,
      COALESCE(SUM(s.quantity), 0) as quantity
    FROM depots d
    LEFT JOIN aisles a ON a.parent_depot = d.depot_id
    LEFT JOIN racks r ON r.parent_aisle = a.aisle_id
    LEFT JOIN rack_slots rs ON rs.rack_id = r.rack_id
    LEFT JOIN stocks s ON s.slot_id = rs.slot_id
    ${where}
    GROUP BY d.depot_id
    HAVING quantity > 0
    ORDER BY quantity DESC
  `, params);

  return rows.map(r => ({
    ...r,
    quantity: Number(r.quantity) || 0
  }));
};

/**
 * Get products below minimum stock threshold (for Low Stock Alert)
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Low stock products
 */
export const getLowStockProducts = async (db, filters = {}) => {
  const conditions = ['p.min_stock_level IS NOT NULL'];
  const params = [];
  const stockConditions = [];

  if (filters.productId) {
    conditions.push('p.product_id = ?');
    params.push(filters.productId);
  }

  if (filters.stockType && filters.stockType !== 'all') {
    stockConditions.push('s.product_type = ?');
  }

  const stockWhere = stockConditions.length > 0 ? ' AND ' + stockConditions.join(' AND ') : '';

  const [rows] = await db.execute(`
    SELECT 
      p.product_id as productId,
      p.name as productName,
      p.min_stock_level as minStockLevel,
      COALESCE(SUM(CASE WHEN 1=1 ${stockWhere} THEN s.quantity ELSE 0 END), 0) as currentQuantity,
      MAX(s.product_type) as productType
    FROM products p
    LEFT JOIN stocks s ON p.product_id = s.product_id
    WHERE ${conditions.join(' AND ')}
    GROUP BY p.product_id, p.min_stock_level
    HAVING COALESCE(SUM(CASE WHEN 1=1 ${stockWhere} THEN s.quantity ELSE 0 END), 0) < p.min_stock_level
    ORDER BY (p.min_stock_level - COALESCE(SUM(CASE WHEN 1=1 ${stockWhere} THEN s.quantity ELSE 0 END), 0)) DESC
    LIMIT 20
  `, filters.stockType && filters.stockType !== 'all' ? [filters.stockType, ...params] : params);

  return rows.map(row => ({
    ...row,
    severity: row.currentQuantity === 0 ? 'critical' :
      (row.currentQuantity / row.minStockLevel < 0.3) ? 'critical' : 'warning'
  }));
};

/**
 * Get detailed movement log (for Movements view)
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Movement log entries
 */
export const getMovementLog = async (db, filters = {}) => {
  const conditions = ['t.timestamp >= DATE_SUB(CURDATE(), INTERVAL ? DAY)'];
  const params = [filters.dateRange || 30];

  if (filters.productId) {
    conditions.push('t.product_id = ?');
    params.push(filters.productId);
  }

  if (filters.txnType && filters.txnType !== 'all') {
    conditions.push('t.txn_type = ?');
    params.push(filters.txnType);
  }

  if (filters.locationId) {
    // Complex join needed to filter by location - joining through slots
    conditions.push(`(
      EXISTS (
        SELECT 1 FROM rack_slots rs
        JOIN racks r ON rs.rack_id = r.rack_id
        JOIN aisles a ON r.parent_aisle = a.aisle_id
        JOIN depots d ON a.parent_depot = d.depot_id
        WHERE rs.slot_id = t.from_slot_id AND d.parent_location = ?
      ) OR EXISTS (
        SELECT 1 FROM rack_slots rs
        JOIN racks r ON rs.rack_id = r.rack_id
        JOIN aisles a ON r.parent_aisle = a.aisle_id
        JOIN depots d ON a.parent_depot = d.depot_id
        WHERE rs.slot_id = t.to_slot_id AND d.parent_location = ?
      )
    )`);
    params.push(filters.locationId, filters.locationId);
  }

  const [rows] = await db.execute(`
    SELECT 
      t.txn_id,
      t.timestamp,
      p.name as productName,
      s.product_type as productType,
      t.txn_type as txnType,
      t.quantity,
      t.total_value as totalValue,
      t.reference_number as referenceNumber,
      COALESCE(src.source_name, c.client_name, 'Internal') as sourceDestination
    FROM transactions t
    JOIN products p ON t.product_id = p.product_id
    LEFT JOIN stocks s ON t.stock_id = s.stock_id
    LEFT JOIN sources src ON t.source_id = src.source_id
    LEFT JOIN clients c ON t.client_id = c.client_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY t.timestamp DESC
    LIMIT 500
  `, params);

  return rows;
};

/**
 * Get transaction quantity summary by type (for bar chart)
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Transaction type summary
 */
export const getTransactionTypeSummary = async (db, filters = {}) => {
  const conditions = ['t.timestamp >= DATE_SUB(CURDATE(), INTERVAL ? DAY)'];
  const params = [filters.dateRange || 30];

  if (filters.productId) {
    conditions.push('t.product_id = ?');
    params.push(filters.productId);
  }

  const [rows] = await db.execute(`
    SELECT 
      t.txn_type as txnType,
      SUM(t.quantity) as totalQuantity,
      COUNT(*) as transactionCount,
      SUM(t.total_value) as totalValue
    FROM transactions t
    WHERE ${conditions.join(' AND ')}
    GROUP BY t.txn_type
    ORDER BY totalQuantity DESC
  `, params);

  return rows;
};

/**
 * Get movement frequency per product (for Movements view)
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Movement frequency data
 */
export const getMovementFrequency = async (db, filters = {}) => {
  const conditions = ['t.timestamp >= DATE_SUB(CURDATE(), INTERVAL ? DAY)'];
  const params = [filters.dateRange || 30];

  if (filters.productId) {
    conditions.push('t.product_id = ?');
    params.push(filters.productId);
  }

  if (filters.txnType && filters.txnType !== 'all') {
    conditions.push('t.txn_type = ?');
    params.push(filters.txnType);
  }

  const [rows] = await db.execute(`
    SELECT 
      p.name as productName,
      s.product_type as productType,
      COUNT(*) as transactionCount,
      SUM(t.quantity) as totalQuantityMoved
    FROM transactions t
    JOIN products p ON t.product_id = p.product_id
    LEFT JOIN stocks s ON t.stock_id = s.stock_id
    WHERE ${conditions.join(' AND ')}
    GROUP BY p.product_id
    ORDER BY transactionCount DESC
    LIMIT 20
  `, params);

  return rows;
};

/**
 * Get occupancy percentage by rack (for Occupancy view)
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Rack occupancy data
 */
export const getOccupancyByRack = async (db, filters = {}) => {
  const conditions = [];
  const params = [];

  if (filters.locationId) {
    conditions.push('d.parent_location = ?');
    params.push(filters.locationId);
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  // For product type filtering in occupancy, we count slots that contain that product type.
  // NOTE: Use parameters (avoid string interpolation).
  let productTypeJoin = 'LEFT JOIN stocks st ON rs.slot_id = st.slot_id';
  let productTypeCondition = '';
  if (filters.stockType && filters.stockType !== 'all') {
    productTypeCondition = 'AND st.product_type = ?';
    params.push(filters.stockType);
  }

  const [rows] = await db.execute(`
    SELECT 
      r.rack_code as rackCode,
      COUNT(DISTINCT rs.slot_id) as totalSlots,
      COUNT(DISTINCT CASE WHEN st.stock_id IS NOT NULL AND COALESCE(st.quantity, 0) > 0 ${productTypeCondition} THEN rs.slot_id END) as occupiedSlots,
      ROUND(
        100.0 * COUNT(DISTINCT CASE WHEN st.stock_id IS NOT NULL AND COALESCE(st.quantity, 0) > 0 ${productTypeCondition} THEN rs.slot_id END)
        / COUNT(DISTINCT rs.slot_id),
        1
      ) as occupancyPercent
    FROM racks r
    JOIN aisles a ON r.parent_aisle = a.aisle_id
    JOIN depots d ON a.parent_depot = d.depot_id
    JOIN rack_slots rs ON rs.rack_id = r.rack_id
    ${productTypeJoin}
    ${where}
    GROUP BY r.rack_id
    HAVING totalSlots > 0
    ORDER BY occupancyPercent DESC
    LIMIT 20
  `, params);

  return rows;
};

/**
 * Get occupancy breakdown by depot and product type (for donut chart)
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Depot occupancy breakdown
 */
export const getOccupancyByDepot = async (db, filters = {}) => {
  const conditions = [];
  const params = [];

  if (filters.locationId) {
    conditions.push('d.parent_location = ?');
    params.push(filters.locationId);
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  // Same filter, but with alias used inside the subquery.
  const where2 = conditions.length > 0 ? 'WHERE ' + conditions.map(c => c.replaceAll('d.', 'd2.')).join(' AND ') : '';

  const [rows] = await db.execute(`
    SELECT 
      COALESCE(s.product_type, 'empty') as productType,
      COUNT(DISTINCT rs.slot_id) as occupiedSlots,
      ROUND(100.0 * COUNT(DISTINCT rs.slot_id) / (
        SELECT COUNT(*) FROM rack_slots rs2
        JOIN racks r2 ON rs2.rack_id = r2.rack_id
        JOIN aisles a2 ON r2.parent_aisle = a2.aisle_id
        JOIN depots d2 ON a2.parent_depot = d2.depot_id
        ${where2}
      ), 1) as percentage
    FROM depots d
    JOIN aisles a ON a.parent_depot = d.depot_id
    JOIN racks r ON r.parent_aisle = a.aisle_id
    JOIN rack_slots rs ON rs.rack_id = r.rack_id
    LEFT JOIN stocks s ON s.slot_id = rs.slot_id AND COALESCE(s.quantity, 0) > 0
    ${where}
    GROUP BY s.product_type
    ORDER BY occupiedSlots DESC
  `, params);

  return rows;
};
