// Visualise API Utility
// Path: frontend/src/utils/visualiseAPI.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Fetch complete visualization data
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Visualization data
 */
export const fetchVisualizationData = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.viewType) {
      params.append('type', filters.viewType);
    }
    if (filters.dateRange) {
      params.append('dateRange', filters.dateRange);
    }
    if (filters.productId) {
      params.append('productId', filters.productId);
    }
    if (filters.locationId) {
      params.append('locationId', filters.locationId);
    }
    if (filters.stockType && filters.stockType !== 'all') {
      params.append('stockType', filters.stockType);
    }
    if (filters.txnType && filters.txnType !== 'all') {
      params.append('txnType', filters.txnType);
    }

    const response = await axios.get(`${API_BASE_URL}/visualise/data?${params.toString()}`);

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch visualization data');
  } catch (error) {
    console.error('Error fetching visualization data:', error);
    throw error;
  }
};

/**
 * Fetch KPI data only
 * @returns {Promise<Object>} KPI data
 */
export const fetchKPIs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/visualise/kpis`);

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch KPIs');
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    throw error;
  }
};

/**
 * Fetch stock trends
 * @param {number} days - Number of days
 * @returns {Promise<Object>} Stock trends data
 */
export const fetchStockTrends = async (days = 30) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/visualise/stock-trends?days=${days}`);

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch stock trends');
  } catch (error) {
    console.error('Error fetching stock trends:', error);
    throw error;
  }
};

/**
 * Fetch warehouse occupancy data
 * @returns {Promise<Object>} Warehouse data
 */
export const fetchWarehouseOccupancy = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/visualise/occupancy`);

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch warehouse data');
  } catch (error) {
    console.error('Error fetching warehouse data:', error);
    throw error;
  }
};

/**
 * Fetch filter options (products, locations)
 * @returns {Promise<Object>} Filter options
 */
export const fetchFilterOptions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/visualise/filters`);

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch filter options');
  } catch (error) {
    console.error('Error fetching filter options:', error);
    throw error;
  }
};

export default {
  fetchVisualizationData,
  fetchKPIs,
  fetchStockTrends,
  fetchWarehouseOccupancy,
  fetchFilterOptions
};
