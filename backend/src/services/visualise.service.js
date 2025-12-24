// Visualization Service - Business logic for visualization data
// Path: backend/src/services/visualise.service.js

import * as visualiseModel from '../models/visualise.model.js';

/**
 * Get all KPI data for the dashboard
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} KPI data object
 */
export const getKPIs = async (db, filters = {}) => {
  const [totalStockValue, movementsToday, belowMinLevel, warehouseOccupancy] = await Promise.all([
    visualiseModel.getTotalStockValue(db, filters),
    visualiseModel.getMovementsToday(db, filters),
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
  const dailyChanges = await visualiseModel.getStockTrends(db, days, filters);

  // Build historical values by working backwards from current value
  const trendData = [];
  const today = new Date();

  // Create a map of date -> change
  const changeMap = new Map();
  dailyChanges.forEach(row => {
    const dateStr = new Date(row.date).toISOString().split('T')[0];
    changeMap.set(dateStr, parseFloat(row.daily_change) || 0);
  });

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

  // Format for chart display
  return values.map(item => ({
    date: item.date,
    label: formatDateLabel(item.date),
    value: Math.max(0, Math.round(item.value)),
    units: Math.round(item.value / 100) // Approximate unit count
  }));
};

/**
 * Format date string to display label
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted label (e.g., "Dec 23")
 */
const formatDateLabel = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
  const rawData = await visualiseModel.getTransactionAnalytics(db, filters);

  // Format data for chart consumption (grouped by date)
  const formattedData = {};
  rawData.forEach(row => {
    const dateStr = new Date(row.date).toISOString().split('T')[0];
    if (!formattedData[dateStr]) {
      formattedData[dateStr] = { date: dateStr, label: formatDateLabel(dateStr), inflow: 0, outflow: 0 };
    }
    if (row.txn_type === 'inflow') formattedData[dateStr].inflow = parseFloat(row.total_value) || 0;
    if (row.txn_type === 'outflow') formattedData[dateStr].outflow = parseFloat(row.total_value) || 0;
    // Consumption can be treated similarly to outflow or separately
    if (row.txn_type === 'consumption') formattedData[dateStr].outflow = (formattedData[dateStr].outflow || 0) + (parseFloat(row.total_value) || 0);
  });

  return Object.values(formattedData);
};

/**
 * Get product performance metrics
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} Product performance
 */
export const getProductPerformance = async (db, filters = {}) => {
  return await visualiseModel.getProductPerformance(db, filters);
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
  const rawData = await visualiseModel.getMovementLog(db, filters);

  // Format timestamps for display
  return rawData.map(row => ({
    ...row,
    timestamp: new Date(row.timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }));
};

/**
 * Get transaction type summary for bar chart
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Transaction type summary
 */
export const getTransactionTypeSummary = async (db, filters = {}) => {
  return await visualiseModel.getTransactionTypeSummary(db, filters);
};

/**
 * Get enhanced transaction analytics with all 5 types
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Movements over time by type
 */
export const getMovementsOverTime = async (db, filters = {}) => {
  const rawData = await visualiseModel.getTransactionAnalytics(db, filters);

  // Format data for chart with all 5 transaction types
  const formattedData = {};
  rawData.forEach(row => {
    const dateStr = new Date(row.date).toISOString().split('T')[0];
    if (!formattedData[dateStr]) {
      formattedData[dateStr] = {
        date: dateStr,
        label: formatDateLabel(dateStr),
        inflow: 0,
        outflow: 0,
        transfer: 0,
        consumption: 0,
        adjustment: 0
      };
    }

    const value = parseFloat(row.total_value) || 0;
    formattedData[dateStr][row.txn_type] = value;
  });

  return Object.values(formattedData);
};

/**
 * Get movement frequency by product
 * @param {Object} db - Database connection pool
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Movement frequency data
 */
export const getMovementFrequency = async (db, filters = {}) => {
  return await visualiseModel.getMovementFrequency(db, filters);
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

