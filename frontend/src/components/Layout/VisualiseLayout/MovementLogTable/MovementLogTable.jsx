import React, { useState } from 'react';
import styles from './MovementLogTable.module.css';

const TRANSACTION_TYPE_LABELS = {
    inflow: 'Inflow',
    outflow: 'Outflow',
    transfer: 'Transfer',
    consumption: 'Consumption',
    adjustment: 'Adjustment'
};

const TRANSACTION_TYPE_COLORS = {
    inflow: styles.inflow,
    outflow: styles.outflow,
    transfer: styles.transfer,
    consumption: styles.consumption,
    adjustment: styles.adjustment
};

const MovementLogTable = ({ data = [] }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    if (!data || data.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h3 className={styles.title}>Movement Log</h3>
                        <span className={styles.subtitle}>Transaction history</span>
                    </div>
                </div>
                <div className={styles.emptyState}>
                    <p>No movements recorded for the selected filters</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h3 className={styles.title}>Movement Log</h3>
                    <span className={styles.subtitle}>{data.length} transaction{data.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Product</th>
                            <th>Type</th>
                            <th>Transaction</th>
                            <th>Quantity</th>
                            <th>Value</th>
                            <th>Source/Dest</th>
                            <th>Reference</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((row, index) => (
                            <tr key={row.txn_id || index}>
                                <td className={styles.timestamp}>{row.timestamp}</td>
                                <td className={styles.productName}>{row.productName}</td>
                                <td>
                                    <span className={styles.productType}>{row.productType || '-'}</span>
                                </td>
                                <td>
                                    <span className={`${styles.txnType} ${TRANSACTION_TYPE_COLORS[row.txnType]}`}>
                                        {TRANSACTION_TYPE_LABELS[row.txnType] || row.txnType}
                                    </span>
                                </td>
                                <td className={styles.quantity}>{row.quantity.toLocaleString()}</td>
                                <td className={styles.value}>
                                    ${(row.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className={styles.source}>{row.sourceDestination || '-'}</td>
                                <td className={styles.reference}>{row.referenceNumber || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.pageButton}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span className={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className={styles.pageButton}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default MovementLogTable;
