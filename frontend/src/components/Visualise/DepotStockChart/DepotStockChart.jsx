import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './DepotStockChart.module.css';

const RADIAN = Math.PI / 180;

const DepotStockChart = ({ data = [] }) => {
    const chartData = useMemo(() => {
        return data.map(item => ({
            name: item.depot_name,
            location: item.location_name,
            value: Number(item.total_value) || 0
        }));
    }, [data]);

    // Use theme colors
    const COLORS = ['#ffbb00', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6'];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Depot Stock Value</h3>
            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#b9bbbe' }}
                            width={100}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{
                                backgroundColor: '#2f3136', // Dark background
                                borderRadius: '8px',
                                border: '1px solid #40444b', // Light gray border
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                color: '#f0f0f0'
                            }}
                            formatter={(value) => [formatCurrency(value), 'Stock Value']}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DepotStockChart;
