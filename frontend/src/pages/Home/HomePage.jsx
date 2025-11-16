import { useState } from 'react';
import LoadingScreen from '../../components/Layout/LoadingScreen/LoadingScreen';
import StoriumLogo from '../../components/Layout/StoriumLogo/StoriumLogo';
import Menu from '../../components/Layout/Menu/Menu.jsx';
import Container from '../../components/UI/Container/Container';
import styles from './HomePage.module.css';

// HomePage component that manages loading screen and main content display

function HomePage() {
  const [showLoading, setShowLoading] = useState(true);

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  return (
    // Main application container

    // Conditional rendering of loading screen and main content
    <div className={styles.appContainer}>
      {showLoading && (
        <div className={styles.loadingContainer}>
          <LoadingScreen onLoadingComplete={handleLoadingComplete} />
        </div>
      )}
      
      {/* Main content area, shown after loading completes */}
      <div className={`${styles.mainContent} ${!showLoading ? styles.show : ''}`}>
        <Container>
          <StoriumLogo />
          <Menu />
        </Container>
        
        {/* Version display */}
        <div className={styles.version}>
          v{import.meta.env.VITE_APP_VERSION || '0.0.1'}
        </div>
      </div>
    </div>
  );
}

export default HomePage;