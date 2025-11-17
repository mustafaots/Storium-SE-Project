import {
  FaCompass, 
  FaSitemap, 
  FaChartBar, 
  FaDatabase, 
  FaBox, 
  FaExchangeAlt, 
  FaUsers,
  FaCogs, 
  FaBell
} from 'react-icons/fa';

import styles from './NavBar.module.css';
import { useNavigate } from 'react-router-dom';

// Default navigation items
const defaultNavItems = [ 
  {
      name: 'Menu',
      icon: <FaCompass/>,
      path: '/'
  },
  {
      name: 'Schema',
      icon: <FaSitemap/>,
      path: '/schema'
  },
  {
      name: 'Visualise',
      icon: <FaChartBar/>,
      path: '/visualise'
  },
  {
      name: 'Sources',
      icon: <FaDatabase/>,
      path: '/sources'
  },
  {
      name: 'Products',
      icon: <FaBox/>,
      path: '/products'
  },
  {
      name: 'Transactions',
      icon: <FaExchangeAlt/>,
      path: '/transactions'
  },
  {
      name: 'Clients',
      icon: <FaUsers/>,
      path: '/clients'
  },
  {
      name: 'Routines',
      icon: <FaCogs/>,
      path: '/routines'
  },
  {
      name: 'Alerts',
      icon: <FaBell/>,
      path: '/alerts'
  }
];

function NavBar({ navItems = defaultNavItems, activeItem = '' }) {
  const navigate = useNavigate();

  return (
    <nav className={styles.navbar}>
      {navItems.map((item) => (
        <button
          key={item.name}
          className={`${styles.navItem} ${
            activeItem === item.name ? styles.active : ''
          }`}
          onClick={() => navigate(item.path)}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.name}</span>
        </button>
      ))}
    </nav>
  );
}

export default NavBar;