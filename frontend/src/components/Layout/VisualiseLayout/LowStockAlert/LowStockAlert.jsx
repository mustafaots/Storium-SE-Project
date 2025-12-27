import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import styles from './LowStockAlert.module.css';

const LowStockAlert = ({ data = [] }) => {
    if (!data || data.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Low Stock Products</h3>
                    <span className={styles.subtitle}>Products below minimum threshold</span>
                </div>
                <div className={styles.emptyState}>
                    <p>✓ All products are at healthy stock levels</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Low Stock Products</h3>
                <span className={styles.subtitle}>{data.length} product{data.length !== 1 ? 's' : ''} below threshold</span>
            </div>

            <div className={styles.alertList}>
                {data.map((product, index) => (
                    <div
                        key={index}
                        className={`${styles.alertItem} ${product.severity === 'critical' ? styles.critical : styles.warning}`}
                    >
                        <div className={styles.iconWrapper}>
                            {product.severity === 'critical' ? (
                                <AlertCircle className={styles.icon} />
                            ) : (
                                <AlertTriangle className={styles.icon} />
                            )}
                        </div>
                        <div className={styles.info}>
                            <div className={styles.productName}>{product.productName}</div>
                            <div className={styles.details}>
                                <span className={styles.productType}>{product.productType}</span>
                                <span className={styles.separator}>•</span>
                                <span className={styles.quantity}>
                                    {product.currentQuantity} / {product.minStockLevel} units
                                </span>
                            </div>
                        </div>
                        <div className={styles.badge}>
                            {product.severity === 'critical' ? 'Critical' : 'Warning'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LowStockAlert;
