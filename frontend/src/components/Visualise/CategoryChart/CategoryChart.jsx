// CategoryChart Component
// Path: frontend/src/components/Visualise/CategoryChart/CategoryChart.jsx

import { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import styles from './CategoryChart.module.css';

// Updated colors to include gold and match dark theme vibrancy
const COLORS = ['#ffbb00', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const CategoryChart = ({ data = [] }) => {
    const chartData = useMemo(() => {
        return data.map(item => ({
            name: item.name,
            value: item.value
        }));
    }, [data]);

    const totalValue = useMemo(() => {
        return chartData.reduce((sum, item) => sum + item.value, 0);
    }, [chartData]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Category Distribution</h3>
                <span className={styles.subtitle}>Value by Product Category</span>
            </div>

            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none" // Remove white border
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{
                                backgroundColor: '#2f3136',
                                borderRadius: '8px',
                                border: '1px solid #40444b',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                color: '#f0f0f0'
                            }}
                            itemStyle={{ color: '#f0f0f0' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
                <div className={styles.centerLabel}>
                    <span className={styles.centerValue}>{formatCurrency(totalValue)}</span>
                    <span className={styles.centerText}>Total Value</span>
                </div>
            </div>
        </div>
    );
};

export default CategoryChart;
