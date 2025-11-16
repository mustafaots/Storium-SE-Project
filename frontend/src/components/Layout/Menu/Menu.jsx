import Button from '../../UI/Button/Button';
import styles from './Menu.module.css';

// Menu component providing navigation options
function Menu() {
  // Define menu items with labels and actions
  const menuItems = [
    { label: 'Enter', action: () => console.log('Enter clicked') },
    { label: 'Settings', action: () => console.log('Settings clicked') },
    { label: 'Support', action: () => console.log('Support clicked') },
    { label: 'Backup', action: () => console.log('Backup clicked') },
  ];

  return (
    <nav className={styles.menu}>
      {menuItems.map((item, index) => (
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