import StoriumLogo from '../../components/Layout/StoriumLogo/StoriumLogo';
import Menu from '../../components/Layout/Menu/Menu.jsx';
import Container from '../../components/UI/Container/Container';
import styles from './HomePage.module.css';

function HomePage() {
  return (
    <div className={styles.homePage}>
      <Container>
        <StoriumLogo />
        <Menu />
      </Container>
      
      {/* Version inside the same container but absolutely positioned */}
      <div className={styles.version}>
        v{import.meta.env.VITE_APP_VERSION || '0.0.1'}
      </div>
    </div>
  );
}

export default HomePage;