// Visualization Routes - API endpoint definitions
// Path: backend/src/routes/visualise.routes.js

import express from 'express';
import * as visualiseController from '../controllers/visualise.controller.js';

const router = express.Router();

/**
 * @route   GET /api/visualise/kpis
 * @desc    Get Key Performance Indicators
 */
router.get('/kpis', visualiseController.getKPIs);

/**
 * @route   GET /api/visualise/analytics
 * @desc    Get aggregated analytics data based on type
 */
router.get('/analytics', visualiseController.getAnalytics);

/**
 * @route   GET /api/visualise/stock-trends
 * @desc    Get detailed stock trend analysis
 */
router.get('/stock-trends', visualiseController.getStockTrends);

/**
 * @route   GET /api/visualise/occupancy
 * @desc    Get warehouse occupancy and utilization analysis
 */
router.get('/occupancy', visualiseController.getOccupancyAnalytics);

/**
 * @route   GET /api/visualise/transactions
 * @desc    Get transaction pattern analysis
 */
router.get('/transactions', visualiseController.getTransactionAnalytics);

/**
 * @route   GET /api/visualise/products
 * @desc    Get product performance and distribution metrics
 */
router.get('/products', visualiseController.getProductPerformance);

/**
 * @route   GET /api/visualise/filters
 * @desc    Get filter options (categories, locations, products)
 */
router.get('/filters', visualiseController.getFilterOptions);

// Keep this for backward compatibility and dashboard view
router.get('/data', visualiseController.getVisualizationData);

export default router;
