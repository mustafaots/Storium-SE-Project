import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaExclamationCircle } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import styles from './NotificationWatcher.module.css';

const ALERTS_URL = "http://localhost:3001/api/alerts";

import alertSound from '../../assets/audio/alert.mp3';

const NotificationWatcher = () => {
    const lastAlertIdRef = useRef(null);

    const checkForNewAlerts = async () => {
        try {
            // FIX: Append a timestamp to the URL to prevent the browser from caching the response
            const res = await fetch(`${ALERTS_URL}?t=${Date.now()}`); 
            const data = await res.json();
            
            // Filter for unread alerts
            const unreadAlerts = data.filter(a => a.is_read === 0);
            const latestAlert = unreadAlerts[0]; 

            if (latestAlert) {
                const currentId = latestAlert.alert_id;
                const rememberedId = lastAlertIdRef.current;

                console.log(`Syncing... DB ID: ${currentId} | Memory: ${rememberedId}`);

                // Only trigger if we have a valid ID and it's different from the last one shown
                if (currentId && currentId !== rememberedId) {
                    console.log("%c NEW DATA DETECTED - TRIGGERING POPUP", "color: #ff4d4d; font-weight: bold;");
                    showRedAlertToast(latestAlert.content, currentId);
                    playSound();
                    lastAlertIdRef.current = currentId;
                }
            }
        } catch (error) {
            console.error("Watcher Sync Error:", error);
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
                // Unique toastId ensures the alert pops up immediately
                toastId: `alert-${id}-${Date.now()}`, 
                position: "bottom-right",
                autoClose: 5000,
                className: styles.toastContainerRed
            }
        );
    };

const playSound = () => {
    const audio = new Audio(alertSound);
    audio.play().catch((err) => console.warn("Audio blocked:", err));
};
    useEffect(() => {
        // Run once on load
        checkForNewAlerts();

        // Setup the 5-second loop
        const interval = setInterval(checkForNewAlerts, 5000);

        // Cleanup the loop if the component unmounts
        return () => clearInterval(interval);
    }, []);

    return null;
};

export default NotificationWatcher;