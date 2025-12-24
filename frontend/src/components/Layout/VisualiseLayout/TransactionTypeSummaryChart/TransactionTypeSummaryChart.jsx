import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import styles from './TransactionTypeSummaryChart.module.css';

const TYPE_COLORS = {
    inflow: '#10b981',
    outflow: '#ef4444',
    transfer: '#3b82f6',
    consumption: '#f59e0b',
    adjustment: '#8b5cf6'
};

const TYPE_LABELS = {
    inflow: 'Inflow',
    outflow: 'Outflow',
    transfer: 'Transfer',
    consumption: 'Consumption',
    adjustment: 'Adjustment'
};

const TransactionTypeSummaryChart = ({ data = [] }) => {
    const formattedData = data.map(item => ({
        ...item,
        label: TYPE_LABELS[item.txnType] || item.txnType,
        color: TYPE_COLORS[item.txnType] || '#6b7280'
    }));

    const formatNumber = (value) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toString();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Quantity by Transaction Type</h3>
                <span className={styles.subtitle}>Total units moved per type</span>
            </div>

            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={formattedData}
                        margin={{ top: 30, right: 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickFormatter={formatNumber}
                        />
                        <Tooltip
                            formatter={(value, name, props) => [
                                `${value.toLocaleString()} units`,
                                `${props.payload.transactionCount} transactions`
                            ]}
                            contentStyle={{
                                borderRadius: '8px',
                                border: 'none',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Bar dataKey="totalQuantity" radius={[8, 8, 0, 0]}>
                            <LabelList dataKey="totalQuantity" position="top" formatter={formatNumber} style={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} />
                            {formattedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TransactionTypeSummaryChart;
