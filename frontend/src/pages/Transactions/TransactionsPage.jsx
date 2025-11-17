import styles from './TransactionsPage.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';

function TransactionsPage() {
    const activeItem = useActiveNavItem();

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.mainContent}>
                <div className={styles.comingSoon}>
                    <div className={styles.content}>
                        <h1 className={styles.title}>TRANSACTIONS</h1>
                        <p className={styles.subtitle}>We're working on it.</p>
                    </div>
                </div>
            </div>
            <NavBar activeItem={activeItem} />
        </div>
    );
}

export default TransactionsPage;