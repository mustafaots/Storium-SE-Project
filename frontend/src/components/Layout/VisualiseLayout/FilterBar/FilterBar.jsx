// FilterBar Component
// Path: frontend/src/components/Visualise/FilterBar/FilterBar.jsx

import { Calendar, Layers, Package, MapPin, Filter, Play, ArrowRightLeft } from 'lucide-react';
import styles from './FilterBar.module.css';

const viewTypeOptions = [
  { value: 'stock_levels', label: 'Stock Levels' },
  { value: 'movements', label: 'Movements' },
  { value: 'occupancy', label: 'Occupancy' },
];

const dateRangeOptions = [
  { value: 7, label: 'Last 7 Days' },
  { value: 30, label: 'Last 30 Days' },
  { value: 90, label: 'Last 90 Days' },
];

const stockTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'raw', label: 'Raw Materials' },
  { value: 'wip', label: 'Work in Progress' },
  { value: 'to_ship', label: 'Ready to Ship' },
];

const transactionTypeOptions = [
  { value: 'all', label: 'All Transactions' },
  { value: 'inflow', label: 'Inflow' },
  { value: 'outflow', label: 'Outflow' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'consumption', label: 'Consumption' },
  { value: 'adjustment', label: 'Adjustment' },
];

/**
 * FilterBar Component
 * Provides filtering controls for visualization data
 */
const FilterBar = ({
  filters = {},
  onFilterChange,
  onApply,
  products = [],
  locations = []
}) => {
  const handleChange = (key, value) => {
    if (onFilterChange) {
      onFilterChange({ [key]: value });
    }
  };

  return (
    <div className={styles.filterBar}>
      {/* View Type */}
      <div className={styles.filterGroup}>
        <Layers className={styles.selectIcon} />
        <select
          className={styles.select}
          value={filters.viewType || 'stock_levels'}
          onChange={(e) => handleChange('viewType', e.target.value)}
        >
          {viewTypeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range */}
      <div className={styles.filterGroup}>
        <Calendar className={styles.selectIcon} />
        <select
          className={styles.select}
          value={filters.dateRange || 30}
          onChange={(e) => handleChange('dateRange', parseInt(e.target.value))}
        >
          {dateRangeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Products */}
      <div className={styles.filterGroup}>
        <Package className={styles.selectIcon} />
        <select
          className={styles.select}
          value={filters.productId || ''}
          onChange={(e) => handleChange('productId', e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">All Products</option>
          {products.map(product => (
            <option key={product.product_id} value={product.product_id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      {/* Locations */}
      <div className={styles.filterGroup}>
        <MapPin className={styles.selectIcon} />
        <select
          className={styles.select}
          value={filters.locationId || ''}
          onChange={(e) => handleChange('locationId', e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">All Locations</option>
          {locations.map(location => (
            <option key={location.location_id} value={location.location_id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stock Types */}
      <div className={styles.filterGroup}>
        <Filter className={styles.selectIcon} />
        <select
          className={styles.select}
          value={filters.stockType || 'all'}
          onChange={(e) => handleChange('stockType', e.target.value)}
        >
          {stockTypeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Transaction Type - Only for Movements view */}
      {filters.viewType === 'movements' && (
        <div className={styles.filterGroup}>
          <ArrowRightLeft className={styles.selectIcon} />
          <select
            className={styles.select}
            value={filters.txnType || 'all'}
            onChange={(e) => handleChange('txnType', e.target.value)}
          >
            {transactionTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Apply Button */}
      <button className={styles.applyButton} onClick={onApply}>
        <Play className={styles.applyIcon} />
        Apply Filters
      </button>
    </div>
  );
};

export default FilterBar;
