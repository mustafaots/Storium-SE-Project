import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify'; // REMOVED ToastContainer import
import { FaExclamationCircle } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import styles from './NotificationWatcher.module.css';

const ALERTS_URL = "http://localhost:3001/api/alerts";

const NotificationWatcher = () => {
    const prevCountRef = useRef(0);

    const checkForNewAlerts = async () => {
        try {
            const res = await fetch(ALERTS_URL);
            const data = await res.json();
            
            const unreadAlerts = data.filter(a => a.is_read === 0);
            const currentUnreadCount = unreadAlerts.length;

            // If we have more unread now than before, show the NEWEST one
            if (currentUnreadCount > prevCountRef.current) {
                const latestAlert = unreadAlerts[0]; 
                if (latestAlert) {
                    showRedAlertToast(latestAlert.content, latestAlert.id);
                    playSound();
                }
            }
            prevCountRef.current = currentUnreadCount;
        } catch (error) {
            console.error("Notification check failed", error);
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
                // CHANGE 1: Unique toastId ensures the alert ALWAYS pops up
                toastId: `${id}-${Date.now()}`, 
                position: "bottom-right", // Matching your request for the bottom
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
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

    // CHANGE 2: Return null. This component is a "watcher," 
    // it uses the Container sitting in App.js.
    return null;
};

export default NotificationWatcher;