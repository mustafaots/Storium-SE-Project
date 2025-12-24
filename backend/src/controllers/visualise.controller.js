// Visualization Controller - HTTP request handlers
// Path: backend/src/controllers/visualise.controller.js

import * as visualiseService from '../services/visualise.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Get Key Performance Indicators
 * GET /api/visualise/kpis
 */
export const getKPIs = async (req, res) => {
  try {
    const filters = {
      locationId: req.query.locationId ? parseInt(req.query.locationId) : null,
      productId: req.query.productId ? parseInt(req.query.productId) : null
    };
    const kpis = await visualiseService.getKPIs(req.db, filters);
    return successResponse(res, 'KPIs retrieved', kpis);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch KPIs', error.message, 500);
  }
};

/**
 * Main analytics aggregator
 * GET /api/visualise/analytics
 */
export const getAnalytics = async (req, res) => {
  try {
    const { type, dateRange, locationId, productId } = req.query;
    const filters = {
      dateRange: dateRange ? parseInt(dateRange) : 30,
      locationId: locationId ? parseInt(locationId) : null,
      productId: productId ? parseInt(productId) : null
    };

    let data;
    switch (type) {
      case 'stock-trends':
        data = await visualiseService.getStockTrends(req.db, filters.dateRange);
        break;
      case 'occupancy':
        data = await visualiseService.getWarehouseZones(req.db);
        break;
      case 'transactions':
        data = await visualiseService.getTransactionAnalytics(req.db, filters);
        break;
      case 'products':
        data = await visualiseService.getProductPerformance(req.db);
        break;
      default:
        data = await visualiseService.getVisualizationData(req.db, filters);
    }

    return successResponse(res, 'Analytics data retrieved', data);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return errorResponse(res, 'Failed to fetch analytics', error.message, 500);
  }
};

/**
 * Get detailed stock trends
 * GET /api/visualise/stock-trends
 */
export const getStockTrends = async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 30;
    const trends = await visualiseService.getStockTrends(req.db, days);
    const comparison = visualiseService.calculateComparison(trends);
    return successResponse(res, 'Stock trends retrieved', { trends, comparison });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch trends', error.message, 500);
  }
};

/**
 * Get occupancy analytics
 * GET /api/visualise/occupancy
 */
export const getOccupancyAnalytics = async (req, res) => {
  try {
    const data = await visualiseService.getWarehouseZones(req.db);
    return successResponse(res, 'Occupancy data retrieved', data);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch occupancy', error.message, 500);
  }
};

/**
 * Get transaction analytics
 * GET /api/visualise/transactions
 */
export const getTransactionAnalytics = async (req, res) => {
  try {
    const filters = {
      dateRange: req.query.dateRange ? parseInt(req.query.dateRange) : 30,
      locationId: req.query.locationId ? parseInt(req.query.locationId) : null
    };
    const data = await visualiseService.getTransactionAnalytics(req.db, filters);
    return successResponse(res, 'Transaction analytics retrieved', data);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch transaction analytics', error.message, 500);
  }
};

/**
 * Get product performance
 * GET /api/visualise/products
 */
export const getProductPerformance = async (req, res) => {
  try {
    const data = await visualiseService.getProductPerformance(req.db);
    return successResponse(res, 'Product performance retrieved', data);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch product performance', error.message, 500);
  }
};

/**
 * Base data for dashboard
 * GET /api/visualise/data
 */
export const getVisualizationData = async (req, res) => {
  try {
    const { type, dateRange, productId, locationId, stockType, txnType } = req.query;
    const filters = {
      dateRange: dateRange ? parseInt(dateRange) : 30,
      productId: productId ? parseInt(productId) : null,
      locationId: locationId ? parseInt(locationId) : null,
      stockType: stockType || 'all',
      txnType: txnType || 'all'
    };

    // If a specific view type is requested, return focused data
    if (type === 'movements') {
      // For movements view, focus on transaction analytics
      const [
        kpis,
        filterOptions,
        movementLog,
        transactionTypeSummary,
        movementsOverTime,
        movementFrequency
      ] = await Promise.all([
        visualiseService.getKPIs(req.db, filters),
        visualiseService.getFilterOptions(req.db),
        visualiseService.getMovementLog(req.db, filters),
        visualiseService.getTransactionTypeSummary(req.db, filters),
        visualiseService.getMovementsOverTime(req.db, filters),
        visualiseService.getMovementFrequency(req.db, filters)
      ]);

      return successResponse(res, 'Movements data retrieved', {
        kpis,
        filterOptions,
        movementLog,
        transactionTypeSummary,
        movementsOverTime,
        movementFrequency
      });
    } else if (type === 'occupancy') {
      // For occupancy view, focus on warehouse zones
      const [
        kpis,
        filterOptions,
        warehouseZones,
        occupancyByRack,
        occupancyByDepot
      ] = await Promise.all([
        visualiseService.getKPIs(req.db, filters),
        visualiseService.getFilterOptions(req.db),
        visualiseService.getWarehouseZones(req.db, filters),
        visualiseService.getOccupancyByRack(req.db, filters),
        visualiseService.getOccupancyByDepot(req.db, filters)
      ]);

      return successResponse(res, 'Occupancy data retrieved', {
        kpis,
        filterOptions,
        warehouseZones,
        occupancyByRack,
        occupancyByDepot
      });
    } else {
      // Default to stock_levels - comprehensive dashboard data with new charts
      const data = await visualiseService.getVisualizationData(req.db, filters);

      // Add stock levels specific visualizations
      const [stockByDepot, lowStockProducts] = await Promise.all([
        visualiseService.getStockByDepot(req.db, filters),
        visualiseService.getLowStockProducts(req.db, filters)
      ]);

      return successResponse(res, 'Visualization data retrieved', {
        ...data,
        stockByDepot,
        lowStockProducts
      });
    }
  } catch (error) {
    console.error('Error fetching visualization data:', error);
    return errorResponse(res, 'Failed to fetch visualization data', error.message, 500);
  }
};

/**
 * Filter options
 * GET /api/visualise/filters
 */
export const getFilterOptions = async (req, res) => {
  try {
    const filters = await visualiseService.getFilterOptions(req.db);
    return successResponse(res, 'Filters retrieved', filters);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch filters', error.message, 500);
  }
};
