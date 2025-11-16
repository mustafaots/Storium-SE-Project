import styles from './ComingSoon.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';
import { useNavigate } from 'react-router-dom';
import { FaCompass } from 'react-icons/fa';

function ComingSoonPage() {
    const navigate = useNavigate();

    const navItems= [ {
        name: 'Menu',
        icon: <FaCompass/>,
        action: () => navigate('/')
    } ];
    
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
        <NavBar navItems={navItems}/>
        </div>
    );
}

export default ComingSoonPage;