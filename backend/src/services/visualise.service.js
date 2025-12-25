// Visualization Service - Business logic for visualization data
// Path: backend/src/services/visualise.service.js

import * as visualiseModel from '../models/visualise.model.js';
import { TransactionFileStore } from '../utils/transactionFileStore.js';

const toIsoDate = (timestamp) => {
  try {
    return new Date(timestamp).toISOString().split('T')[0];
  } catch {
    return null;
  }
};

const formatDateLabel = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const buildLastNDays = (days) => {
  const n = Math.max(1, Number(days) || 30);
  const today = new Date();
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    out.push({ date: dateStr, label: formatDateLabel(dateStr) });
  }
  return out;
};

const getSlotIdsForLocation = async (db, locationId) => {
  if (!locationId) return null;
  const [rows] = await db.execute(
    `SELECT rs.slot_id
     FROM rack_slots rs
     JOIN racks r ON rs.rack_id = r.rack_id
     JOIN aisles a ON r.parent_aisle = a.aisle_id
     JOIN depots d ON a.parent_depot = d.depot_id
     WHERE d.parent_location = ?`,
    [locationId]
  );
  return new Set(rows.map(r => Number(r.slot_id)));
};

const filterTransactionsFromFile = async (db, filters = {}) => {
  const all = TransactionFileStore.readAll();

  const dateRangeDays = Math.max(1, Number(filters.dateRange) || 30);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - dateRangeDays);

  const slotSet = await getSlotIdsForLocation(db, filters.locationId);

  return all.filter(t => {
    if (!t || !t.timestamp) return false;
    const ts = new Date(t.timestamp);
    if (Number.isNaN(ts.getTime())) return false;
    if (ts < cutoff) return false;

    if (filters.productId && Number(t.product_id) !== Number(filters.productId)) return false;
    if (filters.txnType && filters.txnType !== 'all' && String(t.txn_type) !== String(filters.txnType)) return false;

    if (slotSet) {
      const fromId = t.from_slot_id != null ? Number(t.from_slot_id) : null;
      const toId = t.to_slot_id != null ? Number(t.to_slot_id) : null;
      if (!(fromId != null && slotSet.has(fromId)) && !(toId != null && slotSet.has(toId))) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Get all KPI data for the dashboard
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} KPI data object
 */
export const getKPIs = async (db, filters = {}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const movementsToday = (await filterTransactionsFromFile(db, { ...filters, dateRange: 1 }))
    .filter(t => (t.timestamp || '').startsWith(todayStr)).length;

  const [totalStockValue, belowMinLevel, warehouseOccupancy] = await Promise.all([
    visualiseModel.getTotalStockValue(db, filters),
    visualiseModel.getProductsBelowMinLevel(db, filters),
    visualiseModel.getWarehouseOccupancy(db, filters)
  ]);

  return {
    totalStockValue,
    movementsToday,
    belowMinLevel,
    warehouseOccupancy
  };
};

/**
 * Generate stock trend data points for charting
 * @param {Object} db - Database connection pool
 * @param {number} days - Number of days to include
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Array of trend data points
 */
export const getStockTrends = async (db, days = 30, filters = {}) => {
  const currentValue = await visualiseModel.getCurrentStockValue(db, filters);
  const txns = await filterTransactionsFromFile(db, { ...filters, dateRange: days, locationId: null, txnType: 'all' });

  const dailyChangeMap = new Map();
  for (const t of txns) {
    const dateStr = toIsoDate(t.timestamp);
    if (!dateStr) continue;
    if (filters.productId && Number(t.product_id) !== Number(filters.productId)) continue;
    const v = Number(t.total_value) || 0;
    const signed = t.txn_type === 'outflow' ? -v : (t.txn_type === 'inflow' ? v : 0);
    dailyChangeMap.set(dateStr, (dailyChangeMap.get(dateStr) || 0) + signed);
  }

  // Build historical values by working backwards from current value
  const trendData = [];
  const today = new Date();

  const changeMap = dailyChangeMap;

  // Calculate cumulative changes to get historical values
  let runningValue = currentValue;
  const values = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    values.unshift({
      date: dateStr,
      value: runningValue
    });

    // Subtract today's change to get yesterday's value
    const change = changeMap.get(dateStr) || 0;
    runningValue -= change;
  }

  return values.map(item => ({
    date: item.date,
    label: formatDateLabel(item.date),
    value: Math.max(0, Math.round(item.value)),
    units: Math.round(item.value / 100)
  }));
};

/**
 * Calculate comparison metrics between current and previous period
 * @param {Array} trends - Stock trend data
 * @returns {Object} Comparison object with percentage and direction
 */
export const calculateComparison = (trends) => {
  if (!trends || trends.length < 2) {
    return { percentage: 0, isPositive: true, period: 'N/A' };
  }

  const midpoint = Math.floor(trends.length / 2);
  const recentHalf = trends.slice(midpoint);
  const earlierHalf = trends.slice(0, midpoint);

  const recentAvg = recentHalf.reduce((sum, t) => sum + t.value, 0) / recentHalf.length;
  const earlierAvg = earlierHalf.reduce((sum, t) => sum + t.value, 0) / earlierHalf.length;

  if (earlierAvg === 0) {
    return { percentage: 0, isPositive: true, period: `Last ${trends.length} Days` };
  }

  const percentChange = ((recentAvg - earlierAvg) / earlierAvg) * 100;

  return {
    percentage: Math.abs(Math.round(percentChange * 10) / 10),
    isPositive: percentChange >= 0,
    period: `Last ${trends.length} Days`
  };
};

/**
 * Get warehouse zones with occupancy data
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Array of warehouse zones
 */
export const getWarehouseZones = async (db, filters = {}) => {
  return await visualiseModel.getWarehouseZones(db, filters);
};

/**
 * Get filter options for the visualization page
 * @param {Object} db - Database connection pool
 * @returns {Promise<Object>} Filter options object
 */
export const getFilterOptions = async (db) => {
  // Filters don't apply to the filter options themselves (usually)
  const [products, locations] = await Promise.all([
    visualiseModel.getProducts(db),
    visualiseModel.getLocations(db)
  ]);

  return { products, locations };
};

/**
 * Get transaction pattern analytics
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Transaction analytics
 */
export const getTransactionAnalytics = async (db, filters = {}) => {
  const txns = await filterTransactionsFromFile(db, { ...filters, txnType: 'all' });
  const days = Math.max(1, Number(filters.dateRange) || 30);
  const points = buildLastNDays(days);
  const map = new Map(points.map(p => [p.date, { date: p.date, label: p.label, inflow: 0, outflow: 0 }]));

  for (const t of txns) {
    const dateStr = toIsoDate(t.timestamp);
    if (!dateStr || !map.has(dateStr)) continue;
    const v = Number(t.total_value) || 0;
    if (t.txn_type === 'inflow') map.get(dateStr).inflow += v;
    if (t.txn_type === 'outflow') map.get(dateStr).outflow += v;
    if (t.txn_type === 'consumption') map.get(dateStr).outflow += v;
  }

  return Array.from(map.values());
};

/**
 * Get product performance metrics
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} Product performance
 */
export const getProductPerformance = async (db, filters = {}) => {
  const days = Math.max(1, Number(filters.dateRange) || 30);
  const txns = await filterTransactionsFromFile(db, { ...filters, dateRange: days, locationId: null, txnType: 'all' });

  const byProduct = new Map();
  for (const t of txns) {
    if (t.txn_type !== 'outflow') continue;
    const key = Number(t.product_id);
    const prev = byProduct.get(key) || { name: t.product_name || 'Unknown', total_quantity: 0 };
    prev.total_quantity += Number(t.quantity) || 0;
    byProduct.set(key, prev);
  }

  const topMoving = Array.from(byProduct.values())
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, 5);

  // Slow moving: products that have stock but no activity in last 90 days
  const activeSet = new Set();
  const activeTxns = await filterTransactionsFromFile(db, { ...filters, dateRange: 90, locationId: null, txnType: 'all' });
  for (const t of activeTxns) {
    if (t.product_id != null) activeSet.add(Number(t.product_id));
  }

  const [stockRows] = await db.execute(`
    SELECT p.product_id, p.name, COALESCE(SUM(s.quantity), 0) as current_stock
    FROM products p
    LEFT JOIN stocks s ON p.product_id = s.product_id
    GROUP BY p.product_id
    HAVING current_stock > 0
  `);

  const slowMoving = stockRows
    .filter(r => !activeSet.has(Number(r.product_id)))
    .sort((a, b) => (Number(b.current_stock) || 0) - (Number(a.current_stock) || 0))
    .slice(0, 5)
    .map(r => ({ name: r.name, current_stock: Number(r.current_stock) || 0 }));

  return { topMoving, slowMoving };
};

/**
 * Get complete visualization data
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Complete visualization data
 */
export const getVisualizationData = async (db, filters = {}) => {
  const days = filters.dateRange || 30;

  const [
    kpis,
    stockTrends,
    warehouseZones,
    filterOptions,
    categoryDistribution,
    expirySchedule,
    supplyChainMetrics,
    transactionPatterns,
    productPerformance,
    inventoryHealth,
    depotStock,
    productPlacement
  ] = await Promise.all([
    getKPIs(db, filters),
    getStockTrends(db, days, filters),
    getWarehouseZones(db, filters),
    getFilterOptions(db),
    visualiseModel.getCategoryDistribution(db, filters),
    visualiseModel.getExpirySchedule(db, filters),
    visualiseModel.getSupplyChainMetrics(db, filters),
    getTransactionAnalytics(db, filters),
    getProductPerformance(db, filters),
    visualiseModel.getInventoryHealth(db, filters),
    visualiseModel.getDepotStock(db, filters),
    visualiseModel.getProductPlacement(db, filters)
  ]);

  const comparison = calculateComparison(stockTrends);

  // Create chart data from stock trends
  const chartData = stockTrends.map(trend => ({
    date: trend.date,
    label: trend.label,
    stockValue: trend.value
  }));

  return {
    kpis,
    stockTrends,
    warehouseZones,
    chartData,
    comparison,
    filterOptions,
    categoryDistribution,
    expirySchedule,
    supplyChainMetrics,
    transactionPatterns,
    productPerformance,
    inventoryHealth,
    depotStock,
    productPlacement
  };
};

/**
 * Get stock by depot for Stock Levels view
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Stock by depot data
 */
export const getStockByDepot = async (db, filters = {}) => {
  return await visualiseModel.getStockByDepot(db, filters);
};

/**
 * Get low stock products for alert panel
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Low stock products
 */
export const getLowStockProducts = async (db, filters = {}) => {
  return await visualiseModel.getLowStockProducts(db, filters);
};

/**
 * Get movement log for Movements view
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Formatted movement log
 */
export const getMovementLog = async (db, filters = {}) => {
  const txns = await filterTransactionsFromFile(db, filters);

  // Optional enrichment: pull product_type from current stocks (may be null if stock row deleted)
  const stockIds = Array.from(new Set(txns.map(t => t.stock_id).filter(v => v != null).map(v => Number(v))));
  const stockTypeById = new Map();
  if (stockIds.length > 0) {
    const [rows] = await db.execute(
      'SELECT stock_id, product_type FROM stocks WHERE stock_id IN (?)',
      [stockIds]
    );
    rows.forEach(r => stockTypeById.set(Number(r.stock_id), r.product_type));
  }

  const mapped = txns.slice(0, 500).map(t => {
    const sourceDestination = t.source_name || t.client_name || 'Internal';
    return {
      txn_id: t.txn_id,
      timestamp: new Date(t.timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      productName: t.product_name || 'Unknown',
      productType: stockTypeById.get(Number(t.stock_id)) || null,
      txnType: t.txn_type,
      quantity: Number(t.quantity) || 0,
      totalValue: Number(t.total_value) || 0,
      referenceNumber: t.reference_number || null,
      sourceDestination
    };
  });

  return mapped;
};

/**
 * Get transaction type summary for bar chart
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Transaction type summary
 */
export const getTransactionTypeSummary = async (db, filters = {}) => {
  const txns = await filterTransactionsFromFile(db, { ...filters, txnType: 'all' });
  const agg = new Map();

  for (const t of txns) {
    const type = t.txn_type;
    const prev = agg.get(type) || { txnType: type, totalQuantity: 0, transactionCount: 0, totalValue: 0 };
    prev.totalQuantity += Number(t.quantity) || 0;
    prev.transactionCount += 1;
    prev.totalValue += Number(t.total_value) || 0;
    agg.set(type, prev);
  }

  return Array.from(agg.values()).sort((a, b) => b.totalQuantity - a.totalQuantity);
};

/**
 * Get enhanced transaction analytics with all 5 types
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Movements over time by type
 */
export const getMovementsOverTime = async (db, filters = {}) => {
  const txns = await filterTransactionsFromFile(db, { ...filters, txnType: 'all' });
  const days = Math.max(1, Number(filters.dateRange) || 30);
  const points = buildLastNDays(days);
  const map = new Map(points.map(p => [p.date, {
    date: p.date,
    label: p.label,
    inflow: 0,
    outflow: 0,
    transfer: 0,
    consumption: 0,
    adjustment: 0
  }]));

  for (const t of txns) {
    const dateStr = toIsoDate(t.timestamp);
    if (!dateStr || !map.has(dateStr)) continue;
    const v = Number(t.total_value) || 0;
    const slot = map.get(dateStr);
    if (slot[t.txn_type] !== undefined) slot[t.txn_type] += v;
  }

  return Array.from(map.values());
};

/**
 * Get movement frequency by product
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Movement frequency data
 */
export const getMovementFrequency = async (db, filters = {}) => {
  const txns = await filterTransactionsFromFile(db, filters);
  const agg = new Map();

  for (const t of txns) {
    const productId = Number(t.product_id);
    const prev = agg.get(productId) || {
      productName: t.product_name || 'Unknown',
      productType: null,
      transactionCount: 0,
      totalQuantityMoved: 0
    };
    prev.transactionCount += 1;
    prev.totalQuantityMoved += Number(t.quantity) || 0;
    agg.set(productId, prev);
  }

  return Array.from(agg.values())
    .sort((a, b) => b.transactionCount - a.transactionCount)
    .slice(0, 20);
};

/**
 * Get occupancy by rack
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Rack occupancy data
 */
export const getOccupancyByRack = async (db, filters = {}) => {
  return await visualiseModel.getOccupancyByRack(db, filters);
};

/**
 * Get occupancy breakdown by depot and product type
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Depot occupancy breakdown
 */
export const getOccupancyByDepot = async (db, filters = {}) => {
  return await visualiseModel.getOccupancyByDepot(db, filters);
};

