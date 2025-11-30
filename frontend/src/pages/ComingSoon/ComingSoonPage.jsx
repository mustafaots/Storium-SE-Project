import styles from './ComingSoon.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import {FaCompass} from 'react-icons/fa';

function ComingSoonPage() {
    const activeItem = useActiveNavItem();

    const simpleNavItems = [ 
        {
            name: 'Menu',
            icon: <FaCompass/>,
            path: '/'
        },
    ];
    
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
            <NavBar navItems={simpleNavItems} activeItem={activeItem} />
        </div>
    );
}

export default ComingSoonPage;