import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import styles from './RoutinesWidget.module.css';

const RoutinesWidget = ({ data = {} }) => {
    const [activeTab, setActiveTab] = useState('upcoming'); // 'overdue' or 'upcoming'

    const overdue = data.overdue || [];
    const upcoming = data.upcoming || [];

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Routines</h3>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'overdue' ? styles.active : ''}`}
                        onClick={() => setActiveTab('overdue')}
                    >
                        Overdue ({overdue.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'upcoming' ? styles.active : ''}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Upcoming
                    </button>
                </div>
            </div>

            <div className={styles.list}>
                {activeTab === 'overdue' ? (
                    overdue.length > 0 ? (
                        overdue.map((routine, i) => (
                            <div key={i} className={`${styles.item} ${styles.overdue}`}>
                                <div className={styles.iconBox}>
                                    <Clock size={16} />
                                </div>
                                <div className={styles.details}>
                                    <span className={styles.name}>{routine.name}</span>
                                    <span className={styles.freq}>{routine.frequency} • Due: {formatDate(routine.last_run)}</span>
                                </div>
                                <button className={styles.actionBtn}>Run</button>
                            </div>
                        ))
                    ) : (
                        <div className={styles.empty}>No overdue routines</div>
                    )
                ) : (
                    upcoming.length > 0 ? (
                        upcoming.map((routine, i) => (
                            <div key={i} className={styles.item}>
                                <div className={`${styles.iconBox} ${styles.blue}`}>
                                    <Calendar size={16} />
                                </div>
                                <div className={styles.details}>
                                    <span className={styles.name}>{routine.name}</span>
                                    <span className={styles.freq}>{routine.frequency} • Ran: {formatDate(routine.last_run)}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.empty}>No active routines</div>
                    )
                )}
            </div>
        </div>
    );
};

export default RoutinesWidget;
