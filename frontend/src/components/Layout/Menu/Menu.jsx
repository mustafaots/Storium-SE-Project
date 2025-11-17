import { useNavigate } from 'react-router-dom';
import Button from '../../UI/Button/Button';
import styles from './Menu.module.css';

function Menu() {
  const navigate = useNavigate(); // Hook for navigation

  const menuItems = [
    { label: 'Enter', action: () => navigate('/home-page') },
    { label: 'Settings', action: () => navigate('/settings') },
    { label: 'Support', action: () => console.log('Support clicked') },
    { label: 'Backup', action: () => navigate('/coming-soon') },
  ];

  return (
    <nav className={styles.menu}>
      {menuItems.map((item) => (
        <Button
          key={item.label}
          onClick={item.action}
          variant={item.label === 'Enter' ? 'primary' : 'secondary'}
        >
          {item.label}
        </Button>
      ))}
    </nav>
  );
}

export default Menu;