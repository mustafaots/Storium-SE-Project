// ExpiryTimeline Component
// Path: frontend/src/components/Visualise/ExpiryTimeline/ExpiryTimeline.jsx

import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import styles from './ExpiryTimeline.module.css';

const ExpiryTimeline = ({ data = [] }) => {
    const chartData = useMemo(() => {
        return data.map(item => {
            const date = new Date(item.date);
            return {
                name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                count: item.item_count,
                quantity: item.total_quantity,
                fullDate: item.date
            };
        });
    }, [data]);

    const totalExpiringItems = useMemo(() => {
        return chartData.reduce((sum, item) => sum + item.count, 0);
    }, [chartData]);

    const getBarColor = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) return '#ef4444'; // Critical
        if (diffDays <= 30) return '#f59e0b'; // Warning
        return '#3b82f6'; // Safe (Blue) or could be Gold #ffbb00
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h3 className={styles.title}>Expiry Schedule</h3>
                    <span className={styles.subtitle}>Items expiring in next 90 days</span>
                </div>
                {totalExpiringItems > 0 && (
                    <div className={styles.alertCount}>
                        <AlertTriangle size={16} />
                        <span>{totalExpiringItems} Items</span>
                    </div>
                )}
            </div>

            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#b9bbbe' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#b9bbbe' }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className={styles.tooltip}>
                                            <p className={styles.tooltipLabel}>{payload[0].payload.name}</p>
                                            <p className={styles.tooltipValue}>{payload[0].value} Batches</p>
                                            <p className={styles.tooltipSubValue}>{payload[0].payload.quantity} total units</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBarColor(entry.fullDate)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ExpiryTimeline;
