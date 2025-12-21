import React, { useState, useEffect, useRef } from 'react';
import styles from './NotificationWatcher.module.css';
import { FaBell, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// API URL
const ALERTS_URL = "http://localhost:3001/api/alerts";

const NotificationWatcher = () => {
    // State to show/hide the floating icon
    const [showAlertIcon, setShowAlertIcon] = useState(false);
    
    // Track previous count to know WHEN a NEW alert arrives
    const prevCountRef = useRef(0);

    // 1. POLLING FUNCTION
    const checkForNewAlerts = async () => {
        try {
            const res = await fetch(ALERTS_URL);
            const data = await res.json();
            
            // Count unread alerts
            const currentUnread = data.filter(a => a.is_read === 0).length;
            const latestAlert = data[0]; // Newest is always first

            // LOGIC: If unread count has INCREASED...
            if (currentUnread > prevCountRef.current) {
                console.log("🔥 NEW ALERT DETECTED!");
                
                // A. Show the Floating Icon
                setShowAlertIcon(true);
                
                // B. Play Sound
                playSound();
                
                // C. Show Toast Popup
                toast.error(`🚨 NEW ALERT: ${latestAlert.content}`, {
                    theme: "dark",
                    position: "top-right"
                });
            }

            // Update the tracker for the next check
            prevCountRef.current = currentUnread;

        } catch (error) {
            console.error("Notification check failed", error);
        }
    };

    // 2. PLAY SOUND HELPER
    const playSound = () => {
        try {
            // Assumes 'alert.mp3' is in your /public folder
            const audio = new Audio('/alert.mp3'); 
            audio.play().catch(e => console.log("Audio play blocked."));
        } catch (e) {
            console.error("Sound error", e);
        }
    };

    // 3. START THE TIMER
    useEffect(() => {
        // Initial check to set the baseline
        checkForNewAlerts();
        
        // Check every 5 seconds
        const interval = setInterval(checkForNewAlerts, 5000);
        return () => clearInterval(interval);
    }, []);
    
    // Don't render anything if there's no new alert
    if (!showAlertIcon) {
        return null;
    }

    // Render the Floating Icon
    return (
        <div className={styles.notificationIcon} title="New Alert! Click to view.">
            {/* The Bell */}
            <FaBell size={24} />

            {/* Close Button to hide it */}
            <button 
                className={styles.closeButton} 
                onClick={(e) => {
                    e.stopPropagation(); // Prevents clicking the bell
                    setShowAlertIcon(false);
                }}
            >
                <FaTimes />
            </button>
        </div>
    );
};

export default NotificationWatcher;
