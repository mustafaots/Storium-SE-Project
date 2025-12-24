// SupplierPerformance Component
// Path: frontend/src/components/Visualise/SupplierPerformance/SupplierPerformance.jsx

import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts';
import styles from './SupplierPerformance.module.css';

const SupplierPerformance = ({ data = [] }) => {
    const chartData = useMemo(() => {
        return (Array.isArray(data) ? data : []).map(item => {
            const leadTimeNumber = Number(item?.avg_lead_time);
            const leadTime = Number.isFinite(leadTimeNumber) ? leadTimeNumber : 0;

            const productCountNumber = Number(item?.product_count);
            const products = Number.isFinite(productCountNumber) ? productCountNumber : 0;

            const avgCostNumber = Number(item?.avg_cost);
            const avgCost = Number.isFinite(avgCostNumber) ? avgCostNumber : 0;

            return {
                name: item?.name || '—',
                leadTime,
                leadTimeLabel: leadTime.toFixed(1),
                products,
                avgCost
            };
        });
    }, [data]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Supplier Performance</h3>
                <span className={styles.subtitle}>Average lead time in days</span>
            </div>

            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            width={100}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className={styles.tooltip}>
                                            <p className={styles.tooltipLabel}>{data.name}</p>
                                            <p className={styles.tooltipValue}>{data.leadTimeLabel} Days Avg Lead Time</p>
                                            <p className={styles.tooltipSubValue}>{data.products} Products Sourced</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey="leadTime"
                            fill="#3b82f6"
                            radius={[0, 4, 4, 0]}
                            barSize={20}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SupplierPerformance;
