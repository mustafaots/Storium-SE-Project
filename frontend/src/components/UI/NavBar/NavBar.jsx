import { FaHome, FaCog, FaUser } from 'react-icons/fa';
import styles from './NavBar.module.css';

// Default navigation items
const defaultNavItems = [
  { 
    name: 'Home', 
    icon: <FaHome />,
    action: () => console.log('Home clicked')
  },
  { 
    name: 'Settings', 
    icon: <FaCog />,
    action: () => console.log('Settings clicked')
  },
  { 
    name: 'Profile', 
    icon: <FaUser />,
    action: () => console.log('Profile clicked')
  },
];

function NavBar({ navItems = defaultNavItems, activeItem = '' }) {
  return (
    <nav className={styles.navbar}>
      {navItems.map((item) => (
        <button
          key={item.name}
          className={`${styles.navItem} ${
            activeItem === item.name ? styles.active : ''
          }`}
          onClick={item.action}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.name}</span>
        </button>
      ))}
    </nav>
  );
}

export default NavBar;