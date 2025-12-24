import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './TransactionChart.module.css';

const TransactionChart = ({ data = [] }) => {
    const chartData = useMemo(() => {
        return data.map(item => ({
            name: item.label,
            inflow: item.inflow || 0,
            outflow: item.outflow || 0,
            transfer: item.transfer || 0,
            consumption: item.consumption || 0,
            adjustment: item.adjustment || 0,
        }));
    }, [data]);

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
            <div className={styles.header}>
                <h3 className={styles.title}>Movements Over Time</h3>
                <span className={styles.subtitle}>Transaction values by type</span>
            </div>

            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorTransfer" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorAdjustment" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
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
                            tickFormatter={(value) => `$${value > 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                        />
                        <Tooltip
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{
                                backgroundColor: '#2f3136',
                                borderRadius: '8px',
                                border: '1px solid #40444b',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                color: '#f0f0f0'
                            }}
                        />
                        <Legend verticalAlign="top" align="right" height={36} />
                        <Area
                            type="monotone"
                            dataKey="inflow"
                            name="Inflow"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#colorInflow)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="outflow"
                            name="Outflow"
                            stroke="#ef4444"
                            fillOpacity={1}
                            fill="url(#colorOutflow)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="transfer"
                            name="Transfer"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorTransfer)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="consumption"
                            name="Consumption"
                            stroke="#f59e0b"
                            fillOpacity={1}
                            fill="url(#colorConsumption)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="adjustment"
                            name="Adjustment"
                            stroke="#8b5cf6"
                            fillOpacity={1}
                            fill="url(#colorAdjustment)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TransactionChart;
