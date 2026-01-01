// for the menu layout, we will use buttons that navigate to different routes

import { useNavigate } from 'react-router-dom';
import Button from '../../UI/Button/Button';
import styles from './Menu.module.css';

function Menu() {
  const navigate = useNavigate(); // Hook for navigation

  const handleExit = () => {
    // Send IPC message to close the Electron app
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.send('quit-app');
    } else {
      // Fallback for non-Electron environments
      window.close();
    }
  };

  const menuItems = [
    { label: 'Enter', action: () => navigate('/schema') },
    { label: 'Support', action: () => navigate('/support') },
    { label: 'Exit', action: handleExit },
  ];

  return (
    <nav className={styles.menu}>
      {menuItems.map((item) => (
        <Button
          key={item.label}
          onClick={item.action}
          makes_sound={true}
          variant={item.label === 'Enter' ? 'primary' : 'secondary'}
        >
          {item.label}
        </Button>
      ))}
    </nav>
  );
}

export default Menu;