import React, { useState } from 'react';
import { AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import styles from './InventoryHealthTable.module.css';

const InventoryHealthTable = ({ data }) => {
    const [activeTab, setActiveTab] = useState('low'); // 'low' or 'out'

    const lowStock = data?.lowStock || [];
    const outOfStock = data?.outOfStock || [];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Inventory Health</h3>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'low' ? styles.active : ''}`}
                        onClick={() => setActiveTab('low')}
                    >
                        Low Stock ({lowStock.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'out' ? styles.active : ''}`}
                        onClick={() => setActiveTab('out')}
                    >
                        Out of Stock ({outOfStock.length})
                    </button>
                </div>
            </div>

            <div className={styles.listContainer}>
                {activeTab === 'low' ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Current</th>
                                <th>Min Level</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStock.map((item, i) => (
                                <tr key={i}>
                                    <td className={styles.productName}>{item.name}</td>
                                    <td className={styles.stockVal}>{item.current_stock}</td>
                                    <td className={styles.minVal}>{item.min_stock_level}</td>
                                    <td><span className={styles.badgeWarning}>Low</span></td>
                                </tr>
                            ))}
                            {lowStock.length === 0 && (
                                <tr><td colSpan="4" className={styles.empty}>No low stock alerts</td></tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Min Level</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {outOfStock.map((item, i) => (
                                <tr key={i}>
                                    <td className={styles.productName}>{item.name}</td>
                                    <td className={styles.minVal}>{item.min_stock_level}</td>
                                    <td><span className={styles.badgeCritical}>Empty</span></td>
                                </tr>
                            ))}
                            {outOfStock.length === 0 && (
                                <tr><td colSpan="3" className={styles.empty}>No stockouts</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default InventoryHealthTable;
