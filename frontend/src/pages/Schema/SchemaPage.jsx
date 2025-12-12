import { FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './SchemaPage.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import Button from '../../components/UI/Button/Button';

function SchemaPage() {
    const activeItem = useActiveNavItem();
    const navigate = useNavigate();

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.mainContent}>
                <div className={styles.comingSoon}>
                    <div className={styles.content}>
                        <h1 className={styles.title}>SCHEMA</h1>
                        <p className={styles.subtitle}>We're working on it.</p>
                        <div className={styles.actions}>
                            <Button
                                variant="primary"
                                leadingIcon={<FaMapMarkerAlt />}
                                onClick={() => navigate('/locations')}
                            >
                                Go to Locations
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <NavBar activeItem={activeItem} />
        </div>
    );
}

export default SchemaPage;