import styles from './HomePage.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';


function HomePage() {
    
    return (
        <div className={styles.pageWrapper}>
        <div className={styles.mainContent}>
            <div className={styles.comingSoon}>
            <div className={styles.content}>
                <h1 className={styles.title}>Coming Soon</h1>
                <p className={styles.subtitle}>We're working on it.</p>
            </div>
            </div>
        </div>
        <NavBar/>
        </div>
    );
}

export default HomePage;