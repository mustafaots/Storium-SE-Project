import React from 'react';
import { AlertCircle, AlertTriangle, Bell, Clock } from 'lucide-react';
import styles from './AlertsWidget.module.css';

const AlertsWidget = ({ data = [] }) => {
    const getIcon = (type, severity) => {
        if (severity === 'critical') return <AlertCircle size={18} className={styles.iconCritical} />;
        if (type === 'expiry') return <Clock size={18} className={styles.iconWarning} />;
        return <AlertTriangle size={18} className={styles.iconInfo} />;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diff === 0) return 'Today';
        if (diff === 1) return 'Yesterday';
        return `${diff}d ago`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Active Alerts</h3>
                <span className={styles.badge}>{data.length}</span>
            </div>

            <div className={styles.feed}>
                {data.map((alert, i) => (
                    <div key={i} className={`${styles.alertItem} ${styles[alert.severity]}`}>
                        <div className={styles.iconWrapper}>
                            {getIcon(alert.alert_type, alert.severity)}
                        </div>
                        <div className={styles.content}>
                            <p className={styles.message}>{alert.content}</p>
                            <div className={styles.meta}>
                                <span className={styles.type}>{alert.alert_type.replace('_', ' ')}</span>
                                <span className={styles.time}>{formatDate(alert.sent_at)}</span>
                            </div>
                        </div>
                        {alert.severity === 'critical' && <div className={styles.dot} />}
                    </div>
                ))}

                {data.length === 0 && (
                    <div className={styles.empty}>
                        <Bell size={32} />
                        <p>All clear! No active alerts.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertsWidget;
