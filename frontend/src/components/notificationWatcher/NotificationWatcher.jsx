import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaExclamationCircle } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import styles from './NotificationWatcher.module.css';

const ALERTS_URL = "http://localhost:3001/api/alerts";

const NotificationWatcher = () => {
    const lastAlertIdRef = useRef(null);

const checkForNewAlerts = async () => {
    try {
        const res = await fetch(ALERTS_URL);
        const data = await res.json();
        
        // 1. Get all unread records
        const unreadAlerts = data.filter(a => a.is_read === 0);

        if (unreadAlerts.length > 0) {
            // Get the very newest one
            const latest = unreadAlerts[0]; 
            const currentId = latest.alert_id;

            // 2. The ONLY check: Is this ID different from the last one we popped up?
            if (currentId !== lastAlertIdRef.current) {
                
                showRedAlertToast(latest.content, currentId);
                playSound();

                // 3. Save this ID so we don't repeat it in 5 seconds
                lastAlertIdRef.current = currentId;
            }
        }
    } catch (error) {
        console.error("Check failed", error);
    }
};

    const showRedAlertToast = (message, id) => {
        toast(
            <div className={styles.customToast}>
                <div className={styles.toastHeader}>
                    <span className={styles.brandName}>Storium <span className={styles.brandSuffix}>IMS</span></span>
                </div>
                <div className={styles.toastBody}>
                    <div className={styles.errorCircle}>
                        <FaExclamationCircle />
                    </div>
                    <div className={styles.toastMessage}>{message}</div>
                </div>
            </div>,
            {
                // Forces it to pop up even if a similar toast exists
                toastId: `alert-${id}-${Date.now()}`, 
                position: "bottom-right",
                autoClose: 5000,
                className: styles.toastContainerRed
            }
        );
    };

    const playSound = () => {
        const audio = new Audio('/alert.mp3'); 
        audio.play().catch(() => {});
    };

    useEffect(() => {
        checkForNewAlerts();
        const interval = setInterval(checkForNewAlerts, 5000);
        return () => clearInterval(interval);
    }, []);

    return null;
};

export default NotificationWatcher;