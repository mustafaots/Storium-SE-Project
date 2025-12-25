// Chart Component (Stock Trends)
// Path: frontend/src/components/Visualise/Chart/Chart.jsx

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './Chart.module.css';

/**
 * Format number as currency
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
 * Custom tooltip component for the chart
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <p className={styles.tooltipValue}>
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * Stock Chart Component
 * Displays stock value trends over time with comparison indicator
 */
const Chart = ({ data = [], comparison = {} }) => {
  // Transform data for Recharts
  const chartData = useMemo(() => {
    return data.map(item => ({
      name: item.label || item.date,
      value: item.value || item.stockValue || 0,
    }));
  }, [data]);

  // Get the latest value for display
  const totalUnits = useMemo(() => {
    if (chartData.length === 0) return 0;
    return chartData[chartData.length - 1].value;
  }, [chartData]);

  const { percentage = 0, isPositive = true, period = 'Last 30 Days' } = comparison;

  const comparisonClass = isPositive
    ? styles.comparisonPositive
    : styles.comparisonNegative;

  return (
    <div className={styles.chartContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>Stock Value Trend</span>
          <span className={styles.totalUnits}>{formatCurrency(totalUnits)}</span>
        </div>
        <div className={`${styles.comparison} ${comparisonClass}`}>
          {isPositive ? (
            <TrendingUp className={styles.comparisonIcon} />
          ) : (
            <TrendingDown className={styles.comparisonIcon} />
          )}
          <span>{percentage}% vs {period}</span>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffbb00" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ffbb00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#b9bbbe' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#b9bbbe' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#ffbb00"
              strokeWidth={2}
              fill="url(#stockGradient)"
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Chart;
