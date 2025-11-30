import { useState, useEffect } from 'react';
import styles from './LoadingScreen.module.css';


// LoadingScreen component that displays a progress bar and a done button

function LoadingScreen({ onLoadingComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // loading SIMULATION
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 20);

    return () => clearInterval(timer);
  }, []);

  const handleClick = () => {
    onLoadingComplete();
  };

  return (
    <div className={styles.loadingScreen}>
      <div className={styles.content}>
        <h1 className={styles.title}>Storium</h1>
        
        {/* Simple progress bar */}
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className={styles.percentage}>{progress}%</p>
        
        {/* Show button when loading complete */}
        {progress === 100 && (
          <button className={styles.continueButton} onClick={handleClick} style={{ borderRadius: '50px' , width: 'fit-content', padding: '16px' }}>
            DONE
          </button>
        )}
      </div>
    </div>
  );
}

export default LoadingScreen;