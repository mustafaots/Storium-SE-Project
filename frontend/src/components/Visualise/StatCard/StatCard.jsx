// StatCard Component
// Path: frontend/src/components/Visualise/StatCard/StatCard.jsx

import { DollarSign, ArrowRightLeft, AlertTriangle, Building2 } from 'lucide-react';
import styles from './StatCard.module.css';

const iconMap = {
  dollar: DollarSign,
  movements: ArrowRightLeft,
  warning: AlertTriangle,
  building: Building2,
};

/**
 * Format number as currency
 * @param {number} value - Value to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format number with commas
 * @param {number} value - Value to format
 * @returns {string} Formatted number string
 */
const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Individual stat card component
 */
export const StatCard = ({ title, value, icon, isPercentage = false, className = '' }) => {
  const Icon = iconMap[icon];
  
  const formattedValue = typeof value === 'number'
    ? icon === 'dollar' 
      ? formatCurrency(value)
      : isPercentage 
        ? `${value}%`
        : formatNumber(value)
    : value;

  return (
    <div className={`${styles.statCard} ${className}`}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <div className={styles.iconWrapper}>
          {Icon && <Icon className={styles.icon} />}
        </div>
      </div>
      <div className={styles.value}>
        {formattedValue}
      </div>
    </div>
  );
};

/**
 * Grid of stat cards for KPIs
 */
export const StatCardsGrid = ({
  totalStockValue,
  movementsToday,
  belowMinLevel,
  warehouseOccupancy,
}) => {
  return (
    <div className={styles.cardsGrid}>
      <StatCard
        title="Total Stock Value"
        value={totalStockValue}
        icon="dollar"
      />
      <StatCard
        title="Movements Today"
        value={movementsToday}
        icon="movements"
      />
      <StatCard
        title="Below Min. Level"
        value={belowMinLevel}
        icon="warning"
      />
      <StatCard
        title="Warehouse Occupancy"
        value={warehouseOccupancy}
        icon="building"
        isPercentage
      />
    </div>
  );
};

export default StatCard;
