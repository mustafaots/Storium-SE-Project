import { useState, useEffect } from 'react';
import LoadingScreen from '../../components/Layout/LoadingScreen/LoadingScreen';
import StoriumLogo from '../../components/Layout/StoriumLogo/StoriumLogo';
import Menu from '../../components/Layout/Menu/Menu.jsx';
import Container from '../../components/UI/Container/Container';
import styles from './HomePage.module.css';

function HomePage() {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const hasLoadedThisSession = sessionStorage.getItem('sessionHasLoaded');
    if (hasLoadedThisSession) {
      setShowLoading(false);
    }
  }, []);

  const handleLoadingComplete = () => {
    sessionStorage.setItem('sessionHasLoaded', 'true');
    setShowLoading(false);
  };

  return (
    <div className={styles.appContainer}>
      {showLoading && (
        <div className={styles.loadingContainer}>
          <LoadingScreen onLoadingComplete={handleLoadingComplete} />
        </div>
      )}
      
      <div className={`${styles.mainContent} ${!showLoading ? styles.show : ''}`}>
        <Container>
          <StoriumLogo />
          <Menu />
        </Container>
        
        <div className={styles.version}>
          v{import.meta.env.VITE_APP_VERSION || '0.0.1'}
        </div>
      </div>
    </div>
  );
}

export default HomePage;