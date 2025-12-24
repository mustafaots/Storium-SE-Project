// useVisualise Hook
// Path: frontend/src/hooks/useVisualise.js

import { useState, useEffect, useCallback } from 'react';
import { fetchVisualizationData } from '../utils/visualiseAPI';

const defaultFilters = {
  viewType: 'stock_levels',
  dateRange: 30,
  productId: null,
  locationId: null,
  stockType: 'all',
  txnType: 'all',
};

/**
 * Custom hook for managing visualization data and state
 * @returns {Object} Visualization state and actions
 */
const useVisualise = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);

  /**
   * Fetch visualization data from API
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchVisualizationData(filters);
      setData(response);
    } catch (err) {
      console.error('Error fetching visualization data:', err);
      setError(err.message || 'Failed to fetch data');

      // Fallback to mock data if API fails
      // setData(generateMockData(filters.dateRange));
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Initial data fetch and refetch on filter changes
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Update filter values
   * @param {Object} newFilters - New filter values to merge
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Apply current filters and refetch data
   */
  const applyFilters = useCallback(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Reset filters to default values
   */
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  /**
   * Refetch data with current filters
   */
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    filters,
    updateFilters,
    applyFilters,
    resetFilters,
    refetch,
  };
};

/**
 * Generate mock data for fallback/testing
 * @param {number} days - Number of days
 * @returns {Object} Mock visualization data
 */
const generateMockData = (days = 30) => {
  const stockTrends = [];
  const today = new Date();
  let currentValue = 150000;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Random fluctuation
    currentValue += (Math.random() - 0.45) * 5000;
    currentValue = Math.max(50000, currentValue);

    stockTrends.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(currentValue),
      units: Math.round(currentValue / 100),
    });
  }

  const warehouseZones = [
    {
      id: 'zone-1',
      name: 'Main Warehouse',
      location: 'Building A',
      slots: Array.from({ length: 48 }, (_, i) => ({
        id: `slot-${i + 1}`,
        label: `A-${Math.floor(i / 4) + 1}-${(i % 4) + 1}`,
        occupancy: ['empty', 'low', 'medium', 'high'][Math.floor(Math.random() * 4)],
        product: Math.random() > 0.3 ? `Product ${i + 1}` : null,
        quantity: Math.floor(Math.random() * 100),
        capacity: 100,
      })),
    },
    {
      id: 'zone-2',
      name: 'Cold Storage',
      location: 'Building B',
      slots: Array.from({ length: 24 }, (_, i) => ({
        id: `cold-slot-${i + 1}`,
        label: `B-${Math.floor(i / 4) + 1}-${(i % 4) + 1}`,
        occupancy: ['empty', 'low', 'medium', 'high'][Math.floor(Math.random() * 4)],
        product: Math.random() > 0.4 ? `Perishable ${i + 1}` : null,
        quantity: Math.floor(Math.random() * 50),
        capacity: 50,
      })),
    },
  ];

  // Calculate comparison
  const midpoint = Math.floor(stockTrends.length / 2);
  const recentAvg = stockTrends.slice(midpoint).reduce((sum, t) => sum + t.value, 0) / (stockTrends.length - midpoint);
  const earlierAvg = stockTrends.slice(0, midpoint).reduce((sum, t) => sum + t.value, 0) / midpoint;
  const percentChange = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;

  return {
    kpis: {
      totalStockValue: Math.round(currentValue),
      movementsToday: Math.floor(Math.random() * 50) + 10,
      belowMinLevel: Math.floor(Math.random() * 10),
      warehouseOccupancy: Math.floor(Math.random() * 40) + 50,
    },
    stockTrends,
    warehouseZones,
    chartData: stockTrends.map(t => ({ date: t.date, label: t.label, stockValue: t.value })),
    comparison: {
      percentage: Math.abs(Math.round(percentChange * 10) / 10),
      isPositive: percentChange >= 0,
      period: `Last ${days} Days`,
    },
    filterOptions: {
      products: [
        { product_id: 1, name: 'Widget A', category: 'Electronics' },
        { product_id: 2, name: 'Widget B', category: 'Electronics' },
        { product_id: 3, name: 'Gadget X', category: 'Hardware' },
      ],
      locations: [
        { location_id: 1, name: 'Main Warehouse' },
        { location_id: 2, name: 'Cold Storage' },
      ],
    },
  };
};

export default useVisualise;
