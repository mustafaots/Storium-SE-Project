import { useState } from 'react';
import styles from './FilterBar.module.css';
import { FaChevronDown, FaCalendarAlt } from 'react-icons/fa';

function FilterBar() {
  const [filters, setFilters] = useState({
    stockLevel: 'Stock Levels',
    timeframe: 'Last 30 Days',
    product: 'All Products',
    location: 'All Locations',
    stockType: 'All Stock Types'
  });

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const handleApplyFilters = () => {
    console.log('Filters applied:', filters);
  };

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterGroup}>
        <div className={styles.filterItem}>
          <select
            className={styles.filterSelect}
            value={filters.stockLevel}
            onChange={(e) => handleFilterChange('stockLevel', e.target.value)}
          >
            <option>Stock Levels</option>
            <option>Movements</option>
            <option>Stock Value</option>
          </select>
          <FaChevronDown className={styles.chevron} />
        </div>

        <div className={styles.filterItem}>
          <FaCalendarAlt className={styles.icon} />
          <select
            className={styles.filterButton}
            value={filters.timeframe}
            onChange={(e) => handleFilterChange('timeframe', e.target.value)}
          >
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last 90 Days</option>
            <option>Last Year</option>
          </select>
          <FaChevronDown className={styles.chevron} />
        </div>

        <div className={styles.filterItem}>
          <select
            className={styles.filterButton}
            value={filters.product}
            onChange={(e) => handleFilterChange('product', e.target.value)}
          >
            <option>All Products</option>
            <option>Product A</option>
            <option>Product B</option>
          </select>
          <FaChevronDown className={styles.chevron} />
        </div>

        <div className={styles.filterItem}>
          <select
            className={styles.filterButton}
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          >
            <option>All Locations</option>
            <option>Location A</option>
            <option>Location B</option>
          </select>
          <FaChevronDown className={styles.chevron} />
        </div>

        <div className={styles.filterItem}>
          <select
            className={styles.filterButton}
            value={filters.stockType}
            onChange={(e) => handleFilterChange('stockType', e.target.value)}
          >
            <option>All Stock Types</option>
            <option>Type A</option>
            <option>Type B</option>
          </select>
          <FaChevronDown className={styles.chevron} />
        </div>
      </div>

      <button className={styles.applyButton} onClick={handleApplyFilters}>
        Apply Filters
      </button>
    </div>
  );
}

export default FilterBar;
