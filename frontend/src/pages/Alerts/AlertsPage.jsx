import styles from './AlertsPage.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';

function AlertsPage() {
    const activeItem = useActiveNavItem();

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.mainContent}>
                <div className={styles.comingSoon}>
                    <div className={styles.content}>
                        <h1 className={styles.title}>ALERTS</h1>
                        <p className={styles.subtitle}>We're working on it.</p>
                    </div>
                </div>
            </div>
            <NavBar activeItem={activeItem} />
        </div>
    );
}

export default AlertsPage;